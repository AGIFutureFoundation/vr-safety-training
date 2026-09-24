/**
 * Gates the training-track pages (tools/gen_tracks.mjs):
 *
 *   1. every programme has a page in WebXR/home/tracks/ and its bundled copy
 *      in WebXR/dist/tracks/, both what the generator writes now, and the
 *      generator runs from gen_catalog.mjs and the bundler copies the pages
 *   2. every link resolves: each relative href/src to a file beside the
 *      bundles; each ?sim= / ?room= to a station that exists in that app,
 *      under a condition shared/ladder.js parses and the station can run;
 *      each ?programme=&level= to a programme and a level 1–20 that exist
 *   3. nothing loads from another host: the only absolute URLs are the
 *      Google Fonts preconnect and stylesheet, no script has a src, and no
 *      CSS url() leaves the page
 *   4. each page carries every level (with its lesson count), a deep link
 *      for every task on its ladder, a card for every station, the standards
 *      its levels evidence, and a screenshot thumbnail wherever
 *      docs/screenshots holds one (a missing thumbnail is reported)
 *   5. the homepage's Training tracks section links every page, in both
 *      layouts, with the level and lesson counts
 *
 *     node tools/check_tracks.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCondition, conditionValid, conditionFromQuery, taskKey, LADDER_LEVELS } from "../WebXR/shared/ladder.js";
import { TRACK_DIR, DIST_TRACK_DIR, trackContext, renderAll, thumbPath, esc, taskHref } from "./gen_tracks.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");

let failures = 0;
let warnings = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.message ?? err}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }

/** Every attribute value in a document, with its attribute and tag name. */
function attributes(html) {
  const out = [];
  for (const tag of html.match(/<[a-zA-Z][^>]*>/g) ?? []) {
    const name = /^<([a-zA-Z0-9]+)/.exec(tag)[1].toLowerCase();
    for (const m of tag.matchAll(/([a-zA-Z-]+)\s*=\s*"([^"]*)"/g)) out.push({ tag: name, name: m[1], value: m[2] });
  }
  return out;
}
const unescape = (v) => v.replace(/&amp;/g, "&");

const tc = await trackContext();
const { catalog, LADDER_BY_PROGRAMME, LADDER_STANDARDS, byKey, shots } = tc;
const pages = renderAll(tc);
const stationsBy = { smartcity: new Set(), trades: new Set() };
for (const s of catalog.stations) stationsBy[s.app]?.add(s.id);
const metaOf = (app, id) => {
  // The numbers conditionValid needs, from the ladders' station tables.
  for (const l of Object.values(LADDER_BY_PROGRAMME)) { const r = l.stations[`${app}:${id}`]; if (r) return { app, ...r }; }
  const c = byKey.get(`${app}:${id}`);
  return c ? { app, indoor: c.indoor, hazards: c.hazards, interrupts: [] } : null;
};

console.log("Training-track pages\n");

// ------------------------------------------------------------ 1. the pages
await check("every programme has a track page and a bundled copy, both current", () => {
  const stale = [];
  for (const prog of catalog.curricula) {
    const src = join(TRACK_DIR, `${prog.id}.html`);
    const dist = join(DIST_TRACK_DIR, `${prog.id}.html`);
    assert(existsSync(src), `WebXR/home/tracks/${prog.id}.html is missing — run node tools/gen_tracks.mjs`);
    assert(existsSync(dist), `WebXR/dist/tracks/${prog.id}.html is missing — run python3 tools/bundle_webxr.py`);
    const want = pages.get(prog.id);
    if (readFileSync(src, "utf8") !== want) stale.push(`home/tracks/${prog.id}.html`);
    if (readFileSync(dist, "utf8") !== want) stale.push(`dist/tracks/${prog.id}.html`);
  }
  assert(!stale.length, `${stale.length} stale page(s), e.g. ${stale.slice(0, 3).join(", ")} — run node tools/gen_tracks.mjs, then python3 tools/bundle_webxr.py`);
  const genCatalog = readFileSync(join(ROOT, "tools/gen_catalog.mjs"), "utf8");
  assert(/gen_tracks\.mjs/.test(genCatalog), "tools/gen_catalog.mjs does not run tools/gen_tracks.mjs, so the pages will drift");
  const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
  assert(/WEBXR \/ "home" \/ "tracks"/.test(bundler), "tools/bundle_webxr.py does not copy the track pages into WebXR/dist/tracks/");
});

// ------------------------------------------------------------ 2. every link
let linkCount = 0, taskLinks = 0, levelLinks = 0;
await check("every link resolves to a file, a station under a valid condition, or a level that exists", () => {
  const broken = [];
  for (const [pid, html] of pages) {
    for (const a of attributes(html)) {
      if (a.name !== "href" && a.name !== "src") continue;
      const v = unescape(a.value);
      if (/^(https?:)?\/\//.test(v) || v.startsWith("#")) continue;
      linkCount += 1;
      const [path, query = ""] = v.split("?");
      if (!existsSync(resolve(DIST_TRACK_DIR, path))) { broken.push(`${pid} → ${v} (no file)`); continue; }
      if (!query) continue;
      const q = new URLSearchParams(query);
      if (q.has("sim") || q.has("room")) {
        const app = q.has("room") ? "trades" : "smartcity";
        const id = q.get("sim") ?? q.get("room");
        if (!stationsBy[app].has(id)) { broken.push(`${pid} → ${v} (no ${app} station ${id})`); continue; }
        const cond = conditionFromQuery(`?${query}`);
        const extra = [...q.keys()].filter((k) => !["sim", "room"].includes(k));
        if (extra.length && cond === "base") broken.push(`${pid} → ${v} (query names no condition shared/ladder.js reads)`);
        if (!conditionValid(cond, metaOf(app, id))) broken.push(`${pid} → ${v} (${id} cannot run under ${cond})`);
        taskLinks += 1;
      } else if (q.has("programme")) {
        const prog = q.get("programme"), n = Number(q.get("level"));
        if (!LADDER_BY_PROGRAMME[prog]) broken.push(`${pid} → ${v} (no programme ${prog})`);
        else if (!(Number.isInteger(n) && n >= 1 && n <= LADDER_LEVELS && LADDER_BY_PROGRAMME[prog].levels[n - 1])) broken.push(`${pid} → ${v} (no level ${q.get("level")})`);
        levelLinks += 1;
      } else broken.push(`${pid} → ${v} (a query this page has no reason to carry)`);
    }
  }
  assert(!broken.length, `${broken.length} broken link(s): ${broken.slice(0, 5).join("; ")}`);
  // A level link is only worth making if the app opens the rung.
  const app = readFileSync(join(WEBXR, "smartcity/js/app.js"), "utf8");
  assert(/get\("level"\)/.test(app) && /assignedLevel = n; ladderOpen = programmeLink/.test(app), "SmartCiti.X does not read ?programme=&level=, so a level link opens nothing");
});

// ---------------------------------------------------------- 3. no other host
await check("nothing loads from another host but Google Fonts", () => {
  const found = [];
  for (const [pid, html] of pages) {
    for (const a of attributes(html)) {
      if (!/^(https?:)?\/\//.test(a.value)) continue;
      const host = new URL(a.value.startsWith("//") ? `https:${a.value}` : a.value).host;
      const fonts = a.tag === "link" && (host === "fonts.googleapis.com");
      if (!fonts) found.push(`${pid}: <${a.tag} ${a.name}="${a.value}">`);
    }
    if (/<script[^>]*\ssrc=/.test(html)) found.push(`${pid}: a script with a src`);
    for (const m of html.matchAll(/url\(([^)]*)\)/g)) if (/(https?:)?\/\//.test(m[1])) found.push(`${pid}: CSS url(${m[1]})`);
    if (/@import/.test(html)) found.push(`${pid}: a CSS @import`);
  }
  assert(!found.length, `${found.length} external reference(s): ${found.slice(0, 4).join("; ")}`);
});

// -------------------------------------------------------- 4. what each page shows
let cards = 0, shotsShown = 0;
const missingThumbs = [];
await check("each page shows every level with its lessons, every task, every station, and its standards", () => {
  const problems = [];
  for (const prog of catalog.curricula) {
    const html = pages.get(prog.id);
    const ladder = LADDER_BY_PROGRAMME[prog.id];
    if (!html.includes(`<h1>${esc(prog.name)}</h1>`)) problems.push(`${prog.id}: no name heading`);
    for (const f of ["union", "certification", "summary"]) if (prog[f] && !html.includes(esc(prog[f]))) problems.push(`${prog.id}: ${f} not shown`);
    for (const lv of ladder.levels) {
      const at = html.indexOf(`id="level-${lv.n}"`);
      if (at < 0) { problems.push(`${prog.id}: level ${lv.n} missing`); continue; }
      const next = html.indexOf('id="level-', at + 10);
      const row = html.slice(at, next < 0 ? html.indexOf('id="stations"') : next);
      if (!row.includes(`<b>${lv.lessons}</b> lessons`)) problems.push(`${prog.id}: level ${lv.n} does not show its ${lv.lessons} lessons`);
      if (lv.partial && !row.includes(`${lv.shortfall} lessons short`)) problems.push(`${prog.id}: level ${lv.n} hides its shortfall`);
      for (const t of lv.tasks) if (!html.includes(`href="${taskHref(t.app, t.id, t.condition)}"`)) problems.push(`${prog.id}: level ${lv.n} task ${taskKey(t)} has no deep link`);
    }
    const distinct = new Set(prog.stations.map((s) => `${s.app}:${s.id}`));
    const articles = (html.match(/<article class="station"/g) ?? []).length;
    if (articles !== distinct.size) problems.push(`${prog.id}: ${articles} station cards for ${distinct.size} stations`);
    cards += articles;
    for (const k of distinct) {
      const [app, id] = k.split(":");
      if (!html.includes(`href="${taskHref(app, id, "base")}"`)) problems.push(`${prog.id}: ${id} has no launch link`);
      const hasShot = shots.has(id);
      const img = html.includes(`src="img/${id}.jpg"`);
      if (img && !existsSync(thumbPath(id))) problems.push(`${prog.id}: ${id} shows a thumbnail that does not exist`);
      if (hasShot && !img) missingThumbs.push(id);
      if (img) shotsShown += 1;
    }
    for (const sid of new Set(ladder.levels.flatMap((lv) => lv.standards))) {
      const e = LADDER_STANDARDS[sid];
      if (!e || !html.includes(`<td>${esc(e.body)}</td><td>${esc(e.title)}</td>`)) problems.push(`${prog.id}: standard ${sid} not in the evidenced table`);
    }
    if (!/What it proves/.test(html) || !/Open Badges 2\.0/.test(html)) problems.push(`${prog.id}: no competency and badge section`);
  }
  assert(!problems.length, `${problems.length} problem(s): ${problems.slice(0, 5).join("; ")}`);
});
if (missingThumbs.length) {
  warnings += 1;
  console.log(`  ! ${new Set(missingThumbs).size} station(s) have a screenshot but no thumbnail — run node tools/gen_tracks.mjs --thumbs: ${[...new Set(missingThumbs)].slice(0, 5).join(", ")}`);
}

// ------------------------------------------------------ 5. the homepage section
await check("the homepage's Training tracks section links every page in both layouts, with levels and lessons", () => {
  const home = readFileSync(join(WEBXR, "index.html"), "utf8");
  const flat = readFileSync(join(WEBXR, "home.html"), "utf8");
  for (const [name, html, prefix] of [["index.html", home, "dist/tracks/"], ["home.html", flat, "tracks/"]]) {
    assert((html.match(/<section class="tracks" id="tracks">/g) ?? []).length === 1, `${name} has no single Training tracks section`);
    assert(/<h2>Training tracks<\/h2>/.test(html), `${name}'s section is not titled Training tracks`);
    const cardsHere = (html.match(/class="track-card"/g) ?? []).length;
    assert(cardsHere === catalog.curricula.length, `${name} has ${cardsHere} track cards for ${catalog.curricula.length} programmes`);
    for (const c of catalog.curricula) {
      assert(html.includes(`href="${prefix}${c.id}.html"`), `${name} does not link ${prefix}${c.id}.html`);
      assert(html.includes(`${c.ladder.levels} levels · ${c.ladder.lessons} lessons`), `${name} does not show ${c.id}'s level and lesson counts`);
    }
  }
  for (const c of catalog.curricula) {
    const l = LADDER_BY_PROGRAMME[c.id];
    assert(c.ladder.lessons === l.lessons && c.ladder.atBar === l.gap.full && c.ladder.levels === l.levels.length, `catalog.json's ladder summary for ${c.id} is stale — run node tools/gen_catalog.mjs`);
  }
});

console.log(failures
  ? `\n${failures} track check(s) failed.`
  : `\nAll track checks pass: ${pages.size} pages, ${linkCount} links (${taskLinks} station runs, ${levelLinks} levels), ${cards} station cards, ${shotsShown} with a screenshot${warnings ? `, ${new Set(missingThumbs).size} thumbnail(s) to build` : ""}.`);
process.exit(failures ? 1 : 0);
