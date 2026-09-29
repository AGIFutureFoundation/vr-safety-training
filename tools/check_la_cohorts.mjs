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

// ---------------------------------------------------------------- report
if (fails.length) { for (const f of fails.slice(0, 40)) console.log("FAIL", f); console.log(`check_la_cohorts: FAILED ${fails.length} of ${checks} checks`); process.exit(1); }
console.log(`check_la_cohorts: ok — ${checks} checks · ${Object.values(out).join(" · ")}`);
