#!/usr/bin/env node
/**
 * check_bridge (console TQ-BRIDGE, docs/tradequest-bridge.md): the v2 shared export and the TradeQuest adapter.
 *
 *   1. the v2 document validates against the v2 schema; broken copies fail; the committed files are current
 *   2. v1 compatibility: every v1 field is present and identical to DEAN's v1 build, and v2 validates against the v1 schema
 *   3. every section's source resolves (ready/partial) or is marked pending with the sources it looked for
 *   4. the guard: owner modules appearing later fill their sections with no code change; a throwing module stays pending
 *   5. the maps section: every registered map, regions, sites with stations, landmarks with lm kinds, hills by name
 *   6. the adapter: shape, determinism, the station index, v1 input, refusal, dependency-free
 *   7. the size budget (raw and gzip) and no learner data
 *   8. the contract doc names every section and registry
 *   9. the robotics facets (TQ-ROBOTICS): programme, AGENTGYM, COLEARN, guarded governor and jobs; the key-shape and byte-cap
 *      refusals; VBRIDGE stand-ins fill the guarded facets; 2.0 and v1 documents still adapt; the three robotics registries
 *
 *     node tools/check_bridge.mjs
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
// The registry is the count: every map and region the parish engine lists (22 maps and six regions when v2 was written).
const { NP_PARISHES: BR_MAPS, NP_REGIONS: BR_REGIONS } = await import(new URL("../WebXR/shared/np-parishes.js", import.meta.url).href);

const T0 = Date.now();
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);
let checks = 0, fails = 0, secFails = 0;
const ok = (c, msg) => { checks++; if (!c) { fails++; secFails++; console.log(`  FAIL ${msg}`); } };
const section = async (n, title, fn) => { secFails = 0; try { await fn(); } catch (e) { ok(false, `threw: ${e?.stack?.split("\n").slice(0, 2).join(" ") ?? e}`); } console.log(`${secFails ? "FAIL" : "ok  "} ${n}. ${title}`); };

const ex = await imp("tools/export_shared.mjs");
const tq = await imp("tools/tq_bridge.mjs");
const ad = await imp("exports/shared/tradequest-adapter.js");
const v1 = await ex.dnBuildShared();
const doc = await ex.dnBuildSharedV2();
const S2 = ex.TQ_SHARED_SCHEMA_V2;
const validate = (d) => [...ex.dnValidateSchema(d, S2), ...tq.tqValidate(d, S2, ex.dnValidateSchema)];
const onDiskText = readFileSync(join(ROOT, "exports/shared/holodeck-shared.json"), "utf8");
const onDisk = JSON.parse(onDiskText);
const SECTIONS = ["maps", "palette", "facades", "vehicles", "robotics", "dataset"];
const summary = {};

await section(1, "the v2 document validates against its schema; the committed files are current", () => {
  const bad = validate(doc);
  ok(bad.length === 0, `v2 validates (${bad.slice(0, 3).join("; ")})`);
  ok(doc.version === tq.TQ_VERSION && /^2\./.test(doc.version), `version ${doc.version}`);
  const { maps, ...noMaps } = doc;
  ok(validate(noMaps).length > 0, "a copy without maps fails");
  ok(validate({ ...doc, palette: { ...doc.palette, status: "done" } }).length > 0, "a copy with an unknown status fails");
  ok(validate({ ...doc, robotics: { ...doc.robotics, status: "pending", data: { scenarios: [] } } }).length > 0, "a pending section that carries data fails");
  ok(validate({ ...doc, maps: { ...doc.maps, data: { ...doc.maps.data, maps: [{ id: "Bad Id" }] } } }).length > 0, "a broken map fails the maps $def");
  ok(doc.changelog[0].version === doc.version && doc.changelog.some((c) => c.version === "1.0.0"), "the changelog leads with this version and keeps v1");
  ok(JSON.stringify(onDisk) === JSON.stringify(doc), "exports/shared/holodeck-shared.json equals a fresh build (re-run tools/export_shared.mjs)");
  const schemaOnDisk = JSON.parse(readFileSync(join(ROOT, "exports/shared/holodeck-shared.schema.json"), "utf8"));
  ok(JSON.stringify(schemaOnDisk) === JSON.stringify(S2), "exports/shared/holodeck-shared.schema.json is the v2 schema");
});

await section(2, "v1 compatibility", () => {
  ok(ex.dnValidateSchema(doc, ex.DN_SHARED_SCHEMA).length === 0, "v2 validates against DEAN's v1 schema");
  for (const k of ex.DN_SHARED_SCHEMA.required) ok(k in doc, `v1 field ${k} is present`);
  const same = Object.keys(v1).filter((k) => !["version", "generatedBy"].includes(k)).filter((k) => JSON.stringify(v1[k]) === JSON.stringify(doc[k]));
  ok(same.length === Object.keys(v1).length - 2, `every v1 field but version/generatedBy is unchanged (${same.length}/${Object.keys(v1).length - 2})`);
  ok(S2.required.length > ex.DN_SHARED_SCHEMA.required.length && ex.DN_SHARED_SCHEMA.required.every((k) => S2.required.includes(k)), "the v2 schema requires everything v1 required");
  ok(Object.keys(ex.DN_SHARED_SCHEMA.properties).every((k) => JSON.stringify(S2.properties[k]) === JSON.stringify(ex.DN_SHARED_SCHEMA.properties[k])), "the v1 property schemas are unchanged in v2");
});

await section(3, "every section's source resolves or is marked pending", () => {
  for (const k of SECTIONS) {
    const s = doc[k];
    summary[k] = s.status;
    ok(tq.TQ_STATUSES.includes(s.status), `${k}: status ${s.status}`);
    ok(doc.sections[k]?.status === s.status, `${k}: sections.${k} agrees`);
    ok(Array.isArray(s.sources) && s.sources.length > 0, `${k}: lists the sources it looked for`);
    const found = s.sources.filter((r) => r.found?.length);
    if (s.status === "pending") ok(s.data === null && found.length === 0, `${k}: pending — none of ${s.sources.map((r) => r.file).join(" | ")} exports it yet`);
    else ok(found.length > 0 && found.every((r) => existsSync(join(ROOT, r.file))), `${k}: ${s.status} — resolved from ${found.map((r) => `${r.file}#${r.found.join(",")}`).join(" ")}`);
  }
  ok(doc.sections.packs.status === "ready" && doc.sections.paths.status === "ready", "packs and paths ready");
});

await section(4, "the guard: owners that merge later fill in with no code change", async () => {
  const SP = process.env.SP ?? "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad";
  const dir = join(SP, "packs/tq-bridge/fake-shared");
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "pa-palette.js"), `export const PA_CATEGORIES = { "creole-pastel": { region: "new-orleans", colours: ["#f4d6c6", "#cfe3d4"] } };\n`);
  writeFileSync(join(dir, "fc-facades.js"), `export const FC_SHARED = { detailKinds: ["cornice", "awning"], signs: ["Hardware", "Bakery"] };\n`);
  writeFileSync(join(dir, "mv-motorworks.js"), `export const MV_CLASSES = ["box-truck"]; export const MV_HANDLING = { "box-truck": { mass: 1, topSpeed: 1, turnRadius: 1, braking: 1 } };\n`);
  writeFileSync(join(dir, "rb-scenarios.js"), `export function rbScenarios() { return [{ id: "rb-pick-place", title: "Pick and place" }]; }\n`);
  writeFileSync(join(dir, "dx-dataworks.js"), `export const DX_SHARED = { episodeSchema: { id: "dx-episode-v1" }, datasetCard: { sections: ["motivation"] } };\n`);
  const later = await tq.tqExtend(v1, { shared: dir });
  // robotics is `partial` here: the scenarios are in, but the programme, AGENTGYM, COLEARN and VBRIDGE facets read files this scratch tree lacks (section 9 proves the full tree).
  ok(["palette", "facades", "vehicles", "dataset"].every((k) => later[k].status === "ready") && later.robotics.status === "partial", `with the owners' modules present: ${["palette", "facades", "vehicles", "robotics", "dataset"].map((k) => `${k} ${later[k].status}`).join(", ")}`);
  ok(later.maps.status === "pending" && later.maps.data === null, "a tree without np-parishes.js marks maps pending");
  ok(later.palette.data.categories["creole-pastel"] && later.facades.data.signs.length === 2 && later.robotics.data.scenarios[0].id === "rb-pick-place", "the owners' data is carried as-is");
  ok(validate(later).length === 0, `the filled document validates (${validate(later).slice(0, 2).join("; ")})`);
  const tqLater = ad.tqAdapt(later);
  ok(tqLater.registries.finishes.status === "ready" && tqLater.registries.kit.signs.length === 2 && tqLater.registries.scenarios.items.length === 1, "the adapter maps the filled sections");
  // A second tree (ES modules are cached by URL): a half-built ROBOTICS module that throws, and no FACADES module.
  const dir2 = `${dir}-2`;
  rmSync(dir2, { recursive: true, force: true }); mkdirSync(dir2, { recursive: true });
  writeFileSync(join(dir2, "rb-half-built.js"), `throw new Error("ROBOTICS half-built");\n`);
  const broken = await tq.tqExtend(v1, { shared: dir2 });
  rmSync(dir2, { recursive: true, force: true });
  ok(broken.robotics.status === "pending" && broken.robotics.sources.some((r) => r.error), "a module that throws on import is guarded: robotics pending with the error recorded");
  ok(broken.facades.status === "pending", "a missing module leaves facades pending");
  rmSync(dir, { recursive: true, force: true });
});

await section(5, "the maps section", () => {
  const m = doc.maps.data;
  ok(m.maps.length === BR_MAPS.length, `${m.maps.length} maps`);
  ok(m.maps.length === doc.parishes.length && m.maps.every((x, i) => x.id === doc.parishes[i].id), "the same maps, in the same order, as v1's parishes");
  const regions = new Set(m.regions.map((r) => r.id));
  ok(regions.size === BR_REGIONS.length && m.maps.every((x) => regions.has(x.region)), `${regions.size} regions: ${[...regions].join(", ")}`);
  ok(m.regions.every((r) => r.maps.every((id) => m.maps.find((x) => x.id === id)?.region === r.id)), "each region lists its own maps");
  const sites = m.maps.flatMap((x) => x.sites);
  ok(sites.length === doc.parishes.reduce((a, p) => a + p.sites.length, 0), `${sites.length} sites`);
  ok(sites.every((s) => s.name && s.kind && s.stations.length > 0), "every site has a name, a kind and stations");
  const catalog = new Set(JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8")).stations.map((s) => s.id));
  const inWorlds = new Set(Object.values(doc.worlds).flatMap((w) => w.station));
  const unknown = [...new Set(sites.flatMap((s) => s.stations))].filter((id) => !catalog.has(id) && !inWorlds.has(id));
  ok(unknown.length === 0, `every site station resolves to the catalogue or the lesson index (${unknown.slice(0, 4).join(", ")})`);
  const lms = m.maps.flatMap((x) => x.landmarks);
  const kinds = new Set(m.lmKinds ?? []);
  ok(lms.length > 0 && lms.filter((l) => l.lm).every((l) => !kinds.size || kinds.has(l.lm)), `${lms.length} landmarks, ${lms.filter((l) => l.lm).length} with an lm kind known to lm-landmarks.js (${kinds.size} kinds)`);
  const hills = m.maps.flatMap((x) => x.hills);
  ok(hills.length > 0 && hills.every((h) => Object.keys(h).join() === "id,name"), `${hills.length} hills, by id and name only (no figures)`);
});

await section(6, "the TradeQuest adapter", () => {
  const t = ad.tqAdapt(onDisk);
  ok(JSON.stringify(ad.tqAdapt(onDisk)) === JSON.stringify(t), "deterministic");
  ok(ad.TQ_REGISTRIES.every((k) => { const r = t.registries[k]; return r && typeof r.pack === "string" && typeof r.provenance === "string" && Array.isArray(r.items) && tq.TQ_STATUSES.includes(r.status); }), "every registry is { pack, provenance, status, items }");
  ok(ad.TQ_REGISTRIES.every((k) => (t.registries[k].status === "pending") === (t.registries[k].provenance === "PENDING")), "pending registries say PENDING");
  const map = { finishes: "palette", kit: "facades", fleet: "vehicles", scenarios: "robotics", dataset: "dataset", places: "maps" };
  ok(Object.entries(map).every(([r, s]) => t.registries[r].status === onDisk[s].status), "each registry's status is its section's");
  ok(JSON.stringify(t.pending) === JSON.stringify(ad.TQ_REGISTRIES.filter((k) => t.registries[k].status === "pending")), `pending: ${t.pending.join(", ") || "none"}`);
  ok(t.registries.places.items.length === BR_MAPS.length && t.registries.places.items.every((p) => p.frame && p.frame.centre.length === 2), `${BR_MAPS.length} places with their frames`);
  ok(t.registries.places.items.every((p) => p.campus === null || ["new-orleans", "treasure-island", "oakland"].includes(p.campus)), "campus routing uses the site's campus ids");
  const every = onDisk.maps.data.maps.flatMap((m) => m.sites.flatMap((s) => s.stations));
  ok(every.every((id) => t.stationIndex[id]?.length), `the station index covers every site station (${Object.keys(t.stationIndex).length} stations)`);
  ok(t.registries.courses.items.length === onDisk.packs.length && t.registries.paths.items.length === onDisk.paths.length, `${t.registries.courses.items.length} courses, ${t.registries.paths.items.length} paths`);
  ok(t.registries.fleet.items.every((v) => v.gatedOn.length > 0), `${t.registries.fleet.items.length} fleet vehicles, every one gated`);
  const fromV1 = ad.tqAdapt(v1);
  ok(fromV1.registries.places.items.length === BR_MAPS.length && fromV1.registries.places.status === "partial" && fromV1.pending.includes("fleet"), "a v1 document adapts: places from parishes, v2-only registries pending");
  let threw = false; try { ad.tqAdapt({ contract: "other", version: "2.0.0" }); } catch (_) { threw = true; }
  ok(threw && !ad.tqAccepts({ contract: ad.TQ_CONTRACT, version: "3.0.0" }).ok, "another contract or a future major is refused");
  const src = readFileSync(join(ROOT, "exports/shared/tradequest-adapter.js"), "utf8").replace(/\/\/.*$/gm, "");
  ok(!/^\s*import\s/m.test(src) && !/\brequire\(/.test(src), "dependency-free (no import, no require)");
  ok(!/\bfetch\(|XMLHttpRequest|WebSocket|document\.|window\.|Date\.now|Math\.random/.test(src), "no network, no DOM, no clock, no randomness");
});

await section(7, "the size budget and no learner data", () => {
  const bytes = Buffer.byteLength(onDiskText);
  const gz = gzipSync(onDiskText).length;
  summary.bytes = bytes; summary.gz = gz;
  ok(bytes <= tq.TQ_BUDGET_BYTES, `${(bytes / 1024).toFixed(1)} KiB of ${tq.TQ_BUDGET_BYTES / 1024} KiB (${Math.round((100 * bytes) / tq.TQ_BUDGET_BYTES)}%)`);
  ok(gz <= tq.TQ_BUDGET_GZIP_BYTES, `gzip ${(gz / 1024).toFixed(1)} KiB of ${tq.TQ_BUDGET_GZIP_BYTES / 1024} KiB`);
  ok(onDisk.budget.maxBytes === tq.TQ_BUDGET_BYTES, "the document states its budget");
  ok(!/"(learner|crewTag|email|classCode|sessionId)":/.test(onDiskText.replace(/"schemas":[\s\S]*?"worlds":/, "")), "no learner fields outside the schema descriptions");
});

await section(8, "the contract doc", () => {
  const f = join(ROOT, "docs/tradequest-bridge.md");
  ok(existsSync(f), "docs/tradequest-bridge.md exists");
  const md = existsSync(f) ? readFileSync(f, "utf8") : "";
  ok([...SECTIONS, "packs", "paths"].every((k) => md.includes(`\`${k}\``)), "names every section");
  ok(ad.TQ_REGISTRIES.every((k) => md.includes(`\`${k}\``)), "names every registry");
  ok(md.includes(String(tq.TQ_BUDGET_BYTES / 1024)) && md.includes("_SHARED"), "states the budget and the owner seam");
});

await section(9, "robotics facets (TQ-ROBOTICS): programme, AGENTGYM, COLEARN, guarded governor and jobs", async () => {
  const tqr = await imp("tools/tq_robotics.mjs");
  const { COMPETENCY_BY_ID } = await imp("WebXR/shared/competency.js");
  const rp = await imp("WebXR/shared/rp-programme-data.js");
  const rbd = await imp("WebXR/shared/rb-robotics-data.js");
  const rb = doc.robotics;
  const d = rb.data;
  const F = d.facets;
  const rbText = JSON.stringify(rb);
  const vbHere = readdirSync(join(ROOT, "WebXR/shared")).some((f) => /^vb-.*\.js$/.test(f));
  summary.facets = tqr.TQR_FACETS.filter((k) => F[k]?.status === "ready").length;
  summary.robBytes = Buffer.byteLength(rbText);

  // The facets and their status
  ok(tqr.TQR_FACETS.every((k) => F[k] && tq.TQ_STATUSES.includes(F[k].status)), `six facets named, each with a status: ${tqr.TQR_FACETS.map((k) => `${k} ${F[k]?.status}`).join(", ")}`);
  ok(["scenarios", "programme", "agentGym", "colearn"].every((k) => F[k].status === "ready" && (k === "scenarios" || d[k])), "scenarios, programme, agentGym and colearn are ready with data");
  ok(["programme", "agentGym", "colearn"].every((k) => existsSync(join(ROOT, F[k].source))), "each ready facet names a source file that exists");
  if (vbHere) ok(tqr.TQR_GUARDED.every((k) => F[k].status === "ready" && d[k]), "VBRIDGE's vb-*.js is in the tree: governor and jobs are ready (its VB_SHARED seam is wired)");
  else ok(tqr.TQR_GUARDED.every((k) => F[k].status === "pending" && d[k] === null && /VBRIDGE/.test(F[k].why)), "no vb-*.js in the tree: governor and jobs are pending with the reason, data null");
  ok(rb.status === (summary.facets === 6 ? "ready" : "partial"), `robotics is ${rb.status} while ${summary.facets} of 6 facets are ready`);
  ok(d.scenarios.length === rbd.RB_SCENARIOS.length && d.scenarios.every((s, i) => s.id === rbd.RB_SCENARIOS[i].id) && JSON.stringify(d.sites) === JSON.stringify(rbd.RB_SITES) && JSON.stringify(d.rules) === JSON.stringify(rbd.RB_RULES), `the 2.0 keys are unchanged: ${d.scenarios.length} scenarios, ${d.sites.length} sites, ${Object.keys(d.rules).length} rules`);

  // programme
  const P = d.programme;
  ok(P.tracks.length === rp.RP_TRACKS.length && P.levels.map((l) => l.id).join() === rp.RP_LEVELS.map((l) => l.id).join(), `${P.tracks.length} tracks, levels ${P.levels.map((l) => l.id).join(" → ")}`);
  ok(P.tracks.every((t) => t.ladder.length === rp.RP_LEVELS.length && t.ladder.every((r, i) => r.level === rp.RP_LEVELS[i].id)), "every track climbs the five levels in order");
  const catalog = new Set(JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8")).stations.map((s) => s.id));
  const pst = P.tracks.flatMap((t) => t.ladder.flatMap((r) => [...r.stations, ...r.capstone]));
  ok(pst.length > 0 && pst.every((id) => catalog.has(id)), `every programme station resolves to the catalogue (${new Set(pst).size} stations)`);
  ok(Object.keys(P.robotStations).length === Object.keys(rp.RP_ROBOT_STATIONS).length && Object.keys(P.robotStations).every((id) => catalog.has(id)), `${Object.keys(P.robotStations).length} robot stations, all in the catalogue`);
  const creds = new Set(P.tracks.flatMap((t) => t.ladder.map((r) => r.credential)).filter(Boolean));
  ok(creds.size > 0 && [...creds].every((id) => COMPETENCY_BY_ID[id] && P.credentials[id]), `${creds.size} credentials, each a competency on the competency layer`);
  ok(P.tracks.every((t) => t.ladder.every((r) => r.credential && r.earnable)), "every level ends in an earnable credential");
  ok(P.tracks.every((t) => d.scenarios.some((s) => s.id === t.scenario) || rp.RP_TRACKS.find((x) => x.id === t.id).scenario === t.scenario) && P.tracks.every((t) => t.rbSites.every((id) => d.sites.some((s) => s.id === id))), "every track's scenario and sites resolve in the gym data");
  ok(P.tracks.every((t) => ["rp-teleop-demonstration-collection", "rp-robot-policy-evaluation-review"].every((id) => t.ladder.find((r) => r.level === "ai-training").stations.includes(id))), "every AI-training level carries the two loop stations");
  ok(P.coverage.covered === P.coverage.of && P.coverage.of === P.tracks.length * P.levels.length, `programme coverage ${P.coverage.covered}/${P.coverage.of} (robot-station coverage of every track and level)`);
  ok(P.loop.length === 5 && P.loop.every((s) => s.live), "the learning loop is 5 of 5 live");
  ok(P.standards.length === rp.RP_STANDARDS.length && P.standards.every((s) => /^(ISO|ANSI|OSHA)/.test(s.label)) && /no partnership/i.test(P.note) && /opt-in/.test(P.consent) && /never K-12/.test(P.consent), "standards named only, the no-partnership line and the consent rule travel with it");

  // AGENTGYM
  const base = JSON.parse(readFileSync(join(ROOT, "docs/perf/agent-baselines.json"), "utf8"));
  const A = d.agentGym;
  ok(A.schema === base.schema && A.config.stations === base.config.stations && JSON.stringify(A.config.seeds) === JSON.stringify(base.config.seeds), `AGENTGYM config as in docs/perf/agent-baselines.json (${A.config.stations} stations, seeds ${A.config.seeds.join(",")})`);
  ok(Object.keys(base.summary).every((p) => A.summary[p]?.episodes === base.summary[p].episodes && Math.abs(A.summary[p].successRate - base.summary[p].successRate) < 0.001), `the four baselines' summary matches: ${Object.entries(A.summary).map(([p, s]) => `${p} ${s.successRate}`).join(", ")}`);
  const rs = A.robotStations;
  ok(rs.measured + rs.notYetBaselined.length === rs.of && rs.of === Object.keys(P.robotStations).length && Object.values(rs.passedOfEpisodes).every((r) => Object.values(r).every((x) => x.endsWith(`/${base.config.seeds.length}`))), `robot stations: ${rs.measured} measured of ${rs.of}; not yet baselined: ${rs.notYetBaselined.join(", ") || "none"}`);
  const sup = JSON.parse(readFileSync(join(ROOT, "docs/perf/agent-baselines-robotics.json"), "utf8"));
  // A robot station added to the programme after the supplement was made is listed (never hidden); the rates then cover the stations measured.
  const unbase = rs.notYetBaselined;
  const supRows = Object.keys(rs.passedOfEpisodes);
  const supRate = (pol) => { const n = supRows.reduce((a, id) => a + Number(sup.perStation[id]?.[pol]?.passed ?? base.perStation[id]?.[pol]?.passed ?? 0), 0); const of = supRows.reduce((a, id) => a + Number(sup.perStation[id]?.[pol]?.of ?? base.perStation[id]?.[pol]?.of ?? 0), 0); return of ? Math.round((1000 * n) / of) / 1000 : 0; };
  ok(rs.supplement === "docs/perf/agent-baselines-robotics.json" && Object.keys(base.summary).every((p) => Math.abs(supRate(p) - rs.rate[p]) < 0.002), `${rs.measured} of ${rs.of} robot stations baselined (the supplement is the same harness and seeds); on them: ${Object.entries(rs.rate).map(([p, v]) => `${p} ${v}`).join(", ")}`);
  if (unbase.length) console.log(`  note: ${unbase.length} robot station(s) not yet baselined (${unbase.join(", ")}): regenerate docs/perf/agent-baselines-robotics.json with node tools/ag_eval.mjs --seeds 3 --stations <the robot stations> --out docs/perf/agent-baselines-robotics.json`);
  ok(Object.keys(base.perStation).filter((id) => sup.perStation[id]).every((id) => JSON.stringify(base.perStation[id]) === JSON.stringify(sup.perStation[id])), "the supplement agrees with the full run on every station both hold (deterministic)");
  ok(/No language model/.test(A.note) && !("perStation" in A), "no language model is claimed, and the 271 KB per-station table is summarised, not copied");

  // COLEARN
  const col = JSON.parse(readFileSync(join(ROOT, "docs/evals/colearn.json"), "utf8"));
  const C = d.colearn;
  ok(C.version === col.version && C.policies.length === col.policies.length && C.policies.every((p, i) => p.scenario === col.policies[i].scenario && p.bc === col.policies[i].bcFiltered.success && p.expert === col.policies[i].expert.success && p.random === col.policies[i].random.success), `COLEARN: ${C.policies.length} policies as in docs/evals/colearn.json (${C.policies.map((p) => `${p.scenario.replace("rb-", "")} bc ${p.bc}`).join(", ")})`);
  ok(C.policies.every((p) => Math.abs(p.expert - p.bc - p.gapToExpert) < 0.002 && p.bc >= p.random) && /synthetic/.test(C.data), "behaviour cloning beats random, the gap to the expert is reported, demonstrations are labelled synthetic");

  // The safety rules at the export boundary
  ok(tqr.tqrRefuse(rbText) === null, "no key-, seed- or wallet-address-shaped string anywhere in robotics");
  ok(["0x" + "a1".repeat(20), "b".repeat(64), "-----BEGIN EC PRIVATE KEY-----", "seed phrase: apple pear", "mnemonic = a b c", "sk_live_abcdefgh1234"].every((s) => tqr.tqrRefuse(s)) && tqr.tqrRefuse("The governor refuses a stale policy and holds when the e-stop is down.") === null, "the key-shape refusal fires on addresses, keys, PEM, seed phrases and API keys, and passes plain rule text");
  // Allowed: the rule's own sentence ("makes no payments"), the gym's "yield-missed" rule (give way), the site id "south-of-market-…", and the programme's denial of a partnership with "investor".
  const money = rbText.replace(/makes no payments/g, "").replace(/yield-missed/g, "").replace(/of-market-/g, "").replace(/software platform, investor or union/g, "");
  ok(!/\$VIRTUAL|virtuals|\btoken|\byield\b|trading|\bmarket\b|\bprice|wallet|payment|investor/i.test(money), "no token, price, yield, market, trading, wallet or fund wording in the robotics section");
  ok(!/endorse|affiliat|official partner|backed by|in partnership with/i.test(rbText), "no affiliation wording");
  const adSrc = readFileSync(join(ROOT, "tools/tq_robotics.mjs"), "utf8");
  ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|https?:\/\/|\bimport\s*\{[^}]*\bas\b/.test(adSrc.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")), "tq_robotics.mjs makes no network call and uses no import alias");

  // Determinism and size
  ok(JSON.stringify((await ex.dnBuildSharedV2()).robotics) === JSON.stringify(rb), "the robotics section is deterministic (two builds identical)");
  ok(Object.entries(tqr.TQR_FACET_CAP).every(([k, cap]) => k === "scenarios" || !d[k] || JSON.stringify(d[k]).length <= cap), "every facet is inside its byte cap");
  ok(summary.robBytes <= 48 * 1024, `the robotics section is ${(summary.robBytes / 1024).toFixed(1)} KiB (cap 48)`);

  // The guard with VBRIDGE stand-ins: nothing in this checker is VBRIDGE's code, only the documented seam shapes.
  const SPD = process.env.SP ?? "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad";
  const tree = (name, files) => {
    const base = join(SPD, "loop5/tqr/rehearsal", name);
    rmSync(base, { recursive: true, force: true });
    const shared = join(base, "WebXR/shared");
    mkdirSync(shared, { recursive: true });
    for (const f of readdirSync(join(ROOT, "WebXR/shared"))) if (!/^vb-/.test(f)) symlinkSync(join(ROOT, "WebXR/shared", f), join(shared, f));
    for (const [f, t] of Object.entries(files)) writeFileSync(join(shared, f), t);
    return { shared, root: ROOT, base };
  };
  const rules = [{ id: "task-not-allowed", text: "The task type is not on the allowlist." }, { id: "unsafe-speed", text: "The speed is over the site limit." }, { id: "separation", text: "The command is inside the separation zone." }, { id: "stale-policy", text: "The policy was trained on revoked data." }, { id: "estop-held", text: "The e-stop is held." }, { id: "physical-target", text: "The target is a physical robot; this build ships that path disabled." }];
  const phases = ["request", "negotiation", "transaction", "evaluation", "completed", "rejected", "expired"];
  const t1 = tree("preferred", { "vb-standin.js": `export const VB_SHARED = ${JSON.stringify({ phases, roles: ["client", "provider", "evaluator"], governor: { rules, physicalRobots: "disabled" } })};\n` });
  const r1 = await tq.tqExtend(v1, t1);
  rmSync(t1.base, { recursive: true, force: true });
  const f1 = r1.robotics.data.facets;
  ok(tqr.TQR_FACETS.every((k) => f1[k].status === "ready") && r1.robotics.status === "ready", `with a VB_SHARED stand-in: all six facets ready, robotics ready (${tqr.TQR_FACETS.map((k) => f1[k].status).join(",")})`);
  ok(r1.robotics.data.governor.rules.length === rules.length && r1.robotics.data.jobs.phases.join() === phases.join() && r1.robotics.data.jobs.roles.length === 3, "the governor's rule list and the job phases and roles are carried as-is");
  ok(validate(r1).length === 0, `the filled document validates (${validate(r1).slice(0, 2).join("; ")})`);
  const a1 = ad.tqAdapt(r1);
  ok(a1.registries.scenarios.governor.rules.length === rules.length && a1.registries.scenarios.jobs.phases.length === phases.length && a1.registries.scenarios.status === "ready", "the adapter's scenarios registry carries the governor and the jobs once they exist");
  summary.robBytesFull = Buffer.byteLength(JSON.stringify(r1.robotics));
  const t2 = tree("named", { "vb-standin-named.js": `export const VB_PHASES = ${JSON.stringify(phases)};\nexport const VB_ROLES = ["client", "provider", "evaluator"];\nexport function vbGovernorRules() { return ${JSON.stringify(rules)}; }\n` });
  const r2 = await tq.tqExtend(v1, t2);
  rmSync(t2.base, { recursive: true, force: true });
  ok(r2.robotics.data.facets.governor.status === "ready" && r2.robotics.data.facets.jobs.status === "ready" && r2.robotics.data.jobs.roles.length === 3, "the named exports (VB_PHASES, VB_ROLES, vbGovernorRules) fill the same facets when VB_SHARED is absent");
  // The shape VBRIDGE's modules export today (named, frozen constants): reasons as { id, text }, phases in capitals, roles as an object, the physical switch.
  const t6 = tree("vb-named", { "vb-standin-shape.js": `export const VB_REASONS = ${JSON.stringify(rules)};\nexport const VB_PHASES = ${JSON.stringify(phases.map((p) => p.toUpperCase()))};\nexport const VB_ROLES = { client: "an external agent", provider: "a robot-site agent", evaluator: "the scoring" };\nexport const VB_PHYSICAL = { enabled: false, requires: "a named human approver" };\nexport const VB_TASKS = { "rb-cell-entry": { label: "Cell entry", rigs: ["cell"] } };\nexport const VB_MOVES = { REQUEST: ["NEGOTIATION"] };\n` });
  const r6 = await tq.tqExtend(v1, t6);
  rmSync(t6.base, { recursive: true, force: true });
  ok(r6.robotics.status === "ready" && r6.robotics.data.governor.rules.length === rules.length && r6.robotics.data.governor.physical.enabled === false && r6.robotics.data.governor.tasks["rb-cell-entry"] && r6.robotics.data.jobs.phases[0] === "REQUEST" && r6.robotics.data.jobs.roles.provider && r6.robotics.data.jobs.moves.REQUEST, "VBRIDGE's own export shape (VB_REASONS, VB_PHASES, VB_ROLES, VB_PHYSICAL, VB_TASKS, VB_MOVES) fills both facets with its detail");
  if (d.governor?.physical) ok(d.governor.physical.enabled === false, "the physical-robot path ships disabled in the exported governor");
  const t3 = tree("refused", { "vb-standin-bad.js": `export const VB_SHARED = { phases: ["request"], governor: { rules: [{ id: "x", text: "key 0x${"ab".repeat(20)}" }] } };\n` });
  const r3x = await tq.tqExtend(v1, t3);
  rmSync(t3.base, { recursive: true, force: true });
  ok(r3x.robotics.data.facets.governor.status === "pending" && /refused/.test(r3x.robotics.data.facets.governor.why) && r3x.robotics.data.governor === null && !/0xabab/.test(JSON.stringify(r3x)), "a rule list that holds a wallet-address-shaped string is refused: pending, with the reason, and the string never reaches the document");
  const t4 = tree("big", { "vb-standin-big.js": `export const VB_SHARED = { phases: ["request"], governor: { rules: ${JSON.stringify(Array.from({ length: 400 }, (_, i) => ({ id: `r${i}`, text: "x".repeat(60) })))} } };\n` });
  const r4 = await tq.tqExtend(v1, t4);
  rmSync(t4.base, { recursive: true, force: true });
  ok(r4.robotics.data.facets.governor.status === "pending" && /cap/.test(r4.robotics.data.facets.governor.why), "a facet over its byte cap is refused, pending with the reason (summarise, do not copy)");
  const t5 = tree("throws", { "vb-standin-half.js": `throw new Error("VBRIDGE half-built");\n` });
  const r5 = await tq.tqExtend(v1, t5);
  rmSync(t5.base, { recursive: true, force: true });
  ok(r5.robotics.data.facets.governor.status === "pending" && r5.robotics.sources.some((s) => /half-built/.test(s.error ?? "")) && r5.robotics.data.facets.programme.status === "ready", "a vb module that throws on import is guarded: governor pending with the error recorded, the other facets unaffected");

  // Readers: v2.0 and v1 documents still adapt
  const d20 = { ...onDisk, version: "2.0.0", robotics: { ...onDisk.robotics, status: "ready", data: { scenarios: onDisk.robotics.data.scenarios, api: onDisk.robotics.data.api, rules: onDisk.robotics.data.rules, sites: onDisk.robotics.data.sites } } };
  const a20 = ad.tqAdapt(d20);
  ok(a20.registries.scenarios.items.length === d.scenarios.length && a20.registries.pathways.status === "pending" && a20.registries.credentials.status === "pending" && a20.registries.launch.status === "pending" && a20.registries.places.items.length === BR_MAPS.length, "a 2.0 document (robotics without facets) adapts: scenarios and places as before, the three new registries pending");
  const a1v = ad.tqAdapt(v1);
  ok(["pathways", "credentials", "launch"].every((k) => a1v.registries[k].status === "pending" && a1v.registries[k].items.length === 0), "a v1 document adapts with the three robotics registries pending");

  // The adapter's three registries
  const t = ad.tqAdapt(onDisk);
  const R = t.registries;
  ok(R.pathways.status === "ready" && R.pathways.items.length === P.tracks.length && R.pathways.items.every((p) => p.levels.length === 5 && p.standards.length > 0 && p.levels.every((l) => l.credential && l.stations.length > 0)), `pathways: ${R.pathways.items.length} robotics pathways × 5 levels, each level with stations, a credential and standards named`);
  ok(R.credentials.items.length === creds.size && R.credentials.items.every((c) => c.earnedAt.length > 0 && COMPETENCY_BY_ID[c.id]), `credentials: ${R.credentials.items.length}, each earned at least one pathway level`);
  const st = R.launch.items.filter((x) => x.kind === "station"), si = R.launch.items.filter((x) => x.kind === "site");
  ok(new Set(pst).size <= st.length && st.every((x) => catalog.has(x.id) && x.launch === `smartcity-x.html?sim=${x.id}&from=tradequest`) && st.filter((x) => x.robot).length === Object.keys(P.robotStations).length, `launch: ${st.length} station links (${st.filter((x) => x.robot).length} robot stations), every one a catalogue id`);
  ok(si.length === d.sites.length && si.every((x) => /^parishes\.html\?parish=[a-z0-9-]+&site=[a-z0-9-]+&from=tradequest$/.test(x.launch) && onDisk.maps.data.maps.find((m) => m.id === x.place)?.sites.some((s) => x.launch.includes(`site=${s.id}&`))), `launch: ${si.length} robotics sites, each opening its map at the building its rig stands beside`);
  ok(st.every((x) => !/^[a-z]+:\/\//.test(x.launch)) && !/https?:\/\//.test(JSON.stringify(R.launch)), "launch links are relative to the Holodeck's deployed root: no host is named");
  ok(JSON.stringify(ad.tqAdapt(onDisk).registries.pathways) === JSON.stringify(R.pathways), "the new registries are deterministic");
});

console.log(`check_bridge: ${checks - fails}/${checks} checks, ${fails} failed · v${doc.version} · ${SECTIONS.map((k) => `${k} ${summary[k]}`).join(", ")} · robotics facets ${summary.facets}/6 (${(summary.robBytes / 1024).toFixed(1)} KiB; all six with VBRIDGE stand-ins ${(summary.robBytesFull / 1024).toFixed(1)} KiB) · ${(summary.bytes / 1024).toFixed(1)} KiB (gzip ${(summary.gz / 1024).toFixed(1)}) · ${Date.now() - T0} ms`);
process.exit(fails ? 1 : 0);
