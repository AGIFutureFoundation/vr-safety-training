import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { markInteractive } from "../../../shared/kit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Reading an Apprenticeship Standard — the briefing station that
// opens the apprenticeship-navigation block of the Job Readiness Edition.
//
// Like the other flat briefing stations in this catalogue it is deliberately
// NOT a walkable scene: a dossier with its sources, then a scored knowledge
// check on the same engine as every other station. It covers how to read a
// registered apprenticeship standard, the ladder from pre-apprentice to
// journey level, what an aptitude test usually covers, the tool list and the
// PPE, and where OSHA 10 fits beside the site's own training.
//
// Every section names its source. Where a specific belongs to a particular
// programme — its test, its tool list, its rates — the dossier says "not
// sourced here" and sends the learner to that programme's own documents. The
// sponsoring organisation is described only in the one sentence of its own
// text that the edition quotes.

const ASR_ACCENT = 0xe0b04a;
const asrQ = (o) => ({ kind: "select", ...o });

export const SIM_APPRENTICESHIP_STANDARDS_READING = {
  id: "apprenticeship-standards-reading",
  index: "256",
  domain: "Apprenticeship navigation",
  trade: "Apprenticeship navigation — reading the standard",
  category: "Community Environmental Justice",
  certification: "Registered apprenticeship standards as a category — the written standards a sponsor registers with the U.S. Department of Labor or a State Apprenticeship Agency, setting the term and work processes, related instruction, the progressive wage schedule, the ratio, the probationary period, the selection procedure and the equal-opportunity pledge; OSHA 10 through the OSHA Outreach Training Program; OSHA 29 CFR 1926.21 on the employer's duty to train each employee for the site; the building-trades training funds that sponsor such programmes, LIUNA and IUOE among them",
  name: "Reading an Apprenticeship Standard",
  title: simTitle("Reading an Apprenticeship Standard"),
  tagline: "How to read a registered apprenticeship standard, the ladder from pre-apprentice to journey level, what the aptitude test covers, the tool list, and where OSHA 10 fits — a sourced briefing and knowledge check",
  flat: true,
  accent: ASR_ACCENT,
  accentCss: "#e0b04a",
  parSeconds: 300,
  badge: { id: "standard-read", name: "Standard Read", note: "The standard, the ladder, the test and the first morning answered without an unsafe conclusion" },

  game: system({
    name: "Standard Reader",
    currency: "CLAUSE",
    ranks: ["Curious", "Reader", "Applicant-Ready", "Ladder-Wise", "Standard Reader Certified"],
    badges: [
      { id: "read-the-document", name: "Read The Document", note: "What a standard states and the ladder answered clean", test: AWARD.all(AWARD.stepClean("what-it-states"), AWARD.stepClean("ladder-order")) },
      { id: "no-shortcut-in", name: "No Shortcut In", note: "Never chose a shortcut into the trade", test: AWARD.safe },
      { id: "first-morning-right", name: "First Morning Right", note: "The first morning put in order without correction", test: AWARD.stepClean("first-morning") },
    ],
    challenges: [
      { id: "clean-check", name: "Clean Check", note: "No corrections anywhere in the check", test: AWARD.clean },
      { id: "read-it-first", name: "Read It First", note: "Finish inside 70% of par — you read the dossier, not the options", test: AWARD.fast(0.7) },
    ],
  }),

  dossier: [
    {
      title: "What an apprenticeship standard is",
      body: "A registered apprenticeship programme runs under written standards that its sponsor — often a joint committee of a union and contractors — registers with the U.S. Department of Labor's Office of Apprenticeship or with a State Apprenticeship Agency; in California that agency is the Division of Apprenticeship Standards. The standard is the document to read before applying. It states the occupation; the term, as hours of on-the-job learning broken down by work process; the related technical instruction; the progressive wage schedule, as a share of the journey-level rate for each period; the ratio of apprentices to journey-level workers; the probationary period; the selection procedure; and the equal-opportunity pledge. Not sourced here: any particular programme's figures — its hours, its rates, its ratio. Read those in that programme's own standard.",
      source: { label: "U.S. Department of Labor — Apprenticeship.gov", url: "https://www.apprenticeship.gov/" },
      source2: { label: "California DIR — Division of Apprenticeship Standards", url: "https://www.dir.ca.gov/das/" },
    },
    {
      title: "The ladder, from pre-apprentice to journey level",
      body: "Pre-apprenticeship prepares people to enter a registered programme's selection process — many building-trades pre-apprenticeship programmes teach North America's Building Trades Unions' Multi-Craft Core Curriculum — but it does not by itself place anyone in a programme. An applicant then goes through the programme's selection procedure. Once indentured, an apprentice serves the probationary period the standard sets, then advances period by period as on-the-job hours, related instruction and evaluations are completed, with a raise at each step of the wage schedule. Completing the term leads to journey-level status and a certificate of completion from the registration agency. Not sourced here: how long any trade's ladder takes, or how many applicants any programme accepts.",
      source: { label: "U.S. Department of Labor — Apprenticeship.gov", url: "https://www.apprenticeship.gov/" },
      source2: { label: "North America's Building Trades Unions", url: "https://nabtu.org/" },
    },
    {
      title: "What the aptitude test usually covers",
      body: "Many construction programmes include an aptitude test in their selection procedure. Across trades the common sections are arithmetic and measurement — fractions, decimals, reading a tape measure — and reading comprehension, with mechanical reasoning or spatial questions on some trades' tests and not others. Minimum qualifications commonly include an age at indenture, a diploma or equivalency, and sometimes a driver's licence. Not sourced here: any specific trade's test, its sections, its time limits or its passing score. The programme's own recruitment notice and outline are the only place to read those, and nobody outside the programme can sell a place on its list.",
      source: { label: "U.S. Department of Labor — Apprenticeship.gov", url: "https://www.apprenticeship.gov/" },
    },
    {
      title: "The tool list and the PPE",
      body: "Programmes publish the basic hand tools a first-period apprentice is expected to bring. The sensible rule is to buy what is on the list and nothing more until a journey-level worker tells you what the work needs. Personal protective equipment is different: OSHA's rules generally require the employer to pay for the PPE a job requires, with exceptions such as ordinary safety-toe boots and prescription safety glasses. Not sourced here: any programme's actual tool list, or what a particular employer provides.",
      source: { label: "OSHA — Personal protective equipment", url: "https://www.osha.gov/personal-protective-equipment" },
    },
    {
      title: "OSHA 10 and the site's own training",
      body: "OSHA 10 is the ten-hour construction course of the OSHA Outreach Training Program, taught by an authorized trainer. It is voluntary awareness training — some states and many contractors require it — and it is not a licence and not a certification. It does not replace the employer's own duty under 29 CFR 1926.21 to instruct each employee in recognising and avoiding the unsafe conditions of the job, which is what the site-specific orientation on the first morning is for.",
      source: { label: "OSHA Outreach Training Program", url: "https://www.osha.gov/training/outreach" },
      source2: { label: "OSHA 29 CFR 1926.21 — Safety training and education", url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.21" },
    },
    {
      title: "What this edition is, and what is not sourced",
      body: "The Job Readiness Edition is built from the programmes wojrc.org describes. On apprenticeship, its own words are: \"We prepare you and help you navigate and enroll in union construction trades apprenticeship programs.\" Nothing else about the organisation's navigation service — how it works, who runs it, its partners or its results — could be retrieved when this station was written, so none of it is stated here. The stations that follow train the steps any applicant takes, sited generically.",
      source: { label: "wojrc.org — text supplied by the sponsor of this edition", url: "https://wojrc.org/" },
    },
  ],

  hazards: {
    "asr-pay-for-placement": "You chose to pay a placement agency to skip the selection procedure. A registered programme selects apprentices by the procedure written in its apprenticeship standard, and nobody outside it can sell a place on its list. The money buys nothing, and the time spent waiting on a promise is time not spent on the steps that actually get people in.",
    "asr-buy-answers": "You chose to buy a copy of the 'real test' online. Programmes treat anything like that as grounds to disqualify an applicant, and what is sold as the real test usually is not. The sections most tests cover — arithmetic, measurement, reading — are learnable honestly, for free, in the weeks before the test.",
    "asr-fake-card": "You chose a card sold online without the course. An OSHA 10 card comes from an authorized trainer after the actual ten hours, and a card bought without them is worthless on a site that checks — and worse, it means walking onto that site without the awareness the course exists to give.",
    "asr-skip-orientation": "You put 'skip the site orientation — you have OSHA 10' in the first morning. The card is general awareness; the orientation is about this site's edges, loads, routes and muster point, and 29 CFR 1926.21 puts the duty to give it on the employer. Skipping it means starting work on a site nobody has shown you.",
  },

  lateNotes: {},

  steps: [
    asrQ({
      id: "where-registered", target: "asr-registered-agency",
      options: [
        { id: "asr-registered-agency", label: "With the U.S. Department of Labor's Office of Apprenticeship or a State Apprenticeship Agency — in California, the Division of Apprenticeship Standards" },
        { id: "asr-registered-hr", label: "With the contractor's human-resources department, and nowhere else" },
        { id: "asr-registered-none", label: "Nowhere — an apprenticeship is an informal arrangement between a worker and a boss" },
      ],
      title: "Where is a registered apprenticeship standard registered?",
      cue: "Pick the answer the dossier sources.",
      why: "A registered programme's standard is on file with the Department of Labor or a State Apprenticeship Agency, which is what makes it a public document an applicant can ask to read, and what makes the certificate at the end mean the same thing to every employer. Knowing where it is registered is knowing where to check that a programme is real before spending a year on it.",
    }),
    asrQ({
      id: "wage-schedule", target: "asr-wage-progressive",
      options: [
        { id: "asr-wage-progressive", label: "Your rate for each period as a share of the journey-level rate, rising as you advance" },
        { id: "asr-wage-flat", label: "One flat rate for the whole apprenticeship" },
        { id: "asr-wage-hours", label: "A guaranteed number of paid hours every week" },
      ],
      title: "What does the progressive wage schedule in a standard tell you?",
      cue: "Pick the statement that matches how a standard sets pay.",
      why: "The wage schedule is how an apprentice checks every pay stub: the rate for the current period as a share of the journey-level rate, and the step up at each advancement. It sets the rate, not the hours — construction work comes and goes with the season and the dispatch — which is why the budget and the savings stations in this edition exist at all.",
    }),
    {
      id: "what-it-states", kind: "find", noHint: true,
      targets: ["asr-states-term", "asr-states-instruction", "asr-states-ratio", "asr-states-probation"],
      itemNames: { "asr-states-term": "the term and work processes", "asr-states-instruction": "the related instruction", "asr-states-ratio": "the ratio", "asr-states-probation": "the probationary period" },
      itemNotes: {
        "asr-states-term": "The term is set as hours of on-the-job learning, broken down by work process — the list your logbook is kept against.",
        "asr-states-instruction": "Related technical instruction is the classroom side, and attendance at it is part of every evaluation.",
        "asr-states-ratio": "The ratio of apprentices to journey-level workers is what keeps an apprentice supervised on the job.",
        "asr-states-probation": "The probationary period is the first stretch, during which either side can end the apprenticeship more easily.",
      },
      decoyNotes: { "asr-states-address": "A standard covers the programme, not a particular jobsite — where you work comes from a dispatch, not from the standard." },
      options: [
        { id: "asr-states-term", label: "The term, as hours of on-the-job learning by work process" },
        { id: "asr-states-address", label: "The address of your first jobsite" },
        { id: "asr-states-instruction", label: "The related technical instruction" },
        { id: "asr-states-ratio", label: "The ratio of apprentices to journey-level workers" },
        { id: "asr-states-probation", label: "The probationary period" },
      ],
      title: "Which of these does an apprenticeship standard state?",
      cue: "Select every item a standard states — there are four.",
      why: "Reading a standard means knowing what to look for in it: the term and the work processes the hours are counted against, the related instruction you must attend, the ratio that keeps you supervised, and the probationary period at the start. Those four decide what the first year is actually like, and every one is in the document before anyone applies.",
    },
    asrQ({
      id: "pre-apprenticeship", target: "asr-pre-prepares",
      options: [
        { id: "asr-pre-prepares", label: "Preparation for a registered programme's selection process — useful, but not a guaranteed place" },
        { id: "asr-pay-for-placement", label: "Pay a placement agency to skip the selection procedure" },
        { id: "asr-pre-guarantee", label: "Finishing it guarantees indenture in any trade you choose" },
      ],
      title: "What does a pre-apprenticeship programme do?",
      cue: "Pick the honest description.",
      why: "Pre-apprenticeship is the rung below the ladder: math, reading, safety and an introduction to the trades, often from the building-trades unions' own curriculum, so that applicants arrive at a programme's selection process ready for it. It makes a real difference and it guarantees nothing, which is exactly why nobody selling a guaranteed place should be believed.",
    }),
    {
      id: "ladder-order", kind: "sequence",
      targets: ["asr-rung-pre", "asr-rung-applicant", "asr-rung-probation", "asr-rung-periods", "asr-rung-journey"],
      itemNames: { "asr-rung-pre": "pre-apprentice", "asr-rung-applicant": "applicant", "asr-rung-probation": "probationary apprentice", "asr-rung-periods": "apprentice advancing by period", "asr-rung-journey": "journey-level worker" },
      outOfOrderNote: "Out of order. Pre-apprentice, then applicant through the selection procedure, then probationary apprentice, then advancing period by period, then journey level.",
      options: [
        { id: "asr-rung-periods", label: "Apprentice advancing period by period" },
        { id: "asr-rung-applicant", label: "Applicant, through the selection procedure" },
        { id: "asr-rung-journey", label: "Journey-level worker, with a certificate of completion" },
        { id: "asr-rung-pre", label: "Pre-apprentice" },
        { id: "asr-rung-probation", label: "Probationary apprentice" },
      ],
      title: "Put the ladder in order",
      cue: "Select the rungs from the bottom to the top.",
      why: "The ladder is how the whole block is organised: pre-apprenticeship, the application and test, the probationary period, the periods of the term with a raise at each, and journey level at the end with a certificate from the registration agency. Seeing it whole is what turns a first-period rate into a step on a known path rather than a low wage with no end.",
    },
    asrQ({
      id: "aptitude-test", target: "asr-test-common",
      options: [
        { id: "asr-test-common", label: "Commonly arithmetic and measurement and reading comprehension, with mechanical reasoning on some trades — the programme's notice says which" },
        { id: "asr-buy-answers", label: "Buy a copy of the 'real test' online and memorise it" },
        { id: "asr-test-same", label: "Every trade uses the same national test with the same passing score" },
      ],
      title: "What does an aptitude test usually cover, and where do you check?",
      cue: "Pick the answer that is sourced, not rumoured.",
      why: "Tests differ between trades and programmes, but most cover the arithmetic and measurement the work runs on and the reading that safety depends on, with mechanical reasoning on some. The programme's own notice is the only place a specific test is described; this briefing marks everything beyond the common sections as not sourced, because that is what it is.",
    }),
    {
      id: "tool-list", kind: "find", noHint: true,
      targets: ["asr-tools-list", "asr-tools-ppe", "asr-tools-ask"],
      itemNames: { "asr-tools-list": "buy what the list names", "asr-tools-ppe": "the employer generally pays for required PPE", "asr-tools-ask": "ask a journey-level worker before buying more" },
      itemNotes: {
        "asr-tools-list": "The programme's list is the standard for day one — not a catalogue, and not a coworker's full kit.",
        "asr-tools-ppe": "OSHA's rules generally put the cost of required PPE on the employer, with exceptions such as ordinary safety-toe boots and prescription safety glasses.",
        "asr-tools-ask": "What the work really needs becomes clear on the job. Ask before buying, and spend the money when you know.",
      },
      decoyNotes: { "asr-tools-everything": "A full professional kit before day one is money a first-period apprentice rarely needs to spend, and much of it may be wrong for the work you are sent to." },
      options: [
        { id: "asr-tools-list", label: "Buy what the programme's tool list names" },
        { id: "asr-tools-everything", label: "Buy the full professional set before the first day" },
        { id: "asr-tools-ppe", label: "The employer generally pays for required PPE, with exceptions like ordinary safety-toe boots" },
        { id: "asr-tools-ask", label: "Ask a journey-level worker before buying more" },
      ],
      title: "Which of these are true about the tool list and PPE?",
      cue: "Select the three true statements.",
      why: "First-period pay is the lowest rate on the schedule, and the tool list is where a new apprentice can spend money they do not have. The list is the day-one standard; required PPE is generally the employer's cost under OSHA's rules, with the exceptions the dossier names; and everything beyond the list waits until somebody who does the work says it is needed. The actual list is the programme's, and is not sourced here.",
    },
    asrQ({
      id: "osha-10", target: "asr-osha-awareness",
      options: [
        { id: "asr-osha-awareness", label: "A voluntary ten-hour awareness course from the OSHA Outreach Training Program — not a licence, and not a substitute for site training" },
        { id: "asr-fake-card", label: "A card you can buy online without sitting the course" },
        { id: "asr-osha-licence", label: "A licence to work unsupervised on any construction site" },
      ],
      title: "What is OSHA 10?",
      cue: "Pick the description the dossier sources.",
      why: "OSHA 10 is worth having — many contractors and some states ask for it — and it is worth being clear about: it is awareness training from an authorized trainer, not a licence and not a certification. Knowing that keeps an apprentice from treating the card as permission to skip the orientation, and from paying for a card with no course behind it.",
    }),
    {
      id: "first-morning", kind: "sequence",
      targets: ["asr-morning-signin", "asr-morning-orientation", "asr-morning-toolbox", "asr-morning-task"],
      itemNames: { "asr-morning-signin": "sign in and show OSHA 10", "asr-morning-orientation": "the site-specific orientation", "asr-morning-toolbox": "the toolbox talk", "asr-morning-task": "the first task, under a journey-level worker" },
      outOfOrderNote: "Out of order. Sign in and show the card, take the site orientation, stand in for the toolbox talk, and only then start the first task alongside your journey-level worker.",
      options: [
        { id: "asr-morning-toolbox", label: "Stand in for the toolbox talk" },
        { id: "asr-morning-signin", label: "Sign in at the trailer and show the OSHA 10 card" },
        { id: "asr-skip-orientation", label: "Skip the site orientation — you already have OSHA 10" },
        { id: "asr-morning-task", label: "Start the first task under a journey-level worker" },
        { id: "asr-morning-orientation", label: "Take the site-specific orientation" },
      ],
      title: "Put the first morning on site in order",
      cue: "Select the steps in the order they happen — one of the options does not belong at all.",
      why: "The first morning has an order for a reason: the site has to know you are on it, then show you its hazards and emergency plan — the instruction 29 CFR 1926.21 makes the employer's duty — then the crew's plan for the day, and only then the work, alongside the journey-level worker the standard puts you under. The jobsite station of this block walks that morning in full.",
    },
    asrQ({
      id: "what-is-sourced", target: "asr-sourced-quote",
      options: [
        { id: "asr-sourced-quote", label: "Only its own sentence — \"We prepare you and help you navigate and enroll in union construction trades apprenticeship programs.\" — and nothing more" },
        { id: "asr-sourced-history", label: "A detailed history of the organisation's apprenticeship placements" },
        { id: "asr-sourced-staff", label: "The names and roles of its navigation staff" },
      ],
      title: "What does this briefing say about the organisation behind the edition?",
      cue: "Pick the honest description of what is sourced.",
      why: "A briefing is only as trustworthy as its sources, and the last question is about this one. The edition quotes one sentence of the organisation's own text on apprenticeship and marks everything else about it as not sourced, because nothing else could be retrieved. Saying so plainly is the same discipline the whole block teaches: read the document, and do not repeat what nobody can show you.",
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
