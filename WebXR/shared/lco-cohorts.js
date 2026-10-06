// LA-COHORTS — instructor guides a teacher or a union hall can run (docs/consoles/LA-COHORTS.md). SmartCiti.X Powered by AGI Corp.
//
// LA-PROGRAMME's DEAN templates (lpTemplates in lp-programme.js) say what a level teaches; these run sheets say how to run
// it with a room of people: what to prepare, who does what, the sessions in order with timed blocks that each launch a real
// station, simulation, flow or game, how to debrief and assess, and how to close the cohort out. A K-12 classroom guide does
// the same for LA-K12's six Louisiana lessons, with their flows and apply games (lco-la-flows.js).
//
// Seams (documented shapes):
//   lcoRunSheets(opts) -> [{ id, pathway, level, title, audience, runBy, module, dueDays, requiredScore, credential,
//                             prep: [string], roles: [{ role, does }], sessions: [{ n, title, minutes, blocks: [{ minutes,
//                             what, launch: { type: "station"|"sim"|"flow"|"game"|"lesson"|null, id } }] }], debrief: [string],
//                             assessment, closeout: [string], noPartnership }]
//     opts is lpTemplates' ({ stationIds, simIds, lookup }); one sheet per template (six pathways × five levels).
//   lcoClassroomGuide() -> the same shape for a K-12 classroom (id "lco-guide-la-k12"), one session per Louisiana lesson.
//   lcoClassroomModule() -> the DEAN module doc for the six lessons (dnValidateDoc shape; station lessons in the parishes).
//   lcoSetUpClassroom({ en, dn }, { orgName, seats, startDate }) -> { org, cohort, module, classCode, due } | null
//   lcoGuide(id) -> one sheet (run sheet or classroom guide) | null
//
// Minutes are this guide's planning allowances for a session, not facts about any place or programme. Facts rule: no
// project figure here (the programme page quotes them from the facts file). The platform has no partnership with any company,
// agency or union. Every top-level name is prefixed `lco`/`LCO_` (the bundler shares one scope); imports are plain.

import { LP_NAME, LP_NO_PARTNERSHIP, LP_PATHWAYS, LP_K12_LESSONS, lpTemplates, lpPathway, lpLevel, lpTrack, lpSim, lpDueDate } from "./lp-programme.js";
import { LK_LESSONS } from "./lk-la-lessons.js";
import { lcoFlowFor, lcoGameFor } from "./lco-la-flows.js";

/** Planning allowances in minutes (this guide's own, stated as such on the page). */
export const LCO_MINUTES = { opening: 10, station: 20, sim: 30, lessonBrief: 5, lessonStation: 12, lessonCheck: 3, apply: 2, lessonClose: 5, debrief: 15, closeout: 15 };
/** The longest a session runs before it is split (planning allowance). */
export const LCO_SESSION_CAP = 90;
export const LCO_BRAND = "SmartCiti.X · Powered by AGI Corp";

const lcoUniq = (a) => [...new Set(a)];
const lcoLesson = (id) => LK_LESSONS.find((l) => l.id === id) ?? null;

/** Who runs a level, and the second person the room needs. */
function lcoRunBy(level) {
  if (level === "aware") return { audience: "a teacher, a career centre or a union hall's outreach session", roles: [
    { role: "Lead (teacher or outreach instructor)", does: "Opens each session, runs the lessons and stations, reads the check questions aloud and leads the debrief." },
    { role: "Second adult", does: "Watches the headset space, helps anyone stuck on a device and keeps the room calm and on time." }] };
  if (level === "lead") return { audience: "a union hall, a training provider or an employer's safety office, for forepersons and crew leads", roles: [
    { role: "Lead instructor (a journey-level instructor in the craft)", does: "Runs the stations and simulations, and has each lead call the stop-work and hand-over points aloud." },
    { role: "Safety observer", does: "Watches the order gates in every simulation and notes who used stop-work authority, and when." },
    { role: "Peer reviewers (the cohort)", does: "Take turns scoring each other's briefings against the debrief prompts." }] };
  return { audience: "a union hall, an apprenticeship programme or a training provider", roles: [
    { role: "Lead instructor (a journey-level instructor in the craft)", does: "Runs the stations and simulations and signs off each learner's module score." },
    { role: "Second competent person", does: "Watches the headset space and the simulations' order gates, and helps anyone stuck on a device." }] };
}

function lcoPrep(tpl, extra = []) {
  return [
    `Set up the cohort: organisation, seats and class code, with the module ${tpl.module.id} assigned and its due date set (the Louisiana page's "Run a cohort" form, or lpSetUpCohort).`,
    "Check every device on the class code before the first session: a desktop, tablet or phone browser, or a headset where the room has clear space around each learner.",
    "Open every station in the plan once yourself, and read its cited safety standards (the station's certification line) so you can answer from the source.",
    ...extra,
    "Print or share the debrief prompts, and read the no-partnership line to the cohort in the opening.",
  ];
}

/** Split an ordered list of blocks into sessions no longer than the cap (opening and debrief in each). */
function lcoSessions(titleOf, blocks) {
  const out = [];
  let cur = null;
  const open = () => { cur = { n: out.length + 1, title: titleOf(out.length + 1), blocks: [{ minutes: LCO_MINUTES.opening, what: out.length ? "Sign in with the class code; recap the last session's debrief in one minute each." : "Sign in with the class code; what this level is for, where the work is on the Louisiana maps, and the no-partnership line.", launch: null }] }; out.push(cur); };
  const used = () => cur.blocks.reduce((n, b) => n + b.minutes, 0);
  for (const b of blocks) {
    if (!cur || used() + b.minutes + LCO_MINUTES.debrief > LCO_SESSION_CAP) {
      if (cur) cur.blocks.push({ minutes: LCO_MINUTES.debrief, what: "Debrief the session with the prompts below.", launch: null });
      open();
    }
    cur.blocks.push(b);
  }
  if (cur) cur.blocks.push({ minutes: LCO_MINUTES.debrief, what: "Debrief the session with the prompts below.", launch: null });
  for (const s of out) s.minutes = s.blocks.reduce((n, b) => n + b.minutes, 0);
  return out;
}

/** Lesson blocks for one Louisiana lesson: the flow (brief + station), the check, the apply game and the close. */
function lcoLessonBlocks(l) {
  const g = lcoGameFor(l);
  const flow = lcoFlowFor(l);
  return [
    { minutes: LCO_MINUTES.lessonBrief, what: `Look at the place first: ${l.theme}. Read the pre-brief of "${l.title}" together.`, launch: { type: "flow", id: flow } },
    { minutes: LCO_MINUTES.lessonStation, what: `Run the station; a run that does not pass goes back to the brief.`, launch: { type: "station", id: l.station } },
    { minutes: LCO_MINUTES.lessonCheck, what: `Check question, read aloud: "${l.check.q}" A wrong answer hears the why and tries again; never scored against anyone.`, launch: { type: "lesson", id: l.id } },
    { minutes: LCO_MINUTES.apply, what: `Apply it: ${g.title} — ${g.summary}`, launch: { type: "game", id: g.id } },
    { minutes: LCO_MINUTES.lessonClose, what: `Close: each learner says how it went, and one sentence about the work: ${l.tradeLine}`, launch: null },
  ];
}

/** One run sheet per LA-PROGRAMME DEAN template. */
export function lcoRunSheets(opts = {}) {
  return lpTemplates(opts).map((tpl) => {
    const p = lpPathway(tpl.pathway), lv = lpLevel(tpl.level);
    const run = lcoRunBy(tpl.level);
    const lessons = tpl.level === "aware" ? lcoAwareLessons(p.id) : [];
    const blocks = [
      ...lessons.flatMap((l) => lcoLessonBlocks(l)),
      ...tpl.guide.practice.filter((x) => !lessons.some((l) => l.station === x.station)).map((x) => ({ minutes: LCO_MINUTES.station, what: x.capstone ? "Capstone station: run it once as practice, then once for the record." : "Station: brief the hazards together, then each learner runs it; a failed run is retried after the debrief of what went wrong.", launch: { type: "station", id: x.station } })),
      ...tpl.guide.simulations.map((s) => ({ minutes: LCO_MINUTES.sim, what: `Full-procedure simulation "${lpSim(s.sim)?.name ?? s.sim}": the order gates are scored; pass mark ${s.passMark}. Stop the run if a gate is skipped and talk it through.`, launch: { type: "sim", id: s.sim } })),
    ];
    const sessions = lcoSessions((n) => `${p.title} · ${lv.title} · session ${n}`, blocks);
    sessions.push({ n: sessions.length + 1, title: `${p.title} · ${lv.title} · close-out`, minutes: LCO_MINUTES.closeout, blocks: [
      { minutes: LCO_MINUTES.closeout, what: "Review every learner's module score against the assessment line, re-run anything below it, and issue the cohort certificate.", launch: null }] });
    const tracks = p.tracks.map(lpTrack).filter(Boolean);
    return {
      id: `lco-guide-${p.id}-${tpl.level}`, pathway: p.id, level: tpl.level, title: `${LP_NAME} · ${p.title} · ${lv.title} — run sheet`,
      audience: run.audience, runBy: run.roles.map((r) => r.role), roles: run.roles, who: lv.who,
      module: tpl.module.id, dueDays: tpl.dueDays, requiredScore: lv.requiredScore, credential: tpl.credential?.id ?? null,
      places: tracks.slice(0, 3).map((t) => `${t.name} — ${t.where}`),
      prep: lcoPrep(tpl, tpl.level === "aware" ? ["Keep to the classroom rule: plain words, one idea at a time, no fear framing; the lessons name kinds of work and the apprenticeship route, never any one employer's jobs."] : tpl.sims.length ? ["Book a longer slot for the simulation session: the order gates need time to talk through."] : []),
      sessions, debrief: tpl.guide.debrief, assessment: tpl.guide.assessment,
      closeout: [
        `Every learner at a module score of ${lv.requiredScore} or more on ${tpl.module.id}, recorded on the class code.`,
        tpl.credential ? `The level's competency (${tpl.credential.id}) on each learner's record, with the cohort certificate.` : "The cohort certificate.",
        "Ask the cohort one question for the next run of this guide, and note it for the next instructor.",
      ],
      noPartnership: LP_NO_PARTNERSHIP,
    };
  });
}

/** The Louisiana lessons a pathway's awareness level carries (LP_K12_LESSONS, re-exported by lp-programme.js). */
function lcoAwareLessons(pathwayId) {
  return LP_PATHWAYS.some((x) => x.id === pathwayId) ? lcoUniq(LP_K12_LESSONS[pathwayId] ?? []).map(lcoLesson).filter(Boolean) : [];
}

/** The DEAN module doc for the six Louisiana lessons (a classroom cohort's assignment). */
export function lcoClassroomModule() {
  return { v: 1, kind: "module", id: "mod-lco-la-k12", title: "K-12 Louisiana: coast, river, energy, flight, boats and trades",
    lessons: LK_LESSONS.map((l) => ({ kind: "station", id: l.station, world: "parishes" })), due: null, requiredScore: 60, assign: [] };
}

/** The K-12 classroom guide: one session per Louisiana lesson. */
export function lcoClassroomGuide() {
  const m = lcoClassroomModule();
  const sessions = LK_LESSONS.map((l, i) => {
    const blocks = [{ minutes: LCO_MINUTES.opening, what: i ? "Sign in with the class code; one learner retells the last lesson's idea." : "Sign in with the class code; how a lesson runs (look, try, check, play, close) and the classroom rules.", launch: null }, ...lcoLessonBlocks(l)];
    return { n: i + 1, title: `Lesson ${i + 1}: ${l.title}`, band: l.band, theme: l.theme, places: l.anchors.map((a) => `${a.map}/${a.site}`), minutes: blocks.reduce((n, b) => n + b.minutes, 0), blocks };
  });
  return {
    id: "lco-guide-la-k12", pathway: null, level: "aware", title: "K-12 Louisiana lessons — classroom guide",
    audience: "a teacher or a school district, or a union hall's school outreach", runBy: ["Teacher", "Second adult"],
    roles: lcoRunBy("aware").roles, who: "upper primary and lower secondary classes",
    module: m.id, dueDays: 14, requiredScore: m.requiredScore, credential: null,
    places: LK_LESSONS.map((l) => `${l.title}: ${l.anchors[0].map}/${l.anchors[0].site}`),
    prep: [
      `Set up the class: an organisation, a cohort with a seat per learner and its class code, with the module ${m.id} assigned (lcoSetUpClassroom, or the instructor console).`,
      "Check every device on the class code; a browser on a desktop, tablet or phone is enough, and headsets need clear space around each learner.",
      "Play each lesson's flow once yourself: the pre-brief, the station, the check question and the two-minute game.",
      "Keep to the classroom rule: plain words, one idea at a time, no fear framing. The lessons teach general science and name kinds of work and the apprenticeship route, never any one employer's jobs.",
    ],
    sessions,
    debrief: ["What was the one idea, in your own words?", "Where on the map did you see it, and who does that work?", "What would you check first if you were on that crew?"],
    assessment: `Each lesson's station passed on the class code at ${m.requiredScore} or more; the check question answered (it is never scored against anyone); the game played once.`,
    closeout: ["Each learner's six lessons shown on the class board (the K-12 scoreboard).", "One question from the class for the next run of this guide."],
    noPartnership: LP_NO_PARTNERSHIP,
  };
}

/** A classroom on the org layer (no payment; seats a count) with the six-lesson module assigned to its class code. */
export function lcoSetUpClassroom({ en, dn }, { orgName, seats = 30, startDate = null } = {}) {
  if (!orgName || !en || !dn) return null;
  const programmes = lcoUniq(LK_LESSONS.map((l) => l.programme));
  const org = en.enOrgs().find((o) => o.name === orgName) ?? en.enCreateOrg({ name: orgName, programmes });
  if (!org) return null;
  let cohort = null;
  for (const programme of programmes) { cohort = en.enCreateCohort({ orgId: org.id, name: "K-12 Louisiana lessons", programme, edition: LP_NAME, startDate, seats }); if (cohort) break; }
  if (!cohort) return null;
  const due = lpDueDate(cohort.startDate, 14);
  const module = dn.dnSaveModule({ ...lcoClassroomModule(), due });
  dn.dnAssign(module.id, cohort.code);
  return { org, cohort, module: dn.dnModule(module.id), classCode: cohort.code, due };
}

export function lcoGuide(id, opts = {}) {
  if (id === "lco-guide-la-k12") return lcoClassroomGuide();
  return lcoRunSheets(opts).find((g) => g.id === id) ?? null;
}
