import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { markInteractive } from "../../../shared/kit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Can We Live? — the opening station of the Hunters Point
// Edition, and like the Hunters Point Briefing deliberately NOT a walkable
// scene. It is a flat, sourced dossier on the Marie Harrison Community
// Foundation ("Can We Live?"), the woman it is named for, and the story of
// the community's fight over the shipyard cleanup, followed by a scored
// knowledge check on the same engine as every other station.
//
// Every claim below carries its source. This edition is a training aid
// built to be offered to the foundation and the trades that work beside it;
// it is not the foundation's own programme and does not speak for it. The
// foundation's own pages could not be retrieved from the environment this
// file was written in, so where its own words belong the dossier says so
// rather than guessing.

const ACCENT = 0xf2c14b;
const q = (o) => ({ kind: "select", ...o });

export const SIM_CAN_WE_LIVE_STORY = {
  id: "can-we-live-story",
  index: "146",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  certification: "Community science under the foundation's own programmes with Greenaction for Health and Environmental Justice; OSHA HAZWOPER 29 CFR 1910.120 for anyone who goes inside a cleanup fence; EPA QA/QC and chain-of-custody guidance for any sample that will be relied on; informed consent under 45 CFR 46 for biomonitoring",
  name: "Can We Live? — The Story",
  title: simTitle("Can We Live? — The Story"),
  tagline: "The Marie Harrison Community Foundation, the woman it is named for, and the community fight over the shipyard cleanup — a sourced briefing and knowledge check that opens the Hunters Point Edition",
  flat: true,
  accent: ACCENT,
  accentCss: "#f2c14b",
  parSeconds: 320,
  badge: { id: "her-story", name: "Her Story", note: "The foundation, its founder and the record answered without an unsafe conclusion" },

  game: system({
    name: "Community Science",
    currency: "PATROL",
    ranks: ["Neighbour", "Patrol Member", "Monitor Lead", "Data Steward", "Community Scientist"],
    badges: [
      { id: "named-right", name: "Named Right", note: "The foundation and its founder answered clean", test: AWARD.all(AWARD.stepClean("founder"), AWARD.stepClean("programmes")) },
      { id: "consent-first", name: "Consent First", note: "Never chose a sample over a person's consent", test: AWARD.safe },
      { id: "record-straight", name: "Record Straight", note: "The site record and the community's role answered without correction", test: AWARD.all(AWARD.stepClean("record"), AWARD.stepClean("community-data")) },
    ],
    challenges: [
      { id: "clean-sheet", name: "Clean Sheet", note: "No corrections anywhere in the check", test: AWARD.clean },
      { id: "read-it-first", name: "Read It First", note: "Finish inside 70% of par — you read the dossier, not the options", test: AWARD.fast(0.7) },
    ],
  }),

  dossier: [
    {
      title: "The organisation",
      body: "The Marie Harrison Community Foundation, Inc. — known as \"Can We Live?\" — is a community-based 501(c)(3) in Bayview Hunters Point, San Francisco, founded and led by Executive Director Arieann Harrison in honour of her mother. Its programmes include the Community Pollution Patrol Network, the Hunters Point Biomonitoring Initiative, the Marie Harrison Community Foundation Academic Scholarship, Solutions for Women, the YES Camp youth summer camp-internship, the BaySpark youth climate event and the Bayview Hunters Point Air Monitor Project. Arieann Harrison serves on the Bay Area Air Quality Management District's Community Advisory Council.",
      source: { label: "Marie Harrison Community Foundation", url: "https://www.canwelive.org/" },
      source2: { label: "BAAQMD Community Advisory Council — Arieann Harrison", url: "https://www.baaqmd.gov/en/about-the-air-district/community-advisory-council/harrison" },
    },
    {
      title: "Marie Harrison, 1948–2019",
      body: "Marie Harrison (30 January 1948 – 5 May 2019) was called the mother of the environmental justice movement in Bayview Hunters Point. As a young woman she worked at the Hunters Point Shipyard. She lived in Hunters View beside the PG&E Hunters Point power plant, and the community campaign she was part of saw the plant shut down in 2006 and its stacks imploded on 18 June 2008. She wrote a column for the San Francisco Bay View, then worked full time for Greenaction for Health and Environmental Justice, staying on its board when her health no longer allowed her to work. A non-smoker, she lived her last years with lung damage that kept her on oxygen, and she kept testifying at hearings and protests until the end. Greenaction and her family created a youth environmental justice scholarship fund in her name.",
      source: { label: "San Francisco Bay View — Marie Harrison, mother of the movement (2019)", url: "https://sfbayview.com/2019/05/marie-harrison-mother-of-the-movement-for-environmental-justice/" },
      source2: { label: "Greenaction — in honor and memory of Marie Harrison", url: "https://greenaction.org/2020/05/06/in-honor-and-memory-of-marie-harrison-1-30-1948-5-5-2019/" },
    },
    {
      title: "The air the neighbourhood measures itself",
      body: "The Marie Harrison Bayview Air Monitoring Project, named for her after her death from lung disease, placed ten air monitors in and around Bayview Hunters Point so that residents have their own record of what they breathe. The foundation works with residents to screen them for toxins through its biomonitoring initiative and offers scholarships to students who study environmental justice. In June 2026 the foundation and Greenaction issued a joint community call to action and demands on the shipyard cleanup.",
      source: { label: "Inside Climate News — advocates have taken air monitoring into their own hands (2021)", url: "https://insideclimatenews.org/news/27112021/air-pollution-bayview-hunters-point-san-francisco/" },
      source2: { label: "Greenaction — June 2026 community call to action and demands", url: "https://greenaction.org/2026/06/06/june-2026-bayview-hunters-point-community-call-to-action-and-demands-issued-by-greenaction-and-the-marie-harrison-community-foundation-inc/" },
    },
    {
      title: "The site record",
      body: "Hunters Point Naval Shipyard has been an EPA Superfund site since 1989, with the Navy as lead agency under EPA and California oversight. Federal False Claims Act litigation over falsified radiological soil data by the Navy's contractor was settled for $57 million in 2026 without resolving the residents' own federal suit, filed by Greenaction in 2024, over whether the cleanup protects health. The Hunters Point Briefing station carries that record in full; this station is about the people beside the fence.",
      source: { label: "EPA Superfund site profile", url: "https://cumulis.epa.gov/supercpad/cursites/csitinfo.cfm?id=0902722" },
      source2: { label: "Greenaction — Bayview Hunters Point", url: "https://greenaction.org/bayview-hunters-point/" },
    },
    {
      title: "What this edition is, and is not",
      body: "The twenty-five stations that follow train the skills a community science programme and the trades beside it actually use: installing and checking air sensors, running a pollution patrol, supporting biomonitoring with consent and chain of custody, fence-line dust and haul-route observation, split soil and sediment samples, radiological literacy, the training gate into cleanup work, and turning data into public testimony. Every one is sited generically. This edition is a training aid built to be offered to the foundation and its partners; it is not the foundation's own programme and does not speak for it. The foundation's CLEAR page could not be retrieved when this station was written, so its own description of that work belongs here, in its own words, before the edition is used with learners.",
      source: { label: "OSHA 29 CFR 1910.120 — HAZWOPER", url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.120" },
    },
  ],

  hazards: {
    "no-consent": "You chose to collect a biomonitoring sample first and explain later. A person's hair, urine or blood is theirs; informed consent, in their language, with the right to say no and to get their own results back, comes before any tube is opened — that is the rule under 45 CFR 46 and the foundation's own practice.",
    "dismiss-community": "You dismissed the neighbourhood's monitors as noise. On a site whose contractor data was found unreliable, the community's independent record is the control, not a courtesy.",
    "speak-for-org": "You presented this simulator as the foundation's own programme. It is a training aid offered to them; their programmes are theirs to describe, and putting words in their mouth is exactly what a community organisation spends its life correcting.",
    "walk-in": "You treated an active Superfund parcel as open ground. Parcels are behind fences and institutional controls; a community monitor works from the public side of the fence unless trained, badged and escorted.",
  },

  lateNotes: {},

  steps: [
    q({
      id: "founder", target: "f-arieann",
      options: [
        { id: "f-arieann", label: "Arieann Harrison, Executive Director, who founded it in honour of her mother Marie Harrison" },
        { id: "f-navy", label: "The Navy's community relations office, as part of the cleanup programme" },
        { id: "f-city", label: "The City of San Francisco's Department of Public Health" },
      ],
      title: "Who founded and leads the Marie Harrison Community Foundation?",
      cue: "Pick the statement that matches the foundation's own record.",
      why: "Who an organisation is decides whose training this is. A community foundation founded by a resident in her mother's name is accountable to the neighbourhood first; a training aid offered to it has to know that before it says a word about the site.",
    }),
    q({
      id: "marie", target: "m-plant",
      options: [
        { id: "m-plant", label: "A resident of Hunters View whose community campaign helped close the PG&E Hunters Point power plant in 2006, later a Greenaction advocate who kept testifying while on oxygen" },
        { id: "m-contractor", label: "The Navy's radiological contractor's community liaison" },
        { id: "m-scientist", label: "A university scientist who ran the shipyard's monitoring programme" },
      ],
      title: "Who was Marie Harrison?",
      cue: "Pick the description that matches the sourced record.",
      why: "The story is the reason the work exists. A neighbour who worked at the shipyard as a young woman, lived beside the power plant, helped shut it down and testified on oxygen until her death is why the foundation measures its own air — and why its patrols log what they smell.",
    }),
    {
      id: "programmes", kind: "sequence", anyOrder: true,
      targets: ["p-patrol", "p-bio", "p-scholar", "p-women"],
      itemNames: { "p-patrol": "Community Pollution Patrol Network", "p-bio": "Hunters Point Biomonitoring Initiative", "p-scholar": "Academic Scholarship", "p-women": "Solutions for Women" },
      decoyNotes: { "p-navy": "Radiological clearance of parcels is the Navy's job under EPA and state oversight, not a community foundation's. The foundation monitors, screens, educates and holds the process to account." },
      options: [
        { id: "p-patrol", label: "Community Pollution Patrol Network" }, { id: "p-bio", label: "Hunters Point Biomonitoring Initiative" },
        { id: "p-scholar", label: "Marie Harrison Community Foundation Academic Scholarship" }, { id: "p-women", label: "Solutions for Women" },
        { id: "p-navy", label: "Radiological clearance of shipyard parcels" },
      ],
      title: "Which programmes does the foundation run?",
      cue: "Select every programme that is the foundation's — order doesn't matter.",
      why: "The twenty-five stations of this edition are organised around these programmes: a patrol station trains what a patrol does, a biomonitoring station trains consent and custody, a scholarship is why the youth stations exist. Knowing the programmes is knowing the syllabus.",
    },
    q({
      id: "air", target: "a-ten",
      options: [
        { id: "a-ten", label: "Ten air monitors placed in and around Bayview Hunters Point by the community project named for her" },
        { id: "a-none", label: "None — the neighbourhood relies on the Navy's on-site instruments" },
        { id: "dismiss-community", label: "A few hobby sensors whose data should be disregarded on a regulated site" },
      ],
      title: "What is the Marie Harrison Bayview Air Monitoring Project?",
      cue: "Pick the real effort.",
      why: "A low-cost sensor network is only as good as its siting, its co-location checks and its data review — which is why three stations of this edition are about exactly that. The point of the project is that the neighbourhood holds its own record, and the point of the training is that the record stands up.",
    }),
    q({
      id: "consent", target: "c-consent",
      options: [
        { id: "c-consent", label: "Explain the study in the resident's language, confirm they can decline and will get their own results back, get signed consent, then collect under chain of custody" },
        { id: "no-consent", label: "Collect the sample while they are willing and go through the paperwork afterwards" },
        { id: "c-verbal", label: "A verbal yes at the door is enough for a hair sample" },
      ],
      title: "A resident agrees to join the biomonitoring initiative. What comes first?",
      cue: "Pick the order the programme requires.",
      why: "Biomonitoring turns a neighbour into a study participant. Informed consent under 45 CFR 46 — the study explained, the right to refuse, the right to their own results — is the ethical floor, and chain of custody is what makes the result mean anything when it comes back.",
    }),
    q({
      id: "patrol", target: "pt-log",
      options: [
        { id: "pt-log", label: "Log time, place, wind, what you smell and see, take a photo, and file the complaint with the Air District — then keep patrolling" },
        { id: "pt-confront", label: "Go through the site gate to find whoever is responsible" },
        { id: "walk-in", label: "Walk onto the parcel to photograph the source up close" },
      ],
      title: "On patrol you smell solvent downwind of a fenced parcel. What does a patrol member do?",
      cue: "Pick the response the patrol trains.",
      why: "A patrol is a record, not a raid. A timed, located, photographed, wind-noted observation filed with the Air District is evidence an inspector can act on; a body inside the fence is a trespass and an exposure, and it puts the patrol's credibility at risk.",
    }),
    q({
      id: "record", target: "r-live",
      options: [
        { id: "r-live", label: "An active Superfund site since 1989 under the Navy with EPA and state oversight; the contractor data case settled in 2026 while the residents' 2024 federal suit over the cleanup's adequacy continues" },
        { id: "r-done", label: "A completed cleanup, transferred to the city" },
        { id: "r-private", label: "A private redevelopment with no federal role" },
      ],
      title: "Where does the site record stand?",
      cue: "Pick the statement that matches the 2026 record.",
      why: "Everything a community monitor does happens against an unfinished record: parcels still under cleanup, litigation still open. Saying that honestly is the first thing a patrol lead owes a new member.",
    }),
    q({
      id: "community-data", target: "cd-control",
      options: [
        { id: "cd-control", label: "As an independent check on the site's own record, made credible by siting, calibration checks, chain of custody and honest data review" },
        { id: "dismiss-community", label: "As anecdote — only the regulators' instruments count" },
        { id: "cd-replace", label: "As a replacement for the regulators' monitoring, which can then stop" },
      ],
      title: "How should community data be treated on this site?",
      cue: "Pick the role the record supports.",
      why: "Neither dismissed nor oversold. Community data earned its standing here because the official data failed; it keeps that standing only by being done carefully, which is what the sensor, dust and sampling stations of this edition teach.",
    }),
    q({
      id: "gate", target: "g-hazwoper",
      options: [
        { id: "g-hazwoper", label: "A 40-hour HAZWOPER course, three supervised field days and an annual refresher, plus the site's own orientation — the trades on site are LIUNA laborers, IUOE operators, Teamsters and radiation technicians" },
        { id: "g-none", label: "A site badge and a toolbox talk" },
        { id: "g-volunteer", label: "Patrol experience counts as site training" },
      ],
      title: "What is the training gate from community patrol into paid cleanup work?",
      cue: "Pick the OSHA requirement.",
      why: "This edition ends with the pathway: patrol members and scholarship students who want the work behind the fence go through the same federal floor as every union laborer on the site. 29 CFR 1910.120 is the gate, and the site orientation sits on top of it.",
    }),
    q({
      id: "edition", target: "e-aid",
      options: [
        { id: "e-aid", label: "A training aid built to be offered to the foundation and its partners, sited generically, that does not speak for the foundation" },
        { id: "speak-for-org", label: "The foundation's official training programme, describing its work on its behalf" },
        { id: "e-navy", label: "The Navy's community outreach curriculum" },
      ],
      title: "What is this Hunters Point Edition?",
      cue: "Pick the honest description.",
      why: "The last unsafe conclusion is about us. A simulator that claims to be a community organisation's own voice takes something that is theirs. This edition is offered; what the foundation says about its work, including its CLEAR page, is for the foundation to say.",
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
