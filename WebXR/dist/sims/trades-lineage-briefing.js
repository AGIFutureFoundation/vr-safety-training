import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { markInteractive } from "../../../shared/kit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Trades Lineage Briefing — the heritage opener of the Job
// Readiness Edition, and like the other two briefings in the catalogue
// deliberately NOT a walkable scene. It is a flat dossier followed by a
// scored knowledge check on the same engine as every other station.
//
// The rules this file is written under (tools/briefs/wojrc-brief.md): the
// organisation whose programmes the edition trains, wojrc.org, may be
// described only in the sentences it published itself, quoted below; the
// person the sponsor names as running the programmes is named and nothing
// more; the Golden Gate Bridge opened in 1937; the Parks Conservancy article
// the sponsor linked exists and is recommended reading, but it could not be
// fetched from the environment this file was written in, so it is not
// summarised or quoted, and nobody who built the bridge is named here.
// Where the dossier does not know, it says so.

const TLB_ACCENT = 0xe07a3f;
const tlbQ = (o) => ({ kind: "select", ...o });

export const SIM_TRADES_LINEAGE_BRIEFING = {
  id: "trades-lineage-briefing",
  index: "227",
  domain: "Workforce readiness",
  trade: "Pre-apprentice — warehouse, Commercial Class A driving and the union construction trades",
  category: "Community Environmental Justice",
  certification: "None is earned by reading a briefing. The stations that follow it are cited to the standards the work is actually held to: OSHA's general industry rules in 29 CFR 1910 for the warehouse, the Teamsters' training programmes for the dock and the cab, NIOSH guidance on long hours and shift work, SAMHSA guidance for the wellness stations, and Psychological First Aid as the Red Cross and NCTSN teach it",
  name: "Trades Lineage Briefing",
  title: simTitle("Trades Lineage Briefing"),
  tagline: "The trades as a lineage — what the sponsor's own text says the programmes are, the bridge that opened in 1937, an article listed as reading rather than retold, and an honest line around what is not sourced",
  flat: true,
  accent: TLB_ACCENT,
  accentCss: "#e07a3f",
  parSeconds: 300,
  supportLine: "the programme's peer-support team or the employee assistance programme (EAP) line your employer or union carries",
  badge: { id: "lineage-read", name: "Lineage Read", note: "The sourced text, the date, the unread article and the standard all answered without an unsafe conclusion" },

  game: system({
    name: "Job Readiness",
    currency: "SHIFT",
    ranks: ["Applicant", "Pre-Apprentice", "Trainee", "Journey-Ready", "Job Ready"],
    badges: [
      { id: "sourced-only", name: "Sourced Only", note: "The organisation described in its own words and nothing else", test: AWARD.all(AWARD.stepClean("what-they-offer"), AWARD.stepClean("who-runs-it")) },
      { id: "nobody-invented", name: "Nobody Invented", note: "No unsafe conclusion anywhere in the check", test: AWARD.safe },
      { id: "date-and-door", name: "Date and Door", note: "The bridge and the article answered clean", test: AWARD.all(AWARD.stepClean("bridge-year"), AWARD.stepClean("the-article")) },
    ],
    challenges: [
      { id: "clean-sheet", name: "Clean Sheet", note: "No corrections anywhere in the check", test: AWARD.clean },
      { id: "read-it-first", name: "Read It First", note: "Finish inside 70% of par — you read the dossier, not the options", test: AWARD.fast(0.7) },
    ],
  }),

  dossier: [
    {
      title: "What the programmes are, in the sponsor's own words",
      body: "The organisation is referred to here by its domain, wojrc.org. Everything this edition says about it is the text the sponsor supplied from that site, quoted without change: \"Everyone who is willing to work hard deserves an opportunity to succeed. For the past 14 years, we have been helping low-income Bay Area residents' gain the skills and confidence they need to get and keep jobs, and build financial security that support themselves and their families.\" And, under How We Help: \"We offer training for warehouse and Commercial A truck driver positions. We prepare you and help you navigate and enroll in union construction trades apprenticeship programs. We offer financial coaching to help build your credit score, reduce debt, and build savings.\" Two page titles are also sourced: \"TDL Pre-Apprenticeship Training\" and \"Wellness Resource Center\". Nothing else about the organisation could be fetched from the environment this station was written in, and nothing else is stated.",
      source: { label: "wojrc.org — text supplied by the sponsor of this edition", url: "https://wojrc.org/" },
    },
    {
      title: "Who runs the programmes, as far as this edition can say",
      body: "Joyce Guy is named by the sponsor of this edition as the person who runs the programmes. That is the whole of what is sourced: no title, no biography, no quotation and no history are attached to the name here, because none was supplied and none could be fetched. A learner who wants to know more asks the programme, not this briefing.",
      source: { label: "wojrc.org — text supplied by the sponsor of this edition", url: "https://wojrc.org/" },
    },
    {
      title: "A lineage, not a ladder",
      body: "The Golden Gate Bridge opened in 1937. The people who built it worked in the trades this edition prepares people for: ironwork and rigging, welding, labouring, operating, driving what had to be driven. Those trades are still taught the way they were taught then — a journey-level worker beside an apprentice, a skill handed down on the job under a written standard, a card or a licence earned rather than assumed. That is what this edition means by a lineage: not that anyone here built the bridge, but that a pre-apprentice loading a trailer, a Class A trainee doing a pre-trip inspection, and an apprentice on their first day at a union hall are standing in a line of people who did this work before them and were trained to do it safely. The bridge is the visible end of the line. The standards are the rest of it.",
      source: { label: "Golden Gate Bridge Highway and Transportation District — the bridge's own site", url: "https://www.goldengate.org/" },
    },
    {
      title: "Recommended reading — listed, not retold",
      body: "The sponsor linked an article from the Golden Gate National Parks Conservancy on the construction of the Golden Gate Bridge, the welding workers on it, and Black history in San Francisco. It is recommended reading for every learner who opens this edition, at the address the sponsor supplied. It could not be fetched from the environment this briefing was written in, so it is not summarised here and it is not quoted here, and no worker it may name is named here. A briefing that retold an article it had not read would be inventing a record, which is the one thing a sourced dossier must never do. Read the article itself; then the lineage in the section above has names in it, put there by the people who did the research.",
      source: { label: "Golden Gate National Parks Conservancy — the article the sponsor linked (not fetched, not summarised here)", url: "https://www.parksconservancy.org/article/golden-gate-bridge-construction-welding-workers-black-history-san-francisco" },
    },
    {
      title: "What this edition trains, and what it is not",
      body: "Four blocks follow this briefing, each a procedure with its standard: the TDL pre-apprenticeship's warehouse work (the forklift and pallet jack under OSHA's powered industrial truck standard, 29 CFR 1910.178; dock and trailer loading; picking, packing and scanning; hazmat labelling under 49 CFR 172; racking and load limits; the NIOSH lifting equation) and its Commercial Class A driving (the pre-trip, the air-brake test, coupling, backing, cargo securement under 49 CFR 393, hours of service and the electronic log under 49 CFR 395, the roadside inspection, and the entry-level driver training rule in 49 CFR 380 Subpart F); navigating and enrolling in a union construction apprenticeship; financial coaching that builds credit, reduces debt and builds savings, with the consumer bodies named and no tax advice given; and the Wellness Resource Center block — four walkable stations on sleep and shift work, a peer-support conversation, substance use and the job, and asking for help — each of which closes with the guide's check-in and names the peer-support and EAP resource. This edition is a training aid built to be offered to the programme. It is not the programme's own curriculum and it does not speak for the organisation.",
      source: { label: "OSHA 29 CFR 1910.178 — powered industrial trucks", url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.178" },
      source2: { label: "SAMHSA — the wellness stations' guidance body", url: "https://www.samhsa.gov/" },
    },
  ],

  hazards: {
    "invent-the-record": "You filled in what the article says from memory or from a guess. This briefing did not read it; it lists it. A sourced dossier that retells a document it has not seen is inventing a record, and the first learner who reads the real article finds out that the training lied to them about the easiest thing in it.",
    "speak-for-org": "You described the organisation beyond the sentences it published. Its fourteen years, its three programmes and its two page titles are sourced; a title for the person who runs it, a founding story, a partner list or a number of graduates are not, and putting them in the sponsor's mouth is exactly what a small organisation spends its life correcting.",
    "name-a-worker": "You named one of the bridge's workers in a briefing that has not read the article about them. A name given from memory can be the wrong name, the wrong trade or the wrong bridge, and the people whose history the article records deserve to be named by the researchers who found them, not by a training aid guessing.",
    "heritage-over-standard": "You treated the lineage as a substitute for the standard. A trade passed down does not exempt anyone from the forklift evaluation, the entry-level driver training record, OSHA 10 or the apprenticeship's own first-period evaluation — heritage is why a learner is here, and the standard is what keeps them here.",
  },

  lateNotes: {},

  steps: [
    tlbQ({
      id: "what-they-offer", target: "wo-three",
      options: [
        { id: "wo-three", label: "Training for warehouse and Commercial A truck driver positions; help navigating and enrolling in union construction trades apprenticeship programs; financial coaching to build credit, reduce debt and build savings" },
        { id: "speak-for-org", label: "A union hiring hall with its own dispatch list, a housing programme and a legal clinic" },
        { id: "wo-college", label: "A two-year community college degree in logistics" },
      ],
      title: "What does the sponsor's own text say the organisation offers?",
      cue: "Pick the statement that matches the quoted text, and nothing beyond it.",
      why: "Everything this edition is allowed to say about the organisation is in those three sentences, so the first thing a learner has to be able to do is repeat them without adding to them. The four blocks of the edition map onto exactly that text — the warehouse and the cab, the apprenticeship, the coaching — and anything a station teaches that is not on that list is the edition's own, cited to a standard, not the organisation's.",
    }),
    tlbQ({
      id: "who-runs-it", target: "wr-named",
      options: [
        { id: "wr-named", label: "Joyce Guy, named by the sponsor of this edition as the person who runs the programmes — nothing else about her is sourced" },
        { id: "speak-for-org", label: "Joyce Guy, executive director for fourteen years and founder of the organisation" },
        { id: "wr-unknown", label: "Nobody is named; the programmes are run by a county agency" },
      ],
      title: "Who runs the programmes, and how much of that is sourced?",
      cue: "Pick the answer that stops where the sourcing stops.",
      why: "A name is sourced; a title, a tenure and a founding story are not, however plausible they sound next to the sentence about fourteen years. The discipline of this briefing is to say exactly as much as the record supports and then stop, because a learner repeats what a briefing says to a hiring manager, and the person named would have to correct it.",
    }),
    tlbQ({
      id: "bridge-year", target: "by-1937",
      options: [
        { id: "by-1937", label: "1937" },
        { id: "by-1929", label: "1929" },
        { id: "by-1941", label: "1941" },
      ],
      title: "When did the Golden Gate Bridge open?",
      cue: "The one date this briefing states about the bridge.",
      why: "The bridge opened in 1937, and that is the only fact about its construction this briefing claims, because it is the only one it can source without the article. The date matters to the lineage frame for a plain reason: the trades that built it are the trades this edition prepares people for, and every card and licence those trades now require was written in the decades since — by people who saw what the work cost when it had none.",
    }),
    tlbQ({
      id: "the-article", target: "ta-listed",
      options: [
        { id: "ta-listed", label: "It exists at the address the sponsor supplied and is recommended reading; it could not be fetched, so this briefing does not summarise or quote it" },
        { id: "invent-the-record", label: "It profiles the welders who worked the towers and gives their names, which the briefing repeats" },
        { id: "ta-quoted", label: "It is quoted in full in the dossier above" },
      ],
      title: "What does this briefing say about the Parks Conservancy article?",
      cue: "Pick the honest description of what was, and was not, read.",
      why: "A listing is not a summary. The briefing knows the article's subject from the sponsor's description and its address from the sponsor's link, and that is all; retelling it would mean inventing what a researcher wrote. Saying plainly that a document was not read is what lets a learner trust the parts of the dossier that were sourced — a briefing that fudges one paragraph teaches people to doubt the rest.",
    }),
    {
      id: "the-blocks", kind: "sequence", anyOrder: true,
      targets: ["blk-warehouse", "blk-class-a", "blk-apprentice", "blk-finance", "blk-wellness"],
      itemNames: { "blk-warehouse": "TDL warehouse", "blk-class-a": "TDL Commercial Class A driving", "blk-apprentice": "apprenticeship navigation", "blk-finance": "financial coaching", "blk-wellness": "the Wellness Resource Center block" },
      decoyNotes: { "speak-for-org": "The sourced text says the organisation helps people navigate and enrol in union apprenticeship programmes. It does not say the organisation runs a hiring hall or a dispatch list, and this edition may not say so either." },
      options: [
        { id: "blk-warehouse", label: "TDL warehouse — forklift, dock, pick and pack, hazmat labels, racking, lifting" },
        { id: "blk-class-a", label: "TDL Commercial Class A — pre-trip, air brakes, coupling, backing, securement, hours of service, inspection" },
        { id: "blk-apprentice", label: "Apprenticeship navigation — the standard, the test, the tool list, OSHA 10, the hall, the first evaluation" },
        { id: "blk-finance", label: "Financial coaching — credit report, debt plan, pay stub, budget, savings, predatory lending, benefits" },
        { id: "blk-wellness", label: "Wellness Resource Center — sleep and shift work, peer support, substance use and the job, asking for help" },
        { id: "speak-for-org", label: "The organisation's own hiring hall and dispatch list" },
      ],
      title: "Which blocks make up this edition?",
      cue: "Select every block that follows this briefing — order does not matter.",
      why: "The edition is organised around the sponsor's three sentences plus the one page title that names a wellness centre, and knowing the blocks is knowing what is a procedure with a standard behind it and what is not. The decoy is the kind of thing that sounds right — a union hall — and is not in the text; a learner who can tell the difference here can tell the difference when a station's step names a rule.",
    },
    tlbQ({
      id: "toolbox-talk", target: "tt-point-to-it",
      options: [
        { id: "tt-point-to-it", label: "Say the article exists, give the address the sponsor supplied, and do not name anyone this briefing has not sourced" },
        { id: "name-a-worker", label: "Give a name from memory — one is bound to be right" },
        { id: "tt-make-one-up", label: "Make up a representative name as an example" },
      ],
      title: "A learner asks you to name one of the bridge's Black welders for a toolbox talk. What do you do?",
      cue: "Pick the answer that keeps the history in the hands of the people who researched it.",
      why: "The reason the article is recommended is that it holds names and facts this briefing does not. A toolbox talk that points people to the source gives them the real history; one that guesses a name hands them a wrong one with a steward's authority behind it. Naming nobody is not erasing anybody — it is refusing to speak for a record that somebody else did the work to build.",
    }),
    tlbQ({
      id: "lineage-and-standard", target: "ls-same-card",
      options: [
        { id: "ls-same-card", label: "The standard is the same for everyone in the line: the forklift evaluation, the entry-level driver training record, OSHA 10, the apprenticeship's first-period evaluation — the lineage is why you are here, not a pass around any of it" },
        { id: "heritage-over-standard", label: "A trade handed down in a family or a neighbourhood does not need the card — the experience is the qualification" },
        { id: "ls-only-new", label: "The standards apply to new trades only; the old trades are grandfathered" },
      ],
      title: "What does the lineage frame mean for the standard?",
      cue: "Pick the statement the rest of this edition is built on.",
      why: "Every station after this one is a procedure cited to a body — OSHA in 29 CFR 1910, the Teamsters' training programmes, NIOSH, SAMHSA — and the frame of a lineage would be worthless if it read as an exemption. The people who built the bridge in 1937 worked without most of those rules and paid for it; the rules exist because of what that cost. Standing in their line means holding the standard, not skipping it.",
    }),
    tlbQ({
      id: "wellness-block", target: "wb-four-stations",
      options: [
        { id: "wb-four-stations", label: "Four stations of this edition — sleep and shift work, a peer-support conversation, substance use and the job, asking for help — each closing with the guide's check-in and naming the peer-support and EAP resource" },
        { id: "speak-for-org", label: "A clinical counselling service the organisation runs, described here from its own materials" },
        { id: "wb-screening", label: "An employer's fitness-for-duty screening" },
      ],
      title: "What is the Wellness Resource Center block in this edition?",
      cue: "Pick the description that speaks for the edition, not for the organisation.",
      why: "The page title is sourced; what the organisation's centre does is not, so the edition's wellness stations describe themselves — four procedures grounded in SAMHSA and NIOSH guidance and in Psychological First Aid, with the guide's own check-in at the end of each. Calling them the organisation's clinical service would be the speaking-for-others this whole briefing is built to avoid, and calling them a screening would make sure nobody used them.",
    }),
  ],

  build(root) {
    const hits = {};
    for (const step of this.steps) {
      for (const opt of step.options ?? []) {
        if (hits[opt.id]) continue;
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
