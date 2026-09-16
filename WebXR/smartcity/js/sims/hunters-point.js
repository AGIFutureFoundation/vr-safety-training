import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { markInteractive } from "../../../shared/kit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Hunters Point Briefing — the first station in the Environmental
// Monitoring category, and deliberately NOT a walkable 3D environment.
//
// Hunters Point Naval Shipyard is a real, active EPA Superfund site in
// southeast San Francisco with a serious, still-unfolding history: a federal
// False Claims Act case over falsified radiological soil data, a federal
// lawsuit by neighborhood residents over the adequacy of the Navy's cleanup,
// and a community that has been measuring its own air for years. Rendering
// that as a pleasant park to stroll through would misrepresent the place and
// the people who live next to it. So this station is a flat dossier — the
// same treatment a map or an aerial lookup gets — followed by a scored
// knowledge check that runs on the same procedure engine, records to the
// same training log, and counts toward the same ladder as every other
// station. The "hazards" here are unsafe conclusions, not unsafe objects.
//
// Every factual claim below carries its source; the crew that maintains this
// file re-checks them when the record changes (the settlement and the
// lawsuit are both live matters). Nothing here is an on-site program of
// ours — the community air monitoring named is the real one.

const ACCENT = 0x8fd18b;

/** A step that is a multiple-choice question: `options` is what the flat
 * card renders, `target` is the right answer; wrong ids score as ordinary
 * corrections and the ones listed in `hazards` as unsafe conclusions. */
const q = (o) => ({ kind: "select", ...o });

export const SIM_HUNTERS_POINT = {
  id: "hunters-point",
  index: "21",
  domain: "Environmental",
  trade: "Environmental monitoring technician",
  category: "Environmental Monitoring",
  certification: "LIUNA hazmat & environmental laborer — OSHA HAZWOPER (29 CFR 1910.120) 40-hour with annual refresher; chain-of-custody sampling under EPA QA/QC guidance",
  name: "Hunters Point Briefing",
  title: simTitle("Hunters Point Briefing"),
  tagline: "A real Superfund site, a real data-fraud case, a real community air-monitoring effort — flat briefing and knowledge check, not a walkable scene",
  flat: true,
  accent: ACCENT,
  accentCss: "#8fd18b",
  parSeconds: 300,
  badge: { id: "data-integrity", name: "Data Integrity", note: "Every question on site status, oversight, data integrity and crew training answered without an unsafe conclusion" },

  game: system({
    name: "Site Awareness",
    currency: "SAMPLE",
    ranks: ["Site Aware", "Sampler", "Field Lead", "QA Verifier", "Integrity Certified"],
    badges: [
      { id: "sourced", name: "Sourced", note: "Site status and oversight answered clean", test: AWARD.all(AWARD.stepClean("status"), AWARD.stepClean("oversight")) },
      { id: "no-substitution", name: "No Substitution", note: "Never chose a shortcut over an honest sample", test: AWARD.safe },
      { id: "crew-ready", name: "Crew Ready", note: "Trades and training questions answered without correction", test: AWARD.all(AWARD.stepClean("trades"), AWARD.stepClean("hazwoper")) },
    ],
    challenges: [
      { id: "clean-sheet", name: "Clean Sheet", note: "No corrections anywhere in the check", test: AWARD.clean },
      { id: "read-it-first", name: "Read It First", note: "Finish the check inside 70% of par — you read the dossier, not the options", test: AWARD.fast(0.7) },
    ],
  }),

  /** What the flat card shows above the questions. Sources are real pages;
   * the dates are the dates of the record, not of this file. */
  dossier: [
    {
      title: "What the site is",
      body: "Hunters Point Naval Shipyard (HPNS) is an 866-acre former U.S. Navy shipyard on the southeast San Francisco waterfront. It has been on the EPA's National Priorities List (a Superfund site) since 1989. The Navy is the lead agency for investigation and cleanup; the U.S. EPA and California's regulators (DTSC and the Regional Water Board) oversee and enforce the Navy's work. Contamination includes radionuclides, PCBs, heavy metals, petroleum fuels, pesticides and volatile organic compounds, in soil and groundwater on land and in bay sediment offshore (the ~443-acre Parcel F).",
      source: { label: "EPA Superfund site profile", url: "https://cumulis.epa.gov/supercpad/cursites/csitinfo.cfm?id=0902722" },
      source2: { label: "SF.gov — HPNS cleanup", url: "https://www.sf.gov/hpns-cleanup-learn" },
    },
    {
      title: "The data-integrity case",
      body: "Between 2003 and 2014 the Navy's radiological remediation contractor, Tetra Tech EC, was required to survey soil and buildings and remediate excess radiation so parcels could be transferred to the city. Federal False Claims Act litigation alleged that employees and subcontractors substituted clean soil for potentially contaminated samples and fabricated radiological readings the Navy relied on. A Navy review found roughly 48% of the contractor's radiological data suspect or showing signs of manipulation; an EPA letter raised concerns about a far larger share in parts of the site. In August 2026 a federal judge approved a $57 million settlement of the government's False Claims Act claims; the company did not admit liability, and the settlement does not resolve a separate suit by homeowners.",
      source: { label: "U.S. Department of Justice press release (2026)", url: "https://www.justice.gov/opa/pr/tetra-tech-ec-inc-agrees-pay-57m-settle-false-claims-act-allegations-falsifying-soil-test" },
    },
    {
      title: "The community and the litigation",
      body: "Bayview Hunters Point is a residential neighborhood next to the shipyard fence. Greenaction for Health and Environmental Justice filed a federal lawsuit against the Navy in 2024 alleging the cleanup is not protective of human health and the environment; a court hearing on it was held in February 2026, and in June 2026 Greenaction and the Marie Harrison Community Foundation issued a public call to action and demands. Marie Harrison (1948–2019) was a Greenaction organizer, a Bayview resident for decades and, as a young woman, a worker at the shipyard; residents later installed neighborhood air monitors in her memory. That community air-monitoring effort, run by Greenaction with the Marie Harrison Community Foundation, is the independent neighborhood air record this station points you to — there is no on-site monitoring program of ours here.",
      source: { label: "Greenaction — Bayview Hunters Point", url: "https://greenaction.org/bayview-hunters-point/" },
      source2: { label: "Greenaction — in memory of Marie Harrison", url: "https://greenaction.org/2020/05/06/in-honor-and-memory-of-marie-harrison-1-30-1948-5-5-2019/" },
    },
    {
      title: "Who does the work",
      body: "Environmental monitoring and remediation on a site like this is union trade work with real training gates: hazmat and environmental laborers (LIUNA) under OSHA HAZWOPER — a 40-hour course, three days of supervised field time and an annual 8-hour refresher (29 CFR 1910.120(e)); operating engineers (IUOE) on the excavators and soil-handling equipment; Teamsters hauling regulated soil under DOT hazardous-materials rules; radiation control technicians on survey and clearance; and industrial hygienists and environmental sampling technicians keeping chain of custody on every sample. The lesson of this site is that the last item is not paperwork — independent split samples, chain of custody and third-party verification are the only reason anyone can trust a clearance number.",
      source: { label: "OSHA 29 CFR 1910.120 — HAZWOPER", url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.120" },
    },
  ],

  hazards: {
    "walk-in": "You treated an active Superfund parcel as open ground. Parcels here are behind fences and institutional controls for a reason: residual contamination, ongoing excavation and radiological survey work. Site access is by the Navy's controls and a HAZWOPER-trained escort, never on your own read of a map.",
    "swap-sample": "You chose to swap in a sample that reads clean. That is exactly what the False Claims Act case was about: substituted soil and fabricated readings that a whole cleanup was then judged on. A sample is the location it came from, logged under chain of custody, or it is nothing.",
    "silence-alarm": "You silenced the perimeter dust monitor to keep the excavator moving. The monitor is the neighborhood's only real-time protection from what the dig is lifting; the response to an alarm is stop, wet down, notify — not mute.",
    "dismiss-community": "You dismissed the community's air monitors as noise. Independent neighborhood data is a check on the site's own record — on this site in particular, where the contractor's data was found unreliable, an outside measurement is not a nuisance, it is the control.",
  },

  lateNotes: {},

  steps: [
    q({
      id: "status", target: "status-superfund",
      options: [
        { id: "status-superfund", label: "An active EPA Superfund site since 1989; the Navy leads the cleanup under EPA and California oversight" },
        { id: "status-done", label: "A completed cleanup, fully transferred to the city for redevelopment" },
        { id: "walk-in", label: "Former industrial land that is open to walk, like any waterfront park" },
      ],
      title: "What is Hunters Point Naval Shipyard today?",
      cue: "Pick the statement that matches the record.",
      why: "The site's legal status sets every rule for anyone working near it. It has been on the National Priorities List since 1989, the Navy is the lead agency, and the EPA and the state regulators oversee the Navy — that is who signs off on whether a parcel is done.",
    }),
    {
      id: "contaminants", kind: "sequence", anyOrder: true,
      targets: ["c-radionuclides", "c-pcbs", "c-metals", "c-petroleum"],
      itemNames: { "c-radionuclides": "radionuclides", "c-pcbs": "PCBs", "c-metals": "heavy metals", "c-petroleum": "petroleum fuels" },
      decoyNotes: { "c-leadpaint": "Lead paint alone would be a residential renovation problem. The record here lists radionuclides, PCBs, heavy metals, petroleum, pesticides and VOCs in soil, groundwater and bay sediment." },
      options: [
        { id: "c-radionuclides", label: "Radionuclides" }, { id: "c-pcbs", label: "PCBs" },
        { id: "c-metals", label: "Heavy metals" }, { id: "c-petroleum", label: "Petroleum fuels" },
        { id: "c-leadpaint", label: "Lead paint only" },
      ],
      title: "Which contaminants does the record list at the site?",
      cue: "Select every family that applies — order doesn't matter.",
      why: "What is in the ground decides the PPE, the monitoring, the disposal route and the clearance criteria. A crew that thinks it is dealing with one contaminant plans for one and is exposed to the rest.",
    },
    q({
      id: "integrity", target: "int-substituted",
      options: [
        { id: "int-substituted", label: "Radiological soil samples were substituted and readings fabricated; a Navy review found about 48% of the data suspect, and a $57M False Claims Act settlement was approved in 2026" },
        { id: "int-minor", label: "A handful of clerical errors in one parcel's paperwork, corrected on re-survey" },
        { id: "swap-sample", label: "Field crews sensibly swapped in clean samples where a reading would have forced expensive rework" },
      ],
      title: "What did the contractor data case establish?",
      cue: "Pick the statement that matches the Department of Justice record.",
      why: "The scale is the point: when roughly half a contractor's radiological data is suspect, every clearance built on it is in question. The whole discipline of environmental monitoring exists so that a number can be trusted — and this case is what it looks like when it can't.",
    }),
    q({
      id: "chain", target: "chain-independent",
      options: [
        { id: "chain-independent", label: "Chain of custody on every sample, independent split samples, and third-party verification of the contractor's results" },
        { id: "chain-trust", label: "Hiring a reputable contractor and trusting its final report" },
        { id: "chain-more", label: "Taking more samples with the same crew and the same instruments" },
      ],
      title: "What actually protects data integrity on a monitoring crew?",
      cue: "Pick the control that would have caught the problem.",
      why: "More samples from the same untrusted process are just more untrusted numbers. Chain of custody ties a result to a place and a person; split samples and an independent lab make a fabricated result disagree with something.",
    }),
    q({
      id: "oversight", target: "ov-agencies",
      options: [
        { id: "ov-agencies", label: "The Navy leads; the U.S. EPA and California's DTSC and Regional Water Board oversee and enforce; community organizations monitor and litigate" },
        { id: "ov-city", label: "The City of San Francisco runs the cleanup on its own land" },
        { id: "ov-contractor", label: "The cleanup contractor certifies its own parcels as complete" },
      ],
      title: "Who oversees the cleanup?",
      cue: "Pick the arrangement the record describes.",
      why: "Knowing who signs what tells you whose data you are producing and who will audit it. A contractor certifying its own work is precisely the failure this site is known for.",
    }),
    q({
      id: "community", target: "cm-monitors",
      options: [
        { id: "cm-monitors", label: "Community air monitors installed by Bayview Hunters Point residents in Marie Harrison's memory, run by Greenaction with the Marie Harrison Community Foundation" },
        { id: "cm-none", label: "There is none — only the Navy's on-site instruments report air quality" },
        { id: "dismiss-community", label: "Some neighborhood sensors exist, but uncalibrated community data should be disregarded on a regulated site" },
      ],
      title: "Where does independent neighborhood air data come from?",
      cue: "Pick the real effort.",
      why: "On a site where the official record was found unreliable, an independent measurement is the control, not a courtesy. The community effort is real, named, and ongoing — and it is not something this simulator runs or speaks for.",
    }),
    {
      id: "trades", kind: "sequence", anyOrder: true,
      targets: ["t-laborers", "t-operators", "t-teamsters", "t-radtech"],
      itemNames: { "t-laborers": "hazmat laborers (LIUNA)", "t-operators": "operating engineers (IUOE)", "t-teamsters": "Teamsters hauling regulated soil", "t-radtech": "radiation control technicians" },
      decoyNotes: { "t-untrained": "There is no untrained role on a Superfund excavation. Every worker in the exclusion zone carries HAZWOPER and site-specific training, and the drivers carry DOT hazmat endorsements." },
      options: [
        { id: "t-laborers", label: "Hazmat & environmental laborers (LIUNA)" }, { id: "t-operators", label: "Operating engineers (IUOE)" },
        { id: "t-teamsters", label: "Teamsters — regulated soil hauling" }, { id: "t-radtech", label: "Radiation control technicians" },
        { id: "t-untrained", label: "General labor with no special training" },
      ],
      title: "Which trades does the actual work call on?",
      cue: "Select every trade that belongs on the site — order doesn't matter.",
      why: "Environmental monitoring is not one job. Excavation, hauling, survey, sampling and hygiene are separate trades with separate training gates, and the crew is only as safe as the least-trained person inside the fence.",
    },
    q({
      id: "hazwoper", target: "hz-40",
      options: [
        { id: "hz-40", label: "A 40-hour HAZWOPER course, three days of supervised field experience, and an 8-hour refresher every year (29 CFR 1910.120(e))" },
        { id: "hz-tbt", label: "A toolbox talk on the first morning" },
        { id: "hz-24", label: "An 8-hour awareness class, renewed every five years" },
      ],
      title: "What is the minimum training for a hazmat laborer here?",
      cue: "Pick the OSHA requirement.",
      why: "HAZWOPER is the federal floor for anyone who could be exposed to hazardous substances on an uncontrolled site. The 40-hour course, the supervised days and the annual refresher are the rule — site-specific training sits on top of it, never instead of it.",
    }),
    q({
      id: "dust", target: "dust-stop",
      options: [
        { id: "dust-stop", label: "Stop the excavation, wet the work face down, and notify the site health and safety officer before restarting" },
        { id: "silence-alarm", label: "Silence the monitor and keep the excavator moving — the wind will change" },
        { id: "dust-log", label: "Note it in the log and check again at the end of the shift" },
      ],
      title: "A perimeter dust monitor alarms during excavation. What now?",
      cue: "Pick the response the site's own controls require.",
      why: "The perimeter monitor exists for the neighborhood on the other side of the fence. Stop, control the source, notify — the excavator restarts when the air says so, not when the schedule does.",
    }),
    q({
      id: "now", target: "now-live",
      options: [
        { id: "now-live", label: "A live matter: the settlement resolved the government's claims in 2026 without resolving the homeowners' suit, and the residents' federal case over the cleanup's adequacy continues" },
        { id: "now-closed", label: "Fully resolved — the settlement closed every question about the site" },
        { id: "now-transferred", label: "Moot — the whole shipyard has already been transferred and built on" },
      ],
      title: "Where does the record stand?",
      cue: "Pick the statement that matches the 2026 record.",
      why: "Anyone briefing a crew on this site has to say honestly that it is unfinished: parcels still under cleanup, litigation still open, a neighborhood still measuring its own air. That is the frame you work inside — not a story with an ending.",
    }),
  ],

  /** No scene. Every option id becomes an invisible interactable so the
   * procedure engine, the checkers and the hint system see a normal room. */
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
