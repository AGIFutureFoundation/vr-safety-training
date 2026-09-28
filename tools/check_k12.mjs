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
 *      finder, and docs/k12.md labelled as the SmartCiti.X side only.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSmartCity } from "./lib/headless.mjs";

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
    // 5 — launchable from a world
    const boards = [...BAY_SITES.map((s) => ["bayworld", s]), ...DEEP_SITES.map((s) => ["deep", s])]
      .filter(([, s]) => (s.stations ?? []).includes(id) && (s.programmes ?? []).includes(c.id));
    if (!boards.length) fail(id, `no Bay World or Deep site board launches it with its programme ${c.id}`);
    else {
      const href = lkStationLink(id, { from: boards[0][0], page: "index.html", siteId: boards[0][1].id });
      if (!href.includes(`sim=${id}`)) fail(id, `lkStationLink built "${href}"`); else ok();
    }
  }
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

console.log(`\n  ${K12.length} classroom programmes · ${seenStations.size} stations · ${passed} checks`);
console.log(failed ? `\n${failed} K-12 check(s) failed.` : `\nAll K-12 checks pass.`);
process.exit(failed ? 1 : 0);
