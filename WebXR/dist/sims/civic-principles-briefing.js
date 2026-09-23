import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { markInteractive } from "../../../shared/kit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Civic Principles Briefing — the opening station of the Civic
// Leadership and Emotional Intelligence programme, and like the Can We Live?
// story deliberately NOT a walkable scene: a flat dossier with its sources,
// followed by a scored knowledge check on the same engine as every station.
//
// The programme was asked to draw on the principles taught by a civic-
// leadership foundation. That foundation's own site could not be reached from
// the environment this file was written in, and nothing about it exists in
// this repository. So this briefing does not describe the foundation, does not
// quote it, and does not speak for it or for any person connected with it.
// The eight principles are stated generically and attributed as what they
// are: principles commonly taught in civic-leadership programmes; the
// foundation's own curriculum is not sourced in this repository. Where a
// section has no source, its source line says "not sourced" rather than
// pointing anywhere. The statutes and public bodies are named from their
// official sites, which were not retrieved at build time either — the
// briefing says so on each line.

const CPB_ACCENT = 0xc9a34a;
const cpbQ = (o) => ({ kind: "select", ...o });

export const SIM_CIVIC_PRINCIPLES_BRIEFING = {
  id: "civic-principles-briefing",
  index: "226",
  domain: "Civic",
  trade: "Civic leader — councillor, commissioner, organiser or public servant",
  category: "Community Environmental Justice",
  certification: "The Ralph M. Brown Act (California Government Code section 54950 and following) for open meetings; the Political Reform Act and the Fair Political Practices Commission (FPPC) for disclosure, disqualification and gifts; the municipal ethics code, named generically; Robert's Rules of Order as a practice a body adopts, not a law; SAMHSA's trauma-informed care principles; NIMS and ICS for crisis communication; Title II of the ADA for access. The eight leadership principles are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
  name: "Civic Principles Briefing",
  title: simTitle("Civic Principles Briefing"),
  tagline: "Eight principles of public leadership, a six-step decision framework, and the law under every public meeting — a briefing and knowledge check that opens the civic leadership programme, with every source stated and every gap marked not sourced",
  flat: true,
  accent: CPB_ACCENT,
  accentCss: "#c9a34a",
  parSeconds: 320,
  badge: { id: "principles-held", name: "Principles Held", note: "The eight principles, the framework and the law answered without an unsafe conclusion" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your employee assistance program, or a colleague in public life you trust",

  game: system({
    name: "Public Trust",
    currency: "TRUST",
    ranks: ["Resident", "Volunteer", "Organiser", "Public Servant", "Civic Leader"],
    badges: [
      { id: "attributed-right", name: "Attributed Right", note: "The principles attributed honestly, without an invented voice", test: AWARD.stepClean("attribution") },
      { id: "open-door", name: "Open Door", note: "Never chose a closed door over an open one", test: AWARD.safe },
      { id: "framework-held", name: "Framework Held", note: "The decision framework put in order first time", test: AWARD.stepClean("framework-order") },
    ],
    challenges: [
      { id: "clean-sheet", name: "Clean Sheet", note: "No corrections anywhere in the check", test: AWARD.clean },
      { id: "read-it-first", name: "Read It First", note: "Finish inside 70% of par — you read the dossier, not the options", test: AWARD.fast(0.7) },
    ],
  }),

  dossier: [
    {
      title: "What this programme is, and what it is not",
      body: "The Civic Leadership and Emotional Intelligence programme was asked to draw on the principles taught by a civic-leadership foundation. That foundation's own curriculum could not be retrieved from the environment this briefing was written in, and nothing about it exists in this repository, so this briefing does not describe the foundation, does not quote it, and does not speak for it or for anybody connected with it. The eight principles that follow are stated generically: they are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository. Before the programme is used with learners, the foundation's own words belong here, in its own voice.",
      source: { label: "Not sourced — the foundation's own curriculum is not in this repository" },
    },
    {
      title: "The eight principles",
      body: "1. Listen first — hear the whole thing before you answer any of it. 2. Know the interest behind the position — ask why before you argue with what. 3. Count the votes before the vote — and count them honestly, in public, never by carrying positions between members in private. 4. Keep your word — promise only what you can deliver, then deliver it. 5. Spend public money in the open — the public sees the same numbers, at the same time, as the people deciding. 6. Take the hard call and own it — say \"we chose\", say why, say when you will look again. 7. Bring people in rather than shut them out — notice who is missing and go and get them. 8. Mentor the next person — the job is not done until somebody else can do it without you.",
      source: { label: "Not sourced — principles commonly taught in civic-leadership programmes, stated generically" },
    },
    {
      title: "A decision framework: hear, name, count, decide, own, report",
      body: "Hear: every affected voice, the quiet ones included, before anything is proposed. Name: the interest behind each position, said back in the speaker's own words. Count: honest support, in the open — a maybe is not a yes. Decide: in the noticed meeting, on the posted item, with any personal interest disclosed and stepped away from. Own: the decision in the first person, with the reason and a date to revisit it. Report: the decision, the reasoning, the dissent and each vote, back to the people it affects. The nine stations of this programme each practise part of this sequence under pressure.",
      source: { label: "Not sourced — a framework written for this programme, not taken from any organisation" },
    },
    {
      title: "The open-meeting law under every public meeting",
      body: "California's Ralph M. Brown Act governs meetings of local legislative bodies: city councils, county boards, and the commissions and committees they create. A regular meeting's agenda is posted in public seventy-two hours ahead; the public may address the body; the body acts only on what was noticed, with narrow exceptions; a majority may not discuss, deliberate or decide the body's business outside a noticed meeting, including through a chain of one-to-one contacts or an intermediary; documents given to a majority are public at the same time; and a majority may attend a community meeting open to the public so long as they do not discuss the body's business among themselves there.",
      source: { label: "California Legislative Information — Government Code section 54950 and following (official site; page not retrieved at build time)", url: "https://leginfo.legislature.ca.gov/" },
    },
    {
      title: "Money, gifts and conflicts of interest",
      body: "The Political Reform Act of 1974, administered by the Fair Political Practices Commission, requires public officials to disclose their economic interests on the Statement of Economic Interests (Form 700), bars an official from making or influencing a decision in which they have a financial interest, and limits and requires reporting of gifts. Gift limits are adjusted over time, so no figure is quoted here. A city's or county's own ethics code adds its rules on gifts from interested parties, lobbyist contact, misuse of position and the revolving door; they differ by jurisdiction and are named here only generically.",
      source: { label: "Fair Political Practices Commission (official site; page not retrieved at build time)", url: "https://www.fppc.ca.gov/" },
    },
    {
      title: "Procedure is a practice, not a law",
      body: "Robert's Rules of Order is a parliamentary authority: a body adopts it, or a simplified version, or its own rules of procedure, and is bound by it only to the extent it has chosen to be. It supplies the ordinary shape of a meeting — a motion, a second, debate on something specific, a vote — and the chair's job of recognising speakers and keeping order. The open-meeting law sits underneath it and cannot be waived by any rule of procedure.",
      source: { label: "Robert's Rules of Order Newly Revised — official site (page not retrieved at build time)", url: "https://robertsrules.com/" },
    },
    {
      title: "People, crisis and access",
      body: "SAMHSA's six principles of a trauma-informed approach — safety; trustworthiness and transparency; peer support; collaboration and mutuality; empowerment, voice and choice; and cultural, historical and gender issues — shape how a leader listens to a neighbourhood that has been hurt before. In an emergency, NIMS places the public information officer on the incident's command staff and uses a joint information centre so every agency speaks with one voice. Title II of the ADA requires public entities to make their programmes, meetings and communications accessible, including interpreters and captions on request.",
      source: { label: "SAMHSA (official site; page not retrieved at build time)", url: "https://www.samhsa.gov/" },
      source2: { label: "FEMA — National Incident Management System (official site; page not retrieved at build time)", url: "https://www.fema.gov/emergency-managers/nims" },
    },
  ],

  hazards: {
    "quote-the-founder": "You chose to put quotations in the mouth of the foundation's founder. Nothing the foundation or any person connected with it has said is sourced in this repository; an invented quotation attributed to a real person is exactly the thing a civic-leadership programme should never teach, however vivid it would make the slide.",
    "cut-in": "You chose to correct the resident mid-sentence from the chair. The podium time was hers; staff answer the facts afterwards, on the record. A chair who speaks over the public teaches the whole room that the podium is a formality.",
    "private-majority": "You chose to poll three of five members by reply-all. A majority deliberating by email is a meeting nobody noticed — the serial meeting the open-meeting law forbids, whatever the intention.",
    "promise-tomorrow": "You chose to promise an inspector tomorrow. The office cannot order one; a promise that feels kind at the desk becomes the next broken one by the end of the week.",
    "accept-gift": "You chose to accept the tickets from the applicant whose permit is on the agenda. A gift from somebody with business before the body is reportable at best and disqualifying at worst.",
  },

  lateNotes: {},

  steps: [
    cpbQ({
      id: "attribution", target: "a-generic",
      options: [
        { id: "a-generic", label: "Principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository" },
        { id: "quote-the-founder", label: "Quote the foundation's founder on each principle, to make them vivid" },
        { id: "a-official", label: "The foundation's official curriculum, reproduced in full" },
      ],
      title: "How are the eight principles in this programme attributed?",
      cue: "Pick the honest attribution.",
      why: "A training aid that invents a real person's words, or claims to reproduce a curriculum it has never seen, teaches the opposite of civic leadership. The honest attribution says exactly what the principles are and exactly what is missing, so the foundation's own words can be put in their place when they are available.",
    }),
    {
      id: "eight-principles", kind: "sequence", anyOrder: true,
      targets: ["p-listen-first", "p-interest", "p-keep-word", "p-mentor"],
      itemNames: { "p-listen-first": "Listen first", "p-interest": "Know the interest behind the position", "p-keep-word": "Keep your word", "p-mentor": "Mentor the next person" },
      decoyNotes: { "p-win-at-all-costs": "Winning the vote whatever it takes is not among the principles — the principles are about how a decision is reached as much as which way it goes." },
      options: [
        { id: "p-listen-first", label: "Listen first" }, { id: "p-interest", label: "Know the interest behind the position" },
        { id: "p-keep-word", label: "Keep your word" }, { id: "p-mentor", label: "Mentor the next person" },
        { id: "p-win-at-all-costs", label: "Win the vote whatever it takes" },
      ],
      title: "Which of these are among the eight principles?",
      cue: "Select every one that is — order doesn't matter.",
      why: "The eight principles are the spine of the nine stations that follow: the meeting chair practises listening first, the coalition table practises the interest behind the position, the service desk practises keeping your word and the succession station practises mentoring the next person. Knowing them is knowing what each station is really scoring.",
    },
    {
      id: "framework-order", kind: "sequence",
      targets: ["f-hear", "f-name", "f-count", "f-decide", "f-own", "f-report"],
      itemNames: { "f-hear": "Hear", "f-name": "Name the interest", "f-count": "Count honestly", "f-decide": "Decide in the open", "f-own": "Own it", "f-report": "Report back" },
      options: [
        { id: "f-decide", label: "Decide — in the noticed meeting, interests disclosed" }, { id: "f-hear", label: "Hear — every affected voice first" },
        { id: "f-report", label: "Report — decision, reasoning, dissent and votes" }, { id: "f-name", label: "Name — the interest behind each position" },
        { id: "f-own", label: "Own — first person, with a reason and a date" }, { id: "f-count", label: "Count — honest support, in the open" },
      ],
      title: "Put the decision framework in order",
      cue: "Select the six steps in the order they are taken.",
      why: "Each step earns the next. Hearing first produces the interests to name; named interests make an honest count possible; an honest count is what a decision in the open rests on; owning the decision in the first person is what makes the report back credible. Taken out of order — deciding, then hearing — the framework becomes consultation theatre.",
      outOfOrderNote: "Hear, name, count, decide, own, report. Deciding before hearing is the most common way a good process turns into a formality.",
    },
    cpbQ({
      id: "listen-first", target: "l-bell",
      options: [
        { id: "l-bell", label: "Hear her to the bell, then ask staff to answer the facts on the record" },
        { id: "cut-in", label: "Correct her figures from the chair while she is speaking" },
        { id: "l-skip", label: "Move her to the end of the list until she has checked her numbers" },
      ],
      title: "A resident at the podium gets her figures wrong. What does the chair do?",
      cue: "Pick what listening first looks like from the chair.",
      why: "Listening first is not agreeing; it is letting the speaker finish, then correcting the record through staff, where the correction can be checked. The residents waiting their turn are watching how this one is treated.",
    }),
    cpbQ({
      id: "count-votes", target: "c-open",
      options: [
        { id: "c-open", label: "Ask each colleague's view openly, and never carry one member's position to another" },
        { id: "private-majority", label: "Poll three of the five members by a reply-all email the night before" },
        { id: "c-staff", label: "Have a staffer ask each office and report the count back to all of them" },
      ],
      title: "How do you count the votes before a vote on a five-member council?",
      cue: "Pick the way that stays inside the open-meeting law.",
      why: "Counting votes is a real leadership skill, and a lawful one when it is listening, one colleague at a time, without shuttling positions. Polling a majority by email, or through a staffer who carries each answer to the others, is a serial meeting — the deliberation the public was entitled to see.",
    }),
    cpbQ({
      id: "keep-word", target: "k-date",
      options: [
        { id: "k-date", label: "A callback date the department's own queue supports, written on a card she keeps, then met" },
        { id: "promise-tomorrow", label: "Promise an inspector at her door tomorrow" },
        { id: "k-vague", label: "Tell her someone will be in touch soon" },
      ],
      title: "A tenant with no heat has called twice and heard nothing. What does keeping your word look like at the desk?",
      cue: "Pick the commitment the office can keep.",
      why: "Keeping your word starts with choosing a word you can keep. A real date, written down and met, rebuilds trust; a kind promise nobody can deliver becomes the office's third failure; a vague \"soon\" is not a commitment at all.",
    }),
    cpbQ({
      id: "public-money", target: "m-post",
      options: [
        { id: "m-post", label: "Put copies on the public table and read the change aloud before testimony continues" },
        { id: "m-later", label: "Post the revision on the website after the meeting" },
        { id: "m-ignore", label: "Carry on — it is only a spreadsheet" },
      ],
      title: "Mid-hearing, an aide hands a revised budget sheet to three members. What happens?",
      cue: "Pick what spending public money in the open requires.",
      why: "Documents given to a majority of the body are public at the same time. A revision the public cannot see means residents are testifying against numbers the committee has already replaced — and every vote taken afterwards is in question.",
    }),
    cpbQ({
      id: "gift-offered", target: "g-decline",
      options: [
        { id: "g-decline", label: "Decline, say why, and report any gift you do accept from anyone at its honest value" },
        { id: "accept-gift", label: "Accept the applicant's tickets — the permit is weeks away" },
        { id: "g-pass", label: "Accept them and give them to a staff member" },
      ],
      title: "The applicant for next month's permit offers you concert tickets. What do you do?",
      cue: "Pick the answer the disclosure rules support.",
      why: "A gift from somebody with business before the body is the plainest conflict there is. Declining it, and valuing and reporting honestly any gift that is accepted from anyone, is what keeps the register meaningful — passing it on to staff only moves the problem.",
    }),
    cpbQ({
      id: "own-it", target: "o-we-chose",
      options: [
        { id: "o-we-chose", label: "\"We chose to cut Saturday hours. Here is why, and we revisit it at mid-year, in public.\"" },
        { id: "o-state", label: "\"The state left us no choice.\"" },
        { id: "o-silent", label: "Say nothing and let the adopted budget speak for itself" },
      ],
      title: "After a hard budget vote, how does the chair explain the cut?",
      cue: "Pick the statement that takes the hard call and owns it.",
      why: "Owning a decision means the first person, the reason and a date to look again. Blaming the state may be partly true and still tells residents the committee will not stand behind its own choice; silence tells them nothing at all.",
    }),
    cpbQ({
      id: "mentor-next", target: "n-note",
      options: [
        { id: "n-note", label: "Pass her a quiet note with the next step and leave the gavel where it is" },
        { id: "n-take", label: "Take the gavel back and handle the room yourself" },
        { id: "n-wait", label: "Say nothing and let her work it out alone" },
      ],
      title: "Your successor freezes when a resident shouts at her. What does a mentor do?",
      cue: "Pick the answer that helps without taking over.",
      why: "Mentoring the next person means giving her what she needs to act while the authority stays visibly hers. Taking the gavel back teaches the room who is really in charge; leaving her alone teaches her that she was set up to fail.",
    }),
  ],

  build(root) {
    const hits = {};
    for (const step of this.steps) {
      for (const opt of step.options ?? []) {
        const o = new THREE.Object3D();
        o.visible = false;
        markInteractive(o, opt.id);
        root.add(o);
        hits[opt.id] = o;
      }
    }
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.4, -2),
      onStep() {}, onStepComplete() {}, onHazard() {}, animate() {},
    };
  },
};
