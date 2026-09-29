#!/usr/bin/env node
/**
 * DEAN's checker (console DEAN, docs/modules.md): versions, modules and the shared export.
 *
 *   1. a module round-trips through export/import exactly (a single module and the bundle)
 *   2. every lesson id in a module resolves (station, field lesson, parish lesson across worlds); a bad id is refused
 *   3. applying a version hides exactly what it should (worlds, packs, stations only in hidden packs) and the
 *      enterprise block always wins
 *   4. a locked version blocks a path switch (and unlocking allows it)
 *   5. the world apply step: assigned lessons glow on the right parish boards, only for a joined class
 *   6. progress per learner: org.js's consented snapshots and SCHOLAR's sessions (registered), non-sharing rows empty
 *   7. the shared export validates against its schema (and a broken copy does not); provenance lists the street fabric
 *   8. no network and no markup from strings in DEAN's modules and the console tab; the parishes app mounts it
 *
 *     node tools/check_dean.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const T0 = Date.now();
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const mk = (m) => ({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; } });
globalThis.localStorage = mk(new Map());
globalThis.sessionStorage = mk(new Map());
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);

const dn = await imp("WebXR/shared/dn-modules.js");
const { dnLessonIndex, dnFrames } = await imp("WebXR/shared/dn-index.js");
const org = await imp("WebXR/shared/org.js");
const { dnBuildShared, dnValidateSchema } = await imp("tools/export_shared.mjs");

let fails = 0, checks = 0;
const ok = (cond, what) => { checks++; if (!cond) { fails++; console.log(`  FAIL ${what}`); } return !!cond; };
const section = (n, title, fn) => { const f0 = fails; fn(); console.log(`${fails === f0 ? "ok  " : "FAIL"} ${n}. ${title}`); };

const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
const index = dnLessonIndex({ catalogIds: catalog.stations.map((s) => s.id) });
const by = index.byWorld();
const pick = (world, kind) => index.lessons.find((l) => l.world === world && l.kind === kind);

// A module from three worlds: a parish board station, a Bay World field lesson, a BAYOU parish lesson, a catalogue station.
const lessonsIn = [pick("parishes", "station"), pick("bayworld", "field"), pick("parishes", "parish-lesson"), pick("smartcity", "station")].map((l) => ({ kind: l.kind, id: l.id, world: l.world }));
let mod;

section(1, "a module round-trips through export/import", () => {
  dn.dnClear();
  mod = dn.dnSaveModule({ title: "Week one — the levee and the quay", lessons: lessonsIn, due: "2026-10-15", requiredScore: 75 });
  const text = dn.dnExport(mod.id);
  dn.dnClear();
  const r = dn.dnImport(text, index);
  ok(r.ok && r.modules === 1, `import of one module (${r.errors.join("; ")})`);
  ok(JSON.stringify(dn.dnModule(mod.id)) === JSON.stringify(mod), "the imported module equals the exported one exactly");
  const v = dn.dnSaveVersion({ name: "Class A", scope: { kind: "class", id: "ABCD-EFGH" }, worlds: ["parishes", "bayworld"] });
  const bundle = dn.dnExport();
  dn.dnClear();
  const r2 = dn.dnImport(bundle, index);
  ok(r2.ok && r2.modules === 1 && r2.versions === 1, "the bundle carries one module and one version");
  ok(JSON.stringify(dn.dnVersions()[0]) === JSON.stringify(v) && JSON.stringify(dn.dnModules()[0]) === JSON.stringify(mod), "the bundle round trip is exact");
  ok(!dn.dnImport("{not json", index).ok, "a file that is not JSON is refused");
});

section(2, "every lesson id in a module resolves", () => {
  ok(index.lessons.length > 700, `the index holds ${index.lessons.length} lessons across ${Object.keys(by).length} worlds`);
  for (const l of mod.lessons) ok(index.resolve(l), `${l.kind}:${l.id} resolves`);
  ok(new Set(mod.lessons.map((l) => l.world)).size >= 3, "the module spans three worlds");
  const bad = { ...mod, id: "mod-bad-1", lessons: [...mod.lessons, { kind: "station", id: "no-such-station", world: null }] };
  const r = dn.dnImport(JSON.stringify(bad), index);
  ok(!r.ok && r.errors.some((e) => e.includes("no-such-station")), "a module naming an unknown station is refused with the id");
  ok(dn.dnValidateDoc({ ...mod, lessons: [{ kind: "video", id: "x" }] }).length > 0, "an unknown lesson kind is refused");
  for (const p of dnFrames()) for (const s of p.sites) for (const id of s.stations) ok(index.resolve({ kind: "station", id }), `${p.id}/${s.id}: ${id}`);
});

section(3, "applying a version hides exactly what it should", () => {
  dn.dnClear(); dn.dnSetEnterprise(null);
  const packs = dn.dnPacks();
  const off = packs[0].id;
  const v = dn.dnSaveVersion({ name: "Two worlds", scope: { kind: "class", id: "WXYZ-2345" }, worlds: ["parishes", "bayworld"], packs: packs.map((p) => p.id).filter((id) => id !== off) });
  const eff = dn.dnVersion({ classCodes: ["WXYZ-2345"] });
  ok(eff.id === v.id, "the class's version is the effective one for that class code");
  const h = dn.dnHidden(eff);
  ok(h.worlds.size === dn.DN_WORLDS.length - 2 && !h.worlds.has("parishes") && !h.worlds.has("bayworld"), `worlds hidden: ${h.worlds.size} of ${dn.DN_WORLDS.length}`);
  ok(h.packs.size === 1 && h.packs.has(off), `packs hidden: exactly ${off}`);
  const others = new Set(packs.filter((p) => p.id !== off).flatMap((p) => p.stations));
  const expect = packs[0].stations.filter((s) => !others.has(s));
  ok(h.stations.size === expect.length && expect.every((s) => h.stations.has(s)), `stations hidden: the ${expect.length} only ${off} carries, none another pack teaches`);
  ok(dn.dnHidden(dn.dnVersion({ classCodes: ["NONE-NONE"] })).worlds.size === 0, "a class with no version sees every world");
  dn.dnSetEnterprise({ worlds: ["parishes"], programmes: null });
  const e2 = dn.dnVersion({ classCodes: ["WXYZ-2345"] });
  ok(JSON.stringify(e2.worlds) === JSON.stringify(["parishes"]), "the enterprise block is the stricter side (bayworld stays off)");
  ok(!dn.dnWorldOn("bayworld", dn.dnVersion({ classCodes: [] })), "a class-less device still honours the enterprise block");
  dn.dnSetEnterprise(null);
});

section(4, "a locked version blocks a path switch", () => {
  const v = dn.dnVersions()[0];
  ok(dn.dnCanSwitchPath("k12", dn.dnVersion({ classCodes: ["WXYZ-2345"] })), "unlocked: a learner may switch to k12");
  dn.dnLockVersion(v.id, true, "union-trades");
  const locked = dn.dnVersion({ classCodes: ["WXYZ-2345"] });
  ok(locked.locked && !dn.dnCanSwitchPath("k12", locked) && !dn.dnCanSwitchPath("roam", locked), "locked to union-trades: k12 and roam are blocked");
  ok(dn.dnCanSwitchPath("union-trades", locked), "locked: the locked path stays open");
  dn.dnLockVersion(v.id, false);
  ok(dn.dnCanSwitchPath("k12", dn.dnVersion({ classCodes: ["WXYZ-2345"] })), "unlocking allows the switch again");
  ok(!dn.dnCanSwitchPath("not-a-path"), "an unknown path id is never allowed");
});

let sample;
section(5, "the world apply step glows the assigned lessons", () => {
  dn.dnClear(); org.enClear();
  sample = org.enLoadSample();
  const cohort = org.enCohorts()[0];
  const m = dn.dnSaveModule({ title: "Parish week", lessons: lessonsIn });
  const sites = dnFrames().find((p) => p.id === index.resolve(lessonsIn[0]).parish).sites;
  const none = dn.dnApplyModule("parishes", { sites, classCodes: [cohort.code] });
  ok(none.modules.length === 0 && none.glow.sites.size === 0, "an unassigned module glows nothing");
  dn.dnAssign(m.id, cohort.code);
  const a = dn.dnApplyModule("parishes", { sites, classCodes: [cohort.code] });
  const expectSites = sites.filter((s) => s.stations.includes(lessonsIn[0].id)).map((s) => s.id);
  ok(a.modules.length === 1 && a.glow.stations.has(lessonsIn[0].id), "the assigned station glows");
  ok(a.glow.sites.size === expectSites.length && expectSites.every((s) => a.glow.sites.has(s)), `the boards that glow: ${[...a.glow.sites].join(", ")}`);
  ok(a.glow.lessons.has(lessonsIn[2].id) && !a.glow.lessons.has(lessonsIn[1].id), "the parish lesson glows here; the Bay World field lesson does not");
  ok(dn.dnApplyModule("parishes", { sites, classCodes: ["ZZZZ-ZZZZ"] }).modules.length === 0, "another class sees nothing assigned");
});

section(6, "progress per learner (org snapshots + SCHOLAR sessions)", () => {
  const cohort = org.enCohorts()[0];
  const m = dn.dnSaveModule({ title: "Ladder", lessons: [...org.enCohortProgress(cohort.id).programme.stations.slice(0, 3).map((id) => ({ kind: "station", id, world: "smartcity" })), { kind: lessonsIn[1].kind, id: lessonsIn[1].id, world: lessonsIn[1].world }], requiredScore: 50 });
  dn.dnUseSessions(() => [{ lessonId: lessonsIn[1].id, learner: "A. Learner", classCode: cohort.code, stars: 3, at: "2026-09-29" }]);
  const p = dn.dnProgress(m.id, cohort.code);
  ok(p && p.rows.length === 4, `a row per learner of the sample cohort (${p?.rows.length})`);
  const quiet = p.rows.find((r) => !r.shared);
  ok(quiet && quiet.cells.slice(0, 3).every((c) => c === null), "a learner who does not share shows no station cells");
  const done = p.rows.find((r) => r.cells[3]?.done);
  ok(done && done.cells[3].score === 100, "SCHOLAR's session fills the field-lesson cell (3 stars = 100)");
  ok(p.rows.some((r) => r.cells.slice(0, 3).some((c) => c?.done)), "a sharing learner's passed station shows done");
  dn.dnUseSessions(() => { throw new Error("SCHOLAR not ready"); });
  ok(dn.dnProgress(m.id, cohort.code).rows.length === 4, "a throwing sessions hook is guarded");
  dn.dnUseSessions(null);
});

const shared = await dnBuildShared();
{
  const bad = dnValidateSchema(shared);
  ok(bad.length === 0, `holodeck-shared validates (${bad.slice(0, 3).join("; ")})`);
  ok(dnValidateSchema({ ...shared, parishes: [{ id: "Bad Id" }] }).length > 0, "a broken copy fails the schema");
  ok(shared.parishes.length === dnFrames().length && shared.parishes.every((p) => p.centre.length === 2), `${shared.parishes.length} parishes/districts with a lat/lng frame`);
  ok(shared.provenance.some((p) => /street fabric/.test(p.what) && /AUTHORED/.test(p.provenance) && p.files.length === 5), "provenance lists the Trade Craft Academy street fabric (five parishes)");
  ok(JSON.stringify(shared.paths) === JSON.stringify(dn.DN_PATHS), "the seven STORYLINE paths");
  const onDisk = JSON.parse(readFileSync(join(ROOT, "exports/shared/holodeck-shared.json"), "utf8"));
  ok(onDisk.version === shared.version && onDisk.parishes.length === shared.parishes.length && dnValidateSchema(onDisk).length === 0, "the committed file is current and valid (re-run tools/export_shared.mjs)");
  console.log(`${fails ? "FAIL" : "ok  "} 7. the shared export validates against its schema (${shared.packs.length} packs from ${shared.packsSource}, ${Object.keys(shared.worlds).length} worlds)`);
}

section(8, "no network, no markup from strings, mounted", () => {
  for (const f of ["WebXR/shared/dn-modules.js", "WebXR/shared/dn-index.js", "WebXR/instructor/js/dean.js"]) {
    const src = readFileSync(join(ROOT, f), "utf8").replace(/\/\/.*$/gm, "");
    ok(!/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon/.test(src), `${f}: no network call`);
    ok(!/innerHTML|insertAdjacentHTML|outerHTML/.test(src), `${f}: no markup from a string`);
  }
  const app = readFileSync(join(ROOT, "WebXR/parishes/js/app.js"), "utf8");
  ok(/dnApplyModule\(/.test(app), "the parishes app applies the module at load");
  const con = readFileSync(join(ROOT, "WebXR/instructor/index.html"), "utf8");
  ok(/id="tab-dean"/.test(con) && /id="dn-root"/.test(con), "the instructor console has the Versions & modules tab");
  const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
  ok((bundler.match(/"dn-modules\.js"/g) ?? []).length >= 2, "the bundler carries dn-modules.js into the console and the parishes app");
});

console.log(`check_dean: ${checks - fails}/${checks} checks, ${fails} failed · ${Date.now() - T0} ms`);
process.exit(fails ? 1 : 0);
