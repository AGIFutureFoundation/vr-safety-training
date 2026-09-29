#!/usr/bin/env node
// LA-COHORTS' gate (docs/consoles/LA-COHORTS.md). SmartCiti.X Powered by AGI Corp.
//     node tools/check_la_cohorts.mjs
//
//   1. flows and apply games: every LA-K12 lesson has a flow (WebXR/flows/lk-*.json) that validates against the catalog,
//      is indexed and documented, names the lesson's station and check, and hands off to the lesson's apply game; every
//      game sits at the lesson's first fixed anchor on a real site, is two minutes, has three rounds with exactly one right
//      move each, and carries no digit, fear word, project figure, company name or hiring claim
//   2. classroom boards: every K-12 classroom on a Louisiana map carries a Louisiana lessons board whose launches resolve
//      (session lessons on that map, else the lessons' K-12 stations), within the room's reading ceiling and mesh budget
//   3. Home: both layouts link the Louisiana programme page and the cohort guides, and the links resolve
//   4. instructor guides: a run sheet for every DEAN template (30) and a K-12 classroom guide; every block launches a real
//      station, simulation, flow or game; minutes add up; the DEAN docs validate; a cohort and a classroom are set up on the
//      org layer with a class code; the page and the handbook carry every guide, the brand line and the no-partnership line
//   5. hygiene: no model identifier in LA-COHORTS' files; this console's doc has its Cycles
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = join(ROOT, "WebXR");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);
const fails = [];
let checks = 0;
const check = (cond, where, msg) => { checks++; if (!cond) fails.push(`${where}: ${msg}`); };

const FEAR = /\b(scary|scared|disaster|catastroph\w*|devastat\w*|deadly|drown\w*|terrif\w*|destroy\w*|panic|poison\w*|dying|dead|die|death|kill\w*|injur\w*|danger\w*)\b/i;
const PROJECT = /\b(?:SpaceX|Starbase|Meta|Applied Digital|Delta Forge|Shintech|Black Bayou|Saronic|AVEX|Aviation Exteriors|Woodside|FastSites|billion|million|hiring|hires)\b/i;
const PARTNER = /\bpartner(ship|ed|s)?\b(?![^.]*\bno\b)|\bofficial\b|\bendorse|\bin association with\b|\bcertified by\b/i;

const catalog = JSON.parse(read("WebXR/smartcity/catalog.json"));
const STATIONS = new Set(catalog.stations.map((s) => s.id));
const F = await imp("WebXR/shared/flowhub.js");
const LK = await imp("WebXR/shared/lk-la-lessons.js");
const LCO = await imp("WebXR/shared/lco-la-flows.js");
const { NP_PARISHES } = await imp("WebXR/shared/np-parishes.js");
const byId = new Map(NP_PARISHES.map((p) => [p.id, p]));
const idx = JSON.parse(read("WebXR/flows/index.json"));
const FLOWDOC = read("docs/flowhub.md");
const out = {};

// ---------------------------------------------------------------- 1 flows and apply games
{
  let rounds = 0;
  for (const l of LK.LK_LESSONS) {
    const where = `flows/${l.id}`;
    const fid = LCO.lcoFlowFor(l);
    check(/^lk-[a-z0-9-]+$/.test(fid ?? ""), where, `flow id ${fid} is not an lk- id`);
    const fp = `WebXR/flows/${fid}.json`;
    if (!existsSync(join(ROOT, fp))) { check(false, where, `no flow at ${fp} — run node tools/gen_lco_flows.mjs`); continue; }
    const flow = JSON.parse(read(fp));
    const v = F.validateFlow(flow, catalog);
    check(v.ok && v.terminals.length > 0, where, `flow does not validate: ${(v.errors ?? []).join("; ")}`);
    check(flow.id === fid, where, "flow id differs from its file");
    check(flow.nodes.some((n) => n.kind === "station" && n.ref === l.station), where, "flow does not launch the lesson's station");
    check(flow.nodes.some((n) => n.params?.check?.q === l.check.q), where, "flow does not carry the lesson's check question");
    const g = LCO.lcoGameFor(l);
    const ext = flow.nodes.find((n) => n.kind === "external");
    check(!!g && ext?.ref === g.id, where, "flow does not hand off to the lesson's apply game");
    check(idx.flows.some((r) => r.id === fid && r.file === `${fid}.json` && r.title === flow.title), where, "flow not indexed in flows/index.json");
    check(FLOWDOC.includes(`${fid}.json`), where, "docs/flowhub.md does not describe the flow");
    if (!g) continue;
    const gw = `games/${g.id}`;
    const a = l.anchors[0];
    check(g.parish === a.map && g.site === a.site, gw, "game is not at the lesson's first fixed anchor");
    const p = byId.get(g.parish);
    check(!p || p.sites.some((s) => s.id === g.site), gw, `game site ${g.parish}/${g.site} is not a site of that map`);
    check(g.minutes === 2, gw, "not a two-minute game");
    const steps = LCO.lcoApplySteps(g.id);
    check(steps.length === 3, gw, `${steps.length} rounds, expected three`);
    for (const s of steps) {
      rounds++;
      check(Array.isArray(s.board) && s.board.length && s.prompt && s.options.length === 2 && s.options.filter((o) => o.safe).length === 1, gw, "a round is malformed (board, prompt, one right move of two)");
    }
    const text = [g.title, g.idea, g.summary, ...steps.flatMap((s) => [...s.board, s.prompt, ...s.options.map((o) => o.text)])].join(" ");
    check(!/\d/.test(text), gw, "game text states a figure (a digit)");
    check(!FEAR.test(text), gw, `fear framing (${text.match(FEAR)?.[0]})`);
    check(!PROJECT.test(text), gw, `project figure, company or hiring claim (${text.match(PROJECT)?.[0]})`);
    check(JSON.stringify(LCO.lcoApplySteps(g.id)) === JSON.stringify(steps), gw, "rounds are not deterministic");
    const af = LCO.lcoApplyFor(l);
    check(af?.kind === "mini-game" && af.id === g.id && af.steps.length === 3, gw, "lcoApplyFor does not return the game");
  }
  const ses = NP_PARISHES.flatMap((p) => LCO.lcoSessionLessons(p.id, { npParish: (id) => byId.get(id) }));
  check(ses.length > 0 && ses.every((s) => s.flow && s.apply?.id), "flows", "a session lesson lacks its flow or apply game");
  check(ses.length === NP_PARISHES.flatMap((p) => LK.lkSessionLessons(p.id, { npParish: (id) => byId.get(id) })).length, "flows", "lcoSessionLessons changes the lesson places");
  out.flows = `${LK.LK_LESSONS.length} flows · ${LCO.LCO_APPLY_GAMES.length} apply games (${rounds} rounds) · ${ses.length} session places carry flow + game`;
}

// ---------------------------------------------------------------- 2 classroom boards
{
  const CR = await imp("WebXR/shared/cr-classrooms.js");
  const { SC_LESSONS } = await imp("WebXR/shared/sc-lessons.js");
  const scIds = new Set(SC_LESSONS.map((l) => l.id));
  let rooms = 0, asLesson = 0, asFlow = 0, maps = 0;
  for (const p of NP_PARISHES) {
    const k12 = CR.crRoomsFor(p).filter((r) => r.kind === "k12");
    const la = LK.LK_REGIONS.test(String(p.region ?? ""));
    if (la && k12.length) maps++;
    const lessonIds = new Set(CR.crLessonsOf(p).map((l) => l.id));
    for (const r of k12) {
      const b = r.fixtures.find((f) => f.id === "lkboard");
      const where = `rooms/${p.id}/${r.id}`;
      if (!la) { check(!b, where, "a Louisiana lessons board off the Louisiana maps"); continue; }
      rooms++;
      check(!!b, where, "K-12 classroom on a Louisiana map has no Louisiana lessons board");
      if (!b) continue;
      const all = [b.launch, ...(b.more ?? [])];
      const covered = new Set();
      for (const l of all) {
        if (l.type === "lesson") { asLesson++; check(lessonIds.has(l.id) && scIds.has(l.id), where, `lesson ${l.id} is not a session lesson on ${p.id}`); covered.add(l.id.split("@")[0]); }
        else if (l.type === "flow") { asFlow++; check(STATIONS.has(l.id) && /^k12-lk-/.test(l.id), where, `flow launch ${l.id} is not a Louisiana K-12 station`); covered.add(LK.lkLessonById(l.id)?.id); }
        else check(false, where, `launch type ${l.type} on the Louisiana board`);
      }
      check(LK.LK_LESSONS.every((l) => covered.has(l.id)), where, "the board does not carry all six Louisiana lessons");
      check(!/\d/.test(b.label) && !FEAR.test(b.label), where, `label "${b.label}" has a digit or a fear word`);
      const main = r.fixtures.find((f) => f.id === "board");
      check(!main || !/^lk-lesson-/.test(main.launch.id) || !CR.crLessonsOf(p).some((l) => !/^lk-lesson-/.test(l.id)), where, "the main board lost the parish's own lesson to a Louisiana one");
    }
  }
  check(rooms >= 10, "rooms", `only ${rooms} K-12 classrooms on Louisiana maps carry the board`);
  out.rooms = `${rooms} K-12 classrooms on ${maps} Louisiana maps carry the Louisiana lessons board (${asLesson} lesson launches on their maps, ${asFlow} station launches)`;
}

// ---------------------------------------------------------------- 3 Home
{
  const home = read("WebXR/index.html"), flat = read("WebXR/home.html");
  check(home.includes('href="louisiana/index.html"'), "home", "WebXR/index.html does not link the Louisiana programme page");
  check(home.includes('href="louisiana/cohorts.html"'), "home", "WebXR/index.html does not link the cohort guides");
  check(/id="hm-louisiana"/.test(home) && /id="hm-louisiana"/.test(flat), "home", "the programme finder has no Louisiana line on both layouts — run node tools/gen_home.mjs");
  check(/tree\/main\/WebXR\/louisiana"/.test(flat) && /WebXR\/louisiana\/cohorts\.html"/.test(flat), "home", "the flat layout does not name the Louisiana pages where they live");
  for (const f of ["WebXR/louisiana/index.html", "WebXR/louisiana/cohorts.html"]) check(existsSync(join(ROOT, f)), "home", `${f} is missing`);
  const lpPage = read("WebXR/louisiana/index.html");
  check(/href="cohorts\.html"/.test(lpPage), "home", "the Louisiana programme page does not link the cohort guides — run node tools/gen_la_programme.mjs");
  out.home = "Home links the programme and the guides on both layouts; the programme page links the guides";
}

// ---------------------------------------------------------------- 4 instructor guides
{
  globalThis.window ??= globalThis;
  if (!globalThis.localStorage) { const m = new Map(); globalThis.localStorage = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; } }; }
  const lp = await imp("WebXR/shared/lp-programme.js");
  const C = await imp("WebXR/shared/lco-cohorts.js");
  const dn = await imp("WebXR/shared/dn-modules.js");
  const en = await imp("WebXR/shared/org.js");
  const opts = { stationIds: STATIONS, simIds: new Set(lp.LP_SIMS.map((s) => s.id)) };
  const tpls = lp.lpTemplates(opts);
  const sheets = C.lcoRunSheets(opts);
  const k12 = C.lcoClassroomGuide();
  const guides = [k12, ...sheets];
  const flowIds = new Set(idx.flows.map((r) => r.id));
  const PAGE = read("WebXR/louisiana/cohorts.html"), DOC = read("docs/louisiana-cohorts.md");
  check(sheets.length === tpls.length && tpls.length === 30, "guides", `${sheets.length} run sheets for ${tpls.length} DEAN templates`);
  let blocks = 0, sessions = 0;
  for (const g of guides) {
    const where = `guides/${g.id}`;
    check(g.roles.length >= 2 && g.prep.length >= 3 && g.debrief.length >= 3 && g.assessment && g.closeout.length >= 2, where, "a guide part is missing (roles, prep, debrief, assessment, close-out)");
    check(g.noPartnership === lp.LP_NO_PARTNERSHIP, where, "no no-partnership line");
    const tpl = tpls.find((t) => t.module.id === g.module);
    if (g.pathway) check(!!tpl, where, `module ${g.module} is not a DEAN template`);
    const practice = tpl ? [...tpl.guide.practice.map((x) => x.station)] : [];
    const launched = new Set();
    for (const s of g.sessions) {
      sessions++;
      const sum = s.blocks.reduce((n, b) => n + b.minutes, 0);
      check(sum === s.minutes && s.minutes > 0, `${where}/${s.n}`, `blocks add to ${sum}, session says ${s.minutes}`);
      check(s.minutes <= C.LCO_SESSION_CAP, `${where}/${s.n}`, `session runs ${s.minutes} minutes, over the cap`);
      for (const b of s.blocks) {
        blocks++;
        check(Number.isInteger(b.minutes) && b.minutes > 0 && b.what, `${where}/${s.n}`, "a block has no minutes or no instruction");
        const l = b.launch;
        if (!l) continue;
        let ok = false;
        if (l.type === "station") ok = STATIONS.has(l.id);
        else if (l.type === "sim") ok = !!lp.lpSim(l.id);
        else if (l.type === "flow") ok = flowIds.has(l.id) && existsSync(join(ROOT, `WebXR/flows/${l.id}.json`));
        else if (l.type === "game") ok = !!LCO.lcoApplyGame(l.id);
        else if (l.type === "lesson") ok = !!LK.lkLessonById(l.id);
        check(ok, `${where}/${s.n}`, `launch ${l.type} ${l.id} does not resolve`);
        launched.add(`${l.type}:${l.id}`);
      }
    }
    for (const st of practice) check(launched.has(`station:${st}`), where, `template station ${st} is never run`);
    for (const sim of tpl?.sims ?? []) check(launched.has(`sim:${sim}`), where, `template simulation ${sim} is never run`);
    if (g.level === "aware") {
      const want = g.pathway ? (lp.LP_K12_LESSONS[g.pathway] ?? []) : LK.LK_LESSONS.map((l) => l.id);
      for (const id of want) {
        const l = LK.lkLessonById(id);
        check(launched.has(`flow:${LCO.lcoFlowFor(l)}`) && launched.has(`game:${LCO.lcoGameFor(l)?.id}`), where, `lesson ${id} runs without its flow and game`);
      }
    }
    const text = [g.title, ...g.prep, ...g.roles.map((r) => r.does), ...g.sessions.flatMap((s) => s.blocks.map((b) => b.what)), ...g.debrief, g.assessment, ...g.closeout].join(" ");
    if (g.level === "aware") { check(!FEAR.test(text), where, `fear framing in a classroom guide (${text.match(FEAR)?.[0]})`); check(!PROJECT.test(text), where, `project figure or company in a classroom guide (${text.match(PROJECT)?.[0]})`); }
    check(!/\$\s?\d|\b\d[\d,.]*\s*(?:billion|million|jobs|acres)\b/i.test(text), where, "a guide quotes a project figure");
    check(PAGE.includes(`data-lco-guide="${g.id}"`), where, "missing from WebXR/louisiana/cohorts.html — run node tools/gen_lco_guides.mjs");
    check(DOC.includes(`\`${g.id}\``), where, "missing from docs/louisiana-cohorts.md");
  }
  // the classroom's DEAN doc and set-up on the org layer; a pathway cohort still sets up through LA-PROGRAMME
  const m = C.lcoClassroomModule();
  let v = null; try { v = dn.dnValidateDoc(m); } catch (e) { v = { ok: false, errors: [e.message] }; }
  const vok = v === true || v?.ok === true || (Array.isArray(v) && v.length === 0) || (v && Array.isArray(v.errors) && v.errors.length === 0);
  check(vok, "guides", `${m.id}: dnValidateDoc ${JSON.stringify(v).slice(0, 160)}`);
  check(m.lessons.length === LK.LK_LESSONS.length && m.lessons.every((l) => STATIONS.has(l.id)), "guides", "the classroom module does not carry the six stations");
  let r = null; try { r = C.lcoSetUpClassroom({ en, dn }, { orgName: "LA Check School", seats: 28, startDate: "2026-10-05" }); } catch (e) { r = { error: e.message }; }
  check(!!r?.classCode && r.cohort?.seats === 28 && r.module?.id === m.id && r.due === "2026-10-19" && r.module.assign.some((a) => a.classCode === r.classCode), "guides", `classroom set-up failed ${JSON.stringify(r).slice(0, 160)}`);
  check(C.lcoSetUpClassroom({ en, dn }, { orgName: "" }) === null, "guides", "a classroom without a name was set up");
  check(C.lcoGuide("lco-guide-la-k12")?.id === "lco-guide-la-k12" && C.lcoGuide(sheets[0].id, opts)?.id === sheets[0].id && C.lcoGuide("nope") === null, "guides", "lcoGuide lookup");
  // the page
  check(/shared\/design\.css/.test(PAGE) && /class="home-chip"/.test(PAGE) && /gdMount/.test(PAGE), "page", "design system, Home chip or Guide missing");
  check(/SmartCiti\.X · Powered by AGI Corp/.test(PAGE) && PAGE.includes(lp.LP_NO_PARTNERSHIP.replace(/'/g, "'")), "page", "brand line or no-partnership line missing");
  check(/id="lco-form"/.test(PAGE) && /enCreateCohort/.test(PAGE) && /dnAssign/.test(PAGE), "page", "the classroom set-up form is missing");
  check(/planning allowances/.test(PAGE), "page", "the page does not say the minutes are planning allowances");
  const links = [...PAGE.matchAll(/\s(?:href|src)="([^"#:?]+)(?:[?#][^"]*)?"/g)].map((x) => x[1]).filter((h) => !/^(?:https?|mailto)/.test(h));
  const broken = [...new Set(links)].filter((h) => !existsSync(resolve(join(W, "louisiana"), h)));
  check(broken.length === 0, "page", `broken relative links: ${broken.slice(0, 5).join(", ")}`);
  out.guides = `${guides.length} guides (${sheets.length} run sheets + the K-12 classroom guide) · ${sessions} sessions · ${blocks} timed blocks, every launch resolves · classroom ${r?.classCode ? "set up with class code" : "NOT set up"} (module ${m.id}, due ${r?.due ?? "—"})`;
}

// ---------------------------------------------------------------- 5 hygiene
{
  const mine = ["WebXR/shared/lco-la-flows.js", "WebXR/shared/lco-cohorts.js", "tools/gen_lco_flows.mjs", "tools/gen_lco_guides.mjs", "tools/check_la_cohorts.mjs", "WebXR/louisiana/cohorts.html", "docs/louisiana-cohorts.md", "docs/consoles/LA-COHORTS.md", ...LK.LK_LESSONS.map((l) => `WebXR/flows/${LCO.lcoFlowFor(l)}.json`)];
  for (const f of mine) {
    if (!existsSync(join(ROOT, f))) { check(false, "hygiene", `${f} is missing`); continue; }
    check(!/claude-(opus|sonnet|haiku)|\bopus[- ]\d|\bsonnet[- ]\d|\bhaiku[- ]\d/i.test(read(f)), "hygiene", `${f}: a model identifier`);
  }
  const doc = existsSync(join(ROOT, "docs/consoles/LA-COHORTS.md")) ? read("docs/consoles/LA-COHORTS.md") : "";
  check(/## Cycles\n1\. /.test(doc), "hygiene", "docs/consoles/LA-COHORTS.md has no Cycles");
  for (const f of ["WebXR/shared/lco-la-flows.js", "WebXR/shared/lco-cohorts.js"]) check(!/import\s*\{[^}]*\bas\b[^}]*\}/.test(read(f)), "hygiene", `${f}: an aliased import (the flat bundler keeps only declared names)`);
}

// ---------------------------------------------------------------- report
if (fails.length) { for (const f of fails.slice(0, 40)) console.log("FAIL", f); console.log(`check_la_cohorts: FAILED ${fails.length} of ${checks} checks`); process.exit(1); }
console.log(`check_la_cohorts: ok — ${checks} checks · ${Object.values(out).join(" · ")}`);
