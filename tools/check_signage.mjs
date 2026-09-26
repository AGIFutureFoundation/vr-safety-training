/**
 * Gates the union and safety signage (tools/briefs/assets-brief.md, "Union
 * signage"; docs/signage.md):
 *
 *   1. tools/unions.json is complete and honest: one well-formed entry per
 *      union, every trainingBody a registry union entry, every registry union
 *      entry carried by some union, no colours or locals the file does not
 *      justify, and every programme's `union` string resolving to at least one
 *      entry — and WebXR/shared/unions.js is what gen_unions.mjs writes now
 *   2. no logo ships: WebXR/assets/brand/ holds the manifest and its README
 *      and nothing else, the manifest carries a licence note and one entry per
 *      union, and every `file` is null
 *   3. the signs render headlessly inside their mesh counts and put the right
 *      words on their faces: every union's wordmark (abbrev, name, local,
 *      "Training partner"), every ANSI header with every pictogram, every
 *      jobsite board
 *   4. the stage stands a union sign beside every station's pad — the union
 *      unionForStation() names, from the station's programme — and a safety
 *      sign for the category's hazard wherever the budget allows, both inside
 *      STATION_MESH_BUDGET with the station's own meshes; in AR the union sign
 *      alone. Reports how many stations the budget made the stage skip.
 *   5. docs/signage.md exists and states the trademark policy; the bundler
 *      ships both modules; app.js hands the station to the stage and confirms
 *      the safety sign against the built count
 *
 *     node tools/check_signage.mjs
 */
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, WEBXR, THREE_STUB, installDomStubs, strip, buildSuite, loadSmartCity } from "./lib/headless.mjs";
import { renderUnionsModule, UNIONS_MODULE } from "./gen_unions.mjs";
import { CURRICULA } from "../WebXR/smartcity/js/curricula.js";

let failures = 0;
const fail = (area, msg) => { failures += 1; console.log(`  ✗ [${area}] ${msg}`); };
const ok = (msg) => console.log(`  ✓ ${msg}`);

const data = JSON.parse(readFileSync(join(ROOT, "tools/unions.json"), "utf8"));
const registry = JSON.parse(readFileSync(join(ROOT, "tools/standards.json"), "utf8"));
const registryUnions = registry.standards.filter((s) => s.body === "union");
const registryById = Object.fromEntries(registry.standards.map((s) => [s.id, s]));

// ----------------------------------------------------------- 1. unions.json
{
  const before = failures;
  if (!Array.isArray(data.unions) || !data.unions.length) fail("unions", "tools/unions.json has no `unions` array");
  if (typeof data.note !== "string" || !/no union logo/i.test(data.note)) fail("unions", "the file's `note` must state that no union logo is reproduced");
  const ids = new Set();
  const hex = /^#[0-9a-f]{6}$/i;
  for (const u of data.unions ?? []) {
    const tag = u.id ?? "(no id)";
    if (!/^[a-z][a-z0-9-]*$/.test(u.id ?? "")) fail("unions", `${tag}: id must be kebab-case`);
    if (ids.has(u.id)) fail("unions", `${tag}: duplicate id`);
    ids.add(u.id);
    for (const k of ["name", "abbrev", "note"]) if (typeof u[k] !== "string" || !u[k].trim()) fail("unions", `${tag}: ${k} must be a non-empty string`);
    if (!Array.isArray(u.aliases) || !u.aliases.length) fail("unions", `${tag}: aliases must list the spellings the platform's text uses`);
    if (!("local" in u) || !("colors" in u) || !("trainingBody" in u)) fail("unions", `${tag}: local, colors and trainingBody must be present (null where unknown)`);
    if (u.local !== null && !/Local \d+/.test(u.local)) fail("unions", `${tag}: local "${u.local}" is not a numbered local`);
    if (u.colors !== null) {
      if (typeof u.colors !== "object") fail("unions", `${tag}: colors must be null or an object of hex strings`);
      else for (const [k, v] of Object.entries(u.colors)) if (!hex.test(v)) fail("unions", `${tag}: colors.${k} "${v}" is not a hex colour`);
    }
    if (u.trainingBody !== null) {
      const body = registryById[u.trainingBody];
      if (!body) fail("unions", `${tag}: trainingBody "${u.trainingBody}" is not in tools/standards.json`);
      else if (body.body !== "union") fail("unions", `${tag}: trainingBody "${u.trainingBody}" is a ${body.body} entry, not a union one`);
    }
    for (const k of ["logo", "file", "motto", "slogan"]) if (k in u) fail("unions", `${tag}: carries a "${k}" field, which the policy forbids`);
  }
  const carried = new Set((data.unions ?? []).map((u) => u.trainingBody).filter(Boolean));
  for (const r of registryUnions) if (!carried.has(r.id)) fail("unions", `registry union entry "${r.id}" has no union in tools/unions.json`);
  const generated = renderUnionsModule();
  if (!existsSync(UNIONS_MODULE)) fail("unions", "WebXR/shared/unions.js is missing — run node tools/gen_unions.mjs");
  else if (readFileSync(UNIONS_MODULE, "utf8") !== generated) fail("unions", "WebXR/shared/unions.js is stale — run node tools/gen_unions.mjs");
  if (failures === before) ok(`tools/unions.json: ${data.unions.length} unions, every trainingBody a registry union entry, all ${registryUnions.length} registry union entries carried, shared/unions.js current`);
}

// ------------------------------------------------------------ 2. no logo ships
{
  const before = failures;
  const dir = join(WEBXR, "assets/brand");
  const files = existsSync(dir) ? readdirSync(dir).sort() : [];
  if (JSON.stringify(files) !== JSON.stringify(["README.md", "manifest.json"])) fail("brand", `WebXR/assets/brand/ must hold exactly README.md and manifest.json, found: ${files.join(", ") || "(nothing)"}`);
  let manifest = null;
  try { manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")); } catch (e) { fail("brand", `manifest.json does not parse: ${e.message}`); }
  if (manifest) {
    if (typeof manifest.licence !== "string" || !/permission/i.test(manifest.licence) || !/trademark/i.test(manifest.licence)) fail("brand", "manifest.licence must state that the deployment must hold permission and that the logos are trademarks");
    const keys = Object.keys(manifest.unions ?? {}).sort();
    const want = data.unions.map((u) => u.id).sort();
    if (JSON.stringify(keys) !== JSON.stringify(want)) fail("brand", `manifest.unions must have exactly one entry per union in tools/unions.json (missing: ${want.filter((k) => !keys.includes(k)).join(", ") || "none"}; extra: ${keys.filter((k) => !want.includes(k)).join(", ") || "none"})`);
    for (const [id, e] of Object.entries(manifest.unions ?? {})) {
      const file = e && typeof e === "object" ? e.file : e;
      if (file !== null) fail("brand", `manifest.unions.${id}.file is ${JSON.stringify(file)} — the repository ships every file null`);
    }
  }
  // A logo hidden anywhere else under WebXR/ would be the same breach.
  const walk = (d, out = []) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) { if (!["node_modules", "dist", ".git"].includes(e.name)) walk(join(d, e.name), out); }
      else out.push(join(d, e.name));
    }
    return out;
  };
  const unionIds = data.unions.map((u) => u.id);
  const suspects = walk(WEBXR).filter((f) => /\.(svg|png|jpe?g|webp|gif)$/i.test(f))
    .filter((f) => { const base = f.split("/").pop().toLowerCase(); return /logo/.test(base) || unionIds.some((id) => base === `${id}.svg` || base === `${id}.png`); });
  for (const f of suspects) fail("brand", `${f.replace(ROOT + "/", "")} looks like a union logo file`);
  if (failures === before) ok(`no logo ships: assets/brand/ holds the manifest and README only, every manifest file null, licence note present`);
}

// ----------------------------------------------------- 3. the signs render
// A canvas stub that remembers what was written on each face, so the check
// can read the sign back rather than only count its meshes.
const drawn = [];
function recordingDom() {
  const ctx = new Proxy({}, {
    get(_t, prop) {
      if (prop === "fillText") return (text) => { drawn.push(String(text)); };
      if (prop === "measureText") return (t) => ({ width: String(t).length * 6 });
      if (prop === "createLinearGradient") return () => ({ addColorStop() {} });
      if (prop === "canvas") return { width: 512, height: 512 };
      return () => {};
    },
    set() { return true; },
  });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }), baseURI: "" };
}

const SIGN_MODULES = ["shared/kit.js", "shared/unions.js", "smartcity/js/curricula.js", "shared/signage.js"];
const S = await buildSuite(SIGN_MODULES,
  "export { unionSign, safetySign, jobsiteBoard, stationSignage, unionForStation, unionsNamed, hazardSignFor, signMeshCount, UNIONS, ANSI_HEADERS, PICTOGRAMS, BOARD_KINDS, HAZARD_BY_CATEGORY, CATEGORY_DEFAULT_UNION, SIGN_MESHES, STATION_MESH_BUDGET, THREE };", "signage");
recordingDom();

{
  const before = failures;
  for (const c of CURRICULA) {
    const ids = S.unionsNamed(c.union);
    if (!ids.length) fail("programmes", `programme "${c.id}" union string resolves to no union: "${c.union}"`);
  }
  for (const [cat, id] of Object.entries(S.CATEGORY_DEFAULT_UNION)) {
    const u = S.UNIONS.find((x) => x.id === id);
    if (!u) fail("defaults", `category default for "${cat}" names unknown union "${id}"`);
    else if (u.scope.length && !u.scope.includes(cat)) fail("defaults", `category default for "${cat}" is ${id}, whose training fund does not cover it`);
  }
  for (const cat of registry.categories.filter((c) => c !== "Trade Skills Simulator")) {
    if (!S.HAZARD_BY_CATEGORY[cat]) fail("hazards", `no safety sign for category "${cat}"`);
    if (!S.CATEGORY_DEFAULT_UNION[cat]) fail("defaults", `no default union for category "${cat}"`);
  }
  for (const [cat, h] of Object.entries(S.HAZARD_BY_CATEGORY)) {
    if (!S.ANSI_HEADERS[h.header]) fail("hazards", `${cat}: header "${h.header}" is not an ANSI Z535 signal word`);
    if (!S.PICTOGRAMS.includes(h.pictogram)) fail("hazards", `${cat}: pictogram "${h.pictogram}" unknown`);
    if (!h.text || h.text.length < 20) fail("hazards", `${cat}: the sign needs a sentence of generic text`);
    if (/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(h.text)) fail("hazards", `${cat}: a phone number on a generic sign`);
  }
  if (failures === before) ok(`every programme's union string resolves; ${Object.keys(S.HAZARD_BY_CATEGORY).length} category hazards and ${Object.keys(S.CATEGORY_DEFAULT_UNION).length} category defaults cover the registry's categories`);
}

{
  const before = failures;
  const root = new S.THREE.Group();
  for (const u of S.UNIONS) {
    drawn.length = 0;
    let g;
    try { g = S.unionSign(root, 0, 0, 0, u.id); } catch (e) { fail("render", `unionSign(${u.id}) threw — ${e.message}`); continue; }
    const n = S.signMeshCount(g);
    if (n > S.SIGN_MESHES.union) fail("render", `unionSign(${u.id}) is ${n} meshes, over ${S.SIGN_MESHES.union}`);
    if (g.name !== "union-sign" || g.userData.unionId !== u.id) fail("render", `unionSign(${u.id}) is not named/tagged for the checker`);
    if (!drawn.includes(u.abbrev)) fail("render", `unionSign(${u.id}) did not set the abbreviation "${u.abbrev}"`);
    if (!drawn.includes("TRAINING PARTNER")) fail("render", `unionSign(${u.id}) has no "Training partner" line`);
    if (u.name !== u.abbrev && !drawn.some((t) => t.startsWith(u.name.split(" ")[0]))) fail("render", `unionSign(${u.id}) did not set the full name`);
    if (u.local && !drawn.includes(u.local)) fail("render", `unionSign(${u.id}) did not set the local "${u.local}"`);
    if (!u.local && drawn.some((t) => /^Local \d+$/.test(t))) fail("render", `unionSign(${u.id}) shows a local the file does not name`);
    if (u.trainingTitle && !drawn.some((t) => u.trainingTitle.startsWith(t.replace(/…$/, "")))) fail("render", `unionSign(${u.id}) did not name its training body`);
  }
  try { S.unionSign(root, 0, 0, 0, "not-a-union"); fail("render", "unionSign accepted an unknown union id"); } catch { /* expected */ }
  for (const header of Object.keys(S.ANSI_HEADERS)) {
    for (const pictogram of S.PICTOGRAMS) {
      drawn.length = 0;
      let g;
      try { g = S.safetySign(root, 0, 0, 0, { header, text: "Generic hazard text for the checker to read back.", pictogram }); } catch (e) { fail("render", `safetySign(${header}, ${pictogram}) threw — ${e.message}`); continue; }
      const n = S.signMeshCount(g);
      if (n > S.SIGN_MESHES.safety) fail("render", `safetySign(${header}, ${pictogram}) is ${n} meshes, over ${S.SIGN_MESHES.safety}`);
      if (!drawn.includes(header)) fail("render", `safetySign(${header}, ${pictogram}) did not set its signal word`);
      if (!drawn.some((t) => t.startsWith("Generic hazard"))) fail("render", `safetySign(${header}, ${pictogram}) did not set its message`);
    }
  }
  drawn.length = 0;
  const odd = S.safetySign(root, 0, 0, 0, { header: "BEWARE", text: "x", pictogram: "skull" });
  if (odd.userData.header !== "NOTICE" || !drawn.includes("NOTICE")) fail("render", "an unknown header must fall back to NOTICE, never invent a signal word");
  for (const kind of S.BOARD_KINDS) {
    drawn.length = 0;
    let g;
    try { g = S.jobsiteBoard(root, 0, 0, 0, { kind }); } catch (e) { fail("render", `jobsiteBoard(${kind}) threw — ${e.message}`); continue; }
    const n = S.signMeshCount(g);
    if (n > S.SIGN_MESHES.board) fail("render", `jobsiteBoard(${kind}) is ${n} meshes, over ${S.SIGN_MESHES.board}`);
    if (g.userData.kind !== kind || drawn.length < 3) fail("render", `jobsiteBoard(${kind}) drew nothing readable`);
  }
  if (failures === before) ok(`${S.UNIONS.length} union signs, ${Object.keys(S.ANSI_HEADERS).length * S.PICTOGRAMS.length} safety signs and ${S.BOARD_KINDS.length} boards render headlessly, each at most 3 meshes, with their words on the face`);
}

// ------------------------------------------- 4. every station pad, on the stage
// The real stage, behind the richer stub check_districts uses (Color with
// channels, Fog, AmbientLight), built once per station with `station` set.
const STAGE_STUB = THREE_STUB
  .replace("class Color { constructor(v=0){this.v=v;} set(v){this.v=v;return this;} }",
    "class Color { constructor(v=0){this.set(v);} set(v){this.v=typeof v==='number'?v:(v&&v.v)||0;this.r=((this.v>>16)&255)/255;this.g=((this.v>>8)&255)/255;this.b=(this.v&255)/255;this.isColor=true;return this;} getHex(){return (Math.round(this.r*255)<<16)|(Math.round(this.g*255)<<8)|Math.round(this.b*255);} copy(c){this.r=c.r;this.g=c.g;this.b=c.b;return this;} multiplyScalar(k){this.r*=k;this.g*=k;this.b*=k;return this;} lerp(c,t){this.r+=(c.r-this.r)*t;this.g+=(c.g-this.g)*t;this.b+=(c.b-this.b)*t;return this;} }")
  // three's Fog wraps a numeric colour in a Color; an interior stage passes one.
  + "\nexport class Fog { constructor(color,near,far){this.color=color&&color.isColor?color:new Color(color);this.near=near;this.far=far;} }\nexport class AmbientLight extends Obj3D { constructor(c,i){super();this.color=c;this.intensity=i;} }\n";
if (!STAGE_STUB.includes("getHex()")) throw new Error("check_signage: the headless stub changed shape; update the Color replacement here");
const STAGE_MODULES = ["shared/kit.js", "shared/a11y.js", "shared/weather.js", "shared/unions.js", "smartcity/js/curricula.js", "shared/signage.js",
  "smartcity/js/citykit.js", "smartcity/js/ambient.js", "smartcity/js/apron.js", "smartcity/js/interiors.js", "smartcity/js/districts.js", "smartcity/js/stage.js"];
installDomStubs();
const dir = mkdtempSync(join(tmpdir(), "signage-stage-"));
process.on("exit", () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* scratch folder; best effort */ } });
writeFileSync(join(dir, "three-mock.mjs"), STAGE_STUB);
writeFileSync(join(dir, "suite.mjs"), `import * as THREE from "./three-mock.mjs";\n\n${STAGE_MODULES.map((rel) => strip(readFileSync(join(WEBXR, rel), "utf8"))).join("\n\n")}\n\nexport { buildStage, THREE };`);
const ST = await import(pathToFileURL(join(dir, "suite.mjs")).href);
const city = await loadSmartCity();

function stationMeshes(r) {
  const root = new city.THREE.Group();
  r.build(root);
  let n = 0;
  root.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) n += 1; });
  return n;
}
function findNamed(root, name) {
  let hit = null;
  root.traverse((o) => { if (!hit && o.name === name) hit = o; });
  return hit;
}

let skipped = 0, placed = 0, withSafety = 0;
{
  const before = failures;
  for (const r of city.ROOMS) {
    const expect = S.unionForStation(r);
    if (!expect.unionId) { fail("stage", `${r.id}: unionForStation() names no union (category "${r.category}")`); continue; }
    let stage, used;
    try {
      used = stationMeshes(r);
      const scene = { background: null, fog: null };
      stage = ST.buildStage(new ST.THREE.Group(), "flat", scene, r.accent ?? 0x4fd1ff, r.district ?? r.category, r.weather ?? null, r.indoor ?? null, { station: r });
    } catch (e) { fail("stage", `${r.id}: the stage threw — ${e.message}`); continue; }
    if (!stage.signage) { fail("stage", `${r.id}: buildStage() built no signage for the station`); continue; }
    stage.signage.fit(used);
    const union = findNamed(stage.root, "union-sign");
    if (!union) fail("stage", `${r.id}: no union sign beside the pad`);
    else if (union.userData.unionId !== expect.unionId) fail("stage", `${r.id}: union sign is ${union.userData.unionId}, expected ${expect.unionId} (${expect.source})`);
    else placed += 1;
    const safety = findNamed(stage.root, "safety-sign");
    const want = S.hazardSignFor(r.category);
    if (safety) {
      withSafety += 1;
      if (safety.userData.header !== want.header) fail("stage", `${r.id}: safety sign header ${safety.userData.header}, expected ${want.header} for ${r.category}`);
    } else if (stage.signage.skippedSafety) {
      skipped += 1;
      if (used + S.SIGN_MESHES.union + S.SIGN_MESHES.safety <= S.STATION_MESH_BUDGET) fail("stage", `${r.id}: safety sign skipped at ${used} meshes, but it would have fitted`);
    } else fail("stage", `${r.id}: no safety sign and none reported skipped`);
    const total = used + stage.signage.meshes();
    if (total > S.STATION_MESH_BUDGET) fail("stage", `${r.id}: ${used} station meshes + ${stage.signage.meshes()} signage = ${total}, over the ${S.STATION_MESH_BUDGET} budget`);
    if (safety && !stage.signage.skippedSafety && total > S.STATION_MESH_BUDGET) fail("stage", `${r.id}: fit() left the safety sign up over budget`);
  }
  // AR: the union sign alone, close in.
  const sample = city.ROOMS[0];
  const ar = ST.buildStage(new ST.THREE.Group(), "ar", { background: null, fog: null }, sample.accent ?? 0x4fd1ff, sample.category, null, null, { station: sample });
  if (!findNamed(ar.root, "union-sign")) fail("stage", `${sample.id}: in AR the union sign is missing`);
  if (findNamed(ar.root, "safety-sign")) fail("stage", `${sample.id}: in AR no safety sign should be built`);
  // No station, no signs: the hub and the district preview stay as they were.
  const bare = ST.buildStage(new ST.THREE.Group(), "flat", { background: null, fog: null }, 0x4fd1ff, "Energy & Power", null, null, {});
  if (bare.signage || findNamed(bare.root, "union-sign")) fail("stage", "buildStage() without a station built signage anyway");
  if (failures === before) ok(`${placed} of ${city.ROOMS.length} station pads carry their union sign on the stage; ${withSafety} carry the category's safety sign, ${skipped} skipped by the budget; AR carries the union sign alone`);
}

// -------------------------------------------------- 5. docs, bundler, app
{
  const before = failures;
  const doc = join(ROOT, "docs/signage.md");
  if (!existsSync(doc)) fail("docs", "docs/signage.md is missing");
  else {
    const text = readFileSync(doc, "utf8");
    for (const [re, what] of [[/trademark/i, "the word trademark"], [/no union logo is reproduced/i, "the statement that no union logo is reproduced"], [/manifest\.json/, "the manifest"], [/wordmark/i, "the wordmark"], [/Z535/, "ANSI Z535"]]) {
      if (!re.test(text)) fail("docs", `docs/signage.md does not carry ${what}`);
    }
  }
  const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
  for (const name of ["unions.js", "signage.js"]) if (!bundler.includes(`SHARED / "${name}"`)) fail("bundle", `tools/bundle_webxr.py does not ship shared/${name}`);
  const app = readFileSync(join(WEBXR, "smartcity/js/app.js"), "utf8");
  if (!/station:\s*room/.test(app)) fail("app", "smartcity/js/app.js does not hand the station to buildStage (opts.station)");
  if (!/signage\.fit\(/.test(app)) fail("app", "smartcity/js/app.js does not confirm the safety sign against the built mesh count (stage.signage.fit)");
  const stage = readFileSync(join(WEBXR, "smartcity/js/stage.js"), "utf8");
  if (!stage.includes("stationSignage(")) fail("stage", "smartcity/js/stage.js does not call stationSignage()");
  const all = readFileSync(join(ROOT, "tools/check_all.mjs"), "utf8");
  if (!all.includes("check_signage.mjs")) fail("suite", "tools/check_all.mjs does not run this checker");
  if (failures === before) ok("docs/signage.md states the trademark policy; the bundler ships both modules; app.js hands the station to the stage and fits the safety sign");
}

console.log(failures
  ? `\n${failures} signage problem(s).`
  : `\nSignage: ${S.UNIONS.length} unions, no logo shipped, ${placed} station pads signed, ${skipped} safety sign(s) skipped by the budget.`);
process.exit(failures ? 1 : 0);
