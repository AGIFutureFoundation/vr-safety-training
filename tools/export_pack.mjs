/**
 * One Holodeck Pack alone (console PACKS, docs/consoles/PACKS.md).
 *
 *     node tools/export_pack.mjs <pack-id>              → exports/packs/<pack-id>/
 *     node tools/export_pack.mjs <pack-id> --out DIR    → DIR/
 *     node tools/export_pack.mjs --list                 the pack ids
 *
 * Writes the pack's own content and nothing else:
 *
 *   pack.json                          the manifest (WebXR/packs/<id>.json)
 *   unity/SmartCitiX/                  the Unity slice, cut from the committed Unity export (tools/export_unity.mjs):
 *     Content/index.json               the index filtered to this pack's stations, programmes and worlds
 *     Content/stations/<id>.json       only this pack's stations
 *     Content/programmes/<id>.json     only this pack's programmes
 *     Content/worlds/<id>.json         only the Unity-exported worlds this pack plays in
 *     Runtime/, package.json           the runtime as exported, the package named for the pack
 *   web/catalog.json                   the catalog cut to this pack's stations, programmes and categories — what the
 *                                      bundled apps read — with the pack id recorded
 *   web/index.html                     the pack's own card page (the Packs page cut to this pack)
 *
 * Deterministic: keys as exported, no timestamps. tools/check_packs.mjs exports three packs and proves each holds
 * only its own content.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const UNITY = join(ROOT, "exports", "unity", "SmartCitiX");
const PACKS = join(WEBXR, "packs");

const stable = (v) => JSON.stringify(v, null, 2) + "\n";
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

/** Export one pack to `out`. Returns { stations, programmes, worlds, files }. */
export function pkExportPack(id, out = join(ROOT, "exports", "packs", id)) {
  if (!/^[a-z0-9][a-z0-9-]{0,80}$/.test(String(id))) throw new Error(`not a pack id: ${JSON.stringify(id)}`);
  const file = join(PACKS, `${id}.json`);
  if (!existsSync(file)) throw new Error(`no pack ${id} (run node tools/gen_packs.mjs; --list shows the ids)`);
  const pack = readJson(file);
  if (existsSync(out)) rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  let files = 0;
  const write = (rel, text) => { const p = join(out, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); files++; };
  write("pack.json", stable(pack));

  const stationIds = new Set(pack.stations.map((s) => s.id));
  const programmeIds = new Set(pack.programmes);
  const worldIds = new Set(pack.worlds.map((w) => w.world));

  // Unity slice.
  const u = join(out, "unity", "SmartCitiX");
  const index = readJson(join(UNITY, "Content", "index.json"));
  const cut = {
    ...index,
    pack: { id: pack.id, title: pack.title, version: pack.version, brand: pack.brand },
    stations: index.stations.filter((s) => stationIds.has(s.id)),
    programmes: index.programmes.filter((p) => programmeIds.has(p.id)),
    worlds: index.worlds.filter((w) => worldIds.has(w.id)),
  };
  cut.categories = index.categories.filter((c) => cut.stations.some((s) => s.category === c));
  write("unity/SmartCitiX/Content/index.json", stable(cut));
  for (const group of ["stations", "programmes", "worlds"]) {
    for (const e of cut[group]) { write(join("unity", "SmartCitiX", "Content", e.file), readFileSync(join(UNITY, "Content", e.file), "utf8")); }
  }
  mkdirSync(join(u, "Runtime"), { recursive: true });
  for (const f of readdirSync(join(UNITY, "Runtime")).sort()) { copyFileSync(join(UNITY, "Runtime", f), join(u, "Runtime", f)); files++; }
  const pkg = readJson(join(UNITY, "package.json"));
  write("unity/SmartCitiX/package.json", stable({ ...pkg, name: `${pkg.name}.pack.${pack.id}`, displayName: pack.title, version: pack.version, description: `${pack.title}: ${pack.stations.length} stations. ${pkg.description}` }));

  // Web slice.
  const catalog = readJson(join(WEBXR, "smartcity", "catalog.json"));
  const stations = catalog.stations.filter((s) => stationIds.has(s.id));
  const cats = catalog.categories
    .map((c) => ({ ...c, stations: c.stations.filter((id) => stationIds.has(id)) }))
    .filter((c) => c.stations.length);
  write("web/catalog.json", stable({
    ...catalog, pack: { id: pack.id, title: pack.title, version: pack.version, brand: pack.brand },
    categories: cats, curricula: catalog.curricula.filter((c) => programmeIds.has(c.id)), stations,
  }));
  const page = readFileSync(join(PACKS, "flat", "index.html"), "utf8");
  const start = page.indexOf(`<article class="at-card pk-card" id="pack-${pack.id}"`);
  const end = page.indexOf("</article>", start);
  if (start < 0 || end < 0) throw new Error(`the Packs page has no card for ${pack.id}`);
  const grid = page.indexOf('<div class="at-grid" id="pk-grid">');
  const gridEnd = page.indexOf("</main>");
  const single = page.slice(0, grid) + `<div class="at-grid" id="pk-grid">\n${page.slice(start, end + "</article>".length)}\n  </div>\n` + page.slice(gridEnd);
  write("web/index.html", single);
  return { stations: cut.stations.length, programmes: cut.programmes.length, worlds: cut.worlds.map((w) => w.id), files };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2);
  if (args.includes("--list")) {
    for (const p of readJson(join(PACKS, "index.json")).packs) console.log(`${p.id}\t${p.kind}\t${p.title}`);
    process.exit(0);
  }
  const id = args.find((a) => !a.startsWith("--") && a !== args[args.indexOf("--out") + 1]);
  if (!id) { console.error("usage: node tools/export_pack.mjs <pack-id> [--out DIR] | --list"); process.exit(2); }
  const out = args.includes("--out") ? args[args.indexOf("--out") + 1] : join(ROOT, "exports", "packs", id);
  const r = pkExportPack(id, out);
  console.log(`[export_pack] ${id}: ${r.stations} stations, ${r.programmes} programmes, worlds ${r.worlds.join(", ") || "none"} (${r.files} files) → ${out.replace(ROOT + "/", "")}`);
}
