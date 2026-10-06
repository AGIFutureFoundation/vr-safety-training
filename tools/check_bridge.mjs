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
 *
 *     node tools/check_bridge.mjs
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

console.log(`check_bridge: ${checks - fails}/${checks} checks, ${fails} failed · v${doc.version} · ${SECTIONS.map((k) => `${k} ${summary[k]}`).join(", ")} · ${(summary.bytes / 1024).toFixed(1)} KiB (gzip ${(summary.gz / 1024).toFixed(1)}) · ${Date.now() - T0} ms`);
process.exit(fails ? 1 : 0);
