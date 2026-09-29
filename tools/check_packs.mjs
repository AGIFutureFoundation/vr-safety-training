/**
 * The Holodeck Packs, gated (console PACKS, docs/consoles/PACKS.md).
 *
 *     node tools/check_packs.mjs
 *
 * - the manifests, the data module and both Packs pages are what tools/gen_packs.mjs writes now (up to date);
 * - every catalog station belongs to at least one pack;
 * - every pack's stations, programmes, worlds, sites and unions resolve (a site lists one of the pack's stations);
 * - K-12 and union packs are separate modules: a K-12 pack holds only K-12 stations and names no union package,
 *   a union pack holds no K-12 station, and no manifest is both;
 * - titles read "SmartCiti.X <name> — Powered by AGI Corp", every card and the footer carry the branding line,
 *   no logo file is referenced, every `path` is one of STORYLINE's path ids;
 * - the page links resolve in both layouts, and the homepage, the instructor console and the parishes menu link it;
 * - the registry (pk-packs.js) answers pkPacks / pkPack / pkPackOf / pkPacksAt consistently with the manifests;
 * - an exported pack (tools/export_pack.mjs) contains only its own content.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  PK_BRAND, PK_DIR, PK_KINDS, PK_PATHS, pkBuild, pkDataModule, pkPageHtml, pkTitle, pkWorldSites,
} from "./gen_packs.mjs";
import { pkExportPack } from "./export_pack.mjs";

const T0 = Date.now();
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const SP = process.env.PK_TMP ?? join(ROOT, "exports", "packs", ".check");
let checks = 0, failures = 0;
const fails = [];
function ok(cond, msg) { checks++; if (!cond) { failures++; if (fails.length < 40 && !fails.includes(msg)) fails.push(msg); } return !!cond; }
function section(name, fn) {
  const before = failures, c0 = checks;
  fn();
  console.log(`  ${failures === before ? "✓" : "✗"} ${name} (${checks - c0} checks${failures > before ? `, ${failures - before} failed` : ""})`);
}
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

const { packs: fresh, catalog, unions } = await pkBuild();
const { sites, parishes } = await pkWorldSites();
const index = readJson(join(PK_DIR, "index.json"));
const packs = index.packs.map((e) => readJson(join(PK_DIR, e.file)));
const byStation = new Map(catalog.stations.map((s) => [s.id, s]));
const progById = new Map(catalog.curricula.map((c) => [c.id, c]));
const unionIds = new Set(unions.map((u) => u.id));
const parishIds = new Set(parishes.map((p) => p.id));
const WORLDS = new Set(["bayworld", "underwater", "summit", "redwood", "parishes"]);
const isK12 = (id) => id.startsWith("k12-");
const stable = (v) => JSON.stringify(v, null, 2) + "\n";

console.log("check_packs: the SmartCiti.X Powered by AGI Corp Holodeck Packs");

section("up to date with tools/gen_packs.mjs (manifests, index, data module, both pages)", () => {
  ok(fresh.length === packs.length, `index.json lists ${packs.length} packs, the generator builds ${fresh.length}`);
  for (const p of fresh) {
    const f = join(PK_DIR, `${p.id}.json`);
    ok(existsSync(f) && readFileSync(f, "utf8") === stable(p), `WebXR/packs/${p.id}.json is stale — run node tools/gen_packs.mjs`);
  }
  const extra = readdirSync(PK_DIR).filter((f) => f.endsWith(".json") && f !== "index.json" && !fresh.some((p) => `${p.id}.json` === f));
  ok(!extra.length, `manifests with no pack: ${extra.join(", ")}`);
  ok(readFileSync(join(WEBXR, "shared", "pk-packs-data.js"), "utf8") === pkDataModule(fresh, catalog), "WebXR/shared/pk-packs-data.js is stale");
  ok(readFileSync(join(PK_DIR, "index.html"), "utf8") === pkPageHtml(fresh, catalog, unions, parishes, "source"), "WebXR/packs/index.html is stale");
  ok(readFileSync(join(PK_DIR, "flat", "index.html"), "utf8") === pkPageHtml(fresh, catalog, unions, parishes, "dist"), "WebXR/packs/flat/index.html is stale");
  const pub = join(WEBXR, "dist", "packs", "index.html");
  ok(!existsSync(pub) || readFileSync(pub, "utf8") === readFileSync(join(PK_DIR, "flat", "index.html"), "utf8"), "WebXR/dist/packs/index.html differs from WebXR/packs/flat/index.html — run python3 tools/bundle_webxr.py");
});

section("manifest shape, titles, branding, paths, versions", () => {
  const ids = new Set();
  for (const p of packs) {
    ok(!ids.has(p.id), `duplicate pack id ${p.id}`); ids.add(p.id);
    ok(PK_KINDS.includes(p.kind), `${p.id}: kind ${p.kind}`);
    ok(p.title === pkTitle(p.name) && p.title.startsWith("SmartCiti.X ") && p.title.endsWith(" — Powered by AGI Corp"), `${p.id}: title ${JSON.stringify(p.title)}`);
    ok(p.brand === PK_BRAND, `${p.id}: brand line`);
    ok(PK_PATHS.includes(p.path), `${p.id}: path ${p.path} is not a STORYLINE path id`);
    ok(Array.isArray(p.alsoPaths) && p.alsoPaths.every((x) => PK_PATHS.includes(x) && x !== p.path), `${p.id}: alsoPaths`);
    ok(/^\d+\.\d+\.\d+$/.test(p.version) && /^[0-9a-f]{8}$/.test(p.contentHash), `${p.id}: version / contentHash`);
    ok(typeof p.audience === "string" && p.audience.length > 0, `${p.id}: audience`);
    ok(p.stations.length > 0, `${p.id}: no stations`);
    ok(!/\.(png|svg|jpe?g|webp)\b/i.test(JSON.stringify(p)), `${p.id}: references an image file (no logo files)`);
  }
});

section("every catalog station belongs to at least one pack", () => {
  const held = new Set(packs.flatMap((p) => p.stations.map((s) => s.id)));
  for (const s of catalog.stations) ok(held.has(s.id), `station ${s.id} is in no pack`);
});

section("every pack's stations, programmes, worlds, sites and unions resolve", () => {
  for (const p of packs) {
    const ids = new Set(p.stations.map((s) => s.id));
    for (const s of p.stations) ok(byStation.get(s.id)?.app === s.app, `${p.id}: station ${s.app}:${s.id} does not resolve`);
    for (const pid of p.programmes) {
      const c = progById.get(pid);
      if (!ok(c, `${p.id}: programme ${pid} does not resolve`)) continue;
      ok(c.stations.every((s) => ids.has(s.id)), `${p.id}: programme ${pid} has stations outside the pack`);
    }
    for (const pid of p.relatedProgrammes ?? []) ok(progById.has(pid), `${p.id}: related programme ${pid}`);
    for (const u of p.unions) ok(unionIds.has(u), `${p.id}: union ${u} is not in tools/unions.json`);
    for (const w of p.worlds) {
      ok(WORLDS.has(w.world), `${p.id}: world ${w.world}`);
      if (w.world === "parishes") ok(parishIds.has(w.parish), `${p.id}: parish ${w.parish}`);
      for (const sid of w.sites) {
        const site = sites.find((x) => x.world === w.world && (x.parish ?? undefined) === (w.parish ?? undefined) && x.id === sid);
        ok(site && site.stations.some((id) => ids.has(id)), `${p.id}: site ${w.world}/${w.parish ?? ""}/${sid} does not host one of its stations`);
      }
    }
    if (p.kind === "programme" || p.kind === "k12") ok(progById.has(p.id) && p.programmes.length === 1 && p.programmes[0] === p.id, `${p.id}: a programme pack is its own programme`);
  }
  const progPacks = new Set(packs.filter((p) => p.kind === "programme" || p.kind === "k12").map((p) => p.id));
  for (const c of catalog.curricula) ok(progPacks.has(c.id), `programme ${c.id} has no pack`);
});

section("K-12 and union packs are separate modules", () => {
  for (const p of packs) {
    const k = p.stations.filter((s) => isK12(s.id)).length;
    if (p.kind === "k12") {
      ok(k === p.stations.length, `${p.id}: a K-12 pack holds a non-K-12 station`);
      ok(p.unions.length === 0 && p.path === "k12" && p.k12Bands.length > 0, `${p.id}: a K-12 pack names a union or lacks its band`);
    } else {
      ok(k === 0, `${p.id} (${p.kind}): holds ${k} K-12 station(s)`);
      ok(p.k12Bands.length === 0, `${p.id}: K-12 bands on a ${p.kind} pack`);
    }
    if (p.kind === "union") ok(p.unions.length === 1 && p.id === `union-${p.unions[0]}`, `${p.id}: a union pack is one union`);
  }
  const k12 = new Set(packs.filter((p) => p.kind === "k12").map((p) => p.id));
  const uni = new Set(packs.filter((p) => p.kind === "union").map((p) => p.id));
  ok([...k12].every((id) => !uni.has(id)) && k12.size > 0 && uni.size > 0, "a manifest is both K-12 and union, or a kind is empty");
});

// ------------------------------------------------------------------ the page
function hrefs(html) { return [...html.matchAll(/\bhref="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&")); }
const distTracks = new Set(existsSync(join(WEBXR, "home", "tracks")) ? readdirSync(join(WEBXR, "home", "tracks")).filter((f) => f.endsWith(".html")) : []);
const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
const distPages = new Set([...bundler.slice(bundler.indexOf("DIST_PAGES = {"), bundler.indexOf("}", bundler.indexOf("DIST_PAGES = {"))).matchAll(/"([\w-]+\.html)"/g)].map((m) => m[1]));
function queryResolves(u, where) {
  const q = new URLSearchParams(u.split("?")[1] ?? "");
  if (q.has("sim")) ok(byStation.get(q.get("sim"))?.app === "smartcity", `${where}: ?sim=${q.get("sim")}`);
  if (q.has("room")) ok(byStation.get(q.get("room"))?.app === "trades", `${where}: ?room=${q.get("room")}`);
  if (q.has("parish")) ok(parishIds.has(q.get("parish")), `${where}: ?parish=${q.get("parish")}`);
}
let linkCount = 0;
section("page links resolve (source layout WebXR/packs/, flat layout WebXR/dist/packs/)", () => {
  const src = readFileSync(join(PK_DIR, "index.html"), "utf8");
  for (const u of hrefs(src)) {
    if (u.startsWith("#")) continue;
    linkCount++;
    const file = normalize(join(PK_DIR, u.split("?")[0]));
    ok(file.startsWith(WEBXR) && existsSync(file), `source page: ${u} does not resolve`);
    queryResolves(u, "source page");
  }
  const dist = readFileSync(join(PK_DIR, "flat", "index.html"), "utf8");
  for (const u of hrefs(dist)) {
    if (u.startsWith("#")) continue;
    linkCount++;
    const path = u.split("?")[0];
    let good = false;
    if (path.startsWith("./")) good = existsSync(join(PK_DIR, path.slice(2))) && path.endsWith(".json");
    else if (path.startsWith("../tracks/")) good = distTracks.has(path.slice("../tracks/".length));
    else if (path === "../index.html") good = existsSync(join(WEBXR, "home.html"));
    else if (path === "../shared/design.css") good = existsSync(join(WEBXR, "shared", "design.css")) && bundler.includes("DESIGN_CSS");
    else if (path.startsWith("../")) good = distPages.has(path.slice(3));
    ok(good, `flat page: ${u} does not resolve in WebXR/dist/`);
    queryResolves(u, "flat page");
  }
  for (const [name, html] of [["source", src], ["flat", dist]]) {
    const cards = (html.match(/<article class="at-card pk-card"/g) ?? []).length;
    ok(cards === packs.length, `${name} page: ${cards} cards for ${packs.length} packs`);
    ok((html.match(/<p class="pk-brand">SmartCiti\.X · Powered by AGI Corp<\/p>/g) ?? []).length === packs.length, `${name} page: a card lacks the branding line`);
    ok(/<footer class="at-footer">\s*<p>SmartCiti\.X · Powered by AGI Corp/.test(html), `${name} page: the footer lacks the branding line`);
    ok(!/<img\b|\.png"|\.svg"/i.test(html), `${name} page: an image or logo file is referenced`);
    ok(html.includes('class="at-root at-scheme--dark"') && html.includes("shared/design.css"), `${name} page: not on the design system`);
    for (const f of ["pk-path", "pk-audience", "pk-union", "pk-kind"]) ok(html.includes(`id="${f}"`), `${name} page: filter ${f} missing`);
  }
});

section("linked from the homepage, the instructor console and the parishes menu; bundled", () => {
  for (const f of ["index.html", "home.html"]) ok(readFileSync(join(WEBXR, f), "utf8").includes('href="packs/index.html"'), `WebXR/${f} does not link packs/index.html (run node tools/gen_home.mjs)`);
  ok(readFileSync(join(WEBXR, "instructor", "index.html"), "utf8").includes('href="../packs/index.html"'), "the instructor console does not link ../packs/index.html");
  ok(readFileSync(join(WEBXR, "parishes", "parishes.html"), "utf8").includes('href="../packs/index.html"') && readFileSync(join(WEBXR, "parishes", "parishes.html"), "utf8").includes('id="menu-packs"'), "the parishes menu lacks the Packs link or #menu-packs");
  const app = readFileSync(join(WEBXR, "parishes", "js", "app.js"), "utf8");
  ok(app.includes('from "../../shared/pk-packs.js"') && app.includes('npMountPacks($("menu-packs"), parish.id)'), "the parishes app does not mount the packs");
  ok(bundler.includes('SHARED / "pk-packs-data.js"') && bundler.includes('SHARED / "pk-packs.js"') && bundler.includes('(DIST / "packs" / "index.html")'), "the bundler does not carry the registry or copy the Packs page");
  ok(bundler.includes('"packs"]') && bundler.includes("{q}./packs/"), "the bundler does not rewrite ../packs/ links for dist");
});

const reg = await import(pathToFileURL(join(WEBXR, "shared", "pk-packs.js")).href);
{
  const before = failures, c0 = checks;
  ok(reg.pkPacks().length === packs.length, `pkPacks() ${reg.pkPacks().length} vs ${packs.length}`);
  for (const p of packs) {
    const r = reg.pkPack(p.id);
    if (!ok(r, `pkPack(${p.id}) is null`)) continue;
    ok(r.title === p.title && r.path === p.path && r.kind === p.kind && JSON.stringify(r.stations) === JSON.stringify(p.stations) && JSON.stringify(r.programmes) === JSON.stringify(p.programmes), `pkPack(${p.id}) differs from its manifest`);
  }
  for (const s of catalog.stations) ok(reg.pkPackOf(s.id).length > 0, `pkPackOf(${s.id}) is empty`);
  ok(reg.pkPack("nope") === null && reg.pkPackOf("nope").length === 0, "unknown ids answer null / []");
  for (const w of packs.flatMap((p) => p.worlds.map((x) => (x.parish ? `parishes:${x.parish}` : x.world)))) ok(reg.pkPacksAt(w).length > 0, `pkPacksAt(${w}) empty`);
  console.log(`  ${failures === before ? "✓" : "✗"} registry pk-packs.js answers like the manifests (${checks - c0} checks)`);
}

section("an exported pack contains only its own content (tools/export_pack.mjs)", () => {
  const pick = ["electrical-first-period", "k12-science", "union-iaff", "library-trade-skills-simulator"].filter((id) => packs.some((p) => p.id === id));
  ok(pick.length === 4, `export samples missing: ${pick.join(", ")}`);
  for (const id of pick) {
    const p = packs.find((x) => x.id === id);
    const out = join(SP, id);
    const r = pkExportPack(id, out);
    const own = new Set(p.stations.map((s) => s.id));
    const st = readdirSync(join(out, "unity", "SmartCitiX", "Content", "stations")).map((f) => f.replace(/\.json$/, "").replace(/^trades--/, ""));
    ok(st.length === own.size && st.every((x) => own.has(x)), `${id}: Unity stations ${st.length} vs pack ${own.size}`);
    const pr = existsSync(join(out, "unity", "SmartCitiX", "Content", "programmes")) ? readdirSync(join(out, "unity", "SmartCitiX", "Content", "programmes")).map((f) => f.replace(/\.json$/, "")) : [];
    ok(pr.length === p.programmes.length && pr.every((x) => p.programmes.includes(x)), `${id}: Unity programmes ${pr.join(",")}`);
    for (const x of pr) ok(readJson(join(out, "unity", "SmartCitiX", "Content", "programmes", `${x}.json`)).stations?.every?.((s) => own.has(s.id ?? s)) ?? true, `${id}: exported programme ${x} names a station outside the pack`);
    const wd = existsSync(join(out, "unity", "SmartCitiX", "Content", "worlds")) ? readdirSync(join(out, "unity", "SmartCitiX", "Content", "worlds")).map((f) => f.replace(/\.json$/, "")) : [];
    ok(wd.every((w) => p.worlds.some((x) => x.world === w)), `${id}: Unity worlds ${wd.join(",")} beyond the pack's`);
    const ix = readJson(join(out, "unity", "SmartCitiX", "Content", "index.json"));
    ok(ix.stations.length === own.size && ix.pack?.id === id, `${id}: Unity index not cut to the pack`);
    const cat = readJson(join(out, "web", "catalog.json"));
    ok(cat.stations.length === own.size && cat.stations.every((s) => own.has(s.id)), `${id}: web catalog stations`);
    ok(cat.curricula.every((c) => p.programmes.includes(c.id)) && cat.categories.every((c) => c.stations.every((s) => own.has(s))), `${id}: web catalog programmes/categories beyond the pack`);
    const page = readFileSync(join(out, "web", "index.html"), "utf8");
    ok((page.match(/<article class="at-card pk-card"/g) ?? []).length === 1 && page.includes(`id="pack-${id}"`), `${id}: the web page is not the pack's own card`);
    ok(readJson(join(out, "pack.json")).id === id && r.stations === own.size, `${id}: pack.json`);
  }
  rmSync(SP, { recursive: true, force: true });
});

const counts = Object.fromEntries(PK_KINDS.map((k) => [k, packs.filter((p) => p.kind === k).length]));
const pathCounts = PK_PATHS.map((x) => `${x} ${reg.pkPacks({ path: x }).length}`).join(", ");
console.log(`  packs: ${packs.length} (${PK_KINDS.map((k) => `${counts[k]} ${k}`).join(", ")}); stations covered ${catalog.stations.length}/${catalog.stations.length}; by path: ${pathCounts}; page links ${linkCount}`);
for (const f of fails) console.log(`    ✗ ${f}`);
console.log(failures
  ? `\ncheck_packs: ${failures} of ${checks} checks failed (${Date.now() - T0} ms).`
  : `\ncheck_packs: all ${checks} checks pass — ${packs.length} packs, ${catalog.stations.length} stations each in a pack, 4 exports clean (${Date.now() - T0} ms).`);
process.exit(failures ? 1 : 0);
