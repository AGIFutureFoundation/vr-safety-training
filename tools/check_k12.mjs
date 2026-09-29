/**
 * The K-12 gate (tools/briefs/k12-brief.md, docs/k12.md).
 *
 *     node tools/check_k12.mjs
 *
 * Every programme whose `audience` is "classroom" in
 * WebXR/smartcity/js/curricula.js is checked for:
 *   1. its stations meeting the station bar, with "hazards" read as
 *      misconceptions and unsafe shortcuts: 12–15 steps over at least six
 *      kinds, four hazards on registered objects, two interruptions, a `why`
 *      on every step (median at least 200 characters), a support line and a
 *      closing crew check-in;
 *   2. every citation resolving: the programme's guides are registry ids, and
 *      each station's text cites at least one registry entry in scope for its
 *      category, with no citation shape the registry does not know;
 *   3. no grade-level codes and no invented figures: no digit anywhere in a
 *      station's learner-facing prose or a programme's summary and why lines
 *      (a K-12 lesson works with the numbers its scene shows), and no
 *      grade/year/standard-code pattern anywhere in its text;
 *   4. a FlowHub flow per programme (WebXR/flows/<id>.json) that validates
 *      against the catalog and has a teacher gate over the programme's own
 *      stations;
 *   5. every station launchable from a world: on a Bay World or Deep site
 *      board that also lists its programme, with a link lkStationLink builds;
 *   6. the school view: a band named generically, a teacher note on running
 *      it offline and at low quality, a "Classroom" entry in the homepage
 *      finder, and docs/k12.md labelled as the SmartCiti.X side only;
 *   7. the station count the brief names (eight, eight, six, six) and reading
 *      level bounds on every station's cues and whys;
 *   8. field lessons (WebXR/shared/field-lessons.js): at least forty across
 *      Bay World, the Deep, the Regatta and Fairway Park, each anchored at a
 *      real site, landmark, course, facility or hole, tied to a K-12 station
 *      and a trade, linked through lkStationLink, within reading bounds, and
 *      drawn as a K-12 layer on the Bay World and Deep maps;
 *   8b. the lessons in play (WebXR/shared/field-kiosk.js): kiosks and a
 *      lesson screen in Bay World and the Deep, the lesson list on the
 *      Regatta's course card and briefing and on Fairway Park's facility
 *      screen, the module bundled after passport.js;
 *   8c. Summit's and Redwood's own ten lessons each, in their exported
 *      schemas, against their sites and landmarks and the K-12 stations;
 *      both worlds write the shared field-lesson passport award and list
 *      their lessons through k2RenderLessonList;
 *   8d. the teacher tools (WebXR/k12/teacher.html from tools/gen_k12_cards.mjs):
 *      a printable card per field lesson in all six worlds, the teacher view
 *      by programme and band, Field Notes read from the passport, no network.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSmartCity } from "./lib/headless.mjs";
import { readingStats } from "./lib/reading-level.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

let failed = 0, passed = 0;
const fail = (where, msg) => { failed += 1; console.log(`  ✗ ${where}: ${msg}`); };
const ok = () => { passed += 1; };

const { CURRICULA } = await import("../WebXR/smartcity/js/curricula.js");
const { BAY_SITES } = await import("../WebXR/shared/bayworld-data.js");
const { DEEP_SITES } = await import("../WebXR/shared/underwater-data.js");
const { lkStationLink } = await import("../WebXR/shared/links.js");
const F = await import("../WebXR/shared/flowhub.js");
const catalog = JSON.parse(read("WebXR/smartcity/catalog.json"));
const REG = JSON.parse(read("tools/standards.json"));
const REG_IDS = new Set(REG.standards.map((s) => s.id));
const BYL = await import("../WebXR/shared/by-parish-lessons.js");
// The New Orleans parish stations (BAYOU) join the existing programmes; section 9
// checks them, and the brief's counts below are of the core stations only.
const BY_IDS = new Set(BYL.BY_LESSONS.map((l) => l.station));
const city = await loadSmartCity();
const ROOMS = new Map(city.ROOMS.map((r) => [r.id, r]));

const BANDS = ["early primary", "upper primary", "lower secondary", "upper secondary"];
const KINDS = ["select", "sequence", "find", "gauge", "hold", "track", "turn", "drag"];
// Grade-level and standard codes a K-12 station must never carry.
const CODES = [
  /\bgrade\s*\d/i, /\b\d+(st|nd|rd|th)\s+grade\b/i, /\byear\s*\d/i, /\bKS\s?\d\b/, /\bCCSS\b/, /\bNGSS\b/, /\bTEKS\b/,
  /\b[A-Z]{1,5}\.\d+(\.[A-Z0-9]+)+\b/, /\b\d\.[A-Z]{1,3}\.\d/,
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const CITES = [];
for (const s of REG.standards) for (const c of s.cites) CITES.push([c, s]);
const CITE_RE = new RegExp(`(?<![A-Za-z0-9])(?:${CITES.map(([c]) => c).sort((a, b) => b.length - a.length).map(esc).join("|")})(?![A-Za-z0-9])`, "g");
const BY_CITE = new Map(CITES);

function prose(r) {
  const out = [];
  for (const s of r.steps ?? []) {
    out.push(s.title, s.cue, s.why, s.outOfOrderNote, s.holdBreakNote, s.gauge?.missNote, s.drag?.missNote);
    for (const m of [s.itemNames, s.itemNotes, s.decoyNotes]) if (m) out.push(...Object.values(m));
  }
  out.push(...Object.values(r.hazards ?? {}), ...Object.values(r.lateNotes ?? {}));
  for (const it of r.interrupts ?? []) out.push(it.alert, it.cue, it.why, it.missNote, it.wrongNote);
  out.push(r.name, r.tagline, r.supportLine, r.badge?.note);
  // A sequence item's own ordinal ("1 · estimate") is a position, not a figure.
  return out.filter(Boolean).map((t) => String(t).replace(/^\d · /, "")).join(" \n ");
}

console.log("K-12 — classroom programmes, stations, flows and anchors\n");
const K12 = CURRICULA.filter((c) => c.audience === "classroom");
if (K12.length !== 4) fail("curricula", `expected four classroom programmes, found ${K12.length}`); else ok();
for (const want of ["k12-practical-math", "k12-science", "k12-history-and-civics", "k12-literacy-and-life-skills"]) {
  if (!K12.some((c) => c.id === want)) fail("curricula", `no classroom programme "${want}"`); else ok();
}

const seenStations = new Set();
for (const c of K12) {
  // 6 — the school view, per programme
  if (!BANDS.some((b) => String(c.band ?? "").includes(b))) fail(c.id, `band "${c.band}" names none of ${BANDS.join(" / ")}`); else ok();
  if (!/offline/i.test(c.teacherNote ?? "") || !/low quality/i.test(c.teacherNote ?? "")) fail(c.id, "teacher note does not cover working offline and low quality on phones"); else ok();
  // 2 — guides resolve
  for (const g of c.guides ?? []) if (!REG_IDS.has(g)) fail(c.id, `guide "${g}" is not in tools/standards.json`); else ok();
  // 3 — programme text
  for (const [field, text] of [["summary", c.summary], ...c.stations.map((s) => [`why of ${s.id}`, s.why])]) {
    if (/\d/.test(text ?? "")) fail(c.id, `${field} states a figure: "${text}"`); else ok();
  }
  for (const code of CODES) if (code.test(`${c.summary} ${c.certification} ${c.name}`)) fail(c.id, `carries a grade or standard code (${code})`);

  // 4 — the flow
  const flowPath = `WebXR/flows/${c.id}.json`;
  if (!existsSync(join(ROOT, flowPath))) fail(c.id, `no flow at ${flowPath}`);
  else {
    const flow = JSON.parse(read(flowPath));
    const v = F.validateFlow(flow, catalog);
    if (!v.ok) fail(c.id, `flow does not validate: ${v.errors.join("; ")}`); else ok();
    const gate = flow.nodes.find((n) => n.kind === "gate");
    if (!gate || !/teacher/i.test(gate.title ?? "")) fail(c.id, "flow has no teacher gate"); else ok();
    const ids = new Set(c.stations.map((s) => s.id));
    if (gate && !(gate.params?.stations ?? []).every((s) => ids.has(s))) fail(c.id, "the teacher gate reads a station outside the programme"); else ok();
    if (!flow.nodes.some((n) => n.kind === "brief") || !flow.nodes.some((n) => n.kind === "checkin")) fail(c.id, "flow has no brief or no check-in"); else ok();
    if (!flow.nodes.some((n) => n.kind === "programme" && n.ref === c.id)) fail(c.id, "flow does not run its own programme"); else ok();
  }

  for (const st of c.stations) {
    const id = st.id;
    seenStations.add(id);
    const r = ROOMS.get(id);
    if (!r) { fail(id, "not a SmartCiti.X station"); continue; }
    // 1 — the bar
    const steps = r.steps ?? [];
    if (steps.length < 12 || steps.length > 15) fail(id, `${steps.length} steps, not 12–15`); else ok();
    const kinds = new Set(steps.map((s) => s.kind).filter((k) => KINDS.includes(k)));
    if (kinds.size < 6) fail(id, `${kinds.size} step kinds, fewer than six`); else ok();
    if (!["drag", "turn", "gauge", "track"].some((k) => kinds.has(k))) fail(id, "no drag, turn, gauge or track step"); else ok();
    if (Object.keys(r.hazards ?? {}).length !== 4) fail(id, `${Object.keys(r.hazards ?? {}).length} hazards, not four`); else ok();
    if ((r.interrupts ?? []).length !== 2) fail(id, `${(r.interrupts ?? []).length} interruptions, not two`); else ok();
    const whys = steps.map((s) => (s.why ?? "").length).sort((a, b) => a - b);
    if (whys.some((n) => n < 40)) fail(id, "a step has no real why"); else ok();
    if (whys[whys.length >> 1] < 200) fail(id, `median why ${whys[whys.length >> 1]} characters, under 200`); else ok();
    if (!r.supportLine) fail(id, "no support line"); else ok();
    if (!steps.some((s) => /check-in/.test(s.id))) fail(id, "no closing crew check-in"); else ok();
    let api = null;
    try { api = r.build(new city.THREE.Group()); } catch (e) { fail(id, `build threw: ${e.message}`); }
    if (api) {
      for (const h of Object.keys(r.hazards ?? {})) if (!api.hits[h]) fail(id, `hazard "${h}" has no object`);
      for (const it of r.interrupts ?? []) {
        if (!api.hits[it.target]) fail(id, `interruption "${it.id}" answer has no object`);
        const host = steps.find((s) => s.id === it.after);
        if (!host || !["hold", "track"].includes(host.kind)) fail(id, `interruption "${it.id}" is not armed on a hold or track step`);
        else if (host.target === it.target) fail(id, `interruption "${it.id}" is answered by its host step's own control`);
        else ok();
      }
    }
    // 2 — citations resolve, in scope, and nothing unregistered
    const text = `${r.certification ?? ""} ${prose(r)}`;
    const hits = [...text.matchAll(CITE_RE)].map((m) => BY_CITE.get(m[0]));
    const inScope = hits.filter((e) => e.scope.includes(r.category));
    if (!inScope.length) fail(id, `cites no registered standard in scope for ${r.category}`); else ok();
    const outScope = hits.filter((e) => !e.scope.includes(r.category));
    if (outScope.length) fail(id, `cites ${outScope.map((e) => e.id).join(", ")} outside its category`); else ok();
    if (/\b\d{2} CFR\b|§|\bNFPA \d|\bANSI\b|\bOSHA\b/.test(text)) fail(id, "carries a regulatory citation a K-12 lesson has no business with"); else ok();
    // 3 — no figures or codes in the learner-facing prose
    const p = prose(r);
    const digits = p.match(/[^\n]{0,30}\d[^\n]{0,30}/);
    if (digits) fail(id, `learner-facing text states a figure: "…${digits[0].trim()}…"`); else ok();
    for (const code of CODES) if (code.test(text)) fail(id, `carries a grade or standard code (${code})`);
    const cert = r.certification ?? "";
    if (/\d/.test(cert.replace(/Goal 4\b/g, "").replace(/K-12/g, ""))) fail(id, "certification states a figure other than the goal's own number"); else ok();
    if (/certif(y|ies|ied) (the|this) lesson|accredited by|endorsed by/i.test(cert.replace(/None of these certifies the lesson/i, ""))) fail(id, "certification claims a body certifies the lesson"); else ok();
    // 5 — launchable from a world (a parish station from its parish site: section 9)
    if (BY_IDS.has(id)) continue;
    const boards = [...BAY_SITES.map((s) => ["bayworld", s]), ...DEEP_SITES.map((s) => ["deep", s])]
      .filter(([, s]) => (s.stations ?? []).includes(id) && (s.programmes ?? []).includes(c.id));
    if (!boards.length) fail(id, `no Bay World or Deep site board launches it with its programme ${c.id}`);
    else {
      const href = lkStationLink(id, { from: boards[0][0], page: "index.html", siteId: boards[0][1].id });
      if (!href.includes(`sim=${id}`)) fail(id, `lkStationLink built "${href}"`); else ok();
    }
  }
}

// 7 — the station count (k12-brief: 8 + 8 + 6 + 6), and reading level bounds
const WANT_STATIONS = { "k12-practical-math": 8, "k12-science": 8, "k12-history-and-civics": 6, "k12-literacy-and-life-skills": 6 };
for (const c of K12) {
  const want = WANT_STATIONS[c.id];
  const core = c.stations.filter((s) => !BY_IDS.has(s.id)).length;
  if (want && core !== want) fail(c.id, `${core} core stations, the brief names ${want}`); else ok();
}
const nCore = [...seenStations].filter((id) => !BY_IDS.has(id)).length;
if (nCore !== 28) fail("stations", `${nCore} core K-12 stations, expected twenty-eight`); else ok();
// Station prose (cues and whys) sits between upper-primary and upper-secondary
// reading; a field lesson reads on the spot, so it sits lower and in short
// sentences. Flesch–Kincaid grade as a rough yardstick (tools/lib/reading-level.mjs).
const RL_STATION = [4, 11], RL_LESSON_MAX = 7, WPS_STATION = 24, WPS_LESSON = [4, 16];
for (const id of seenStations) {
  const r = ROOMS.get(id);
  if (!r) continue;
  const st = readingStats((r.steps ?? []).map((s) => `${s.cue} ${s.why}`).join(" "));
  if (st.grade < RL_STATION[0] || st.grade > RL_STATION[1]) fail(id, `reading level ${st.grade.toFixed(1)} outside ${RL_STATION.join("–")}`); else ok();
  if (st.wordsPerSentence > WPS_STATION) fail(id, `${st.wordsPerSentence.toFixed(1)} words per sentence, over ${WPS_STATION}`); else ok();
}

// 8 — field lessons (WebXR/shared/field-lessons.js): at least forty, in all four
// worlds, each anchored at a real site or landmark, tied to a K-12 station and a
// trade, linked, and within the reading bounds.
const FL = await import("../WebXR/shared/field-lessons.js");
const { FAIRWAY_FACILITY, FAIRWAY_HOLES } = await import("../WebXR/shared/fairway-data.js");
const { RG_COURSES } = await import("../WebXR/regatta/js/courses.js");
const { BAY_LANDMARKS } = await import("../WebXR/shared/bayworld-data.js");
const { DEEP_LANDMARKS } = await import("../WebXR/shared/underwater-data.js");
const ANCHORS = {
  bayworld: new Set([...BAY_SITES.map((s) => `site:${s.id}`), ...BAY_LANDMARKS.map((l) => `landmark:${l.id}`)]),
  deep: new Set([...DEEP_SITES.map((s) => `site:${s.id}`), ...DEEP_LANDMARKS.map((l) => `landmark:${l.id}`)]),
  regatta: new Set(RG_COURSES.map((c) => `course:${c.id}`)),
  fairway: new Set([...Object.keys(FAIRWAY_FACILITY).map((k) => `facility:${k}`), ...FAIRWAY_HOLES.map((h) => `hole:hole-${h.number}`)]),
};
const lessons = FL.K2_FIELD_LESSONS;
if (lessons.length < 40) fail("field lessons", `${lessons.length} field lessons, fewer than forty`); else ok();
const ids = new Set();
for (const l of lessons) {
  if (ids.has(l.id)) fail(l.id, "duplicate field lesson id"); ids.add(l.id);
  for (const p of FL.k2ValidateFieldLesson(l, { stations: seenStations, anchors: ANCHORS[l.world] ?? new Set() })) fail(l.id, p);
  if (!FL.K2_WORLD_PAGES[l.world]) fail(l.id, `world ${l.world} has no page`);
  const href = FL.k2LessonLink(l, lkStationLink);
  if (!href.includes(`sim=${l.station}`) || !href.includes(`from=${l.world}`)) fail(l.id, `link "${href}" does not launch its station`); else ok();
  const st = readingStats([`${l.title}.`, ...l.steps, l.check.question, l.check.why].join(" "));
  if (st.grade > RL_LESSON_MAX) fail(l.id, `reading level ${st.grade.toFixed(1)} over ${RL_LESSON_MAX}`); else ok();
  if (st.wordsPerSentence < WPS_LESSON[0] || st.wordsPerSentence > WPS_LESSON[1]) fail(l.id, `${st.wordsPerSentence.toFixed(1)} words per sentence, outside ${WPS_LESSON.join("–")}`); else ok();
}
for (const w of ["bayworld", "deep", "regatta", "fairway"]) {
  const n = FL.k2LessonsFor(w).length;
  if (n < 5) fail("field lessons", `${w} has ${n} field lessons, fewer than five`); else ok();
}
// every K-12 programme is reached by at least one field lesson
for (const c of K12) if (!lessons.some((l) => c.stations.some((s) => s.id === l.station))) fail(c.id, "no field lesson points at this programme"); else ok();
// the in-game maps carry the K-12 layer
for (const [file, fn] of [["WebXR/bayworld/js/map.js", "bwMapFieldLessons"], ["WebXR/underwater/js/dive-map.js", "dvMapFieldLessons"]]) {
  if (!read(file).includes(`export function ${fn}`)) fail("map layer", `${file} does not export ${fn}`); else ok();
}
for (const file of ["WebXR/bayworld/js/app.js", "WebXR/underwater/js/app.js"]) {
  if (!/k2DrawFieldLayer\(/.test(read(file))) fail("map layer", `${file} does not draw the K-12 layer`); else ok();
}

// 8b — field lessons in play (WebXR/shared/field-kiosk.js): a kiosk per lesson
// and a lesson screen in Bay World and the Deep; the lesson list on the
// Regatta's briefing and course card and on Fairway Park's facility screen.
const kioskSrc = read("WebXR/shared/field-kiosk.js");
for (const fn of ["k2BuildKiosks", "k2NearestKiosk", "k2OpenLesson", "k2RecordLesson", "k2FieldNotes"]) {
  if (!kioskSrc.includes(`export function ${fn}`)) fail("kiosks", `field-kiosk.js does not export ${fn}`); else ok();
}
if (/THREE\./.test(kioskSrc)) fail("kiosks", "field-kiosk.js spells the three.js namespace; take the library from the caller"); else ok();
for (const [app, html] of [["WebXR/bayworld/js/app.js", "WebXR/bayworld/index.html"], ["WebXR/underwater/js/app.js", "WebXR/underwater/underwater.html"]]) {
  const src = read(app);
  for (const call of ["k2BuildKiosks(", "k2NearestKiosk(", "k2OpenLesson(", "k2KioskPrompt("]) if (!src.includes(call)) fail("kiosks", `${app} does not call ${call})`); else ok();
  const page = read(html);
  if (!page.includes('id="scr-lesson"') || !page.includes('id="k2-lesson"')) fail("kiosks", `${html} has no lesson screen`); else ok();
}
if (!/k2RenderLessonList\(/.test(read("WebXR/regatta/js/app.js")) || !/k2DrawFieldLayer\(/.test(read("WebXR/regatta/js/app.js"))) fail("map layer", "the Regatta draws no K-12 layer on its course card or briefing"); else ok();
if (!read("WebXR/regatta/regatta.html").includes('id="br-lessons"')) fail("map layer", "regatta.html has no br-lessons list"); else ok();
if (!/k2RenderLessonList\(/.test(read("WebXR/fairway/js/app.js"))) fail("map layer", "Fairway Park lists no K-12 lessons"); else ok();
if (!read("WebXR/fairway/index.html").includes('id="facility-lessons"')) fail("map layer", "fairway/index.html has no facility-lessons list"); else ok();
for (const world of ["bayworld", "underwater"]) {
  const bundle = read("tools/bundle_webxr.py");
  if (!bundle.includes('SHARED / "field-kiosk.js"')) fail("kiosks", `bundle_webxr.py does not carry field-kiosk.js for ${world}`); else ok();
}
// the bundler must see passport.js before field-kiosk.js in each world's list
{
  const b = read("tools/bundle_webxr.py");
  let pos = 0, n = 0;
  while ((pos = b.indexOf('SHARED / "field-kiosk.js"', pos + 1)) > 0) {
    n++;
    const before = b.lastIndexOf('SHARED / "passport.js"', pos);
    const sectionStart = b.lastIndexOf('"modules": [', pos);
    if (before < sectionStart) fail("kiosks", "field-kiosk.js is listed before passport.js in a bundle");
    else ok();
  }
  if (n < 4) fail("kiosks", `field-kiosk.js is in ${n} bundle list(s), expected Bay World, the Deep, Summit and Redwood`); else ok();
}
// Summit and Redwood write the same passport award on a right answer and list
// their lessons through the shared list call, so one Field Notes badge counts
// across all six worlds.
for (const app of ["WebXR/summit/js/app.js", "WebXR/redwood/js/app.js"]) {
  const src = read(app);
  for (const call of ["k2AdaptLesson(", "k2RecordLesson(", "k2RenderLessonList(", "k2FieldNotes("]) if (!src.includes(call)) fail("kiosks", `${app} does not call ${call})`); else ok();
}
for (const html of ["WebXR/summit/index.html", "WebXR/redwood/redwood.html"]) if (!read(html).includes('id="map-lessons"')) fail("kiosks", `${html} has no map-lessons list`); else ok();
for (const w of ["summit", "redwood"]) if (!/K2_WORLD_PAGES = \{[^}]*\b/.test(read("WebXR/shared/field-lessons.js")) || !read("WebXR/shared/field-lessons.js").includes(`${w}: "../`)) fail("kiosks", `K2_WORLD_PAGES has no page for ${w}`); else ok();

// 8d — the teacher tools (tools/gen_k12_cards.mjs → WebXR/k12/teacher.html):
// one printable card per field lesson across all six worlds, the teacher view
// by programme, Field Notes read from this browser's passport only, no network.
{
  const pagePath = "WebXR/k12/teacher.html";
  if (!existsSync(join(ROOT, pagePath))) fail("teacher", `${pagePath} is missing — run node tools/gen_k12_cards.mjs`);
  else {
    const page = read(pagePath);
    const SM = await import("../WebXR/shared/summit-data.js");
    const RWL = await import("../WebXR/redwood/js/rw-lore-data.js");
    const total = lessons.length + SM.SM_FIELD_LESSONS.length + RWL.RW_FIELD_LESSONS.length;
    const cards = (page.match(/<article class="card"/g) ?? []).length;
    if (cards !== total) fail("teacher", `${cards} lesson cards, ${total} field lessons — run node tools/gen_k12_cards.mjs`); else ok();
    for (const l of [...lessons, ...SM.SM_FIELD_LESSONS, ...RWL.RW_FIELD_LESSONS]) if (!page.includes(`id="card-${l.id}"`)) fail("teacher", `no card for ${l.id}`);
    for (const w of ["bayworld", "deep", "regatta", "fairway", "summit", "redwood"]) if (!page.includes(`data-k2-notes="${w}"`)) fail("teacher", `no Field Notes count for ${w}`); else ok();
    for (const c of K12) if (!page.includes(`id="prog-${c.id}"`)) fail("teacher", `teacher view has no section for ${c.id}`); else ok();
    if (/fetch\(|XMLHttpRequest|navigator\.sendBeacon|<script[^>]*src="https?:/.test(page)) fail("teacher", "the teacher page reaches the network"); else ok();
    if (!/@media print/.test(page)) fail("teacher", "the teacher page has no print stylesheet"); else ok();
    if (!/k2FieldNotes\(/.test(page)) fail("teacher", "the teacher page does not read Field Notes from the passport"); else ok();
    // every link on the page launches a classroom station, never a lesson's trade station (Summit's and Redwood's carry both)
    const stray = [...page.matchAll(/sim=([^"&]+)/g)].map((m) => m[1]).filter((id) => !seenStations.has(id));
    if (stray.length) fail("teacher", `${stray.length} link(s) launch a non-K-12 station: ${[...new Set(stray)].slice(0, 3).join(", ")}`); else ok();
    if (!/station: l\.k12 \?\? l\.station/.test(kioskSrc)) fail("kiosks", "k2AdaptLesson must take the K-12 station (k12) before the trade station (station)"); else ok();
  }
}

// 8c — Summit's and Redwood's own field lessons, in their exported schemas
// (SM_FIELD_LESSONS: place/at/k12/check.q+choices; RW_FIELD_LESSONS:
// site/landmark/k12/check.q+options): ten each, every anchor a real site or
// landmark of that world, every k12 link a classroom station, three steps, a
// check with a right answer in range, minutes two to four, and reading level
// within the K-12 station ceiling. Their consoles own the words; a digit in
// one is reported, not failed, because their scenes show the numbers they use.
{
  const SM = await import("../WebXR/shared/summit-data.js");
  const RWD = await import("../WebXR/redwood/js/rw-data.js");
  const RWL = await import("../WebXR/redwood/js/rw-lore-data.js");
  const smAnchors = new Set([...SM.SM_SITES.map((s) => s.id), ...SM.SM_LANDMARKS.map((l) => l.id)]);
  const rwSites = new Set(RWD.RW_SITES.map((s) => s.id)), rwLandmarks = new Set(RWD.RW_LANDMARKS.map((l) => l.id));
  // Summit's own schema (site/landmark under `anchor`, the k12 link under
  // `station`, the trade station under `tradeStation`, the question under
  // `check.question`) predates this shared place/k12/station/check.q shape;
  // normalise here rather than fork the checks below.
  const smLessons = SM.SM_FIELD_LESSONS.map((l) => ({
    ...l,
    place: l.anchor?.id,
    k12: l.station,
    station: l.tradeStation,
    check: l.check ? { ...l.check, q: l.check.question } : l.check,
  }));
  const worlds = [
    ["summit", smLessons, (l) => (smAnchors.has(l.place) ? [] : [`place ${l.place} is not a Summit site or landmark`]), (l) => l.check?.options],
    ["redwood", RWL.RW_FIELD_LESSONS, (l) => [...(rwSites.has(l.site) ? [] : [`site ${l.site} is not a Redwood site`]), ...(l.landmark && !rwLandmarks.has(l.landmark) ? [`landmark ${l.landmark} is not a Redwood landmark`] : [])], (l) => l.check?.options],
  ];
  let digits = 0;
  for (const [world, list, anchorsOf, optionsOf] of worlds) {
    if (!Array.isArray(list) || list.length < 10) fail(world, `${list?.length ?? 0} field lessons, fewer than ten`); else ok();
    const seen = new Set();
    for (const l of list ?? []) {
      if (!/-fl-/.test(l.id ?? "")) fail(world, `lesson id "${l.id}" lacks -fl-`); else ok();
      if (seen.has(l.id)) fail(world, `duplicate lesson id ${l.id}`); seen.add(l.id);
      for (const p of anchorsOf(l)) fail(l.id, p);
      if (!seenStations.has(l.k12)) fail(l.id, `k12 "${l.k12}" is not a classroom station`); else ok();
      if (l.station && !ROOMS.has(l.station)) fail(l.id, `trade station "${l.station}" is not a station`); else ok();
      if (!(l.minutes >= 2 && l.minutes <= 4)) fail(l.id, `minutes ${l.minutes} outside two to four`); else ok();
      if (!Array.isArray(l.steps) || l.steps.length !== 3 || !l.steps.every((s) => typeof s === "string" && s.trim())) fail(l.id, "steps are not three sentences"); else ok();
      const opts = optionsOf(l);
      if (!l.check?.q || !Array.isArray(opts) || opts.length < 2 || !Number.isInteger(l.check.answer) || l.check.answer < 0 || l.check.answer >= opts.length) fail(l.id, "check question malformed"); else ok();
      for (const f of ["title", "trade"]) if (typeof l[f] !== "string" || !l[f].trim()) fail(l.id, `no ${f}`); else ok();
      const text = [l.title, l.tradeLine ?? "", ...(l.steps ?? []), l.check?.q ?? "", ...(opts ?? [])].join(" ");
      if (/\d/.test(text)) digits++;
      const st = readingStats([`${l.title}.`, ...(l.steps ?? []), l.check?.q ?? ""].join(" "));
      if (st.grade > RL_STATION[1]) fail(l.id, `reading level ${st.grade.toFixed(1)} over the K-12 ceiling ${RL_STATION[1]}`); else ok();
    }
  }
  if (digits) console.log(`  · ${digits} Summit/Redwood lesson(s) state a figure their scene shows (reported, not failed; the K-12 lessons themselves carry none)`);
}

// 8d — the New Orleans parishes' field lessons (WebXR/shared/sl-parish-play.js,
// SECONDLINE, docs/parish-play.md): the Redwood shape plus `parish` and the trade
// `station`; twenty-five or more, five or more in each of the five parishes, every
// one at a parish site, tied to a classroom station and a trade station, three
// steps, a check with a right answer and a why, minutes two to four, no digit
// (the Facts rule for New Orleans), reading level inside the field-lesson bound,
// and every classroom programme reached.
{
  globalThis.localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} };
  globalThis.sessionStorage ??= globalThis.localStorage;
  const SLP = await import("../WebXR/shared/sl-parish-play.js");
  const list = SLP.SL_FIELD_LESSONS;
  if (!Array.isArray(list) || list.length < 25) fail("parishes", `${list?.length ?? 0} parish field lessons, fewer than twenty-five`); else ok();
  for (const p of SLP.SL_PARISHES) {
    const n = list.filter((l) => l.parish === p.id).length;
    if (n < 5) fail("parishes", `${p.name} has ${n} field lessons, fewer than five`); else ok();
  }
  const seen = new Set();
  for (const l of list) {
    if (!/^sl-fl-/.test(l.id ?? "")) fail("parishes", `lesson id "${l.id}" lacks the sl-fl- prefix`); else ok();
    if (seen.has(l.id)) fail("parishes", `duplicate lesson id ${l.id}`); seen.add(l.id);
    if (!SLP.slSiteDef(l.parish, l.site)) fail(l.id, `site ${l.parish}/${l.site} is not a parish site`); else ok();
    if (!seenStations.has(l.k12)) fail(l.id, `k12 "${l.k12}" is not a classroom station`); else ok();
    if (!ROOMS.has(l.station)) fail(l.id, `trade station "${l.station}" is not a station`); else ok();
    if (!(l.minutes >= 2 && l.minutes <= 4)) fail(l.id, `minutes ${l.minutes} outside two to four`); else ok();
    if (!Array.isArray(l.steps) || l.steps.length !== 3 || !l.steps.every((s) => typeof s === "string" && s.trim())) fail(l.id, "steps are not three sentences"); else ok();
    const c = l.check;
    if (!c?.q || !Array.isArray(c.options) || c.options.length < 2 || !Number.isInteger(c.answer) || c.answer < 0 || c.answer >= c.options.length || !c.why) fail(l.id, "check question malformed"); else ok();
    for (const f of ["title", "trade", "tradeLine"]) if (typeof l[f] !== "string" || !l[f].trim()) fail(l.id, `no ${f}`); else ok();
    const text = [l.title, l.tradeLine, ...(l.steps ?? []), c?.q ?? "", ...(c?.options ?? []), c?.why ?? ""].join(" ");
    if (/\d/.test(text)) fail(l.id, "states a figure (a digit) — the Facts rule for New Orleans"); else ok();
    if (/\b(built|opened|founded|established|dedicated|acres|feet|miles|tall|population|century|anniversary|named after)\b/i.test(text)) fail(l.id, "carries a fact-shaped claim about the place"); else ok();
    const st = readingStats([`${l.title}.`, ...(l.steps ?? []), c?.q ?? ""].join(" "));
    if (st.grade > RL_LESSON_MAX) fail(l.id, `reading level ${st.grade.toFixed(1)} over ${RL_LESSON_MAX}`); else ok();
    if (st.wordsPerSentence < WPS_LESSON[0] || st.wordsPerSentence > WPS_LESSON[1]) fail(l.id, `${st.wordsPerSentence.toFixed(1)} words per sentence, outside ${WPS_LESSON.join("–")}`); else ok();
    const href = lkStationLink(l.k12, { from: "parishes", page: "parishes.html", siteId: l.site });
    if (!href.includes(`sim=${l.k12}`) || !href.includes("from=parishes")) fail(l.id, `link "${href}" does not launch its classroom station`); else ok();
  }
  for (const c of K12) if (!list.some((l) => c.stations.some((s) => s.id === l.k12))) fail(c.id, "no parish field lesson points at this programme"); else ok();
  console.log(`  · ${list.length} parish field lessons across ${SLP.SL_PARISHES.length} parishes`);
}

// 8e — the San Francisco districts' field lessons (GOLDEN-B, WebXR/shared/sg-sf-play.js re-reading each
// district's np-data-sf-*.js fieldLessons): the play layer's shape, ten or more, five or more in each GOLDEN-B
// district, every one at a district site, tied to a classroom station and a trade station, no digit, no
// fact-shaped claim about the place, reading level and sentence length inside the field-lesson bounds.
{
  const SGP = await import("../WebXR/shared/sg-sf-play.js");
  const list = SGP.SG_FIELD_LESSONS;
  if (!Array.isArray(list) || list.length < 10) fail("san-francisco", `${list?.length ?? 0} SF field lessons, fewer than ten`); else ok();
  for (const d of SGP.SG_DISTRICTS) if (list.filter((l) => l.parish === d.id).length < 5) fail("san-francisco", `${d.name} has fewer than five field lessons`); else ok();
  const seen = new Set();
  for (const l of list) {
    if (!/^sg-fl-/.test(l.id ?? "")) fail("san-francisco", `lesson id "${l.id}" lacks the sg-fl- prefix`); else ok();
    if (seen.has(l.id)) fail("san-francisco", `duplicate lesson id ${l.id}`); seen.add(l.id);
    if (!SGP.sgDistrict(l.parish)?.sites.some((s) => s.id === l.site)) fail(l.id, `site ${l.parish}/${l.site} is not a district site`); else ok();
    if (!seenStations.has(l.k12)) fail(l.id, `k12 "${l.k12}" is not a classroom station`); else ok();
    if (!ROOMS.has(l.station)) fail(l.id, `trade station "${l.station}" is not a station`); else ok();
    if (!(l.minutes >= 2 && l.minutes <= 4)) fail(l.id, `minutes ${l.minutes} outside two to four`); else ok();
    if (!Array.isArray(l.steps) || l.steps.length !== 3 || !l.steps.every((s) => typeof s === "string" && s.trim())) fail(l.id, "steps are not three sentences"); else ok();
    const c = l.check;
    if (!c?.q || !Array.isArray(c.options) || c.options.length < 2 || !Number.isInteger(c.answer) || c.answer < 0 || c.answer >= c.options.length || !c.why) fail(l.id, "check question malformed"); else ok();
    const text = [l.title, l.tradeLine, ...(l.steps ?? []), c?.q ?? "", ...(c?.options ?? []), c?.why ?? ""].join(" ");
    if (/\d/.test(text)) fail(l.id, "states a figure (a digit) — the Facts rule"); else ok();
    if (/\b(built|opened|founded|established|dedicated|acres|feet|miles|tall|population|century|anniversary|named after)\b/i.test(text)) fail(l.id, "carries a fact-shaped claim about the place"); else ok();
    const st = readingStats([`${l.title}.`, ...(l.steps ?? []), c?.q ?? ""].join(" "));
    if (st.grade > RL_LESSON_MAX) fail(l.id, `reading level ${st.grade.toFixed(1)} over ${RL_LESSON_MAX}`); else ok();
    if (st.wordsPerSentence < WPS_LESSON[0] || st.wordsPerSentence > WPS_LESSON[1]) fail(l.id, `${st.wordsPerSentence.toFixed(1)} words per sentence, outside ${WPS_LESSON.join("–")}`); else ok();
    const href = lkStationLink(l.k12, { from: "parishes", page: "parishes.html", siteId: `${l.parish}/${l.site}` });
    if (!href.includes(`sim=${l.k12}`) || !href.includes("from=parishes")) fail(l.id, `link "${href}" does not launch its classroom station`); else ok();
  }
  console.log(`  · ${list.length} San Francisco field lessons across ${SGP.SG_DISTRICTS.length} districts`);
}
// 9 — the New Orleans parish lessons (BAYOU, WebXR/shared/by-parish-lessons.js):
// twelve or more stations, each in a classroom programme and anchored at a real
// site of np-data-<parish>.js; its band's reading ceiling held; a GRIOT guide and a
// trade station that resolve; a flow per lesson (WebXR/flows/by-*.json) that
// validates, carries the check and hands off to the lesson's apply step; every
// apply id resolving (a KREWE `kw-` kiosk with a BAYOU fallback, or a BAYOU mini-game
// on a shared mechanic that builds steps); no digit, no fact-shaped claim and no
// fear framing; and the flow agent driving a flow to its end with the passport
// recording the lesson and the apply step once each.
{
  const NPC = await import("../WebXR/shared/npc.js");
  const { QM_MECHANICS } = await import("../WebXR/shared/side-game-mechanics.js");
  const AG = await import("../WebXR/shared/by-flow-agent.js");
  const FACTS = /\b(built|opened|founded|established|dedicated|acres|feet|miles|tall|population|century|anniversary|named after)\b/i;
  const FEAR = /\b(scary|scared|disaster|catastroph\w*|devastat\w*|deadly|drown\w*|terrif\w*|destroy\w*|panic)\b/i;
  const parishData = {};
  for (const pid of ["orleans", "jefferson", "st-bernard", "plaquemines", "st-tammany"]) {
    const m = await import(`../WebXR/shared/np-data-${pid}.js`);
    parishData[pid] = Object.values(m).find((v) => v && Array.isArray(v.sites));
  }
  const list = BYL.BY_LESSONS;
  if (list.length < 12) fail("bayou", `${list.length} parish lessons, fewer than twelve`); else ok();
  const seen = new Set(), programmes = new Map(CURRICULA.map((c) => [c.id, c]));
  const parishes = new Set();
  for (const l of list) {
    const where = l.id;
    if (!/^by-lesson-/.test(l.id) || seen.has(l.id)) fail(where, "lesson id is not a unique by-lesson- id"); else ok();
    seen.add(l.id);
    const prog = programmes.get(l.programme);
    if (!prog || prog.audience !== "classroom" || !prog.stations.some((s) => s.id === l.station)) fail(where, `station ${l.station} is not in classroom programme ${l.programme}`); else ok();
    const r = ROOMS.get(l.station);
    if (!r) { fail(where, `station ${l.station} is not a SmartCiti.X station`); continue; }
    const site = parishData[l.parish]?.sites.find((s) => s.id === l.site);
    if (!site) fail(where, `site ${l.parish}/${l.site} is not a site of np-data-${l.parish}.js`); else { ok(); parishes.add(l.parish); }
    const ceiling = BYL.BY_BAND_CEILING[l.band];
    if (!ceiling) fail(where, `band "${l.band}" is not one of ${Object.keys(BYL.BY_BAND_CEILING).join(" / ")}`);
    else {
      const st = readingStats((r.steps ?? []).map((s) => `${s.cue} ${s.why}`).join(" "));
      if (st.grade > ceiling) fail(where, `station reading level ${st.grade.toFixed(1)} over the ${l.band} ceiling ${ceiling}`); else ok();
      const ls = readingStats([`${l.title}.`, ...l.steps, l.check.q].join(" "));
      if (ls.grade > Math.min(ceiling, RL_LESSON_MAX)) fail(where, `lesson lines read at ${ls.grade.toFixed(1)}, over ${Math.min(ceiling, RL_LESSON_MAX)}`); else ok();
    }
    if (!NPC.grCharacter(l.guide)) fail(where, `guide ${l.guide} is not a GRIOT character`); else ok();
    if (!ROOMS.has(l.tradeStation)) fail(where, `trade station ${l.tradeStation} is not a station`); else ok();
    const c = l.check;
    if (!c?.q || !Array.isArray(c.options) || c.options.length < 2 || !Number.isInteger(c.answer) || c.answer < 0 || c.answer >= c.options.length || !c.why) fail(where, "check question malformed"); else ok();
    if (!Array.isArray(l.steps) || l.steps.length !== 3) fail(where, "not three one-idea steps"); else ok();
    const text = [l.title, l.siteName, ...l.steps, c.q, ...c.options, c.why].join(" ");
    if (/\d/.test(text)) fail(where, "lesson text states a figure (a digit)"); else ok();
    const all = `${text} ${prose(r)}`;
    if (FACTS.test(all)) fail(where, `carries a fact-shaped word about a place (${all.match(FACTS)[0]})`); else ok();
    if (FEAR.test(all)) fail(where, `fear framing (${all.match(FEAR)[0]}) — readiness, teamwork and who helps`); else ok();
    // apply step
    const ids = [l.apply.id, l.apply.fallback].filter(Boolean);
    for (const aid of ids) {
      if (aid.startsWith("kw-")) { if (!BYL.BY_KREWE_KIOSKS.includes(aid)) fail(where, `kiosk ${aid} is not a KREWE kiosk id`); else ok(); continue; }
      const g = BYL.byApplyGame(aid);
      if (!g) { fail(where, `apply step ${aid} is not a BAYOU mini-game`); continue; }
      if (!QM_MECHANICS[g.mechanic]) fail(where, `mini-game ${aid} uses unknown mechanic ${g.mechanic}`); else ok();
      if (!BYL.byApplySteps(aid).length) fail(where, `mini-game ${aid} builds no steps`); else ok();
      if (g.parish !== l.parish || g.site !== l.site) fail(where, `mini-game ${aid} is not at the lesson's site`); else ok();
      if (g.minutes !== 2) fail(where, `mini-game ${aid} is not a two-minute step`); else ok();
    }
    if (l.apply.id.startsWith("kw-") && !l.apply.fallback) fail(where, "a KREWE kiosk with no BAYOU fallback"); else ok();
    const a = BYL.byApplyFor(l, { kiosks: [] });
    if (!a || a.kind !== "mini-game") fail(where, "no playable apply step without KREWE's kiosks"); else ok();
    const href = BYL.byStationHref(l);
    if (!href.includes(`sim=${l.station}`) || !href.includes("from=parishes")) fail(where, `link "${href}" does not launch its station from the parishes`); else ok();
    // the flow
    const fp = `WebXR/flows/${l.flow}.json`;
    if (!existsSync(join(ROOT, fp))) { fail(where, `no flow at ${fp}`); continue; }
    const flow = JSON.parse(read(fp));
    const v = F.validateFlow(flow, catalog);
    if (!v.ok) fail(where, `flow does not validate: ${v.errors.join("; ")}`); else ok();
    const ext = flow.nodes.find((n) => n.kind === "external");
    if (!ext || ext.ref !== l.apply.id) fail(where, "flow does not hand off to the lesson's apply step"); else ok();
    if (!flow.nodes.some((n) => n.kind === "station" && n.ref === l.station) || !flow.nodes.some((n) => n.params?.check?.q === c.q)) fail(where, "flow lacks the station or the check question"); else ok();
    // the agent drives it on device (headless here) and the passport records both
    const awards = [];
    const agent = AG.byFlowAgent(flow, { lesson: l, character: NPC.grCharacter(l.guide), award: (src, o) => awards.push(`${src}:${o.attemptId}`), awarded: (src, id) => awards.includes(`${src}:${id}`) });
    agent.next(); agent.next(); agent.next({ passed: true });
    agent.next({ answer: (c.answer + 1) % c.options.length });
    const stayed = agent.phase === "check" && agent.say().note === c.why;
    agent.next({ answer: c.answer }); agent.next({ done: true }); agent.next();
    if (!stayed || agent.phase !== "done") fail(where, `the flow agent did not drive the flow to its end (at ${agent.phase})`); else ok();
    if (awards.length !== 2 || !awards[0].startsWith("by-lesson:") || !awards[1].startsWith("by-apply:")) fail(where, `the passport did not record the lesson and the apply step (${awards.join(", ")})`); else ok();
  }
  if (parishes.size < 4) fail("bayou", `parish lessons reach ${parishes.size} parishes, fewer than four`); else ok();
  const idx = JSON.parse(read("WebXR/flows/index.json"));
  for (const l of list) if (!idx.flows.some((r) => r.id === l.flow)) fail(l.id, "flow not listed in flows/index.json"); else ok();
  console.log(`  · ${list.length} parish lessons across ${parishes.size} parishes, ${BYL.BY_APPLY_GAMES.length} apply mini-games, ${list.filter((l) => l.apply.id.startsWith("kw-")).length} KREWE kiosks`);
}

// 6 — the finder, the doc
const home = read("tools/gen_home.mjs");
if (!/value="classroom">Classroom/.test(home) || !/data-aud="classroom"/.test(home)) fail("homepage", "the finder has no Classroom filter"); else ok();
const index = read("WebXR/index.html");
const nClass = (index.match(/data-aud="classroom"/g) ?? []).length;
if (nClass !== K12.length) fail("homepage", `${nClass} finder cards marked classroom, expected ${K12.length} — run node tools/gen_home.mjs`); else ok();
if (!existsSync(join(ROOT, "docs/k12.md"))) fail("docs", "docs/k12.md is missing");
else {
  const doc = read("docs/k12.md").replace(/\s+/g, " ");
  if (!/SmartCiti\.X side/i.test(doc)) fail("docs", "docs/k12.md does not say it describes the SmartCiti.X side only"); else ok();
  if (!/no Cognition\.X or FlowHub specification/i.test(doc)) fail("docs", "docs/k12.md does not say the repository holds no Cognition.X or FlowHub specification"); else ok();
  for (const c of K12) if (!doc.includes(c.id)) fail("docs", `docs/k12.md does not describe ${c.id}`); else ok();
}

console.log(`\n  ${K12.length} classroom programmes · ${seenStations.size} stations · ${lessons.length} field lessons · ${passed} checks`);
console.log(failed ? `\n${failed} K-12 check(s) failed.` : `\nAll K-12 checks pass.`);
process.exit(failed ? 1 : 0);
