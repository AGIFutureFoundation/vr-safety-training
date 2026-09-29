/**
 * Generates the homepage — WebXR/index.html, plus WebXR/home.html for the
 * flat single-file dist layout — from WebXR/smartcity/catalog.json.
 *
 *     node tools/gen_home.mjs
 *
 * It is run at the end of tools/gen_catalog.mjs, so the page cannot drift from
 * the roster: every station in the catalog gets a card with a working deep
 * link, every category gets a section, every programme gets a rail chip, and
 * the counts in the hero are counted rather than written.
 *
 * Two rules the checker (tools/check_home.mjs) holds this file to:
 *
 *  1. **Catalog strings reach the page as text, never as markup.** Every name,
 *     tagline, trade, certification and category goes through esc() into a text
 *     position. The only catalog values that ever land in an attribute are ids
 *     (in a deep link) and accent colours (in a CSS custom property), and both
 *     are refused unless they match a strict pattern — so a station added
 *     tomorrow cannot inject anything into this page, whatever its fields say.
 *  2. **Every relative link resolves to a real file.** The two variants differ
 *     only in their links: WebXR/index.html uses the repository layout
 *     (smartcity/index.html?sim=…), WebXR/home.html the flat bundle layout
 *     (smartcity-x.html?sim=…) that tools/bundle_webxr.py copies into
 *     WebXR/dist/index.html beside the bundles.
 *
 * The palette tokens are the app's own, lifted from WebXR/smartcity/index.html
 * so the homepage and the simulators are visibly one product.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tracksSection } from "./gen_tracks.mjs";
import { CN_CSS, cnFile } from "../WebXR/shared/cinema.js";
import { wfHeadFor } from "./gen_seo.mjs";
import { wfSearchScript } from "./wf_search.mjs";
import { atIllustration } from "../WebXR/shared/illustrations.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
// Which programmes each world's job boards carry — read from the worlds' own
// data, so the finder's "World" filter can never claim a board that is not there.
const { BAY_SITES } = await import(pathToFileURL(join(WEBXR, "shared", "bayworld-data.js")).href);
const { DEEP_SITES } = await import(pathToFileURL(join(WEBXR, "shared", "underwater-data.js")).href);
const { RW_SITES } = await import(pathToFileURL(join(WEBXR, "redwood", "js", "rw-data.js")).href);
const { SM_SITES } = await import(pathToFileURL(join(WEBXR, "shared", "summit-data.js")).href);
const { NP_PARISHES, npRegionGroups } = await import(pathToFileURL(join(WEBXR, "shared", "np-parishes.js")).href);
// The parishes page carries two regions: New Orleans (the Parishes card) and San Francisco (GOLDEN-B's districts card).
const NP_SF = NP_PARISHES.filter((p) => p.region === "san-francisco");
const NP_NOLA = NP_PARISHES.filter((p) => p.region !== "san-francisco");
// The Hard Hat Hunt counter's total (docs/easter-egg.md) — imported rather
// than retyped, so a station added to or removed from the hunt can never
// leave this page's footer counting against a stale number.
const { HARD_HAT_TOTAL } = await import(pathToFileURL(join(WEBXR, "shared", "eggs.js")).href);
const REPO = "https://github.com/AGIFutureFoundation/vr-safety-training";
// The English programme taglines and card lines (console BABEL, docs/i18n.md);
// the language layer swaps them for the chosen language on the page.
const HM_TAGLINES = JSON.parse(readFileSync(join(ROOT, "tools", "i18n", "en.json"), "utf8"));

// --------------------------------------------------------------- escaping

/** The only way a catalog string is allowed into this page. */
export function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** An id that is safe in a URL and in an attribute, or a build failure. */
function slug(id, what) {
  const s = String(id ?? "");
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(s)) throw new Error(`${what} is not a plain slug: ${JSON.stringify(id)}`);
  return s;
}

/** A six-digit hex colour, or the app's own accent. */
function tint(accent) {
  const s = String(accent ?? "");
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s.toLowerCase() : "var(--accent)";
}

// ------------------------------------------------------------ world thumbnails

/** Where tools/capture_home_thumbs.mjs writes the real in-game captures. */
export const HM_IMG_DIR = join(WEBXR, "home", "img");
export const HM_THUMB_MAX = 60 * 1024;

/**
 * A world's capture as a data URI, or null when it has not been captured yet.
 * Inlined rather than linked: the published single-file build caps its file
 * count, and a data URI costs no request.
 */
export function hmThumb(id) {
  const file = join(HM_IMG_DIR, `${slug(id, "world id")}.jpg`);
  if (!existsSync(file)) return null;
  const buf = readFileSync(file);
  if (buf.length > HM_THUMB_MAX) throw new Error(`${file} is ${buf.length} bytes — over the ${HM_THUMB_MAX}-byte cap; re-run tools/capture_home_thumbs.mjs`);
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

// ------------------------------------------------------ background loops

/** The recorded loops (console CINEMA, docs/home-backgrounds.md). */
export const HM_MEDIA_DIR = join(WEBXR, "home", "media");
export const HM_MEDIA_BUDGET = { hero: 2.5 * 1024 * 1024, card: 1.2 * 1024 * 1024 };

/** WebXR/home/media/backgrounds.json, or an empty list before one exists. */
export function hmBackgrounds() {
  const file = join(HM_MEDIA_DIR, "backgrounds.json");
  if (!existsSync(file)) return [];
  return JSON.parse(readFileSync(file, "utf8")).slots ?? [];
}

/**
 * One slot's files for a layout, or null when the slot is not listed or a
 * file is missing. File names are refused unless they are plain names in the
 * media folder; the credit line is text only.
 */
export function hmMedia(layout, slot) {
  const e = hmBackgrounds().find((s) => s.slot === slot);
  if (!e) return null;
  const plain = (n) => (cnFile(n) && existsSync(join(HM_MEDIA_DIR, n)) ? n : null);
  const src = plain(e.src), poster = plain(e.poster);
  if (!src || !poster) return null;
  const at = layout.media;
  return { src: at + src, poster: at + poster, webm: plain(e.webm) ? at + e.webm : null, kind: e.kind, credit: e.kind === "licensed" ? String(e.credit ?? "") : "" };
}

function hmVideoTag(m, slot, { autoplay }) {
  return `<video data-cn-slot="${slug(slot, "slot")}"${autoplay ? " autoplay" : ""} muted loop playsinline preload="metadata" poster="${m.poster}" aria-hidden="true" tabindex="-1">`
    + (m.webm ? `<source src="${m.webm}" type="video/webm">` : "")
    + `<source src="${m.src}" type="video/mp4"></video>`;
}

/** The hero's loop and its pause button (WCAG 2.2.2), or nothing. */
function hmHeroVideo(layout) {
  const m = hmMedia(layout, "hero");
  if (!m) return "";
  return `  <div class="cn-bg" aria-hidden="true" style="background-image:url('${m.poster}')">${hmVideoTag(m, "hero", { autoplay: true })}</div>
  <button class="cn-toggle" type="button" data-cn-toggle="hero" aria-pressed="false">Pause background</button>`
    + (m.credit ? `\n  <span class="cn-credit">${esc(m.credit)}</span>` : "");
}

/** A world card's loop over its capture, or nothing. The cards carry no
 *  autoplay attribute: autoplay would fetch every loop on first paint, so
 *  shared/cinema.js starts each one when it scrolls into view. */
function hmCardVideo(layout, slot) {
  const m = hmMedia(layout, slot);
  if (!m) return "";
  return `<span class="cn-bg" aria-hidden="true" style="background-image:url('${m.poster}')">${hmVideoTag(m, slot, { autoplay: false })}</span>`
    + (m.credit ? `<span class="cn-credit">${esc(m.credit)}</span>` : "");
}

// ------------------------------------------------------------ programme finder

/**
 * The union bodies a learner can filter by: the short names (IBEW, LIUNA,
 * UNITE HERE…) that recur across at least three programmes' union lines,
 * most common first. Counted from the catalog, never written here.
 */
export function hmUnionTokens(curricula) {
  const counts = new Map();
  for (const c of curricula) {
    const seen = new Set(hmTokensOf(c.union));
    for (const t of seen) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 18)
    .map(([token, count]) => ({ token, count }));
}

function hmTokensOf(union) {
  const s = String(union ?? "").replace(/UNITE HERE/g, "UNITE_HERE");
  return [...new Set((s.match(/\b[A-Z][A-Z_]*[A-Z]\b/g) ?? []).map((t) => t.replace("_", " ")))];
}

/** The worlds whose boards launch at least one of a programme's stations. */
function hmWorldsOf(c) {
  const out = [];
  const onBoard = (sites) => sites.some((s) => (s.programmes ?? []).includes(c.id));
  if (onBoard(BAY_SITES)) out.push("bayworld");
  if (onBoard(DEEP_SITES)) out.push("deep");
  if ((c.stations ?? []).some((s) => s.app === "smartcity")) out.push("smartcity");
  if ((c.stations ?? []).some((s) => s.app === "trades")) out.push("trades");
  return out;
}

export const HM_WORLD_FILTERS = [["bayworld", "Bay World"], ["deep", "The Deep"], ["smartcity", "SmartCiti.X"], ["trades", "Trade Skills Simulator"]];

// ----------------------------------------------------------- device profile

/**
 * The device line, read out of docs/devices.md rather than written here, so it
 * cannot claim a device the device layer does not describe. Takes the count of
 * run profiles, the count of device rows, and the first device named in each
 * class section.
 */
export function deviceLine(devicesMd) {
  const lines = devicesMd.split("\n");
  let profiles = 0, section = null;
  const classes = [];
  const rows = new Set();
  for (const line of lines) {
    const heading = /^###\s+(.+?)\s*$/.exec(line);
    if (heading) {
      const title = heading[1].replace(/\s*\(.*\)\s*$/, "");
      // Mid-sentence, so lower-case the first word — unless it is an acronym
      // the doc capitalised on purpose ("VR headsets" must not become "vr").
      const first = title.split(" ")[0];
      section = first === first.toUpperCase() ? title : title[0].toLowerCase() + title.slice(1);
      continue;
    }
    if (/^##\s/.test(line)) { if (!/devices, by class/.test(line)) section = null; continue; }
    const cells = /^\|(.+)\|\s*$/.exec(line);
    if (!cells) continue;
    const cols = cells[1].split("|").map((c) => c.trim());
    if (/^-+$/.test(cols[0].replace(/[-:]/g, "-"))) continue;
    // A run-profile row: the profile table's first column is a bare profile id.
    if (/^(desktop|vr|hands|mr|seethrough|assisted)$/.test(cols[0])) { profiles += 1; continue; }
    const id = /^`([a-z0-9-]+)`$/.exec(cols[1] ?? "");
    if (!id || !section) continue;
    rows.add(id[1]);
    if (!classes.some((c) => c.section === section)) classes.push({ section, device: cols[0] });
  }
  const named = classes.map((c) => `${c.device} (${c.section})`).join(", ");
  return `Works in any desktop, tablet or phone browser, and on the ${rows.size} head-worn devices the device layer describes — ${named}. `
    + `${profiles} run profiles resize the HUD, drop the weather and name the right verb for the display in front of the wearer’s eye.`;
}

// ------------------------------------------------------------------ linking

/**
 * The two layouts. `repo` is the source tree as served; `flat` is the
 * single-file bundle folder, where each app is one HTML file next to the page.
 */
const LAYOUTS = {
  repo: {
    out: "index.html",
    media: "home/media/",
    // The Guide's links point into the published folder (console COMPASS).
    guideRoot: "./dist/",
    app: { smartcity: "smartcity/index.html", trades: "trades/index.html", holodeck: "holodeck/index.html", instructor: "instructor/index.html", fairway: "fairway/index.html", bayworld: "bayworld/index.html", regatta: "regatta/regatta.html", underwater: "underwater/underwater.html", redwood: "redwood/redwood.html", summit: "summit/index.html", parishes: "parishes/parishes.html" },
    aside: { atlas: "bayworld/atlas.html", portal: "portal/index.html", verify: "verify/index.html", campus: "campus/index.html" },
    doc: (name) => `../docs/${name}`,
    accessibility: "ACCESSIBILITY.md",
    catalog: "smartcity/catalog.json",
    egg: "race/index.html",
    note: "Deep links, categories and launch parameters for every station are in",
  },
  flat: {
    out: "home.html",
    media: "media/",
    guideRoot: "./",
    app: { smartcity: "smartcity-x.html", trades: "trade-skills-simulator.html", holodeck: "holodeck.html", instructor: "instructor-console.html", fairway: "fairway.html", bayworld: "bayworld.html", regatta: "regatta.html", underwater: "underwater.html", redwood: "redwood.html", summit: "summit.html", parishes: "parishes.html" },
    // The portal, the verifier and the Safety Campus page have no single-file
    // bundle, so in the flat layout they are named where they actually live
    // rather than linked to a file that is not in the folder.
    aside: { atlas: "atlas.html", portal: `${REPO}/tree/main/WebXR/portal`, verify: `${REPO}/tree/main/WebXR/verify`, campus: `${REPO}/tree/main/WebXR/campus` },
    doc: (name) => `${REPO}/blob/main/docs/${name}`,
    accessibility: `${REPO}/blob/main/WebXR/ACCESSIBILITY.md`,
    catalog: `${REPO}/blob/main/WebXR/smartcity/catalog.json`,
    egg: "race.html",
    note: "Deep links, categories and launch parameters for every station are in",
  },
};

/** A station's deep link in the given layout, built from its id. */
function stationHref(layout, station) {
  const id = slug(station.id, `station id (${station.app})`);
  if (station.app === "trades") return `${layout.app.trades}?room=${id}`;
  return `${layout.app.smartcity}?sim=${id}`;
}

// -------------------------------------------------------------------- render

const CSS = `
  :root{
    --void:var(--at-bg, #050a10); --panel:var(--at-surface, #0b141d); --panel-2:var(--at-surface-2, #101b27); --raised:var(--at-raised, #142130); --raised-2:var(--at-raised-2, #192a3b);
    --text:var(--at-on-surface, #edf6fb); --muted:var(--at-on-surface-muted, #93b2c3); --dim:var(--at-on-surface-dim, #6f8ea2);
    --accent:var(--at-primary, #4fd1ff); --accent-2:var(--at-primary-strong, #7ee6ff); --accent-ink:var(--at-on-primary, #03202b); --violet:var(--at-secondary, #a079ff);
    --warn:var(--at-warning, #f2c14b); --danger:var(--at-danger, #f0645b); --good:var(--at-success, #59c97b);
    --edge:var(--at-border, rgba(126,170,200,.16)); --edge-strong:var(--at-border-strong, rgba(126,170,200,.32));
    --r-sm:var(--at-r-sm, 6px); --r-md:var(--at-r-md, 10px); --r-lg:var(--at-r-lg, 14px);
    --shadow-1:var(--at-elev-1, 0 6px 18px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.04));
    --shadow-2:var(--at-elev-3, 0 24px 60px rgba(0,0,0,.55));
    --ring:0 0 0 3px rgba(79,209,255,.22);
    --sans:"Barlow", system-ui, -apple-system, "Segoe UI", sans-serif;
    --cond:"Barlow Condensed", "Barlow", system-ui, sans-serif;
    --surface-card:linear-gradient(180deg, var(--panel-2), var(--panel));
    --gutter:16px;
    --guide-space:84px;
  }
  *{box-sizing:border-box}
  html{-webkit-text-size-adjust:100%}
  body{
    margin:0; background:var(--void); color:var(--text);
    font-family:var(--sans); font-size:16px; line-height:1.55;
    -webkit-font-smoothing:antialiased;
  }
  body::before{
    content:""; position:fixed; inset:0 0 auto; height:60vh; pointer-events:none; z-index:0;
    background:
      radial-gradient(900px 480px at 8% -12%, rgba(79,209,255,.10), transparent 62%),
      radial-gradient(900px 480px at 92% -6%, rgba(160,121,255,.09), transparent 62%);
  }
  .wrap{position:relative; z-index:1; max-width:1120px; margin:0 auto; padding:0 var(--gutter)}
  a{color:var(--accent-2); text-decoration:none}
  a:hover{text-decoration:underline}
  :focus-visible{outline:2px solid var(--accent); outline-offset:2px; border-radius:var(--r-sm)}
  .skip{position:absolute; inset-inline-start:-9999px; top:0; background:var(--raised); padding:10px 14px; border-radius:var(--r-sm); z-index:40}
  .skip:focus{inset-inline-start:var(--gutter); top:8px}
  /* Readable copy on a phone (console WAYFINDER): card and section text at 16 px. */
  @media (max-width:700px){ body:not(#wf) :is(.card-blurb, .prog-meta, .prog-union, .prog-tag, .sub, .hm-sub, .aside, .devices, .cont-line, .count, .tag, .card p, .catmeta, main p:not(.eyebrow)){font-size:16px} }
  /* Footer links and buttons are 44 px tap targets on a phone (console WAYFINDER-2). */
  @media (max-width:700px){ body .foot li a{display:inline-flex; align-items:center; min-height:44px} body .foot button{min-width:44px; min-height:44px} }
  .eyebrow{
    font-family:var(--cond); font-weight:600; text-transform:uppercase;
    letter-spacing:.16em; font-size:11.5px; color:var(--dim); margin:0;
  }

  /* ---- top bar ---- */
  header.top{
    position:sticky; top:0; z-index:30; background:rgba(5,10,16,.92);
    border-bottom:1px solid var(--edge); backdrop-filter:blur(8px);
  }
  .top-in{
    display:flex; gap:12px; align-items:center; justify-content:space-between;
    min-height:54px; padding:8px var(--gutter) 8px var(--hm-nav-w, 56px); max-width:1120px; margin:0 auto;
  }
  /* The shared bar (shared/controls.js #ctl-nav: Home, help, the account
     chip) is fixed at the top left; the bar's left padding, measured from it
     at run time (--hm-nav-w), keeps the brand line clear of it. */
  .hm-nav{display:none; gap:18px; flex:0 0 auto}
  .hm-nav a{font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.1em; font-size:14px; color:var(--muted)}
  .hm-nav a:hover{color:var(--text)}
  .brandline{
    font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.1em;
    font-size:12px; color:var(--muted); margin:0;
    flex:1 1 auto; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .who{display:flex; align-items:center; gap:10px; flex:0 0 auto}
  /* One sign-in entry: where the shared account chip mounted, it is the one. */
  html:has(#gt-account) .who{display:none}
  .who-line{font-size:12.5px; color:var(--muted); max-width:46ch}
  .who-line b{color:var(--text); font-weight:600}
  button{font:inherit; color:inherit}
  .btn{
    background:var(--raised); color:var(--text); border:1px solid var(--edge-strong);
    border-radius:var(--at-r-pill, 6px); padding:8px 14px; cursor:pointer;
    font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.09em; font-size:12.5px;
  }
  .btn:hover{background:var(--raised-2)}
  .btn.primary{background:linear-gradient(180deg,var(--accent-2),var(--accent)); color:var(--accent-ink); border-color:transparent}
  .btn.quiet{background:transparent}
  .linkbtn{background:none; border:0; padding:0; color:var(--accent-2); cursor:pointer; text-decoration:underline}

  /* ---- hero: a live dusk scene behind one headline and two actions ---- */
  .hero{position:relative; overflow:hidden; isolation:isolate; min-height:min(88vh,640px); display:flex; align-items:flex-end;
    background:linear-gradient(180deg,#1a1440 0%,#5b2a6e 38%,#e0725a 58%,#0d2a3c 62%,#06121c 100%)}
  /* The recorded loop (console CINEMA): shared/cinema.js's layer, under the hero's own scrim. */
  .hero .cn-bg{z-index:-2; --cn-scrim:none}
  .hero .cn-toggle{top:14px; right:var(--gutter)}
  .app.world .shot .cn-bg{z-index:1; --cn-scrim:linear-gradient(180deg,rgba(5,10,16,0) 55%,rgba(5,10,16,.35) 100%)}
  .hero::after{content:""; position:absolute; inset:0; z-index:-1; pointer-events:none;
    background:linear-gradient(180deg,rgba(5,10,16,.10) 0%,rgba(5,10,16,.0) 30%,rgba(5,10,16,.55) 62%,rgba(5,10,16,.92) 100%)}
  .hero-in{width:100%; max-width:1120px; margin:0 auto; padding:88px var(--gutter) 28px}
  .hero .eyebrow{color:#e9dcff; text-shadow:0 1px 6px rgba(0,0,0,.6)}
  .hero h1{
    font-family:var(--cond); font-weight:700; text-transform:uppercase; letter-spacing:.012em;
    font-size:clamp(38px,11vw,76px); line-height:.98; margin:10px 0 0; text-wrap:balance;
    text-shadow:0 2px 18px rgba(0,0,0,.55);
  }
  .hero h1 em{font-style:normal; color:var(--accent-2)}
  .hero-lead{font-size:18px; line-height:1.5; color:#e6f1f8; max-width:48ch; margin:14px 0 0; text-shadow:0 1px 8px rgba(0,0,0,.7)}
  .hm-actions{display:grid; gap:10px; margin:22px 0 0; grid-template-columns:1fr; max-width:520px}
  .hm-act{display:flex; align-items:center; justify-content:center; gap:8px; min-height:52px; padding:12px 20px;
    border-radius:12px; font-family:var(--cond); font-weight:700; text-transform:uppercase; letter-spacing:.08em; font-size:18px;
    text-decoration:none !important; border:1px solid transparent}
  .hm-act.go{background:linear-gradient(180deg,var(--accent-2),var(--accent)); color:var(--accent-ink); box-shadow:0 10px 30px rgba(79,209,255,.28)}
  .hm-act.go:hover{filter:brightness(1.07)}
  .hm-act.alt{background:rgba(8,16,26,.62); color:var(--text); border-color:rgba(237,246,251,.45); backdrop-filter:blur(6px)}
  .hm-act.alt:hover{background:rgba(8,16,26,.82)}
  .hm-act svg{width:20px; height:20px; flex:0 0 auto}
  .hm-still-note{margin:12px 0 0; font-size:14px; color:#cfdde7}

  /* ---- shared section furniture ---- */
  .hm-sec{margin:44px 0 0; scroll-margin-top:70px}
  .hm-sec > h2, .hm-h2{font-family:var(--cond); font-weight:700; text-transform:uppercase; letter-spacing:.04em;
    font-size:clamp(24px,6.4vw,34px); line-height:1.05; margin:4px 0 0}
  .hm-sec > .sub, .hm-sub{margin:8px 0 0; font-size:16px; color:var(--muted); max-width:68ch}

  /* ---- how it works ---- */
  .hm-steps{list-style:none; margin:16px 0 0; padding:0; display:grid; gap:10px; grid-template-columns:1fr; counter-reset:hm}
  .hm-steps li{position:relative; padding:14px 14px 14px 60px; background:var(--surface-card); border:1px solid var(--edge); border-radius:var(--r-md); counter-increment:hm}
  .hm-steps li::before{content:counter(hm); position:absolute; left:14px; top:14px; width:34px; height:34px; border-radius:50%;
    display:grid; place-items:center; font:700 18px/1 var(--cond); color:var(--accent-ink); background:var(--step,var(--accent))}
  .hm-steps b{display:block; font-family:var(--cond); font-weight:700; text-transform:uppercase; letter-spacing:.05em; font-size:19px}
  .hm-steps span{display:block; margin-top:2px; font-size:16px; color:var(--muted)}

  /* ---- world cards with real captures ---- */
  .worlds{display:grid; gap:14px; margin:16px 0 0; grid-template-columns:1fr}
  .app.world{padding:0; overflow:hidden; display:flex; flex-direction:column}
  .app.world .shot{position:relative; aspect-ratio:16/9; background:linear-gradient(135deg,var(--tint,var(--accent)),var(--panel)); overflow:hidden}
  .app.world .shot img{display:block; width:100%; height:100%; object-fit:cover; transition:transform .4s ease}
  .app.world:hover .shot img{transform:scale(1.04)}
  .app.world .body{padding:14px 16px 16px; display:flex; flex-direction:column; flex:1 1 auto}
  .app.world p{font-size:16px}
  .app.world .go{margin-top:auto; padding-top:12px; font-size:15px; color:var(--tint,var(--accent))}
  .more-apps{display:grid; gap:12px; margin:14px 0 0; grid-template-columns:1fr}

  /* ---- continue strip ---- */
  .continue{max-width:none}
  .continue .cont-row{display:flex; flex-wrap:wrap; gap:10px; align-items:center}
  .continue .btn{font-size:16px; padding:12px 18px; min-height:48px; display:inline-flex; align-items:center}
  .hm-cont-progs{display:grid; gap:10px; margin:14px 0 0; grid-template-columns:1fr}
  .hm-cont-prog{display:block; padding:10px 12px; background:var(--raised); border:1px solid var(--edge); border-left:3px solid var(--tint,var(--accent)); border-radius:var(--r-sm); color:inherit; font-size:16px}
  .hm-cont-prog:hover{background:var(--raised-2); text-decoration:none}
  .hm-cont-prog .pp-chip{color:var(--tint,var(--accent)); font-size:14px}
  /* the learner's cohorts (docs/enterprise.md): the same card, with the programme ladder as rungs */
  .hm-cont-cohort b{display:block}
  .hm-cont-cohort .hm-cohort-line{display:block; font-size:15px; color:var(--muted); margin:2px 0 6px}
  .hm-cont-cohort .hm-ladder{display:flex; gap:4px; list-style:none; margin:0 0 8px; padding:0}
  .hm-cont-cohort .hm-rung{width:22px; height:22px; border-radius:4px; border:1px solid var(--edge); font-size:13px; line-height:20px; text-align:center; color:var(--text)}
  .hm-cont-cohort .hm-rung-passed{background:rgba(89,201,123,.22); border-color:var(--good)}
  .hm-cont-cohort .hm-rung-tried{background:rgba(242,193,75,.18); border-color:var(--warn)}
  .hm-cont-cohort a{font-size:15px; color:var(--tint,var(--accent))}

  /* ---- programme finder ---- */
  .finder{padding:18px 16px; background:var(--panel); border:1px solid var(--edge); border-radius:var(--r-lg)}
  .hm-filters{display:grid; gap:12px; margin:16px 0 0; grid-template-columns:1fr}
  .hm-filters label{display:block; font-size:14px; color:var(--muted)}
  .hm-filters input, .hm-filters select{display:block; width:100%; margin-top:6px; min-height:48px; padding:11px 12px; font:16px var(--sans); color:var(--text);
    background:var(--void); border:1px solid var(--edge-strong); border-radius:var(--r-sm)}
  .hm-find-count{margin:12px 0 0; font-size:15px; color:var(--muted); font-variant-numeric:tabular-nums}
  .hm-progs{display:grid; gap:12px; margin:14px 0 0; grid-template-columns:1fr}
  .prog{display:flex; flex-direction:column; padding:14px 16px 16px; background:var(--surface-card); border:1px solid var(--edge);
    border-top:3px solid var(--tint,var(--accent)); border-radius:var(--r-md)}
  .prog h3{font-family:var(--cond); font-weight:700; font-size:21px; letter-spacing:.015em; line-height:1.15; margin:0}
  .prog .prog-union{margin:6px 0 0; font-size:15px; color:var(--tint,var(--accent)); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden}
  .prog .prog-meta{margin:6px 0 0; font-size:15px; color:var(--muted)}
  .prog .pp-chip{display:block; margin:10px 0 0; font-size:14px; color:var(--tint,var(--accent))}
  .prog .pp-chip[hidden]{display:none}
  .prog .prog-go{margin-top:auto; align-self:flex-start; min-height:48px; display:inline-flex; align-items:center; padding:10px 22px; font-size:16px}
  .prog .prog-foot{margin-top:auto; padding-top:12px}
  .hm-more{margin:14px 0 0; min-height:48px; font-size:16px; padding:10px 18px}

  /* ---- unions strip ---- */
  .hm-unions{display:flex; flex-wrap:wrap; gap:8px; margin:14px 0 0}
  .hm-union{min-height:44px; padding:8px 14px; border-radius:999px; background:var(--raised); border:1px solid var(--edge-strong);
    font:600 16px/1.2 var(--cond); letter-spacing:.05em; color:var(--text); cursor:pointer}
  .hm-union:hover, .hm-union[aria-pressed="true"]{background:rgba(79,209,255,.16); border-color:var(--accent)}
  .hm-union small{font:500 14px var(--sans); color:var(--muted); margin-left:6px}
  .hm-about{margin:44px 0 0}
  .lead{font-size:16.5px; color:var(--muted); max-width:66ch; margin:16px 0 0}
  .lead b{color:var(--text); font-weight:600}
  .devices{
    margin:18px 0 0; padding:12px 14px; border-left:2px solid var(--accent);
    background:rgba(79,209,255,.05); border-radius:0 var(--r-sm) var(--r-sm) 0;
    font-size:13.5px; color:var(--muted); max-width:78ch;
  }
  .devices a{color:var(--accent-2)}

  /* ---- continue where you left off ---- */
  .continue{
    margin:22px 0 0; padding:14px 16px; background:var(--panel); border:1px solid var(--edge);
    border-left:2px solid var(--good); border-radius:0 var(--r-md) var(--r-md) 0; max-width:78ch;
  }
  .continue .cont-line{margin:4px 0 12px; font-size:17px; color:var(--text)}
  .continue .cont-due{margin:10px 0 0; font-size:15px; color:var(--warn)}

  /* ---- app cards ---- */
  .apps{display:grid; gap:12px; margin:26px 0 0; grid-template-columns:1fr}
  .app{
    display:block; background:var(--surface-card); border:1px solid var(--edge);
    border-top:2px solid var(--tint,var(--accent)); border-radius:var(--r-md);
    padding:16px; box-shadow:var(--shadow-1); color:inherit;
  }
  .app:hover{border-color:var(--edge-strong); text-decoration:none; transform:translateY(-1px)}
  .app .count{
    font-family:var(--cond); font-weight:600; font-size:11.5px; letter-spacing:.14em;
    text-transform:uppercase; color:var(--tint,var(--accent));
  }
  .app h2{font-family:var(--cond); font-weight:600; font-size:24px; letter-spacing:.02em; margin:4px 0 6px}
  .app p{margin:0; font-size:14px; color:var(--muted)}
  .app .go{
    display:inline-block; margin-top:12px; font-family:var(--cond); font-weight:600;
    text-transform:uppercase; letter-spacing:.1em; font-size:12px; color:var(--text);
  }
  .app .go::after{content:" \\2192"}
  .aside{margin:14px 0 0; font-size:13.5px; color:var(--dim)}
  .aside a{color:var(--muted)}

  /* ---- search ---- */
  .find{margin:38px 0 0; padding:16px; background:var(--panel); border:1px solid var(--edge); border-radius:var(--r-md)}
  .find label{display:block; margin-bottom:8px}
  #q{
    width:100%; padding:13px 14px; font-size:16px; color:var(--text);
    background:var(--void); border:1px solid var(--edge-strong); border-radius:var(--r-sm);
    font-family:var(--sans);
  }
  #q::placeholder{color:var(--dim)}
  .count{margin:10px 0 0; font-size:13px; color:var(--muted); font-variant-numeric:tabular-nums}
  .nohits{margin:10px 0 0; font-size:13.5px; color:var(--warn)}

  /* ---- language layer (shared/i18n.js): a translated one-line card tag replaces the English blurb ---- */
  .card-tag{display:none}
  html:not([lang="en"]) .card-tag{display:block}
  html:not([lang="en"]) .card-blurb{display:none}
  .prog-tag{margin:2px 0 4px;font-size:14px;opacity:.9}
  /* ---- programme rail ---- */
  .rails{margin:34px 0 0}
  .rails h2, .cat h2{
    font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.05em;
    font-size:clamp(19px,4.6vw,25px); margin:0;
  }
  .sub{margin:6px 0 0; font-size:13.5px; color:var(--muted); max-width:70ch}
  .rail{
    display:flex; gap:10px; overflow-x:auto; margin:14px calc(var(--gutter) * -1) 0; padding:2px var(--gutter) 10px;
    scroll-snap-type:x proximity; -webkit-overflow-scrolling:touch;
  }
  .chip{
    flex:0 0 auto; max-width:82vw; scroll-snap-align:start;
    background:var(--raised); border:1px solid var(--edge); border-left:2px solid var(--violet);
    border-radius:var(--r-sm); padding:10px 13px; color:inherit;
  }
  .chip:hover{background:var(--raised-2); text-decoration:none}
  .chip b{display:block; font-family:var(--cond); font-weight:600; font-size:15px; letter-spacing:.02em}
  .chip span{display:block; font-size:12px; color:var(--muted); margin-top:2px}
  .chip .pp-chip[hidden]{display:none}
  .chip .pp-chip{color:var(--accent, currentColor)}

  /* ---- catalog ---- */
  #catalog{margin:8px 0 0}
  .cat{margin:34px 0 0; scroll-margin-top:70px}
  .catmeta{margin:5px 0 0; font-size:12.5px; color:var(--dim)}
  .grid{display:grid; gap:10px; margin:14px 0 0; grid-template-columns:1fr}
  .card{
    display:block; position:relative; padding:13px 14px 14px 15px;
    background:var(--surface-card); border:1px solid var(--edge);
    border-left:3px solid var(--tint,var(--accent)); border-radius:var(--r-sm); color:inherit;
  }
  .card:hover{background:var(--raised); text-decoration:none}
  .card .idx{
    font-family:var(--cond); font-weight:600; font-size:11px; letter-spacing:.16em;
    color:var(--dim); font-variant-numeric:tabular-nums;
  }
  .card .app-tag{
    font-family:var(--cond); font-weight:600; font-size:11px; letter-spacing:.12em;
    text-transform:uppercase; color:var(--good); margin-left:8px;
  }
  .card h3{font-family:var(--cond); font-weight:600; font-size:19px; letter-spacing:.015em; margin:1px 0 3px}
  .card .trade{margin:0; font-size:12.5px; color:var(--tint,var(--accent))}
  .card .tag{margin:6px 0 0; font-size:13.5px; color:var(--muted)}
  .vh{position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap}
  [hidden]{display:none !important}

  /* ---- footer ---- */
  footer{margin:52px 0 0; border-top:1px solid var(--edge); background:var(--panel)}
  /* The bottom-right corner is kept clear for COMPASS's floating Guide
     button (shared/guide.js): nothing on this page is fixed there, and the
     footer ends --guide-space above the viewport's bottom edge so the button
     never sits on the last line. */
  .foot{padding:26px var(--gutter) calc(40px + var(--guide-space)); max-width:1120px; margin:0 auto}
  .foot h2{font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.12em; font-size:12px; color:var(--dim); margin:0 0 10px}
  .foot ul{list-style:none; margin:0 0 18px; padding:0; display:grid; gap:8px; grid-template-columns:1fr}
  .foot li{font-size:14px}
  .foot p{margin:0 0 8px; font-size:13px; color:var(--dim); max-width:80ch}
  .egg{background:none; border:0; padding:4px; margin:6px 0 0; cursor:pointer; opacity:.55; line-height:0; border-radius:var(--r-sm)}
  .egg:hover{opacity:.9}
  .egg svg{width:22px; height:22px; display:block}
  .egg-toast{position:fixed; left:50%; bottom:22px; transform:translateX(-50%); z-index:60; max-width:calc(100vw - 32px);
    background:var(--panel-2); border:1px solid var(--warn); border-radius:var(--r-sm); padding:10px 16px;
    font-size:14px; color:var(--text); box-shadow:var(--shadow-2)}
  .hardhat-count{display:inline-block; margin:6px 0 0 10px; font-size:12px; color:var(--dim); vertical-align:middle; font-variant-numeric:tabular-nums}
  .egg-ledger-btn{display:inline-block; margin:6px 0 0 10px; padding:2px 10px; font:600 12px/1.6 inherit; color:var(--dim);
    background:transparent; border:1px solid currentColor; border-radius:999px; cursor:pointer; vertical-align:middle}
  .egg-ledger-btn:hover, .egg-ledger-btn:focus-visible{color:var(--text); border-color:var(--text)}
  #egg-ledger-body h3{font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.03em; font-size:14px; margin:14px 0 4px}
  #egg-ledger-body h3:first-child{margin-top:0}
  #egg-ledger-body ul{margin:0 0 4px; padding-left:18px; font-size:13px; color:var(--muted)}
  #egg-ledger-body li{margin:0 0 4px}

  /* ---- Foreman's Radio (Easter egg) ---- */
  .radio-card{
    width:calc(100vw - 32px); max-width:420px; padding:0; color:var(--text);
    background:var(--panel-2); border:1px solid var(--edge-strong); border-radius:var(--r-md);
    box-shadow:var(--shadow-2);
  }
  .radio-card::backdrop{background:rgba(3,7,12,.74)}
  .radio-in{padding:18px}
  .radio-in h2{font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.04em; font-size:19px; margin:6px 0 8px}
  .radio-in p{margin:0 0 12px; font-size:13.5px; color:var(--muted)}
  .radio-opts{display:grid; gap:8px; margin:0 0 14px}
  .radio-opt{display:block; width:100%; text-align:left; cursor:pointer; background:var(--raised,var(--panel)); border:1px solid var(--edge-strong); border-radius:var(--r-sm); padding:10px 12px; color:inherit; font:inherit}
  .radio-opt:hover{background:rgba(126,170,200,.14)}
  .radio-opt.right{border-color:var(--good); background:rgba(89,201,123,.12)}
  .radio-opt.wrong{border-color:var(--danger); background:rgba(240,100,91,.12)}
  .radio-row{display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap; margin-top:8px}

  /* ---- sign-in dialog ---- */
  dialog{
    width:calc(100vw - 32px); max-width:430px; padding:0; color:var(--text);
    background:var(--panel-2); border:1px solid var(--edge-strong); border-radius:var(--r-md);
    box-shadow:var(--shadow-2);
  }
  dialog::backdrop{background:rgba(3,7,12,.74)}
  .dlg{padding:18px}
  .dlg h2{font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.04em; font-size:21px; margin:6px 0 8px}
  .dlg > p{margin:0 0 14px; font-size:13.5px; color:var(--muted)}
  .opts{display:grid; gap:10px; margin:0 0 14px}
  .opt{
    display:block; width:100%; text-align:left; cursor:pointer;
    background:var(--raised); border:1px solid var(--edge-strong); border-radius:var(--r-sm); padding:12px 13px;
  }
  .opt:hover{background:var(--raised-2)}
  .opt b{display:block; font-family:var(--cond); font-weight:600; font-size:15.5px; letter-spacing:.02em}
  .opt span{display:block; margin-top:3px; font-size:12.5px; color:var(--muted)}
  .field{margin:0 0 12px}
  .field label{display:block; font-size:12.5px; color:var(--muted); margin-bottom:5px}
  .field input{
    width:100%; padding:11px 12px; font-size:16px; font-family:var(--sans); color:var(--text);
    background:var(--void); border:1px solid var(--edge-strong); border-radius:var(--r-sm);
  }
  .dlg-msg{margin:0 0 12px; font-size:13px; color:var(--warn)}
  .dlg-fine{margin:12px 0 0; font-size:12px; color:var(--dim)}
  .dlg-row{display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap}

  /* ---- share to train agents & robots (shared/share-engagement.js) ---- */
  .dlg-section{margin:0 0 14px; padding:10px 12px; background:var(--raised); border:1px solid var(--edge-strong); border-radius:var(--r-sm)}
  .dlg-section .eyebrow{margin-bottom:6px}
  .licence-opts{display:grid; gap:8px}
  .licence-opt{display:flex; gap:8px; align-items:flex-start; font-size:13.5px; cursor:pointer}
  .licence-opt.on{color:var(--accent)}
  .receipt-list{list-style:none; margin:4px 0 0; padding:0; display:grid; gap:4px; max-height:150px; overflow-y:auto}
  .receipt-list li{font-size:12.5px; padding:6px 8px; border-radius:6px; background:var(--void); border-left:3px solid var(--edge-strong)}
  .receipt-list li.ok{border-left-color:var(--good)}
  .receipt-list li.fail{border-left-color:var(--danger)}

  @media (min-width:560px){
    .apps{grid-template-columns:1fr 1fr}
    .hm-actions{grid-template-columns:auto auto; justify-content:start; max-width:none}
    .hm-act{white-space:nowrap; padding:12px 28px}
    .worlds, .more-apps, .hm-progs, .hm-cont-progs{grid-template-columns:1fr 1fr}
    .hm-steps{grid-template-columns:1fr 1fr}
    .hm-filters{grid-template-columns:1fr 1fr}
    .grid{grid-template-columns:1fr 1fr}
    .foot ul{grid-template-columns:1fr 1fr}
  }
  @media (min-width:900px){
    .hero{min-height:620px}
    .hero-in{padding:120px var(--gutter) 56px}
    .hero::after{background:
      linear-gradient(90deg,rgba(5,10,16,.72) 0%,rgba(5,10,16,.38) 50%,rgba(5,10,16,0) 78%),
      linear-gradient(180deg,rgba(5,10,16,0) 72%,rgba(5,10,16,.9) 100%)}
    .hm-nav{display:flex}
    .worlds{grid-template-columns:repeat(4,1fr)}
    .worlds .app.world:first-child{grid-column:span 2; grid-row:span 2}
    .worlds .app.world:first-child .shot{aspect-ratio:auto; flex:1 1 auto; min-height:260px}
    .worlds .app.world:first-child h2{font-size:30px}
    .worlds .app.world:first-child .shot img{object-position:50% 20%}
    .worlds .app.world:nth-child(6), .worlds .app.world:nth-child(7){grid-column:span 2}
    .worlds .app.world:nth-child(6) .shot, .worlds .app.world:nth-child(7) .shot{aspect-ratio:21/9}
    .more-apps{grid-template-columns:repeat(3,1fr)}
    .hm-progs{grid-template-columns:repeat(3,1fr)}
    .hm-cont-progs{grid-template-columns:repeat(3,1fr)}
    .hm-steps{grid-template-columns:repeat(4,1fr)}
    .hm-filters{grid-template-columns:2fr 1fr 1fr 1fr}
    .finder{padding:24px}
    .apps{grid-template-columns:repeat(4,1fr)}
    .grid{grid-template-columns:repeat(3,1fr)}
    .foot ul{grid-template-columns:repeat(3,1fr)}
  }
  @media (prefers-reduced-motion:reduce){
    *{transition:none !important; animation:none !important}
    .app:hover{transform:none}
    .app.world:hover .shot img{transform:none}
  }
`;

/** The page's one script: live filtering, and the sign-in dialog. */
const SCRIPT = `
  // Live filtering. The haystack is each card's own rendered text, so the
  // fields a learner can search are exactly the fields the card shows (plus
  // the id and the standard, which the card carries for screen readers).
  const q = document.getElementById("q");
  const cards = [...document.querySelectorAll(".card")].map((el) => ({ el, hay: el.textContent.toLowerCase().replace(/\\s+/g, " ") }));
  const sections = [...document.querySelectorAll(".cat")];
  const countEl = document.getElementById("count");
  const noHits = document.getElementById("nohits");
  const total = cards.length;
  function apply() {
    const terms = q.value.toLowerCase().split(/\\s+/).filter(Boolean);
    let shown = 0;
    for (const c of cards) {
      const on = terms.every((t) => (window.wfHit ? window.wfHit(c, t) : c.hay.includes(t)));
      c.el.hidden = !on;
      if (on) shown += 1;
    }
    for (const s of sections) {
      const any = [...s.querySelectorAll(".card")].some((el) => !el.hidden);
      s.hidden = !any;
    }
    countEl.textContent = terms.length
      ? shown + " of " + total + " stations match " + JSON.stringify(q.value)
      : total + " stations, " + sections.length + " categories. Type to filter by name, id, trade, category or standard.";
    noHits.hidden = shown !== 0 || terms.length === 0;
  }
  q.addEventListener("input", apply);
  document.getElementById("clear-q").addEventListener("click", () => { q.value = ""; apply(); q.focus(); });
  apply();

  // Sign-in. The module is loaded lazily and the button stays hidden unless it
  // arrives, so the catalog above never depends on it.
  const dialog = document.getElementById("signin-dialog");
  const openBtn = document.getElementById("signin");
  const outBtn = document.getElementById("signout");
  const whoEl = document.getElementById("who");
  const optsEl = document.getElementById("opts");
  const msgEl = document.getElementById("dlg-msg");
  const fieldEl = document.getElementById("dlg-field");
  const fieldLabel = document.getElementById("dlg-field-label");
  const fieldInput = document.getElementById("dlg-field-input");
  const mountEl = document.getElementById("dlg-mount");
  let Auth = null, chosen = null;

  // One sign-in entry on every page, in the same place: the shared account
  // chip in the top-left bar (shared/account.js). The header's own controls
  // show only on a page where the chip did not mount (console POLISH).
  const hmChip = () => !!document.getElementById("gt-account");
  function showWho() {
    const line = Auth?.describe?.();
    const chip = hmChip();
    whoEl.hidden = !line || chip;
    outBtn.hidden = !line || chip;
    openBtn.hidden = !!line || chip;
    if (line) { whoEl.textContent = ""; const b = document.createElement("b"); b.textContent = line.split(" · ")[0]; whoEl.append(b, " · " + line.split(" · ").slice(1).join(" · ")); }
  }
  function setMsg(text) { msgEl.textContent = text || ""; msgEl.hidden = !text; }
  function renderOptions() {
    optsEl.textContent = ""; mountEl.textContent = ""; chosen = null;
    fieldEl.hidden = true;
    const list = Auth ? Auth.available() : [];
    if (!list.length) { setMsg("No sign-in option is configured for this deployment and this browser offers none of its own. Your records still work — they stay in this browser under the crew tag you type in a simulator."); return; }
    for (const p of list) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "opt"; b.dataset.provider = p.id;
      const t = document.createElement("b"); t.textContent = p.label;
      const n = document.createElement("span"); n.textContent = p.note;
      b.append(t, n);
      b.addEventListener("click", () => choose(p));
      optsEl.append(b);
    }
  }
  async function choose(p) {
    setMsg("");
    if (p.needs && chosen?.id !== p.id) {
      chosen = p;
      fieldEl.hidden = false;
      fieldLabel.textContent = p.needs === "email" ? "Your e-mail address" : "The name to label this device's passkey with";
      fieldInput.type = p.needs === "email" ? "email" : "text";
      fieldInput.value = "";
      fieldInput.focus();
      setMsg("Then choose " + p.short + " again.");
      return;
    }
    const value = p.needs ? fieldInput.value : "";
    const res = await Auth.signIn(p.id, { email: value, name: value, mount: mountEl });
    if (res.kind === "signed-in") { showWho(); dialog.close(); return; }
    setMsg(res.reason || res.note || "");
  }

  // One sign-in entry everywhere: the account chip's dialog (shared/account.js,
  // mounted by controls.js) when it is on the page, this page's own otherwise.
  openBtn.addEventListener("click", () => {
    const chip = document.getElementById("gt-account");
    if (chip) { chip.click(); return; }
    renderOptions(); dialog.showModal();
  });
  document.getElementById("dlg-close").addEventListener("click", () => dialog.close());
  outBtn.addEventListener("click", () => {
    const also = confirm("Signed out. Also clear the training records stored in this browser?");
    Auth.signOut({ clearRecords: also });
    showWho();
  });

  // The organisation layer's deployment block (docs/enterprise.md, the
  // "enterprise" block of auth-config.json): the organisation's name on the
  // brand line, only the enabled worlds and programmes shown, and the
  // deployment's default language until the visitor picks one. Read from the
  // configuration file only, never from the launch URL. (This script is
  // written inside a template literal: no backticks here.)
  function hmApplyEnterprise(e) {
    if (!e || typeof e !== "object") return;
    if (e.organisation) { const b = document.querySelector(".brandline"); if (b) b.textContent = b.textContent + " · " + e.organisation; }
    if (Array.isArray(e.worlds)) {
      for (const a of document.querySelectorAll(".app.world")) {
        const h = a.getAttribute("href") || "";
        // The Atlas lives under bayworld/ in the repo layout, so it is tested first.
        const id = /atlas/.test(h) ? "atlas" : (/(bayworld|regatta|underwater|summit|parishes|fairway|redwood|smartcity|holodeck)/.exec(h) || [])[1];
        if (id && !e.worlds.includes(id)) a.style.display = "none";
      }
    }
    if (Array.isArray(e.programmes)) {
      for (const p of document.querySelectorAll(".prog")) {
        const id = (p.querySelector("[data-tr^='prog.']")?.getAttribute("data-tr") || "").split(".")[1];
        if (id && !e.programmes.includes(id)) p.style.display = "none";
      }
    }
    if (e.defaultLanguage) {
      let saved = null;
      try { saved = localStorage.getItem("holodeck-lang-v1"); } catch (_) { saved = null; }
      if (!saved && !/[?&]lang=/.test(location.search)) import("./shared/i18n.js").then((m) => m.trSetDefault(e.defaultLanguage)).catch(() => {});
    }
    document.documentElement.dataset.hmEnterprise = e.organisation ? "named" : "public";
  }

  import("./shared/auth.js").then(async (mod) => {
    const env = mod.makeAuthEnv();
    await mod.Auth.loadConfig(env);
    mod.Auth.load();
    hmApplyEnterprise(mod.Auth.config?.enterprise);
    Auth = {
      available: () => mod.availableProviders(mod.Auth.config, env),
      signIn: (id, opts) => mod.Auth.signIn(id, opts),
      signOut: (opts) => mod.Auth.signOut(opts),
      describe: () => mod.Auth.describe(),
    };
    openBtn.hidden = hmChip();
    showWho();
  }).catch(() => { openBtn.hidden = true; });

  // Share to train agents & robots (shared/share-engagement.js,
  // shared/wallet.js, shared/agent-protocols.js). Lazily loaded, like sign-in
  // above — the roster above never depends on it, and nothing is sent
  // anywhere until Share is pressed, inside these modules themselves.
  const shareDialog = document.getElementById("share-dialog");
  const shareOpenLink = document.getElementById("share-open");
  const shareWalletStatus = document.getElementById("share-wallet-status");
  const shareWalletConnect = document.getElementById("share-wallet-connect");
  const shareWalletDisconnect = document.getElementById("share-wallet-disconnect");
  const shareLicenceEl = document.getElementById("share-licence");
  const shareMsg = document.getElementById("share-msg");
  const shareOptinBtn = document.getElementById("share-optin");
  const shareNowBtn = document.getElementById("share-now");
  const shareRevokeBtn = document.getElementById("share-revoke");
  const shareReceiptsEl = document.getElementById("share-receipts");
  const shareNoReceipts = document.getElementById("share-no-receipts");
  const LICENCE_NOTES = [["CC0", "CC0 — public domain dedication"], ["CC-BY-4.0", "CC-BY-4.0 — attribution required"]];
  let Share = null, shareLicence = "CC0";

  function setShareMsg(text) { shareMsg.textContent = text || ""; shareMsg.hidden = !text; }

  function renderLicence() {
    shareLicenceEl.textContent = "";
    const optedIn = !!(Share && Share.optedIn());
    for (const [id, note] of LICENCE_NOTES) {
      const label = document.createElement("label");
      label.className = "licence-opt" + (shareLicence === id ? " on" : "");
      const input = document.createElement("input");
      input.type = "radio"; input.name = "share-licence"; input.value = id; input.checked = shareLicence === id;
      input.disabled = optedIn;
      input.addEventListener("change", () => { shareLicence = id; renderLicence(); });
      const span = document.createElement("span"); span.textContent = note;
      label.append(input, span);
      shareLicenceEl.append(label);
    }
  }
  renderLicence();

  function renderReceipts() {
    const list = Share ? Share.receipts() : [];
    shareReceiptsEl.textContent = "";
    shareNoReceipts.hidden = list.length > 0;
    for (const r of list.slice().reverse().slice(0, 20)) {
      const li = document.createElement("li");
      li.className = r.ok ? "ok" : "fail";
      li.textContent = new Date(r.at).toLocaleString() + " · " + r.provider + " · " + (r.ok ? "sent" : (r.reason || "failed"));
      shareReceiptsEl.append(li);
    }
  }

  function renderShareState() {
    const wallet = Share ? Share.walletDescribe() : null;
    shareWalletStatus.textContent = wallet
      ? "Connected: " + wallet.shortAddress + (wallet.chainId ? " · chain " + wallet.chainId : "")
      : "Connecting a wallet lets your opt-in be signed (personal_sign) so a relay can check who gave it. Without one, "
        + "opting in still works as a plain, unsigned record kept in this browser. This page never asks for a private "
        + "key or a seed phrase.";
    shareWalletConnect.hidden = !!wallet;
    shareWalletDisconnect.hidden = !wallet;
    const optedIn = !!(Share && Share.optedIn());
    shareOptinBtn.hidden = optedIn;
    shareNowBtn.hidden = !optedIn;
    shareRevokeBtn.hidden = !optedIn;
    renderLicence();
    renderReceipts();
  }

  shareOpenLink.addEventListener("click", () => { shareDialog.showModal(); renderShareState(); });
  document.getElementById("share-close").addEventListener("click", () => shareDialog.close());

  shareWalletConnect.addEventListener("click", async () => {
    if (!Share) return;
    shareWalletConnect.disabled = true;
    const res = await Share.connectWallet();
    shareWalletConnect.disabled = false;
    setShareMsg(res.connected ? "" : (res.reason || ""));
    renderShareState();
  });
  shareWalletDisconnect.addEventListener("click", () => { if (Share) Share.disconnectWallet(); renderShareState(); });

  shareOptinBtn.addEventListener("click", async () => {
    if (!Share) return;
    setShareMsg("");
    const res = await Share.optIn(shareLicence);
    setShareMsg(res.ok ? "" : (res.reason || ""));
    renderShareState();
  });
  shareRevokeBtn.addEventListener("click", () => {
    if (Share) Share.revoke();
    setShareMsg("Consent revoked. Anything already shared is not un-sent.");
    renderShareState();
  });
  shareNowBtn.addEventListener("click", async () => {
    if (!Share) return;
    shareNowBtn.disabled = true;
    const res = await Share.share();
    shareNowBtn.disabled = false;
    setShareMsg(res.ok ? "Shared." : (res.reason || "Nothing was sent."));
    renderShareState();
  });

  import("./shared/share-engagement.js").then(async (se) => {
    const [{ Wallet, makeWalletEnv }, { Adapters }] = await Promise.all([
      import("./shared/wallet.js"), import("./shared/agent-protocols.js"),
    ]);
    se.ShareEngagement.load();
    Share = {
      optedIn: () => se.ShareEngagement.optedIn,
      walletDescribe: () => Wallet.describe(),
      connectWallet: () => Wallet.connect({ env: makeWalletEnv() }),
      disconnectWallet: () => Wallet.disconnect(),
      optIn: (lic) => se.ShareEngagement.optIn({ licence: lic, wallet: Wallet }),
      revoke: () => se.ShareEngagement.revoke(),
      receipts: () => se.ShareEngagement.receipts(),
      share: () => se.ShareEngagement.share(Adapters["cloudflare-relay"]),
    };
    Wallet.onChange = () => renderShareState();
    renderShareState();
  }).catch(() => { shareOpenLink.disabled = true; });

  // The Easter egg: the classic up-up-down-down-left-right-left-right-B-A
  // key sequence, five taps on the hard hat in the footer, or ?egg=race opens
  // the platform's arcade racer with a one-line toast. Typing in the search
  // box never counts toward the sequence.
  const egg = document.getElementById("egg");
  const eggToast = document.getElementById("egg-toast");
  let eggGoing = false;
  function openEgg() {
    if (eggGoing) return;
    eggGoing = true;
    eggToast.hidden = false;
    setTimeout(() => { location.href = egg.dataset.egg; }, 1200);
  }
  const eggCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];
  const eggKeys = [];
  document.addEventListener("keydown", (e) => {
    if (e.target && e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    eggKeys.push(e.code);
    if (eggKeys.length > eggCode.length) eggKeys.shift();
    if (eggKeys.join() === eggCode.join()) openEgg();
  });
  let eggTaps = [];
  egg.addEventListener("click", () => {
    const now = Date.now();
    eggTaps = eggTaps.filter((t) => now - t < 3000);
    eggTaps.push(now);
    if (eggTaps.length >= 5) openEgg();
  });
  if (new URLSearchParams(location.search).get("egg") === "race") openEgg();

  // Hard Hat Hunt: a tiny counter in the footer for the golden hard hats
  // hidden in ${HARD_HAT_TOTAL} stations (shared/eggs.js). Read once on
  // load — the find itself always happens on a different page, so there is
  // nothing here to keep live.
  (function hardHatCounter() {
    const HARDHAT_KEY = "vr-training-hardhats-v1", HARDHAT_TOTAL = ${HARD_HAT_TOTAL};
    let found = 0;
    try { const raw = JSON.parse(localStorage.getItem(HARDHAT_KEY) || "[]"); found = Array.isArray(raw) ? raw.length : 0; } catch (_) { /* ignore */ }
    const el = document.getElementById("hardhat-count");
    el.textContent = "hard hats found: " + found + "/" + HARDHAT_TOTAL;
    el.hidden = false;
  })();

  // Egg ledger: what the six SmartCiti.X training-behaviour field notes
  // (shared/eggs-app.js, docs/easter-egg.md "Field notes") have taught this
  // browser so far, grouped by the programme that earned each one
  // (shared/eggs.js's ledgerByProgramme(), reading its own
  // vr-training-egg-ledger-v1 key). Read once on load, like the hard-hat
  // counter — the finds themselves always happen on a different page.
  (function eggLedgerPanel() {
    const LEDGER_KEY = "vr-training-egg-ledger-v1";
    let rows = [];
    try { const raw = JSON.parse(localStorage.getItem(LEDGER_KEY) || "[]"); rows = Array.isArray(raw) ? raw : []; } catch (_) { /* ignore */ }
    if (!rows.length) return; // nothing earned yet — keep the footer quiet
    const btn = document.getElementById("egg-ledger-btn");
    btn.textContent = "egg ledger: " + rows.length + " found";
    btn.hidden = false;
    const dlg = document.getElementById("egg-ledger-dialog");
    const body = document.getElementById("egg-ledger-body");
    btn.addEventListener("click", () => {
      body.textContent = "";
      const byProgramme = new Map();
      for (const r of rows) {
        const key = String((r && r.programme) || "General");
        if (!byProgramme.has(key)) byProgramme.set(key, []);
        byProgramme.get(key).push(r);
      }
      const programmes = [...byProgramme.keys()].sort((a, b) => a.localeCompare(b));
      for (const programme of programmes) {
        const h3 = document.createElement("h3");
        h3.textContent = programme;
        body.append(h3);
        const ul = document.createElement("ul");
        const entries = byProgramme.get(programme).slice().sort((a, b) => String(a.name).localeCompare(String(b.name)));
        for (const e of entries) {
          const li = document.createElement("li");
          li.textContent = (e.name || e.id) + " — " + e.lesson;
          ul.append(li);
        }
        body.append(ul);
      }
      if (typeof dlg.showModal === "function") dlg.showModal();
    });
    document.getElementById("egg-ledger-close").addEventListener("click", () => dlg.close());
  })();

  // Foreman's Radio: typing "radio" (letters only, same rule as the racer's
  // code — nothing typed in the search box counts) opens a ten-question quiz
  // built only from tools/standards.json's bodies and titles (see
  // shared/radio-quiz.js). Honest about what it is: a quiz, with a best score
  // kept in this browser, not a real radio and not a certification.
  const radioCode = ["KeyR", "KeyA", "KeyD", "KeyI", "KeyO"];
  const radioKeys = [];
  document.addEventListener("keydown", (e) => {
    if (e.target && e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    radioKeys.push(e.code);
    if (radioKeys.length > radioCode.length) radioKeys.shift();
    if (radioKeys.join() === radioCode.join()) openRadio();
  });
  let radioGoing = false;
  function openRadio() {
    if (radioGoing) return;
    radioGoing = true;
    import("./shared/radio-quiz.js").then((quiz) => runRadio(quiz)).catch(() => { radioGoing = false; });
  }
  function runRadio(quiz) {
    const dlg = document.createElement("dialog");
    dlg.className = "radio-card";
    dlg.setAttribute("aria-labelledby", "radio-title");
    document.getElementById("radio-mount").append(dlg);
    dlg.addEventListener("close", () => { radioGoing = false; dlg.remove(); });
    const questions = quiz.buildQuiz(10);
    let i = 0, score = 0;
    function render() {
      const q = questions[i];
      const answered = q._answered;
      dlg.innerHTML = "";
      const wrap = document.createElement("div");
      wrap.className = "radio-in";
      const eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = "Foreman's radio · question " + (i + 1) + " of " + questions.length;
      const h2 = document.createElement("h2");
      h2.id = "radio-title";
      h2.textContent = q.text;
      const opts = document.createElement("div");
      opts.className = "radio-opts";
      q.choices.forEach((choice, ci) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "radio-opt"; b.textContent = choice;
        if (answered) {
          b.disabled = true;
          if (ci === q.answerIndex) b.classList.add("right");
          else if (ci === q._picked) b.classList.add("wrong");
        } else {
          b.addEventListener("click", () => {
            q._answered = true; q._picked = ci;
            if (ci === q.answerIndex) score += 1;
            render();
          });
        }
        opts.append(b);
      });
      const row = document.createElement("div");
      row.className = "radio-row";
      const closeBtn = document.createElement("button");
      closeBtn.type = "button"; closeBtn.className = "btn"; closeBtn.textContent = "Close";
      closeBtn.addEventListener("click", () => dlg.close());
      row.append(closeBtn);
      if (answered) {
        const nextBtn = document.createElement("button");
        nextBtn.type = "button"; nextBtn.className = "btn primary";
        nextBtn.textContent = i + 1 < questions.length ? "Next question" : "See score";
        nextBtn.addEventListener("click", () => { i += 1; i < questions.length ? render() : renderScore(); });
        row.append(nextBtn);
      }
      wrap.append(eyebrow, h2, opts, row);
      dlg.append(wrap);
      if (!dlg.open) dlg.showModal();
    }
    function renderScore() {
      const best = quiz.recordRadioScore(score, questions.length);
      dlg.innerHTML = "";
      const wrap = document.createElement("div");
      wrap.className = "radio-in";
      const eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = "Foreman's radio";
      const h2 = document.createElement("h2");
      h2.id = "radio-title";
      h2.textContent = "Score: " + score + " / " + questions.length;
      const p = document.createElement("p");
      p.textContent = "Best score in this browser: " + best.best + " / " + best.of + (best.isNewBest ? " — a new best." : ".")
        + " Every question here comes straight from the standards registry (tools/standards.json) — the body that publishes each named standard.";
      const row = document.createElement("div");
      row.className = "radio-row";
      const closeBtn = document.createElement("button");
      closeBtn.type = "button"; closeBtn.className = "btn"; closeBtn.textContent = "Close";
      closeBtn.addEventListener("click", () => dlg.close());
      const againBtn = document.createElement("button");
      againBtn.type = "button"; againBtn.className = "btn primary"; againBtn.textContent = "Play again";
      againBtn.addEventListener("click", () => { i = 0; score = 0; questions.length = 0; questions.push(...quiz.buildQuiz(10)); render(); });
      row.append(closeBtn, againBtn);
      wrap.append(eyebrow, h2, p, row);
      dlg.append(wrap);
    }
    render();
  }

`;

/**
 * The homepage's second script: the hero scene, the programme finder, the
 * unions strip and the continue strip. Every top-level name is prefixed hm…
 * (the bundler concatenates modules into one scope). The links it builds are
 * the layout's own, so the flat dist copy resumes into the flat bundles.
 */
function hmScript(layout) {
  const links = {
    smartcity: layout.app.smartcity, trades: layout.app.trades, holodeck: layout.app.holodeck,
    bayworld: layout.app.bayworld, underwater: layout.app.underwater, regatta: layout.app.regatta, fairway: layout.app.fairway,
  };
  const names = { bayworld: "Bay World", underwater: "the Deep", regatta: "the Regatta", fairway: "Fairway Park", holodeck: "the Holodeck", trades: "Trade Skills", smartcity: "SmartCiti.X" };
  return `
  const HM_LINKS = ${JSON.stringify(links)};
  const HM_WORLD_NAMES = ${JSON.stringify(names)};
  const hmReduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  // ---- the hero: a recorded loop of Bay World at dusk (console CINEMA,
  // docs/home-backgrounds.md), behind the page's own scrim. shared/cinema.js
  // plays it only on screen and in a visible tab, gives it a pause button, and
  // under prefers-reduced-motion or Save-Data leaves the poster only (the
  // stylesheet hides the video before any script runs).
  (function hmHero() {
    function hmStill() { return !!(hmReduce && hmReduce.matches) || !!(navigator.connection && navigator.connection.saveData); }
    function hmKick() { document.documentElement.dataset.hmHero = hmStill() ? "still" : "live"; }
    hmKick();
    if (hmReduce && hmReduce.addEventListener) hmReduce.addEventListener("change", hmKick);
    import("./shared/cinema.js").then((cn) => cn.cnEnhanceAll()).catch(() => {
      // No module server (file://): the hero keeps its autoplaying loop, the
      // toggle still pauses it, and the cards keep their posters.
      const v = document.querySelector('video[data-cn-slot="hero"]');
      const t = document.querySelector('[data-cn-toggle="hero"]');
      if (!v || !t) return;
      if (hmStill()) { v.pause(); t.hidden = true; return; }
      t.addEventListener("click", () => { const p = !v.paused; if (p) v.pause(); else v.play().catch(() => {}); t.setAttribute("aria-pressed", String(p)); t.textContent = p ? "Play background" : "Pause background"; });
    });
    document.addEventListener("visibilitychange", () => { if (document.hidden) for (const v of document.querySelectorAll("video[data-cn-slot]")) v.pause(); });
  })();

  // ---- the programme finder: text, union, category and world, nine cards at
  // first so a phone is not a wall, then every match on request.
  const hmQ = document.getElementById("hm-find-q");
  const hmSelU = document.getElementById("hm-find-union");
  const hmSelC = document.getElementById("hm-find-cat");
  const hmSelW = document.getElementById("hm-find-world");
  const hmSelA = document.getElementById("hm-find-aud");
  const hmCount = document.getElementById("hm-find-count");
  const hmNone = document.getElementById("hm-find-none");
  const hmMore = document.getElementById("hm-find-more");
  const hmUnionBtns = [...document.querySelectorAll(".hm-union")];
  const hmCards = [...document.querySelectorAll("#hm-progs .prog")].map((el) => ({
    el, hay: el.textContent.toLowerCase().replace(/ +/g, " "),
    cat: (el.dataset.cat || "").split(" "), u: (el.dataset.u || "").split(" "), w: (el.dataset.w || "").split(" "), a: el.dataset.aud || "",
  }));
  const HM_FIRST = 9;
  let hmAll = false;
  function hmApply() {
    const terms = hmQ.value.toLowerCase().trim().split(/ +/).filter(Boolean);
    let matched = 0, shown = 0;
    for (const c of hmCards) {
      const ok = terms.every((t) => (window.wfHit ? window.wfHit(c, t) : c.hay.includes(t))) && (!hmSelU.value || c.u.includes(hmSelU.value))
        && (!hmSelC.value || c.cat.includes(hmSelC.value)) && (!hmSelW.value || c.w.includes(hmSelW.value)) && (!hmSelA.value || c.a === hmSelA.value);
      if (ok) matched += 1;
      const show = ok && (hmAll || matched <= HM_FIRST);
      c.el.hidden = !show;
      if (show) shown += 1;
    }
    const of = matched === hmCards.length ? hmCards.length + " programmes" : matched + " of " + hmCards.length + " programmes match";
    hmCount.textContent = of + (shown < matched ? " — showing " + shown + "." : ".");
    hmNone.hidden = matched !== 0;
    hmMore.hidden = shown >= matched;
    hmMore.textContent = "Show all " + matched + " programmes";
    for (const b of hmUnionBtns) b.setAttribute("aria-pressed", String(!!hmSelU.value && b.dataset.u === hmSelU.value));
  }
  for (const el of [hmQ, hmSelU, hmSelC, hmSelW, hmSelA]) el.addEventListener(el === hmQ ? "input" : "change", () => { hmAll = false; hmApply(); });
  hmMore.addEventListener("click", () => { hmAll = true; hmApply(); });
  document.getElementById("hm-find-reset").addEventListener("click", () => {
    hmQ.value = ""; hmSelU.value = ""; hmSelC.value = ""; hmSelW.value = ""; hmSelA.value = ""; hmAll = false; hmApply(); hmQ.focus();
  });
  for (const b of hmUnionBtns) b.addEventListener("click", () => {
    hmSelU.value = hmSelU.value === b.dataset.u ? "" : b.dataset.u;
    hmAll = false; hmApply();
    document.getElementById("finder").scrollIntoView({ behavior: hmReduce && hmReduce.matches ? "auto" : "smooth", block: "start" });
  });
  hmApply();

  // ---- the continue strip, read from the training record's own key
  // (shared/records.js RECORDS_KEY) in the store of whoever is using the page
  // right now — the signed-in account's, the demo tab's or this device's, as
  // shared/profiles.js gtStorage() resolves it, so a signed-in learner never
  // sees the device's records and their refreshers (console POLISH). Never
  // synced, never estimated. Without a module server it falls back to this
  // device's key. A first visit keeps the friendly empty state the page ships
  // with. "Due a refresher" mirrors shared/tracking.js's rule (a station whose
  // last clean run is older than 90 days) without importing that module.
  function hmContinue(store) {
    const RECORDS_KEY = "vr-training-records-v1", REFRESHER_DAYS = 90, DAY_MS = 86400000;
    let list;
    try { list = JSON.parse((store || localStorage).getItem(RECORDS_KEY) || "[]"); } catch (_) { list = []; }
    if (!Array.isArray(list) || !list.length) return;
    const last = list[list.length - 1];
    const href = (last.app === "trades" ? HM_LINKS.trades + "?room=" : HM_LINKS.smartcity + "?sim=") + encodeURIComponent(last.simId || "");
    const label = last.simName || last.simId || "a station";
    const days = {};
    for (const r of list) { const at = String(r.at || ""); if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(at)) days[at.slice(0, 10)] = true; }
    const dayKeys = Object.keys(days).sort();
    let streakDays = 0;
    if (dayKeys.length) {
      streakDays = 1;
      const cursor = new Date(dayKeys[dayKeys.length - 1] + "T00:00:00.000Z");
      for (;;) { cursor.setUTCDate(cursor.getUTCDate() - 1); if (days[cursor.toISOString().slice(0, 10)]) streakDays += 1; else break; }
    }
    const lastClean = {};
    for (const r of list) {
      if (!r.passed || !r.simId) continue;
      if (!lastClean[r.simId] || String(r.at) > lastClean[r.simId]) lastClean[r.simId] = String(r.at);
    }
    let dueCount = 0;
    for (const id in lastClean) if (Math.floor((Date.now() - new Date(lastClean[id]).getTime()) / DAY_MS) > REFRESHER_DAYS) dueCount += 1;
    const src = last.source && HM_LINKS[last.source] && last.source !== last.app ? last.source : null;
    let text = "Last station: " + label + (src ? " \\u00b7 from " + HM_WORLD_NAMES[src] : "");
    if (streakDays > 1) text += " \\u00b7 " + streakDays + "-day training streak";
    document.getElementById("continue-line").textContent = text;
    const link = document.getElementById("continue-link");
    link.href = href; link.textContent = "Resume " + label;
    if (src) {
      const back = document.getElementById("hm-cont-world");
      back.href = HM_LINKS[src]; back.textContent = "Back to " + HM_WORLD_NAMES[src]; back.hidden = false;
    }
    if (dueCount) {
      const dueEl = document.getElementById("continue-due");
      dueEl.hidden = false;
      dueEl.textContent = dueCount + " station" + (dueCount === 1 ? "" : "s") + " due a refresher (platform default: " + REFRESHER_DAYS + " days since the last clean run).";
    }
    document.getElementById("continue").dataset.state = "returning";
  }
  import("./shared/profiles.js").then((pf) => hmContinue(pf.gtStorage()), () => hmContinue(null));

  // ---- progress chips on every finder card and the programmes in progress
  // on the continue strip: the learner passport (shared/passport.js, see
  // docs/interop.md), loaded lazily, so a station passed from any world's
  // job board counts here too. Without a module server (file://) the cards
  // stay as they are.
  import("./shared/passport.js").then((pp) => {
    for (const el of document.querySelectorAll("#hm-progs [data-pp-programme]")) pp.ppProgressChip(el, el.getAttribute("data-pp-programme"));
    const going = pp.ppProgrammeIds().map((id) => pp.ppProgramme(id)).filter((p) => p && p.passed > 0 && p.passed < p.total)
      .sort((a, b) => b.passed / b.total - a.passed / a.total).slice(0, 3);
    if (!going.length) return;
    const box = document.getElementById("hm-cont-progs");
    for (const p of going) {
      const a = document.createElement("a");
      a.className = "hm-cont-prog";
      a.href = HM_LINKS.smartcity + "?programme=" + encodeURIComponent(p.id);
      const card = document.querySelector('#hm-progs [data-pp-programme="' + String(p.id).replace(/[^a-z0-9-]/g, "") + '"]');
      const prog = card ? card.closest(".prog") : null;
      if (prog) a.style.setProperty("--tint", prog.style.getPropertyValue("--tint"));
      const b = document.createElement("b"); b.textContent = p.name;
      const chip = document.createElement("span");
      a.append(b, chip);
      pp.ppProgressChip(chip, p.id);
      box.append(a);
    }
    box.hidden = false;
  }).catch(() => { /* no module server (file://): the cards stay as they are */ });

  // ---- "My cohorts" on the continue strip (shared/org.js, docs/enterprise.md):
  // the cohorts the person on this device joined by invite code, each with its
  // programme ladder computed from this device's own records. Shown to the
  // learner only and never stored, so the sharing consent is not involved.
  // (Inside a template literal: string concatenation, no backticks.)
  function hmCohorts(org) {
    const mine = org.enMyCohorts();
    if (!mine.length) return;
    const box = document.getElementById("hm-cont-cohorts");
    for (const c of mine) {
      const card = document.createElement("div");
      card.className = "hm-cont-prog hm-cont-cohort";
      if (c.org && c.org.colour) card.style.setProperty("--tint", c.org.colour);
      const b = document.createElement("b");
      b.textContent = c.cohort.name + (c.org ? " \\u00b7 " + c.org.name : "");
      const line = document.createElement("span");
      line.className = "hm-cohort-line";
      line.textContent = c.programme.name + " \\u00b7 " + c.passed + " of " + c.total + " stations passed \\u00b7 " + (c.member.sharing ? "sharing progress with the coordinator" : "progress not shared");
      const ladder = document.createElement("ol");
      ladder.className = "hm-ladder";
      ladder.setAttribute("aria-label", "Programme ladder for " + c.programme.name);
      for (const st of c.ladder) {
        const li = document.createElement("li");
        li.className = "hm-rung hm-rung-" + st.state;
        li.title = st.simId + ": " + (st.state === "passed" ? "passed, " + st.stars + " stars" : st.state === "tried" ? st.attempts + " attempt(s), not yet passed" : "not yet tried");
        li.textContent = st.state === "passed" ? "\\u2605" : st.state === "tried" ? "\\u00b7" : "";
        ladder.append(li);
      }
      const go = document.createElement("a");
      go.href = HM_LINKS.smartcity + "?programme=" + encodeURIComponent(c.programme.id);
      go.textContent = "Continue this programme";
      card.append(b, line, ladder, go);
      box.append(card);
    }
    box.hidden = false;
    document.getElementById("continue").dataset.cohorts = String(mine.length);
  }
  import("./shared/org.js").then(hmCohorts).catch(() => { /* no module server (file://) */ });
`;
}

function appCard(layout, { href, tint: t, count, name, blurb, go, shot }) {
  // The string-table key for this card (tools/i18n/en.json card.<key>.*), shown translated in non-English modes.
  const key = shot ?? ({ "Trade Skills Simulator": "trades", "Instructor Console": "instructor", "Credential verifier": "verify" })[name];
  if (shot) {
    // A world card: the real in-game capture on top (tools/capture_home_thumbs.mjs),
    // or the world's own tint as a gradient until one has been captured.
    const src = hmThumb(shot);
    const img = src
      ? `<img src="${src}" alt="In-game view of ${esc(name)}" width="480" height="270" decoding="async">`
      : "";
    return `      <a class="app world" style="--tint:${t}" href="${href}">
        <span class="shot">${img}${hmCardVideo(layout, shot)}</span>
        <span class="body">
          <span class="count">${esc(count)}</span>
          <h2>${esc(name)}</h2>
          <p>${esc(blurb)}</p>
          <span class="go">${esc(go)}</span>
        </span>
      </a>`;
  }
  return `      <a class="app" style="--tint:${t}" href="${href}">
        <span class="count">${esc(count)}</span>
        <h2${key ? ` data-tr="card.${key}.name"` : ""}>${esc(name)}</h2>
        <p class="card-blurb">${esc(blurb)}</p>${key ? `
        <p class="card-tag" data-tr="card.${key}.tag"></p>` : ""}
        <span class="go"${key ? ` data-tr="card.${key}.go"` : ""}>${esc(go)}</span>
      </a>`;
}

/**
 * One programme in the finder. The filters read index lists and fixed world
 * tokens from data attributes; every catalog string stays in a text position
 * (the trades the programme covers ride along in a clipped span so the text
 * search can find "welder" or "diver" without printing a wall of them).
 */
function hmProgrammeCard(layout, c, { catIndex, unionTokens, tradesOf, catNames }) {
  const id = slug(c.id, "programme id");
  const n = (c.stations ?? []).length;
  const cats = [...new Set((c.stations ?? []).map((s) => catIndex.get(s.id)).filter((i) => i !== undefined))];
  const tokens = hmTokensOf(c.union);
  const us = unionTokens.map((u, i) => (tokens.includes(u.token) ? i : -1)).filter((i) => i >= 0);
  const worlds = hmWorldsOf(c);
  const catLine = cats.slice(0, 2).map((i) => catNames[i]).join(", ");
  return `      <article class="prog" style="--tint:${tint(c.accent)}" data-cat="${cats.join(" ")}" data-u="${us.join(" ")}" data-w="${worlds.join(" ")}"${c.audience === "classroom" ? ` data-aud="classroom"` : ""}>
        <span class="at-card__art">${atIllustration(id)}</span>
        <h3 data-tr="prog.${id}.t">${esc(c.name)}</h3>
        <p class="prog-tag" data-tr="prog.${id}.g">${esc(HM_TAGLINES[`prog.${id}.g`] ?? "")}</p>
        <p class="prog-union">${esc(c.union ?? "")}</p>
        <p class="prog-meta">${n} station${n === 1 ? "" : "s"}${catLine ? ` · ${esc(catLine)}` : ""}</p>
        <span class="pp-chip" data-pp-programme="${id}" hidden></span>
        <span class="vh">${esc(tradesOf(c).join(" · "))}</span>
        <span class="prog-foot"><a class="btn primary prog-go" href="${layout.app.smartcity}?programme=${id}">Start<span class="vh"> ${esc(c.name)}</span></a></span>
      </article>`;
}

function stationCard(layout, station, ordinal) {
  const href = stationHref(layout, station);
  const idx = station.index ? `Station ${station.index}` : `Room ${ordinal}`;
  const appTag = station.app === "trades" ? `<span class="app-tag">Trade Skills</span>` : "";
  return `        <a class="card" style="--tint:${tint(station.accent)}" href="${href}">
          <span class="idx">${esc(idx)}</span>${appTag}
          <h3>${esc(station.name)}</h3>
          <p class="trade">${esc(station.trade ?? "")}</p>
          <p class="tag">${esc(station.tagline ?? "")}</p>
          <span class="vh">${esc(station.id)} · ${esc(station.category ?? "")} · ${esc(station.certification ?? "")}</span>
        </a>`;
}

/**
 * The whole page. `layout` is "repo" or "flat"; nothing else differs between
 * the two files.
 */
export function renderHome(catalog, devicesMd, layoutName = "repo") {
  const layout = LAYOUTS[layoutName];
  if (!layout) throw new Error(`unknown layout: ${layoutName}`);
  const stations = catalog.stations ?? [];
  const byId = new Map(stations.map((s) => [`${s.app}:${s.id}`, s]));
  const categories = catalog.categories ?? [];
  const cityCount = stations.filter((s) => s.app === "smartcity").length;
  const roomCount = stations.filter((s) => s.app === "trades").length;
  let roomOrdinal = 0;
  const ordinals = new Map();
  for (const s of stations) if (s.app === "trades") ordinals.set(s.id, (roomOrdinal += 1));

  // The eight worlds, each with its real in-game capture, Bay World first
  // (it is where "Start playing" goes); then the two tools that are not worlds.
  const worlds = [
    appCard(layout, {
      href: layout.app.bayworld, tint: "#4fd1ff", count: `${BAY_SITES.length} job sites`, shot: "bayworld",
      name: "Bay World", go: "Enter Bay World",
      blurb: "A free-roam open-world city: walk or drive anywhere, day turns to night, traffic keeps its lanes, and every job board on the map launches a real training station.",
    }),
    appCard(layout, {
      href: layout.app.regatta, tint: "#4fd6a5", count: "12 yachts", shot: "regatta",
      name: "Bay Regatta", go: "Cast off",
      blurb: "Bay World's water: a fleet of twelve motor yachts, hosted events with a safety briefing before every cast-off, and three race courses scored on the marks, the no-wake zone, right of way and a clean docking.",
    }),
    appCard(layout, {
      href: layout.app.underwater, tint: "#4fb3c8", count: `${DEEP_SITES.length} dive sites`, shot: "underwater",
      name: "The Deep", go: "Dive in",
      blurb: "The dive game under the bay: swim or pilot an ROV over a large seabed with a buddy on a line, an ascent line at every site and a reserve you watch rather than count, and every job board launches a real dive or restoration station.",
    }),
    appCard(layout, {
      href: layout.app.summit, tint: "#7fd3ff", count: `${SM_SITES.filter((s) => s.stations.length).length} job sites`, shot: "summit",
      name: "Sierra Summit", go: "Start the climb",
      blurb: "A 4 km mountain to walk: a dam and its penstock, a pass road and tunnel, a transmission ridge, a gondola and a summit lookout — and every job board opens a real line, dam, road or lift station.",
    }),
    appCard(layout, {
      href: layout.app.parishes, tint: "#7fd3ff", count: `${npRegionGroups(NP_PARISHES).map(({ region, parishes }) => `${parishes.length} ${parishes.length === 1 ? region.noun : region.nouns}`).join(" · ")} · ${NP_PARISHES.reduce((n, p) => n + p.sites.length, 0)} job sites`, shot: "parishes",
      name: "New Orleans Parishes", go: "Walk the delta",
      blurb: "Streamed 4 km parish worlds on the delta: the river's bend, the lake shore, levees and floodwalls, the outfall canals and a wetland triangle — with job boards for the port, the levee crews, a pumping station, the streetcar barn, the rail yard, the hospital and stadium districts and a wetland restoration site.",
    }),
    // San Francisco on the parish engine (GOLDEN-B): the districts with region "san-francisco", opened at Marina & Presidio.
    appCard(layout, {
      href: `${layout.app.parishes}?parish=sf-marina`, tint: "#f2a65a", count: `${NP_SF.length} district${NP_SF.length === 1 ? "" : "s"} · ${NP_SF.reduce((n, p) => n + p.sites.length, 0)} job sites`, shot: "sanfrancisco",
      name: "San Francisco Districts", go: "Cross the Golden Gate",
      blurb: "Streamed 4 km districts of San Francisco on the bay: the yacht harbour, the Presidio and the Golden Gate Bridge's crews in the north, the port's southern terminals, the Hunters Point clean-up and two wetlands coming back in the south-east — and the Bay Bridge across to Bay World.",
    }),
    appCard(layout, {
      href: layout.app.fairway, tint: "#8cff5a", count: "Nine holes", shot: "fairway",
      name: "Fairway Park", go: "Play Fairway Park",
      blurb: "An original nine-hole course and an outdoor sports facility, played for real strokes and real scores — with a groundskeeper's log that scores course care right alongside them.",
    }),
    appCard(layout, {
      href: layout.app.redwood, tint: "#e0a040", count: `${RW_SITES.length} work sites`, shot: "redwood",
      name: "Redwood Reach", go: "Walk in",
      blurb: "A four-kilometre forest world: coastal redwoods, a river valley down to an estuary, fire roads, a fire lookout, a sawmill, a restoration reach and a rural substation — every job board opens a real station, and side quests unlock as your skills do.",
    }),
    appCard(layout, {
      href: layout.aside.atlas, tint: "#f2c14b", count: "Map", shot: "atlas",
      name: "Bay Atlas", go: "Open the Atlas",
      blurb: "Every Bay World site and landmark with its programmes over a map — a real-world one when you bring your own Mapbox token.",
    }),
    appCard(layout, {
      href: layout.app.smartcity, tint: "#4fd1ff", count: `${cityCount} stations`, shot: "smartcity",
      name: "SmartCiti.X", go: "Enter SmartCiti.X",
      blurb: "Municipal and heavy-industrial procedures on one digital-twin plaza — isolation, entry, rigging, climbing, response and restoration, each station its own rank ladder and badge set.",
    }),
    appCard(layout, {
      href: layout.app.holodeck, tint: "#a079ff", count: "Generator", shot: "holodeck",
      name: "Holodeck", go: "Enter Holodeck",
      blurb: "Describe a procedure and it builds one, or name a station from the roster and it loads that exact one, hazards and interruptions included.",
    }),
  ].join("\n");
  const moreApps = [
    appCard(layout, {
      href: layout.app.trades, tint: "#37d6c0", count: `${roomCount} rooms`,
      name: "Trade Skills Simulator", go: "Enter Trade Skills",
      blurb: "The bench version: one room per trade, the whole scene built around a single procedure with seeded hazards and graded skill gauges.",
    }),
    appCard(layout, {
      href: layout.app.instructor, tint: "#f2c14b", count: "Live",
      name: "Instructor Console", go: "Open the console",
      blurb: "The class as it runs: where each learner is, every unsafe action as it happens, and the commands an instructor can put in front of one of them.",
    }),
    appCard(layout, {
      href: layout.aside.verify, tint: "#59c97b", count: "Credentials",
      name: "Credential verifier", go: "Verify a badge",
      blurb: "Check an exported badge or training record: who earned it, for which station, and that nothing in it was changed.",
    }),
  ].join("\n");

  // The programme finder: one card per programme, filterable by text, union,
  // category and world.
  const curricula = catalog.curricula ?? [];
  const catIndex = new Map();
  categories.forEach((cat, i) => { for (const id of cat.stations ?? []) if (!catIndex.has(id)) catIndex.set(id, i); });
  const catNames = categories.map((c) => c.name);
  const unionTokens = hmUnionTokens(curricula);
  const tradesOf = (c) => [...new Set((c.stations ?? []).map((s) => byId.get(`${s.app}:${s.id}`)?.trade).filter(Boolean))];
  const progCards = curricula.map((c) => hmProgrammeCard(layout, c, { catIndex, unionTokens, tradesOf, catNames })).join("\n");
  const unionOptions = unionTokens.map((u, i) => `<option value="${i}">${esc(u.token)}</option>`).join("");
  const catOptions = categories.map((c, i) => `<option value="${i}">${esc(c.name)}</option>`).join("");
  const worldOptions = HM_WORLD_FILTERS.map(([id, name]) => `<option value="${id}">${esc(name)}</option>`).join("");
  const unionChips = unionTokens.map((u, i) => `      <button type="button" class="hm-union" data-u="${i}" aria-pressed="false">${esc(u.token)}<small>${u.count}</small></button>`).join("\n");

  const sections = categories.map((cat) => {
    const members = (cat.stations ?? []).map((id) => byId.get(`smartcity:${id}`) ?? byId.get(`trades:${id}`)).filter(Boolean);
    // At most three domains: the line is a hint at what the category covers,
    // not an index of every label the stations in it happen to carry.
    const domains = [...new Set(members.map((s) => s.domain).filter(Boolean))].slice(0, 3);
    const cards = members.map((s) => stationCard(layout, s, ordinals.get(s.id))).join("\n");
    return `    <section class="cat">
      <h2>${esc(cat.name)}</h2>
      <p class="catmeta">${members.length} station${members.length === 1 ? "" : "s"}${domains.length ? ` · ${esc(domains.join(", "))}` : ""}</p>
      <div class="grid">
${cards}
      </div>
    </section>`;
  }).join("\n");

  const docs = [
    ["Controls, keyboard and voice", layout.doc("controls.md")],
    ["Head-worn devices", layout.doc("devices.md")],
    ["Proof of training", layout.doc("proof-of-training.md")],
    ["Standards and authorities", layout.doc("standards/README.md")],
    ["Instructor console", layout.doc("instructor-console.md")],
    ["Sign-in options", layout.doc("sign-in.md")],
    // The privacy page sits beside the homepage in both layouts (docs/enterprise.md).
    ["Privacy — what is stored where", "privacy.html"],
    ["Organisations and cohorts", layout.doc("enterprise.md")],
    ["Wallets and sharing", layout.doc("wallets-and-sharing.md")],
    ["Agent protocols", layout.doc("agent-protocols.md")],
  ].map(([label, href]) => `        <li><a href="${href}">${esc(label)}</a></li>`).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
${wfHeadFor("index.html", layoutName === "flat" ? "dist/index.html" : "index.html")}
<meta name="generator" content="tools/gen_home.mjs">
<link rel="stylesheet" href="./shared/design.css">
<style>${CSS}${CN_CSS}</style>
</head>
<body>
<!-- Generated by tools/gen_home.mjs from WebXR/smartcity/catalog.json — edit the generator, not this file. -->
<a class="skip" href="#catalog" data-tr="home.skip">Skip to the station list</a>

<header class="top" id="top">
  <div class="top-in">
    <p class="brandline">${esc(catalog.network ?? "Training simulators")}</p>
    <nav class="hm-nav" aria-label="Sections">
      <a href="#worlds">Worlds</a>
      <a href="#finder">Programmes</a>
      <a href="#catalog">Every station</a>
    </nav>
    <div class="who">
      <span class="who-line" id="who" hidden></span>
      <button class="btn" id="signin" type="button" hidden>Sign in</button>
      <button class="btn quiet" id="signout" type="button" hidden>Sign out</button>
    </div>
  </div>
</header>

<section class="hero" id="hero" aria-labelledby="hero-title">
${hmHeroVideo(layout)}
  <div class="hero-in">
    <p class="eyebrow">${stations.length} stations · ${categories.length} categories · ${curricula.length} programmes</p>
    <h1 id="hero-title">Pick the job.<br><em>Train the procedure.</em></h1>
    <p class="hero-lead">Walk a city at dusk, sail the bay, dive below it — and every job board you find opens a real, scored safety procedure from a real trade.</p>
    <div class="hm-actions">
      <a class="hm-act go" id="hm-start" href="${layout.app.bayworld}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>Start playing</a>
      <a class="hm-act alt" id="hm-find" href="#finder"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 15l5 5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>Find your trade</a>
    </div>
  </div>
</section>

<main class="wrap">
  <section class="continue hm-sec" id="continue" aria-labelledby="continue-title">
    <p class="eyebrow" id="continue-title" data-tr="home.continue">Continue where you left off</p>
    <p class="cont-line" id="continue-line">Nothing here yet — this is your first visit on this device. Finish any station and it waits for you here, with your programmes beside it.</p>
    <div class="cont-row">
      <a class="btn primary" id="continue-link" href="${layout.app.bayworld}">Start in Bay World</a>
      <a class="btn" id="hm-cont-world" href="${layout.app.bayworld}" hidden></a>
    </div>
    <p class="cont-due" id="continue-due" hidden></p>
    <div class="hm-cont-progs" id="hm-cont-progs" hidden></div>
    <div class="hm-cont-progs" id="hm-cont-cohorts" hidden></div>
  </section>

  <section class="hm-sec" id="how" aria-labelledby="how-title">
    <p class="eyebrow" data-tr="home.how">How it works</p>
    <h2 id="how-title" data-tr="home.howTitle">Play. Take a job. Pass it. Earn it.</h2>
    <ol class="hm-steps">
      <li style="--step:#4fd1ff"><b>Play</b><span>Walk or drive Bay World, sail the Regatta, dive the Deep or play Fairway Park — on a phone, a laptop or a headset.</span></li>
      <li style="--step:#f2c14b"><b>Take a job</b><span>Every job board on the map opens a real training station for a real trade, with its union named.</span></li>
      <li style="--step:#8cff5a"><b>Pass the procedure</b><span>You are scored on what you touch and in what order — hazards, interruptions, holds and torque included.</span></li>
      <li style="--step:#a079ff"><b>Earn the credential</b><span>Stars, badges and a passport record that counts across every world, and that you can export and have verified.</span></li>
    </ol>
  </section>

  <section class="hm-sec" id="worlds-sec" aria-labelledby="worlds-title">
    <p class="eyebrow" data-tr="home.worldsEyebrow">Seven worlds, one passport</p>
    <h2 id="worlds-title" data-tr="home.worldsTitle">Choose a world</h2>
    <p class="sub">Every picture here is a real capture from the game it opens.</p>
    <div class="worlds" id="worlds">
${worlds}
    </div>
    <div class="more-apps">
${moreApps}
    </div>
    <p class="aside">Also here: <a href="${layout.aside.atlas}">the Bay Atlas</a>, every Bay World site and landmark with its programmes over a map (a real-world one when you bring your own Mapbox token),
    <a href="${layout.aside.portal}">the app map</a>,
    <a href="${layout.aside.verify}">the credential verifier</a> for an exported badge, and
    <a href="${layout.aside.campus}">Safety Campus</a>, the hazard-spotting web companion to the Unity headset build.</p>
  </section>

  <section class="finder hm-sec" id="finder" aria-labelledby="finder-title">
    <p class="eyebrow" data-tr="home.finder">Programme finder</p>
    <h2 id="finder-title" class="hm-h2" data-tr="home.find">Find your trade</h2>
    <p class="hm-sub">${curricula.length} programmes — the ordered blocks a hall runs. Each opens at the first station you have not yet passed, and your progress on this device shows on its card.</p>
    <div class="hm-filters">
      <label>Search<input id="hm-find-q" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search" placeholder="Electrician, diver, crane, nurse, IBEW…" data-tr-ph="home.searchPh"></label>
      <label>Union<select id="hm-find-union"><option value="" data-tr="home.anyUnion">Any union</option>${unionOptions}</select></label>
      <label>Category<select id="hm-find-cat"><option value="" data-tr="home.anyCategory">Any category</option>${catOptions}</select></label>
      <label>World<select id="hm-find-world"><option value="" data-tr="home.anyWorld">Any world</option>${worldOptions}</select></label>
      <label>Who for<select id="hm-find-aud"><option value="">Everyone</option><option value="classroom">Classroom (K-12)</option></select></label>
    </div>
    <p class="hm-find-count" id="hm-find-count" role="status">${curricula.length} programmes.</p>
    <div class="hm-progs" id="hm-progs">
${progCards}
    </div>
    <p class="nohits at-empty" id="hm-find-none" hidden>${atIllustration("safety")}No programme matches all of that. <button type="button" class="linkbtn" id="hm-find-reset" data-tr="home.showEvery">Show every programme</button></p>
    <button type="button" class="btn hm-more" id="hm-find-more" data-tr="home.showMatching" hidden>Show all matching programmes</button>
  </section>

  <section class="hm-sec" id="unions" aria-labelledby="unions-title">
    <p class="eyebrow" data-tr="home.unions">Unions and training bodies</p>
    <h2 id="unions-title" data-tr="home.unionsTitle">Find your union</h2>
    <p class="sub">The bodies named most often across the programmes. Pick one to see its programmes in the finder; the number is how many name it.</p>
    <div class="hm-unions">
${unionChips}
    </div>
  </section>

  <section class="hm-sec" id="agent-net" aria-labelledby="agent-net-title">
    <p class="eyebrow">In preparation</p>
    <h2 id="agent-net-title">SmartCiti.X on the agent network</h2>
    <p class="sub">In preparation, not live: a plan for other software agents to hire this platform's station evaluations in simulation,
    synthetic robot-skill datasets, curriculum queries and lessons. No learner data ever leaves your device.
    <a href="${layout.doc("virtuals/strategy.md")}">Read the plan</a>.</p>
  </section>

  <section class="hm-about" aria-labelledby="about-title">
    <p class="eyebrow" id="about-title" data-tr="home.engine">One engine underneath</p>
    <p class="lead">Three simulators share one procedure engine, one apprentice profile and one training record:
    <b>SmartCiti.X</b>'s ${cityCount} municipal and industrial stations, the <b>Trade Skills Simulator</b>'s ${roomCount} benches,
    and the <b>Holodeck</b>'s prompt-built procedures. Every station names the union and the certification the work really
    needs, and scores what you touch and in what order — hazards, interruptions, holds and torque included.
    Pick a world, follow a programme, or search the roster below.</p>
    <p class="devices">${esc(deviceLine(devicesMd))}</p>
    <p class="aside">Off by default: <button type="button" class="linkbtn" id="share-open">share your anonymised training engagement to help train agents and robots</button> —
    episode digests and roll-up scores only, never your name or free text, on the licence you choose, revocable any time.</p>
  </section>

  <section class="find">
    <label class="eyebrow" for="q" data-tr="home.searchStations">Search every station</label>
    <input id="q" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search"
      placeholder="Station, id, trade, category or standard — try confined space, IBEW, welding">
    <p class="count" id="count" role="status"></p>
    <p class="nohits" id="nohits" hidden>Nothing matches that. <button type="button" class="linkbtn" id="clear-q" data-tr="home.clear">Clear the search</button></p>
  </section>

${tracksSection(catalog, layoutName)}

  <div id="catalog">
${sections}
  </div>
</main>

<footer>
  <div class="foot">
    <h2>Documentation</h2>
    <ul>
${docs}
    </ul>
    <p>${esc(layout.note)} <a href="${layout.catalog}">catalog.json</a>, the machine-readable roster a platform can index
    without loading an app. Progress, records and badges stay in this browser until you export them.</p>
    <p>See the <a href="${layout.accessibility}">accessibility statement</a> and
    <a href="${REPO}">the repository</a>. ${esc(catalog.network ?? "")}</p>
    <button class="egg" id="egg" type="button" data-egg="${layout.egg}" aria-label="Hard hat" title="Hard hat"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 32 C9 20 16 12 24 12 C32 12 39 20 39 32 Z" fill="#f2c14b"/><rect x="5" y="31" width="38" height="5" rx="2" fill="#c99a2e"/><rect x="21" y="12" width="6" height="19" rx="2" fill="#ffd97a"/></svg></button>
    <span class="hardhat-count" id="hardhat-count" hidden></span>
    <button type="button" class="egg-ledger-btn" id="egg-ledger-btn" hidden></button>
  </div>
</footer>
<div class="egg-toast" id="egg-toast" role="status" hidden>Night Highway Circuit — the hidden arcade racer, local multiplayer. Opening…</div>
<div id="radio-mount"></div>

<dialog id="egg-ledger-dialog" aria-labelledby="egg-ledger-title">
  <div class="dlg">
    <p class="eyebrow">Found so far, in this browser</p>
    <h2 id="egg-ledger-title">Easter egg ledger</h2>
    <p>Every training-behaviour field note this browser has actually earned inside SmartCiti.X, grouped by the
    programme that earned it, with the lesson it taught. Kept only in this browser's <code>vr-training-egg-ledger-v1</code>
    — this is a running list of what you have noticed, not a training record.</p>
    <div id="egg-ledger-body"></div>
    <div class="dlg-row"><button class="btn" id="egg-ledger-close" type="button">Close</button></div>
  </div>
</dialog>

<dialog id="signin-dialog" aria-labelledby="dlg-title">
  <div class="dlg">
    <p class="eyebrow">Sign in</p>
    <h2 id="dlg-title">Put your name on the record</h2>
    <p>These pages are static files: they collect a credential and hand it to your training host, which is what verifies it.
    Only the options this deployment configured, and this browser can actually do, are listed.</p>
    <div class="opts" id="opts"></div>
    <div class="field" id="dlg-field" hidden>
      <label for="dlg-field-input" id="dlg-field-label">Your e-mail address</label>
      <input id="dlg-field-input" type="email" autocomplete="email">
    </div>
    <p class="dlg-msg" id="dlg-msg" hidden></p>
    <div id="dlg-mount"></div>
    <div class="dlg-row">
      <button class="btn" id="dlg-close" type="button">Close</button>
    </div>
    <p class="dlg-fine">Signing in is optional. Without it you are a crew tag in this browser, and every record still works.</p>
  </div>
</dialog>

<dialog id="share-dialog" aria-labelledby="share-title">
  <div class="dlg">
    <p class="eyebrow">Share to train agents & robots</p>
    <h2 id="share-title">Help train agents and robots</h2>
    <p>Opt in to share anonymised training engagement — episode digests and roll-up scores only, never your name,
    free text or launch identity — with agent-protocol platforms so they can train software agents and robots on
    real practice patterns. This is off by default, and nothing is sent until you press Share, below.</p>
    <div class="dlg-section">
      <p class="eyebrow">Wallet (optional)</p>
      <p id="share-wallet-status">Connecting a wallet lets your opt-in be signed (personal_sign) so a relay can check who gave it.
      Without one, opting in still works as a plain, unsigned record kept in this browser. This page never asks for a
      private key or a seed phrase.</p>
      <div class="dlg-row">
        <button class="btn" id="share-wallet-connect" type="button">Connect wallet</button>
        <button class="btn quiet" id="share-wallet-disconnect" type="button" hidden>Disconnect wallet</button>
      </div>
    </div>
    <div class="dlg-section">
      <p class="eyebrow">Licence</p>
      <div class="licence-opts" id="share-licence"></div>
    </div>
    <p class="dlg-msg" id="share-msg" hidden></p>
    <div class="dlg-row">
      <button class="btn primary" id="share-optin" type="button">Opt in</button>
      <button class="btn primary" id="share-now" type="button" hidden>Share</button>
      <button class="btn quiet" id="share-revoke" type="button" hidden>Revoke</button>
    </div>
    <div class="dlg-section">
      <p class="eyebrow">What is shared, and what never is</p>
      <ul>
        <li>Shared: anonymised episode digests and the per-category roll-up scores already in Training Records.</li>
        <li>Never shared: your name, crew tag, free text, or any launch identity.</li>
      </ul>
      <p class="eyebrow" style="margin-top:8px">Receipts</p>
      <ul class="receipt-list" id="share-receipts"></ul>
      <p id="share-no-receipts">Nothing has been shared yet.</p>
    </div>
    <div class="dlg-row">
      <button class="btn" id="share-close" type="button">Close</button>
    </div>
    <p class="dlg-fine">Sharing is optional and revocable at any time. Revoking removes the local consent record; it
    does not un-send anything already delivered to a relay. See <a href="${layout.doc("wallets-and-sharing.md")}">wallets and sharing</a>
    and <a href="${layout.doc("agent-protocols.md")}">agent protocols</a>.</p>
  </div>
</dialog>

<script type="module">${wfSearchScript(catalog)}</script>
<script type="module">${SCRIPT}</script>
<script type="module">${hmScript(layout)}</script>
<script type="module">import { ctlMount } from "./shared/controls.js"; ctlMount({ world: "the homepage", home: "#top", except: { move: "A page, not a world: Tab walks the cards.", look: "Scroll the page.", interact: "Enter opens the focused card.", map: "Each world keeps its own map.", view: "—", quality: "Set inside each world." } }); { const hmNav = document.getElementById("ctl-nav"); const hmFit = () => document.documentElement.style.setProperty("--hm-nav-w", (hmNav ? Math.ceil(hmNav.getBoundingClientRect().right) + 12 : 56) + "px"); hmFit(); if (hmNav && window.ResizeObserver) new ResizeObserver(hmFit).observe(hmNav); }</script>
<script type="module">import { gdMount } from "./shared/guide.js"; gdMount({ root: ${JSON.stringify(layout.guideRoot)}, y: 0.9 });</script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------- main

/** Write both variants. Exported, because gen_catalog.mjs calls it directly. */
export function writeHome() {
  const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
  const devicesMd = readFileSync(join(ROOT, "docs", "devices.md"), "utf8");
  const written = [];
  for (const [name, layout] of Object.entries(LAYOUTS)) {
    const html = renderHome(catalog, devicesMd, name);
    writeFileSync(join(WEBXR, layout.out), html);
    written.push(`WebXR/${layout.out} (${(html.length / 1024).toFixed(0)} KB, ${name} links)`);
  }
  console.log(`Wrote ${written.join(" and ")} — ${catalog.stations.length} stations, `
    + `${catalog.categories.length} categories, ${catalog.curricula.length} programmes`);
  return written;
}

if (import.meta.url === `file://${process.argv[1]}`) writeHome();
