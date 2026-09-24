/**
 * Generates one training-track page per programme:
 *
 *   WebXR/home/tracks/<programme-id>.html   the page (bundled by tools/bundle_webxr.py
 *                                           into WebXR/dist/tracks/<programme-id>.html)
 *   WebXR/home/tracks/img/<station-id>.jpg  a screenshot thumbnail per station that has one
 *
 * and the homepage's "Training tracks" section (tracksSection, which
 * tools/gen_home.mjs places and nothing else in that file knows about).
 *
 *     node tools/gen_tracks.mjs            pages only (run by tools/gen_catalog.mjs)
 *     node tools/gen_tracks.mjs --thumbs   also (re)build thumbnails from docs/screenshots
 *                                          (needs the global playwright and its chromium)
 *
 * A page features one programme as a training track: its name, union and
 * certification, summary, the twenty-level ladder (lessons, a condition chip
 * per task, the partial flag and shortfall), a card per station (screenshot
 * where docs/screenshots/**\/<id>*.png exists, steps, hazards, interruptions,
 * why it is in the programme, the standards it evidences and every condition
 * the ladder runs it under), the standards the track evidences (registry
 * body and title), the competency and badges it proves, and deep links that
 * open each task with its condition's query parameters.
 *
 * Pages are written for the flat bundle layout they are served from —
 * WebXR/dist/tracks/, one folder below the single-file apps — so every link
 * is ../smartcity-x.html?sim=…, ../trade-skills-simulator.html?room=…,
 * ../index.html or img/…; nothing loads from another host but Google Fonts.
 * The same rules as the homepage hold: catalog and ladder strings reach the
 * page as text, ids reach a link only as plain slugs, conditions only once
 * shared/ladder.js has parsed them. tools/check_tracks.mjs gates all of it.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { conditionLabel, conditionParams, parseCondition, LADDER_LEVELS, LESSON_BAR } from "../WebXR/shared/ladder.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
export const TRACK_DIR = join(WEBXR, "home", "tracks");
export const THUMB_DIR = join(TRACK_DIR, "img");
export const DIST_TRACK_DIR = join(WEBXR, "dist", "tracks");
const SHOTS = join(ROOT, "docs", "screenshots");

// ------------------------------------------------------------------ escaping

export function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function slug(id, what) {
  const s = String(id ?? "");
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(s)) throw new Error(`${what} is not a plain slug: ${JSON.stringify(id)}`);
  return s;
}
function tint(accent) {
  const s = String(accent ?? "");
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s.toLowerCase() : "var(--accent)";
}

// ------------------------------------------------------------------- linking

/** Where the pages sit relative to the apps: WebXR/dist/tracks/ beside WebXR/dist/<app>.html. */
export const TRACK_LINKS = {
  home: "../index.html",
  smartcity: "../smartcity-x.html",
  trades: "../trade-skills-simulator.html",
};

/** A task's deep link: the station, and its condition's query parameters. */
export function taskHref(app, id, condition = "base") {
  const sid = slug(id, "station id");
  if (!parseCondition(condition)) throw new Error(`unknown condition ${JSON.stringify(condition)} for ${sid}`);
  if (app === "trades") return `${TRACK_LINKS.trades}?room=${sid}`;
  const q = conditionParams(condition).map(([k, v]) => `&amp;${k}=${slug(v, "condition value")}`).join("");
  return `${TRACK_LINKS.smartcity}?sim=${sid}${q}`;
}
/** A level's link: SmartCiti.X opens the programme's ladder at that rung (it stays locked until the one below is passed). */
export function levelHref(programme, n) {
  return `${TRACK_LINKS.smartcity}?programme=${slug(programme, "programme id")}&amp;level=${Number(n) | 0}`;
}

// --------------------------------------------------------------- screenshots

/**
 * Station id → its screenshots under docs/screenshots, best first. A file
 * belongs to the LONGEST station id its name starts with (so a shot of
 * "air-monitor-xyz" is never taken for "air-monitor"), and a SmartCiti.X
 * spawn shot is preferred over a signage or district one.
 */
export function screenshotIndex(stationIds) {
  const files = [];
  const walk = (d) => {
    if (!existsSync(d)) return;
    for (const f of readdirSync(d).sort()) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (f.endsWith(".png")) files.push(p);
    }
  };
  walk(SHOTS);
  const ids = [...new Set(stationIds)].sort((a, b) => b.length - a.length);
  const out = new Map();
  for (const p of files) {
    const name = basename(p, ".png");
    const id = ids.find((i) => name === i || (name.startsWith(i) && /^[_.-]/.test(name.slice(i.length))));
    if (!id) continue;
    if (!out.has(id)) out.set(id, []);
    out.get(id).push(p);
  }
  const rank = (p) => (/\/smartcity\/[^/]+_spawn\.png$/.test(p) ? 0 : /\/smartcity\//.test(p) ? 1 : 2);
  for (const list of out.values()) list.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  return out;
}
export const thumbPath = (id) => join(THUMB_DIR, `${slug(id, "station id")}.jpg`);

/** Rebuild thumbnails (480×270 JPEG) for stations whose screenshot is newer than its thumbnail. */
export async function buildThumbs(index) {
  const req = createRequire(join(execSync("npm root -g", { encoding: "utf8" }).trim(), "noop.js"));
  const { chromium } = req("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  mkdirSync(THUMB_DIR, { recursive: true });
  let made = 0;
  for (const [id, list] of index) {
    const src = list[0];
    const out = thumbPath(id);
    if (existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) continue;
    const b64 = readFileSync(src).toString("base64");
    const jpeg = await page.evaluate(async (data) => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = 480; c.height = 270;
      const g = c.getContext("2d");
      const s = Math.max(480 / img.width, 270 / img.height);
      g.drawImage(img, (480 - img.width * s) / 2, (270 - img.height * s) / 2, img.width * s, img.height * s);
      return c.toDataURL("image/jpeg", 0.72).split(",")[1];
    }, b64);
    writeFileSync(out, Buffer.from(jpeg, "base64"));
    made += 1;
  }
  await browser.close();
  return made;
}

// ------------------------------------------------------------------- styling

const CSS = `
  :root{
    --void:#050a10; --panel:#0b141d; --panel-2:#101b27; --raised:#142130; --raised-2:#192a3b;
    --text:#edf6fb; --muted:#93b2c3; --dim:#6f8ea2;
    --accent:#4fd1ff; --accent-2:#7ee6ff; --violet:#a079ff;
    --warn:#f2c14b; --danger:#f0645b; --good:#59c97b;
    --edge:rgba(126,170,200,.16); --edge-strong:rgba(126,170,200,.32);
    --r-sm:6px; --r-md:10px;
    --sans:"Barlow", system-ui, -apple-system, "Segoe UI", sans-serif;
    --cond:"Barlow Condensed", "Barlow", system-ui, sans-serif;
    --gutter:16px;
  }
  *{box-sizing:border-box}
  html{-webkit-text-size-adjust:100%}
  body{margin:0; background:var(--void); color:var(--text); font-family:var(--sans); font-size:16px; line-height:1.55; -webkit-font-smoothing:antialiased}
  body::before{content:""; position:fixed; inset:0 0 auto; height:60vh; pointer-events:none; z-index:0;
    background:radial-gradient(900px 480px at 8% -12%, color-mix(in srgb, var(--prog) 16%, transparent), transparent 62%)}
  .wrap{position:relative; z-index:1; max-width:1120px; margin:0 auto; padding:0 var(--gutter)}
  a{color:var(--accent-2); text-decoration:none}
  a:hover{text-decoration:underline}
  :focus-visible{outline:2px solid var(--accent); outline-offset:2px; border-radius:var(--r-sm)}
  .skip{position:absolute; left:-9999px; top:0; background:var(--raised); padding:10px 14px; border-radius:var(--r-sm); z-index:40}
  .skip:focus{left:var(--gutter); top:8px}
  .eyebrow{font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.16em; font-size:11.5px; color:var(--dim); margin:0}
  header.top{position:sticky; top:0; z-index:30; background:rgba(5,10,16,.92); border-bottom:1px solid var(--edge); backdrop-filter:blur(8px)}
  .top-in{display:flex; gap:12px; align-items:center; justify-content:space-between; min-height:50px; padding:8px var(--gutter); max-width:1120px; margin:0 auto}
  .brandline{font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.1em; font-size:12px; color:var(--muted); margin:0; flex:1 1 auto; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
  .back{font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.09em; font-size:12.5px; white-space:nowrap}
  .hero{padding:28px 0 4px}
  .hero h1{font-family:var(--cond); font-weight:700; text-transform:uppercase; letter-spacing:.012em; font-size:clamp(28px,7.2vw,52px); line-height:1.04; margin:10px 0 0; text-wrap:balance}
  .union{margin:10px 0 0; color:var(--prog); font-weight:600; font-size:15px}
  .cert{margin:6px 0 0; color:var(--muted); font-size:14px; max-width:80ch}
  .summary{margin:14px 0 0; font-size:16px; color:var(--text); max-width:72ch}
  .stats{display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin:22px 0 0}
  .stat{background:var(--panel); border:1px solid var(--edge); border-radius:var(--r-md); padding:12px 14px}
  .stat b{display:block; font-family:var(--cond); font-weight:700; font-size:28px; line-height:1.1; font-variant-numeric:tabular-nums}
  .stat span{font-size:12.5px; color:var(--muted)}
  .stat.warn b{color:var(--warn)}
  .gapnote{margin:12px 0 0; padding:10px 13px; border-left:2px solid var(--warn); background:rgba(242,193,75,.06); border-radius:0 var(--r-sm) var(--r-sm) 0; font-size:13.5px; color:var(--muted); max-width:86ch}
  .gapnote b{color:var(--text)}
  section.block{margin:38px 0 0; scroll-margin-top:64px}
  section.block > h2{font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.05em; font-size:clamp(19px,4.6vw,25px); margin:0}
  .sub{margin:6px 0 0; font-size:13.5px; color:var(--muted); max-width:78ch}
  .legend{display:flex; flex-wrap:wrap; gap:6px; margin:12px 0 0}
  .band{margin:18px 0 0}
  .band h3{font-family:var(--cond); font-weight:600; font-size:13px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); margin:0 0 6px}
  ol.levels{list-style:none; margin:0; padding:0; display:grid; gap:8px}
  .level{display:grid; grid-template-columns:44px 1fr; gap:12px; padding:12px 13px; background:linear-gradient(180deg,var(--panel-2),var(--panel)); border:1px solid var(--edge); border-left:3px solid var(--prog); border-radius:var(--r-sm)}
  .level.partial{border-left-color:var(--warn)}
  .lvl-n{font-family:var(--cond); font-weight:700; font-size:26px; line-height:1; text-align:center; color:var(--prog); font-variant-numeric:tabular-nums}
  .level.partial .lvl-n{color:var(--warn)}
  .lvl-head{display:flex; flex-wrap:wrap; align-items:baseline; gap:6px 12px}
  .lvl-head h4{margin:0; font-family:var(--cond); font-weight:600; font-size:18px; letter-spacing:.015em}
  .lessons{font-size:13px; color:var(--muted); font-variant-numeric:tabular-nums}
  .lessons b{color:var(--text)}
  .flag{display:inline-block; padding:1px 7px; border-radius:5px; font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; background:var(--edge); color:var(--muted)}
  .flag.warn{background:rgba(242,193,75,.16); color:var(--warn)}
  .flag.ok{background:rgba(89,201,123,.16); color:var(--good)}
  ol.tasks{list-style:none; margin:8px 0 0; padding:0; display:flex; flex-wrap:wrap; gap:6px}
  .task{display:inline-flex; align-items:center; gap:6px; padding:4px 8px 4px 9px; border-radius:var(--r-sm); background:var(--raised); border:1px solid var(--edge); font-size:13px; color:var(--text)}
  .task:hover{background:var(--raised-2); text-decoration:none}
  .task .st{font-variant-numeric:tabular-nums; color:var(--dim); font-size:11.5px}
  .chip{display:inline-block; padding:0 7px; border-radius:9px; font-size:11px; font-weight:600; white-space:nowrap; background:var(--edge); color:var(--text)}
  .chip.time{background:rgba(242,193,75,.16); color:#f2d27f}
  .chip.weather{background:rgba(79,209,255,.16); color:#8fe0ff}
  .chip.hazard{background:rgba(240,100,91,.18); color:#ff9b93}
  .chip.interrupt{background:rgba(160,121,255,.2); color:#c7b2ff}
  .chip.variant{background:rgba(89,201,123,.18); color:#8fe3a8}
  .lvl-foot{margin:8px 0 0; display:flex; flex-wrap:wrap; gap:6px 14px; font-size:12.5px; color:var(--dim)}
  .lvl-foot a{font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.08em; font-size:12px}
  .grid{display:grid; gap:12px; margin:14px 0 0; grid-template-columns:1fr}
  .station{display:flex; flex-direction:column; background:linear-gradient(180deg,var(--panel-2),var(--panel)); border:1px solid var(--edge); border-top:2px solid var(--tint,var(--prog)); border-radius:var(--r-md); overflow:hidden}
  .shot{display:block; aspect-ratio:16/9; width:100%; object-fit:cover; background:var(--raised)}
  .noshot{display:flex; align-items:center; justify-content:center; aspect-ratio:16/9; background:repeating-linear-gradient(135deg,var(--panel),var(--panel) 10px,var(--panel-2) 10px,var(--panel-2) 20px); color:var(--dim); font-size:12.5px}
  .st-body{padding:12px 14px 14px; display:flex; flex-direction:column; gap:6px; flex:1}
  .st-body h3{margin:0; font-family:var(--cond); font-weight:600; font-size:19px; letter-spacing:.015em}
  .st-meta{margin:0; font-size:12.5px; color:var(--dim); font-variant-numeric:tabular-nums}
  .why{margin:0; font-size:13.5px; color:var(--muted)}
  .st-std{margin:0; padding:0 0 0 16px; font-size:12.5px; color:var(--muted)}
  .st-std li{margin:1px 0}
  .runs{display:flex; flex-wrap:wrap; gap:5px}
  .run{display:inline-flex; align-items:center; gap:4px; white-space:nowrap}
  .runs{row-gap:4px; column-gap:10px}
  .runs a:hover{text-decoration:none; filter:brightness(1.15)}
  .launch{margin-top:auto; padding-top:6px; font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.1em; font-size:12.5px}
  .launch::after{content:" \\2192"}
  table.std{width:100%; border-collapse:collapse; margin:14px 0 0; font-size:13.5px}
  table.std th{font-family:var(--cond); font-weight:600; font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); text-align:left; padding:6px 8px; border-bottom:1px solid var(--edge-strong)}
  table.std td{padding:7px 8px; border-bottom:1px solid var(--edge); vertical-align:top}
  table.std td.n{font-variant-numeric:tabular-nums; color:var(--muted); white-space:nowrap}
  .tablewrap{overflow-x:auto; -webkit-overflow-scrolling:touch}
  .proof{display:grid; gap:12px; margin:14px 0 0; grid-template-columns:1fr}
  .card{background:var(--panel); border:1px solid var(--edge); border-radius:var(--r-md); padding:14px 16px}
  .card h3{margin:0 0 6px; font-family:var(--cond); font-weight:600; font-size:18px}
  .card p, .card li{font-size:13.5px; color:var(--muted)}
  .card p{margin:6px 0 0}
  .card ul{margin:6px 0 0; padding-left:18px}
  footer{margin:52px 0 0; border-top:1px solid var(--edge); background:var(--panel)}
  .foot{padding:22px var(--gutter) 36px; max-width:1120px; margin:0 auto; font-size:13px; color:var(--dim)}
  .foot p{margin:0 0 8px; max-width:86ch}
  @media (min-width:560px){ .stats{grid-template-columns:repeat(4,1fr)} .grid{grid-template-columns:1fr 1fr} .proof{grid-template-columns:1fr 1fr} }
  @media (min-width:900px){ .hero{padding:44px 0 6px} .grid{grid-template-columns:repeat(3,1fr)} }
  @media (prefers-reduced-motion:reduce){ *{transition:none !important; animation:none !important} }
`;

// -------------------------------------------------------------------- render

const BANDS = [
  ["Orientation and single procedures", 1, 5, "base run, then daylight and dusk"],
  ["Weather and the hour", 6, 10, "rain, wind, fog, storm, smoke; an indoor station takes the hour instead"],
  ["Hazard mode and interruptions", 11, 14, "assessed hazard mode; declared interruptions fired off their authored step"],
  ["Station chains", 15, 18, "two or more stations back to back, one run under a declared interruption"],
  ["Full shift", 19, 19, "five or more of the programme's hardest jobs"],
  ["Capstone", 20, 20, "the hardest stations as assessment variants, no coaching, mastery rule"],
];

function chip(condition) {
  const k = parseCondition(condition)?.kind ?? "base";
  return `<span class="chip ${k}">${esc(conditionLabel(condition))}</span>`;
}

function levelRow(prog, ladder, lv) {
  const tasks = lv.tasks.map((t) => {
    const name = ladder.stations[`${t.app}:${t.id}`]?.name ?? t.id;
    return `            <li><a class="task" href="${taskHref(t.app, t.id, t.condition)}">${esc(name)}${t.app === "trades" ? " (Trade Skills)" : ""} ${chip(t.condition)} <span class="st">${t.steps}</span></a></li>`;
  }).join("\n");
  const flag = lv.partial
    ? `<span class="flag warn">partial · ${lv.shortfall} lessons short</span>`
    : `<span class="flag ok">${LESSON_BAR}+ lessons</span>`;
  return `        <li class="level${lv.partial ? " partial" : ""}" id="level-${lv.n}">
          <span class="lvl-n">${lv.n}</span>
          <div>
            <div class="lvl-head"><h4>${esc(lv.title)}</h4><span class="lessons"><b>${lv.lessons}</b> lessons · ${lv.tasks.length} task${lv.tasks.length === 1 ? "" : "s"}</span>${flag}${lv.coaching ? "" : ` <span class="flag">no coaching</span>`}</div>
            <ol class="tasks">
${tasks}
            </ol>
            <p class="lvl-foot"><span>${lv.standards.length} standard${lv.standards.length === 1 ? "" : "s"} evidenced</span>${lv.interruptions.length ? `<span>${lv.interruptions.length} interruptions an instructor can inject</span>` : ""}<a href="${levelHref(prog.id, lv.n)}">Open level ${lv.n} in SmartCiti.X</a></p>
          </div>
        </li>`;
}

function stationCard(prog, ladder, s, standards, thumbs) {
  const key = `${s.app}:${s.id}`;
  const row = ladder.stations[key];
  const runs = [];
  for (const lv of ladder.levels) for (const t of lv.tasks) if (t.app === s.app && t.id === s.id) runs.push({ n: lv.n, condition: t.condition });
  const byCond = new Map();
  for (const r of runs) { if (!byCond.has(r.condition)) byCond.set(r.condition, []); byCond.get(r.condition).push(r.n); }
  const runChips = [...byCond].map(([c, ns]) => `<span class="run"><a href="${taskHref(s.app, s.id, c)}">${chip(c)}</a> <span class="st-meta">L${ns.join(", L")}</span></span>`).join(" ");
  const thumb = thumbs.has(s.id)
    ? `<img class="shot" src="img/${slug(s.id, "station id")}.jpg" alt="" loading="lazy" width="480" height="270">`
    : `<div class="noshot">No screenshot in docs/screenshots yet</div>`;
  const std = row.standards.map((id) => standards[id]).filter(Boolean);
  return `        <article class="station" style="--tint:${tint(s.accent)}">
          ${thumb}
          <div class="st-body">
            <p class="eyebrow">${esc(s.app === "trades" ? "Trade Skills room" : s.category ?? "Station")}</p>
            <h3>${esc(row.name)}</h3>
            <p class="st-meta">${row.steps} steps · ${row.hazards} hazards · ${row.interrupts.length} interruptions · par ${Math.round(row.parSeconds / 60 * 10) / 10} min${row.indoor ? " · indoors" : ""}</p>
            <p class="why">${esc(s.why)}</p>
            ${std.length ? `<ul class="st-std">${std.map((e) => `<li>${esc(e.body)} — ${esc(e.title)}</li>`).join("")}</ul>` : `<p class="st-meta">No registry standard cited in its category.</p>`}
            <div class="runs">${runChips || `<span class="st-meta">Not on the ladder yet.</span>`}</div>
            <a class="launch" href="${taskHref(s.app, s.id, "base")}">Launch ${esc(row.name)}</a>
          </div>
        </article>`;
}

/** One programme's page. `ctx` carries the catalog entry, the ladder, the standards lookup, the competencies and the thumbnail set. */
export function renderTrack(ctx) {
  const { prog, ladder, standards, competency, coreCompetencies, compStandard, thumbs, network, mastery } = ctx;
  const id = slug(prog.id, "programme id");
  const accent = tint(prog.accent ?? ladder.accent);
  const g = ladder.gap;
  const stations = prog.stations.filter((s, i, a) => a.findIndex((x) => x.app === s.app && x.id === s.id) === i)
    .map((s) => ({ ...s, ...(ctx.catalogStation(s) ?? {}), why: s.why }));
  const bands = BANDS.map(([title, a, b, note]) => `      <div class="band">
        <h3>Levels ${a === b ? a : `${a}–${b}`} · ${esc(title)} <span class="sub">— ${esc(note)}</span></h3>
        <ol class="levels">
${ladder.levels.filter((lv) => lv.n >= a && lv.n <= b).map((lv) => levelRow(prog, ladder, lv)).join("\n")}
        </ol>
      </div>`).join("\n");
  // Standards the track evidences: every level's registry hits, with the levels that reach each.
  const stdLevels = new Map();
  for (const lv of ladder.levels) for (const s of lv.standards) { if (!stdLevels.has(s)) stdLevels.set(s, []); stdLevels.get(s).push(lv.n); }
  const stdRows = [...stdLevels].map(([sid, ns]) => ({ sid, e: standards[sid], ns }))
    .filter((r) => r.e).sort((a, b) => a.e.body.localeCompare(b.e.body) || a.e.title.localeCompare(b.e.title))
    .map((r) => `          <tr><td>${esc(r.e.body)}</td><td>${esc(r.e.title)}</td><td class="n">${r.ns.length === LADDER_LEVELS ? "all 20" : r.ns.length > 6 ? `${r.ns.length} levels` : `L${r.ns.join(", L")}`}</td></tr>`).join("\n");
  const conds = [...new Set(ladder.levels.flatMap((lv) => lv.tasks.map((t) => parseCondition(t.condition).kind)))];
  const legend = ["base", "time:day", "weather:rain", "hazard", "interrupt:x", "variant:assessment"]
    .filter((c) => conds.includes(parseCondition(c).kind))
    .map((c) => (c === "interrupt:x" ? `<span class="chip interrupt">interruption</span>` : chip(c))).join(" ");
  const gapNote = g.full === LADDER_LEVELS
    ? `<p class="gapnote"><b>Every level reaches ${LESSON_BAR} lessons.</b> A lesson is one station step run under one condition; each level's number is its tasks' steps added up from the station modules.</p>`
    : `<p class="gapnote"><b>${g.partial} of ${LADDER_LEVELS} levels ${g.partial === 1 ? "is" : "are"} partial</b> — ${g.shortfall} lessons short in total. ${g.stationsNeeded ? `About <b>${g.stationsNeeded} more station${g.stationsNeeded === 1 ? "" : "s"}</b> of 13 steps would bring every level to ${LESSON_BAR}; content teams write them, and nothing on this page is padded to hide the gap.` : ""}${g.overridePartial.length ? ` Level${g.overridePartial.length === 1 ? "" : "s"} ${g.overridePartial.join(", ")} ${g.overridePartial.length === 1 ? "is" : "are"} hand-tuned and short by choice until the override is edited.` : ""}</p>`;
  const compStd = (competency?.standards ?? []).map((sid) => compStandard(sid));
  const cores = coreCompetencies.map((c) => `<li>${esc(c.title)} <span class="st-meta">(${c.shared} of this track's stations count toward it)</span></li>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(prog.name)} — training track</title>
<meta name="description" content="${esc(`${prog.name}: a twenty-level training track, ${ladder.lessons} lessons across ${stations.length} stations.`)}">
<meta name="generator" content="tools/gen_tracks.mjs">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&amp;family=Barlow:wght@400;500;600&amp;display=swap">
<style>${CSS}</style>
</head>
<body style="--prog:${accent}">
<!-- Generated by tools/gen_tracks.mjs from WebXR/smartcity/js/ladders.js and WebXR/smartcity/catalog.json — edit the generator, not this file. -->
<a class="skip" href="#ladder">Skip to the ladder</a>
<header class="top">
  <div class="top-in">
    <p class="brandline">${esc(network)} · training track</p>
    <a class="back" href="${TRACK_LINKS.home}">All stations</a>
  </div>
</header>
<main class="wrap">
  <section class="hero">
    <p class="eyebrow">Training track · ${stations.length} stations · ${LADDER_LEVELS} levels · ${ladder.lessons} lessons</p>
    <h1>${esc(prog.name)}</h1>
    <p class="union">${esc(prog.union)}</p>
    <p class="cert">${esc(prog.certification)}</p>
    <p class="summary">${esc(prog.summary)}</p>
    <div class="stats">
      <div class="stat${g.full < LADDER_LEVELS ? " warn" : ""}"><b>${g.full} / ${LADDER_LEVELS}</b><span>levels at ${LESSON_BAR}+ lessons</span></div>
      <div class="stat"><b>${ladder.lessons}</b><span>lessons across the track</span></div>
      <div class="stat"><b>${ladder.levels.reduce((a, lv) => a + lv.tasks.length, 0)}</b><span>tasks: a station under a condition</span></div>
      <div class="stat${g.stationsNeeded ? " warn" : ""}"><b>${g.stationsNeeded ?? "60+"}</b><span>${g.stationsNeeded === 0 && g.partial ? "more stations needed: the short level is a hand-tuned override" : "more stations needed to fill it"}</span></div>
    </div>
    ${gapNote}
  </section>

  <section class="block" id="ladder">
    <h2>The ladder</h2>
    <p class="sub">Level 1 is open; each level opens when the one below is passed — every task in one run of it a mastery run. A task opens its station with its condition; the number after each task is its steps.</p>
    <div class="legend">${legend}</div>
${bands}
  </section>

  <section class="block" id="stations">
    <h2>Stations</h2>
    <p class="sub">Every station in the programme, the conditions the ladder runs it under (each chip launches that run, with the levels it appears in), and the standards its own source cites.</p>
    <div class="grid">
${stations.map((s) => stationCard(prog, ladder, s, standards, thumbs)).join("\n")}
    </div>
  </section>

  <section class="block" id="standards">
    <h2>Standards evidenced</h2>
    <p class="sub">Registry entries (tools/standards.json) that a task's own source cites and that govern its category, with the levels that evidence each. Evidencing readiness against a standard is not a licence or a certification issued by its body.</p>
    <div class="tablewrap"><table class="std">
      <thead><tr><th>Body</th><th>Standard</th><th>Levels</th></tr></thead>
      <tbody>
${stdRows}
      </tbody>
    </table></div>
  </section>

  <section class="block" id="proves">
    <h2>What it proves</h2>
    <div class="proof">
      <div class="card">
        <h3>Competency: ${esc(competency?.title ?? prog.name)}</h3>
        <p>${competency ? `Demonstrated with a mastery run on ${competency.require} of its ${competency.stations.length} stations${compStd.length ? `, against ${compStd.map((s) => `${esc(s.body)} ${esc(s.title)}`).join("; ")}` : ""}.` : "No programme competency is registered for this track."}</p>
        ${cores ? `<p>These stations also count toward:</p><ul>${cores}</ul>` : ""}
      </div>
      <div class="card">
        <h3>Badges</h3>
        <p>Each passed level earns an Open Badges 2.0 assertion naming the level, its tasks and their conditions, its lessons and the standards it evidences, with the attempts behind it as evidence, and sends an xAPI statement. Passing level ${LADDER_LEVELS}, the capstone, climbs the whole track.</p>
        <p>${esc(mastery)}</p>
        <p>Certification the work leads to: ${esc(prog.certification)}. No level claims apprenticeship hours: no registry entry states an equivalence.</p>
      </div>
    </div>
  </section>
</main>
<footer>
  <div class="foot">
    <p>Generated from the programme's station modules: lesson counts are read, not typed. The rules are in tools/briefs/ladder-brief.md and the full table in docs/ladders.md.</p>
    <p><a href="${TRACK_LINKS.home}">Back to every station</a> · ${esc(network)}</p>
  </div>
</footer>
</body>
</html>
`;
}

// ------------------------------------------------------ homepage section

const SECTION_CSS = `
  .tracks{margin:34px 0 0}
  .tracks h2{font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.05em; font-size:clamp(19px,4.6vw,25px); margin:0}
  .track-grid{display:grid; gap:10px; margin:14px 0 0; grid-template-columns:1fr}
  .track-card{display:block; padding:13px 14px; background:linear-gradient(180deg,var(--panel-2),var(--panel)); border:1px solid var(--edge); border-top:2px solid var(--tint,var(--accent)); border-radius:var(--r-sm); color:inherit}
  .track-card:hover{background:var(--raised); text-decoration:none}
  .track-card b{display:block; font-family:var(--cond); font-weight:600; font-size:17px; letter-spacing:.02em}
  .track-card .u{display:block; font-size:12px; color:var(--muted); margin-top:2px}
  .track-card .n{display:block; margin-top:8px; font-size:12.5px; color:var(--text); font-variant-numeric:tabular-nums}
  .track-card .n em{font-style:normal; color:var(--warn)}
  .track-meter{display:block; height:4px; margin-top:8px; border-radius:2px; background:var(--edge); overflow:hidden}
  .track-meter i{display:block; height:100%; background:var(--tint,var(--accent))}
  @media (min-width:560px){ .track-grid{grid-template-columns:1fr 1fr} }
  @media (min-width:900px){ .track-grid{grid-template-columns:repeat(3,1fr)} }
`;

/** Where a track page is, from the homepage in each of gen_home.mjs's two layouts. */
export const TRACK_HREF = { repo: (id) => `dist/tracks/${id}.html`, flat: (id) => `tracks/${id}.html` };

/**
 * The homepage's "Training tracks" section: a card per programme linking to
 * its track page, with its level and lesson counts from catalog.json (which
 * gen_catalog.mjs fills from the ladders). Plain text only; ids as slugs.
 */
export function tracksSection(catalog, layoutName = "repo") {
  const href = TRACK_HREF[layoutName];
  if (!href) throw new Error(`unknown layout: ${layoutName}`);
  const list = (catalog.curricula ?? []).filter((c) => c.ladder);
  const totalLessons = list.reduce((a, c) => a + c.ladder.lessons, 0);
  const cards = list.map((c) => {
    const id = slug(c.id, "programme id");
    const l = c.ladder;
    const pct = Math.round((l.atBar / l.levels) * 100);
    return `      <a class="track-card" style="--tint:${tint(c.accent)}" href="${href(id)}">
        <b>${esc(c.name)}</b>
        <span class="u">${esc(c.union ?? "")}</span>
        <span class="n">${l.levels} levels · ${l.lessons} lessons · ${l.atBar === l.levels ? `all ${l.levels} at ${l.lessonBar}+` : `<em>${l.atBar} of ${l.levels} at ${l.lessonBar}+</em>`}</span>
        <span class="track-meter"><i style="width:${pct}%"></i></span>
      </a>`;
  }).join("\n");
  return `  <section class="tracks" id="tracks">
    <style>${SECTION_CSS}</style>
    <h2>Training tracks</h2>
    <p class="sub">Every programme as a twenty-level track: ${list.length} tracks, ${totalLessons} lessons. A lesson is one station step under one condition — the hour, the weather, hazard mode, an injected interruption or an assessment variant — and each page shows the ladder, the stations, the standards and the gaps still to fill.</p>
    <div class="track-grid">
${cards}
    </div>
  </section>`;
}

// ---------------------------------------------------------------------- main

/** Everything renderTrack needs for every programme, read from the generated files. */
export async function trackContext() {
  const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
  // A fresh copy of ladders.js: gen_catalog.mjs rewrites it earlier in the same process.
  const ladUrl = `${pathToFileURL(join(WEBXR, "smartcity/js/ladders.js")).href}?t=${statSync(join(WEBXR, "smartcity/js/ladders.js")).mtimeMs}`;
  const { LADDER_BY_PROGRAMME, LADDER_STANDARDS } = await import(ladUrl);
  const comp = await import("../WebXR/shared/competency.js");
  const byKey = new Map(catalog.stations.map((s) => [`${s.app}:${s.id}`, s]));
  const allIds = catalog.stations.map((s) => s.id);
  const shots = screenshotIndex(allIds);
  return { catalog, LADDER_BY_PROGRAMME, LADDER_STANDARDS, comp, byKey, shots };
}

export function renderAll(tc) {
  const { catalog, LADDER_BY_PROGRAMME, LADDER_STANDARDS, comp, byKey } = tc;
  const thumbs = new Set(existsSync(THUMB_DIR) ? readdirSync(THUMB_DIR).filter((f) => f.endsWith(".jpg")).map((f) => f.slice(0, -4)) : []);
  const out = new Map();
  for (const prog of catalog.curricula) {
    const ladder = LADDER_BY_PROGRAMME[prog.id];
    if (!ladder) throw new Error(`no ladder for ${prog.id}`);
    const ids = new Set(prog.stations.map((s) => s.id));
    const coreCompetencies = comp.CORE_COMPETENCIES
      .map((c) => ({ title: c.title, shared: c.stations.filter((s) => ids.has(s)).length }))
      .filter((c) => c.shared > 0);
    const html = renderTrack({
      prog: { ...prog, accent: ladder.accent }, ladder, standards: LADDER_STANDARDS,
      competency: comp.COMPETENCY_BY_ID[prog.id] ?? null, coreCompetencies, compStandard: comp.standard,
      thumbs, network: catalog.network ?? "Training simulators", mastery: comp.MASTERY.text,
      catalogStation: (s) => byKey.get(`${s.app}:${s.id}`),
    });
    out.set(prog.id, html);
  }
  return out;
}

export async function writeTracks({ thumbs = false } = {}) {
  const tc = await trackContext();
  mkdirSync(TRACK_DIR, { recursive: true });
  let made = 0;
  // Only a station some programme names gets a card, so only those get a thumbnail.
  const onTracks = new Set(tc.catalog.curricula.flatMap((c) => c.stations.map((s) => s.id)));
  const wanted = new Map([...tc.shots].filter(([id]) => onTracks.has(id)));
  if (thumbs) made = await buildThumbs(wanted);
  const pages = renderAll(tc);
  for (const [id, html] of pages) writeFileSync(join(TRACK_DIR, `${id}.html`), html);
  const missing = [...wanted.keys()].filter((id) => !existsSync(thumbPath(id)));
  console.log(`Wrote ${pages.size} track pages to WebXR/home/tracks/${thumbs ? ` (${made} thumbnails rebuilt)` : ""}`
    + (missing.length ? ` — ${missing.length} screenshot(s) have no thumbnail yet: run node tools/gen_tracks.mjs --thumbs` : ""));
  return pages;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await writeTracks({ thumbs: process.argv.includes("--thumbs") });
