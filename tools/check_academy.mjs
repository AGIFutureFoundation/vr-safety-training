#!/usr/bin/env node
/**
 * ACADEMY gate — the Bay Restoration Academy (docs/consoles/ACADEMY.md, docs/bay-academy.md).
 *
 *     node tools/check_academy.mjs
 *
 *   1. every track's work types are phrases of the facts file (the EPA release of 22 September 2026 and its
 *      coverage; the Port of Oakland's Clean Ports pages) — read from the facts file when this box has it,
 *      else from BAYKEEPER's and CLEANPORTS' verified copies (bk-bayprogram.js, cp-cleanports.js)
 *   2. one track per named project (the eight) plus Clean Ports, recipients exactly as the facts state
 *   3. every matrix cell resolves: a catalog station and a tools/unions.json union; every simulation is live
 *      in this tree or a pending UNIONSIMS id (us-, listed in its ids file when present), never a broken link
 *   4. every role pathway ends in a credential that exists on the competency layer and is earnable inside
 *      its own module (track stations + capstone >= the competency's mastery rule)
 *   5. every DEAN template validates and resolves through DEAN's lesson index, round-trips through
 *      dnExport/dnImport, and a cohort set up on the org layer gets the module on its class code with a due date
 *   6. the credentials export: mastery runs demonstrate a pathway's competency (status, Open Badge, xAPI)
 *   7. the page and the handbook: every station, union, simulation and credential on them resolves; the hub
 *      links the page; no partnership claim, no price, no figure the facts do not state, no unnamed project named
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const T0 = Date.now();
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const mk = (m) => ({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; } });
globalThis.localStorage ??= mk(new Map());
globalThis.sessionStorage ??= mk(new Map());
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);

const ea = await imp("WebXR/shared/ea-academy.js");
const bk = await imp("WebXR/shared/bk-bayprogram.js");
const cp = await imp("WebXR/shared/cp-cleanports.js");
const comp = await imp("WebXR/shared/competency.js");
const dn = await imp("WebXR/shared/dn-modules.js");
const en = await imp("WebXR/shared/org.js");
const { dnLessonIndex } = await imp("WebXR/shared/dn-index.js");
const { eaTreeIds } = await imp("tools/gen_academy.mjs");

const unions = new Set(JSON.parse(readFileSync(join(ROOT, "tools/unions.json"), "utf8")).unions.map((u) => u.id));
const tree = await eaTreeIds();
const opts = { stationIds: new Set(tree.stations.keys()), simIds: new Set(tree.sims.keys()) };

let fails = 0, checks = 0;
const ok = (cond, what) => { checks++; if (!cond) { fails++; console.log(`  FAIL ${what}`); } return !!cond; };
const line = (s) => console.log(`  ok   ${s}`);
const section = (n, title, fn) => { const f0 = fails; fn(); console.log(`${fails === f0 ? "ok  " : "FAIL"} ${n}. ${title}`); };
const unesc = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');

console.log("check_academy — the Bay Restoration Academy");

// 1. Work types are facts-file phrases.
const factsPath = process.env.BK_FACTS || "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad/epa/epa-2026-facts.md";
const factsText = existsSync(factsPath) ? readFileSync(factsPath, "utf8").replace(/\s+/g, " ")
  : [...bk.BK_PROJECTS.map((p) => p.does), ...cp.CP_FACTS.activities].join(" | ");
const factsFrom = existsSync(factsPath) ? "the facts file" : "BAYKEEPER's and CLEANPORTS' verified copies";
section(1, "every work type is a phrase of the facts file", () => {
  const wts = ea.EA_TRACKS.flatMap((t) => t.workTypes.map((w) => ({ t, w })));
  for (const { t, w } of wts) ok(factsText.includes(w.facts), `${t.id}/${w.id}: "${w.facts}" is not in ${factsFrom}`);
  // A work type quotes its own project's line (or Clean Ports' activities), not another project's.
  for (const { t, w } of wts) {
    const own = t.id === "clean-ports" ? cp.CP_FACTS.activities.join(" | ") : bk.BK_PROJECTS.find((p) => p.id === t.project)?.does ?? "";
    ok(own.includes(w.facts), `${t.id}/${w.id}: "${w.facts}" is not in that project's own line`);
  }
  for (const t of ea.EA_TRACKS) for (const g of t.gaps ?? []) ok(factsText.includes(g.facts), `${t.id} gap "${g.facts}" not in the facts`);
  line(`${wts.length} work types across ${ea.EA_TRACKS.length} tracks, each quoting its own project's words in ${factsFrom}`);
});

// 2. Tracks = the eight named projects + Clean Ports.
section(2, "one track per named project plus Clean Ports", () => {
  const ids = ea.EA_TRACKS.map((t) => t.id);
  ok(ids.length === 9 && new Set(ids).size === 9, `expected 9 distinct tracks, got ${ids.length}`);
  for (const p of bk.BK_PROJECTS) {
    const t = ea.EA_TRACKS.find((x) => x.project === p.id);
    ok(t && t.recipient === p.recipient, `no track for ${p.recipient} (or its recipient differs)`);
  }
  ok(ids.includes("clean-ports"), "no Clean Ports track");
  for (const t of ea.EA_TRACKS) { ok(t.workTypes.length > 0, `${t.id} has no work types`); ok(!!en && tree.catalog.curricula.some((c) => c.id === t.programme), `${t.id}: cohort programme ${t.programme} is not a catalog programme`); }
  line(`9 tracks: ${ea.EA_TRACKS.map((t) => t.short).join(", ")}`);
});

// 3. Matrix cells resolve; simulations are live or pending UNIONSIMS ids.
const idsFile = join(dirname(factsPath), "..", "restoration", "unionsims-ids.md");
const usListed = existsSync(idsFile) ? new Set([...readFileSync(idsFile, "utf8").matchAll(/\b(us-[a-z0-9-]+)/g)].map((m) => m[1])) : null;
let pendingAll = [];
section(3, "every matrix cell resolves to a real station and union", () => {
  const matrix = ea.eaMatrix(opts);
  for (const r of matrix) { ok(tree.stations.has(r.station), `cell ${r.track}/${r.workType}: station ${r.station} not in the catalog`); ok(unions.has(r.union), `cell ${r.track}/${r.workType}: union ${r.union} not in tools/unions.json`); }
  for (const t of ea.EA_TRACKS) for (const w of t.workTypes) {
    for (const c of w.crafts) ok(unions.has(c.union), `${t.id}/${w.id}: union ${c.union} not in tools/unions.json`);
    for (const id of w.k12) ok(id.startsWith("k12-"), `${t.id}/${w.id}: ${id} is not a K-12 lesson`);
  }
  for (const t of ea.EA_TRACKS) {
    const r = ea.eaResolve(t, opts);
    ok(r.workTypes.every((w) => w.stations.length > 0), `${t.id}: a work type has no live station`);
    for (const id of r.pending) {
      ok(id.startsWith("us-"), `${t.id}: ${id} does not resolve and is not a UNIONSIMS id`);
      if (usListed) ok(usListed.has(id), `${t.id}: pending ${id} is not in UNIONSIMS' ids file`);
    }
    pendingAll.push(...r.pending);
  }
  pendingAll = [...new Set(pendingAll)];
  const usNamed = [...new Set(ea.EA_TRACKS.flatMap((t) => t.workTypes.flatMap((w) => [...w.stations, ...w.sims])).filter((id) => id.startsWith("us-")))];
  const cells = new Set(matrix.map((r) => `${r.track}|${r.workType}|${r.union}`));
  line(`matrix: ${cells.size} work type × craft cells, ${matrix.length} station links — every station in the catalog, every union in the registry`);
  line(`UNIONSIMS guard: ${usNamed.length - pendingAll.length} of ${usNamed.length} us- ids resolve in this tree, ${pendingAll.length} pending${usListed ? " (each listed in its ids file)" : ""}`);
});

// 4. Pathways end in an earnable credential.
section(4, "every role pathway ends in an earnable credential", () => {
  let n = 0, cap = 0;
  for (const t of ea.EA_TRACKS) for (const p of ea.eaPathways(t, opts)) {
    n++;
    const c = p.credential && comp.COMPETENCY_BY_ID[p.credential.id];
    if (!ok(!!c, `${t.id}/${p.role}: no credential`)) continue;
    ok(p.earnable && p.credential.overlap + p.capstone.length >= c.require, `${t.id}/${p.role}: ${p.credential.id} needs ${c.require}, module holds ${p.credential.overlap + p.capstone.length}`);
    for (const s of p.capstone) { ok(c.stations.includes(s) && tree.stations.has(s), `${t.id}/${p.role}: capstone ${s} is not a ${c.id} station in the catalog`); cap++; }
    ok(p.stations.length + p.capstone.length > 0, `${t.id}/${p.role}: empty pathway`);
  }
  ok(n === 45, `expected 45 pathways (9 tracks × 5 roles), got ${n}`);
  line(`${n} pathways (9 tracks × ${ea.EA_ROLES.length} roles), each ending in one of ${ea.eaCredentialIds(opts).length} competencies, earnable in-module (${cap} capstone stations)`);
});

// 5. DEAN templates validate, resolve, round-trip; cohort operation.
section(5, "every DEAN template resolves and a cohort runs on the org layer", () => {
  const index = dnLessonIndex({ catalogIds: [...tree.stations.keys()] });
  const tpls = ea.eaTemplates(opts);
  ok(tpls.length === 45, `expected 45 templates, got ${tpls.length}`);
  ok(new Set(tpls.map((x) => x.module.id)).size === tpls.length, "template ids are not unique");
  let lessons = 0;
  for (const x of tpls) {
    const bad = dn.dnValidateDoc(x.module, index);
    ok(!bad.length, `${x.module.id}: ${bad.join("; ")}`);
    lessons += x.module.lessons.length;
    for (const s of x.sims) ok(tree.sims.has(s), `${x.module.id}: simulation ${s} not live`);
    ok(x.guide.objectives.length && x.guide.debrief.length && x.guide.assessment && x.guide.practice.length === x.module.lessons.length, `${x.module.id}: instructor guide incomplete`);
  }
  // Round trip: import the bundle, export it, the same modules come back.
  dn.dnClear();
  const bundle = { v: 1, kind: "dean-bundle", versions: [], modules: tpls.map((x) => x.module) };
  const r = dn.dnImport(JSON.stringify(bundle), index);
  ok(r.ok && r.modules === tpls.length, `import: ${r.errors?.join("; ")}`);
  const back = JSON.parse(dn.dnExport()).modules;
  ok(tpls.every((x) => { const m = back.find((b) => b.id === x.module.id); return m && JSON.stringify(m.lessons) === JSON.stringify(x.module.lessons) && m.requiredScore === x.module.requiredScore; }), "round trip changed a module");
  // Cohort: org + seats + class code + module assigned with its due date.
  dn.dnClear(); en.enClear();
  const c = ea.eaSetUpCohort({ en, dn, ...opts }, { orgName: "Check Hall", trackId: "clean-ports", role: "appr", seats: 12, startDate: "2026-10-05" });
  ok(c && c.cohort.seats === 12 && /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c.classCode), "cohort not created with its seats and class code");
  ok(c && c.module.id === "mod-ea-cleanports-appr" && c.module.due === "2026-11-16" && c.module.requiredScore === 80, `module due/score wrong: ${c?.module?.due} ${c?.module?.requiredScore}`);
  ok(c && c.module.assign.some((a) => a.classCode === c.classCode), "module not assigned to the class code");
  const apply = c && dn.dnApplyModule("smartcity", { classCodes: [c.classCode] });
  ok(apply && apply.glow.stations.has("cp-charging-yard-connectors-and-e-stops"), "the assigned module's stations do not glow for the class");
  ok(c && en.enCohort(c.cohort.id)?.programme === "wojrc-pathway-edition", "cohort programme is not the track's");
  line(`${tpls.length} DEAN templates (${lessons} lessons) validate and resolve through DEAN's index; bundle round-trips; cohort "Check Hall" → ${c?.classCode} · 12 seats · ${c?.module.id} due ${c?.module.due} · score ${c?.module.requiredScore}`);
  line(`instructor guides: ${tpls.length}, each with objectives, the stations' cited practice, simulations, debrief prompts and an assessment`);
});

// 6. Credentials export on the competency layer.
section(6, "mastery runs demonstrate a pathway credential (status, Open Badge, xAPI)", () => {
  const p = ea.eaPathways(ea.eaTrack("clean-ports"), opts).find((x) => x.role === "appr");
  const c = comp.COMPETENCY_BY_ID[p.credential.id];
  const runs = [...p.stations, ...p.capstone].filter((s) => c.stations.includes(s)).slice(0, c.require);
  const records = runs.flatMap((s, i) => [0, 1].map((d) => ({ id: `a-${i}-${d}`, simId: s, simName: s, stars: 3, hazardHits: 0, errors: 0, seconds: 60, score: 100, at: `2026-10-${String(10 + i * 2 + d).padStart(2, "0")}T10:00:00Z` })));
  const out = ea.eaCredentials(records);
  ok(out.status[c.id]?.demonstrated, `${c.id} not demonstrated from ${runs.length} mastery runs (${JSON.stringify(out.status[c.id] ?? {}).slice(0, 160)})`);
  ok(out.badges.length >= 1, "no Open Badge issued for the credential");
  ok(Array.isArray(out.xapi) ? out.xapi.length >= 1 : !!out.xapi, "no xAPI statement for the credential");
  ok(Object.keys(out.status).every((id) => ea.eaCredentialIds(opts).includes(id)), "status lists a competency outside the Academy");
  line(`${c.id}: ${runs.length} mastery runs → demonstrated · ${out.badges.length} Open Badge · ${Array.isArray(out.xapi) ? out.xapi.length : 1} xAPI statement(s)`);
});

// 7. Page + handbook + hub.
section(7, "the page, the handbook and the hub", () => {
  const f7 = fails;
  const page = readFileSync(join(ROOT, "WebXR/bayprogram/academy.html"), "utf8");
  const hub = readFileSync(join(ROOT, "WebXR/bayprogram/index.html"), "utf8");
  const doc = readFileSync(join(ROOT, "docs/bay-academy.md"), "utf8");
  ok(/href="academy\.html"/.test(hub), "the hub does not link academy.html");
  ok(page.includes('class="home-chip"') && page.includes("gdMount") && page.includes("../shared/design.css"), "page lacks the Home chip, the Guide or the design system");
  const attr = (a) => [...page.matchAll(new RegExp(`${a}="([^"]+)"`, "g"))].map((m) => m[1]);
  const st = attr("data-ea-station"), us = attr("data-ea-union"), sims = attr("data-ea-sim"), cr = attr("data-ea-credential");
  for (const id of st) ok(tree.stations.has(id), `page links unknown station ${id}`);
  for (const id of us) ok(unions.has(id), `page tags unknown union ${id}`);
  for (const id of sims) ok(tree.sims.has(id), `page shows a simulation not in this tree: ${id}`);
  for (const id of cr) ok(!!comp.COMPETENCY_BY_ID[id], `page names unknown credential ${id}`);
  for (const id of pendingAll) ok(!st.includes(id) && !sims.includes(id), `pending ${id} is linked`);
  ok(attr("data-ea-pathway").length === 45 && attr("data-ea-track").length === 9, "page does not show 9 tracks and 45 pathways");
  for (const t of ea.eaTemplates(opts)) ok(doc.includes(t.module.id) && page.includes(t.module.id), `${t.module.id} missing from the page or the handbook`);
  // Words: no partnership claim, no price, no stray figure, no unnamed project.
  const strip = (h) => unesc(h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ")).replace(ea.EA_NO_PARTNERSHIP, " ");
  for (const [name, text] of [["page", strip(page)], ["handbook", doc.replace(ea.EA_NO_PARTNERSHIP, " ")]]) {
    const claim = text.match(/\b(in partnership with|partnered with|our partners?|official(?:ly)? (?:training )?partner|endorsed by|accredited by|certified by (?:the )?(?:PMA|ILWU|IBEW|LIUNA|IUOE|Teamsters|WOJRC|Machinists)|delivers? (?:the )?(?:PMA|WOJRC|MI)(?:'s)? (?:program|curriculum))\b/i);
    ok(!claim, `${name}: partnership claim "${claim?.[0]}"`);
    const price = text.match(/\$\s?\d[\d.,]*(?![\d.,]| (?:million|billion))|\bper seat\b|\bprice[ds]?\b|\bUSD\b/i);
    ok(!price, `${name}: a price "${price?.[0]}"`);
    const money = [...text.matchAll(/\$[\d.,]+ (?:million|billion)/gi)].map((m) => m[0].toLowerCase());
    const allowed = new Set(["$82 million", "$322 million", ...bk.BK_PROJECTS.map((p) => p.amount)]);
    ok(money.every((m) => allowed.has(m)), `${name}: money figure outside the facts: ${money.filter((m) => !allowed.has(m)).join(", ")}`);
    const orgs = [...text.matchAll(/\b(City of [A-Z][a-z]+(?: [A-Z][a-z]+)?|County of [A-Z][a-z]+(?: [A-Z][a-z]+)?|[A-Z][A-Za-z]+ (?:Water|Sanitary|Flood|Resource Conservation) District)\b/g)].map((m) => m[1]);
    const named = new Set(bk.BK_PROJECTS.map((p) => p.recipient));
    const hit = orgs.filter((o) => ![...named].some((a) => a.startsWith(o)));
    ok(!hit.length, `${name}: names an organisation outside the eight: ${[...new Set(hit)].join(", ")}`);
  }
  ok(page.includes("twelve are not named"), "page does not note the twelve unnamed projects");
  line(`page: ${new Set(st).size} stations, ${new Set(us).size} unions, ${new Set(sims).size} simulations, ${new Set(cr).size} credentials — all resolve; ${pendingAll.length} pending ids shown unlinked; the hub links it`);
  if (fails === f7) line("words: no partnership claim, no price, only the facts' figures, the twelve unnamed projects never named");
});

console.log(`\ncheck_academy: ${fails ? `FAILED ${fails}` : "ok"} — ${checks} checks · 9 tracks · 45 pathways · 45 DEAN templates · ${ea.eaMatrix(opts).length} matrix links · ${pendingAll.length} UNIONSIMS ids pending (${Date.now() - T0} ms)`);
process.exit(fails ? 1 : 0);
