/**
 * Search and share metadata for every page, from the catalog (console WAYFINDER).
 *
 *     node tools/gen_seo.mjs          (python3 tools/bundle_webxr.py runs it last)
 *
 * Writes one marked block into the <head> of every page — the published flat
 * folder WebXR/dist/ (homepage, the 11 app bundles, the track pages, 404),
 * the generated sources that are copied into it (WebXR/home.html,
 * WebXR/home/tracks/), the repo-layout homepage and every app's source and
 * per-app dist page — holding: one <title> (<= 60 chars) and meta description
 * (<= 155), a canonical link, theme-color, the web app manifest and icons,
 * Open Graph and Twitter card tags with a real capture as the image, and
 * JSON-LD (Organization, WebSite with its SearchAction and an ItemList of the
 * programmes on the homepage; one Course per programme on its track page).
 * Then it writes WebXR/dist/sitemap.xml, robots.txt, manifest.webmanifest,
 * 404.html and copies the captures and icons from WebXR/assets/wf/.
 *
 * Every text comes from the catalog or the page's own copy: no claim, number
 * or partner is written here that the page does not already state.
 *
 * URLs: tools/seo-config.json's baseUrl is empty by default and every URL is
 * then relative to the page; set it (ending in /) and every canonical, og:url,
 * og:image, JSON-LD url and sitemap <loc> becomes absolute. Each page points
 * at its copy in the published flat folder, so a repo-layout page names its
 * dist twin as canonical.
 *
 * New top-level names carry the `wf` prefix (the bundler's one-scope rule).
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const DIST = join(WEBXR, "dist");
const ASSETS = join(WEBXR, "assets", "wf");

export const WF_TITLE_MAX = 60;
export const WF_DESC_MAX = 155;
export const WF_CONFIG = JSON.parse(readFileSync(join(ROOT, "tools", "seo-config.json"), "utf8"));
const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
export const WF_PROGRAMMES = catalog.curricula;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Cut at a word boundary to fit `max`, with an ellipsis when anything was cut. */
export function wfFit(text, max) {
  const t = String(text).replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6)).replace(/[\s,;:—–-]+$/, "") + "…";
}

/**
 * A programme's description: its summary's whole sentences while they fit,
 * topped up with the track's own size when that leaves room.
 */
function wfSummary(prog, max) {
  const sentences = String(prog.summary).replace(/\s+/g, " ").match(/[^.!?]+[.!?]+(\s|$)/g) ?? [prog.summary];
  let out = "";
  for (const s of sentences) { const next = (out + " " + s.trim()).trim(); if (next.length > max) break; out = next; }
  if (!out) return wfFit(prog.summary, max);
  const size = ` A ${prog.stations.length}-station training track.`;
  return out.length < 100 && (out + size).length <= max ? out + size : out;
}

// ------------------------------------------------------------ the page table

const stations = catalog.stations.length;
const categories = catalog.categories.length;
const cityStations = catalog.apps?.smartcity?.stations ?? catalog.stations.filter((s) => s.app === "smartcity").length;
const rooms = catalog.apps?.trades?.rooms ?? catalog.stations.filter((s) => s.app === "trades").length;

/** Every app bundle: its flat file, its source folder and page, and its copy. */
export const WF_APPS = [
  { out: "smartcity-x.html", dir: "smartcity", index: "index.html", og: "og/smartcity.jpg",
    title: "SmartCiti.X — City Safety Training Stations",
    desc: `${cityStations} municipal and industrial training stations in one WebXR city. Each names its union and certification and scores what you touch, in order.` },
  { out: "trade-skills-simulator.html", dir: "trades", index: "index.html", og: "og/trades.jpg",
    title: "Trade Skills Simulator — Hands-On Trade Rooms",
    desc: `${rooms} trade rooms — electrical, salon, kitchen, phlebotomy, welding, plumbing and more — each a scored procedure on a flat screen or in a VR headset.` },
  { out: "holodeck.html", dir: "holodeck", index: "index.html", og: "og/holodeck.jpg",
    title: "Holodeck — Speak a Procedure Into a Simulation",
    desc: "Describe a procedure and the Holodeck builds it as a scored simulation; it can also load any SmartCiti.X station by name. Flat screen or VR." },
  { out: "instructor-console.html", dir: "instructor", index: "index.html", og: "og/instructor.jpg",
    title: "Instructor Console — Live Training Sessions",
    desc: "A live view of the training sessions on this machine or through a relay: where each learner is, what they have hit, and the programme they are on." },
  { out: "race.html", dir: "race", index: "index.html", og: "og/race.jpg",
    title: "Night Highway Circuit — Arcade Racer",
    desc: "An arcade racer on ten original courses, plus a Mirror class and a Battle Arena. Local multiplayer: split-screen on one machine or two browser tabs." },
  { out: "arcade.html", dir: "arcade", index: "index.html", og: "og/arcade.jpg",
    title: "Break Room Arcade — Four Retro Cabinets",
    desc: "Four original retro games in the crew break room: a climbing platformer, a side-scrolling runner, a falling-block stacker and a lane-crossing dodger." },
  { out: "fairway.html", dir: "fairway", index: "index.html", og: "og/fairway.jpg",
    title: "Fairway Park — Nine-Hole Golf Course",
    desc: "An original nine-hole golf course: stroke play with a timed swing meter, real scoring, and a groundskeeper's log that scores course care." },
  { out: "bayworld.html", dir: "bayworld", index: "index.html", og: "og/bayworld.jpg",
    title: "Bay World — Open-World City With Training Missions",
    desc: "Walk or drive a free-roam city, day and night, with traffic, weather, a map and missions that launch real training stations. Keyboard, touch, gamepad." },
  { out: "atlas.html", dir: "bayworld", index: "atlas.html", og: "og/atlas.jpg",
    title: "Bay Atlas — Training Sites and Programmes on a Map",
    desc: "Every Bay World training site and landmark with its programmes and deep links, over a map drawn from the world's own data." },
  { out: "regatta.html", dir: "regatta", index: "regatta.html", og: "og/regatta.jpg",
    title: "Bay Regatta — Motor Yacht Races With Safety Briefings",
    desc: "Twelve motor yachts on Bay World's water: a safety briefing before every cast-off and three race courses scored on marks, right of way and docking." },
  { out: "underwater.html", dir: "underwater", index: "underwater.html", og: "og/underwater.jpg",
    title: "The Deep — Dive and ROV Game Under the Bay",
    desc: "Swim or pilot an ROV over a large seabed, with a buddy line and an ascent line at every site, and job boards that launch real dive stations." },
  { out: "summit.html", dir: "summit", index: "index.html", og: "og/summit.jpg",
    title: "Sierra Summit — Mountain World With Work Sites",
    desc: "A four-kilometre mountain world: a reservoir and dam, a pass road, a transmission ridge and a lift shop, with job boards that open real training stations." },
  { out: "redwood.html", dir: "redwood", index: "redwood.html", og: "og/redwood.jpg",
    title: "Redwood Reach — Forest World With Work Sites",
    desc: "A four-kilometre coastal forest: a river valley, fire roads, a lookout, a sawmill and a wildland fire station, with job boards that open real stations." },
  { out: "parishes.html", dir: "parishes", index: "parishes.html", og: "og/home.jpg",
    title: "New Orleans Parishes — Delta Worlds With Work Sites",
    desc: "Four-kilometre parish worlds on the delta: the river's bend, the lake shore, levees, canals and wetlands, with job boards that open real training stations." },
  { out: "treasures.html", dir: ".", index: "treasures.html", og: "og/treasures.jpg",
    title: "Treasure Map — Hidden Finds Across the Platform",
    desc: "How many treasures you have found in each world and area, never where the unfound ones are. Each find teaches a line from a union, a standard or a station." },
  { out: "privacy.html", dir: ".", index: "privacy.html", og: "og/home.jpg",
    title: "What Is Stored Where — Privacy",
    desc: "What each store holds, where it lives (this browser only), what the free demo keeps, what an export contains, and what a cohort view can and cannot see." },
];

/** Repo-layout pages the flat folder does not publish: their canonical is themselves. */
export const WF_REPO_ONLY = [
  { file: "portal/index.html", title: "Training Network — Every WebXR App in One Place",
    desc: "One entry point for every WebXR training app in this repository: SmartCiti.X, the Trade Skills Simulator, the Holodeck and the worlds." },
  { file: "verify/index.html", title: "Credential Verifier — Check an Open Badges 2.0 Badge",
    desc: "Check an Open Badges 2.0 credential exported from the SmartCiti.X training network: its structure, dates, issuer and hosted copy." },
  { file: "campus/index.html", title: "Safety Campus — Hazard-Spotting Web Companion",
    desc: "Safety Campus, the hazard-spotting web companion to the Unity headset build of the training platform. Spot the hazards on a flat screen or in WebXR." },
];

/** A track page's title: the programme's name, shortened to its part before " — " when too long. */
export function wfTrackTitle(prog, taken = new Set()) {
  const tail = " — Training Track";
  for (const name of [prog.name, prog.name.split(" — ")[0]]) {
    const t = name + tail;
    if (t.length <= WF_TITLE_MAX && !taken.has(t)) return t;
  }
  const t = wfFit(prog.name, WF_TITLE_MAX);
  return taken.has(t) ? wfFit(`${prog.name.split(" — ")[0]} (${prog.id})`, WF_TITLE_MAX) : t;
}

/** The first station of a programme with a capture beside the track pages. */
function wfTrackImage(prog) {
  for (const s of prog.stations) if (existsSync(join(WEBXR, "home", "tracks", "img", `${s.id}.jpg`))) return `tracks/img/${s.id}.jpg`;
  return "og/home.jpg";
}

function wfOrg() {
  return { "@type": "Organization", name: WF_CONFIG.organization.name, url: WF_CONFIG.organization.url };
}

/**
 * Every page keyed by its path in the published flat folder, with its text,
 * image and structured data. `url(target, from)` resolves a flat-folder path
 * for a page at `from`.
 */
export function wfPages() {
  const pages = [];
  const progTitles = new Set();
  pages.push({
    key: "index.html", public: true,
    title: "SmartCiti.X — AR/VR Safety Training Simulators",
    desc: wfFit(`${stations} AR/VR training stations across ${categories} categories and ${WF_PROGRAMMES.length} programmes: walk a city, sail the bay or dive below it, and pass scored procedures.`, WF_DESC_MAX),
    og: "og/home.jpg", ogAlt: "The SmartCiti.X homepage: a city skyline at dusk behind the start buttons",
    ld: (u) => [
      { "@context": "https://schema.org", ...wfOrg() },
      { "@context": "https://schema.org", "@type": "WebSite", name: WF_CONFIG.siteName, url: u("index.html"),
        publisher: wfOrg(),
        potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${u("index.html")}?q={search_term_string}` }, "query-input": "required name=search_term_string" } },
      { "@context": "https://schema.org", "@type": "ItemList", name: "Training programmes", numberOfItems: WF_PROGRAMMES.length,
        itemListElement: WF_PROGRAMMES.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: u(`tracks/${p.id}.html`) })) },
    ],
    mirrors: [["dist/index.html", "dist/index.html"], ["home.html", "dist/index.html"], ["index.html", "index.html"]],
  });
  for (const a of WF_APPS) {
    const mirrors = [[`dist/${a.out}`, `dist/${a.out}`], [`${a.dir}/dist/${a.out}`, `${a.dir}/dist/${a.out}`], [`${a.dir}/${a.index}`, `${a.dir}/${a.index}`]];
    pages.push({ key: a.out, public: true, title: a.title, desc: a.desc, og: a.og, ogAlt: `A capture of ${a.title.split(" — ")[0]}`,
      ld: (u) => [{ "@context": "https://schema.org", "@type": "WebPage", name: a.title, description: a.desc, url: u(a.out),
        isPartOf: { "@type": "WebSite", name: WF_CONFIG.siteName, url: u("index.html") },
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: u("index.html") },
          { "@type": "ListItem", position: 2, name: a.title.split(" — ")[0], item: u(a.out) }] } }],
      mirrors });
  }
  for (const p of WF_PROGRAMMES) {
    const title = wfTrackTitle(p, progTitles);
    progTitles.add(title);
    const desc = wfSummary(p, WF_DESC_MAX);
    const key = `tracks/${p.id}.html`;
    pages.push({ key, public: true, title, desc, og: wfTrackImage(p), ogAlt: `A capture from the first station of ${p.name}`,
      ld: (u) => [
        { "@context": "https://schema.org", "@type": "Course", name: p.name, description: wfFit(p.summary, 500), url: u(key),
          provider: wfOrg(), ...(p.certification ? { educationalCredentialAwarded: p.certification } : {}),
          hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: u("index.html") },
          { "@type": "ListItem", position: 2, name: "Programmes", item: `${u("index.html")}#finder` },
          { "@type": "ListItem", position: 3, name: p.name, item: u(key) }] },
      ],
      mirrors: [[`dist/${key}`, `dist/${key}`], [`home/${key}`, `dist/${key}`]] });
  }
  pages.push({ key: "404.html", public: false, title: "Page Not Found — SmartCiti.X",
    desc: "That address does not match a page here. Go to the homepage, choose a world, find a programme or ask the Guide.",
    og: "og/home.jpg", ogAlt: "The SmartCiti.X homepage", ld: () => [], mirrors: [["dist/404.html", "dist/404.html"]] });
  for (const r of WF_REPO_ONLY) {
    pages.push({ key: `repo:${r.file}`, public: false, repoOnly: true, title: r.title, desc: r.desc, og: "og/home.jpg", ogAlt: "The SmartCiti.X homepage",
      ld: () => [], mirrors: [[r.file, r.file]] });
  }
  return pages;
}

/**
 * The URL of a flat-folder path (or, for a repo-only page, a WebXR/ path) as
 * written in a page that lives at WebXR/<at>.
 */
export function wfUrl(target, at, { repoOnly = false } = {}) {
  const base = WF_CONFIG.baseUrl;
  const full = repoOnly ? target : `dist/${target}`;
  // A repo-only page is not in the published folder, so it stays relative.
  if (base && !repoOnly) return base + target;
  const rel = posix.relative(posix.dirname(at), full);
  return rel || posix.basename(full);
}

let wfCache = null;
/** The head block for the page at flat path `key`, as written in WebXR/<at> (gen_home.mjs, gen_tracks.mjs). */
export function wfHeadFor(key, at) {
  wfCache ??= new Map(wfPages().map((p) => [p.key, p]));
  const page = wfCache.get(key);
  if (!page) throw new Error(`gen_seo: no page ${key}`);
  return wfBlock(page, at);
}

export const WF_BEGIN = "<!-- wf-seo: generated by tools/gen_seo.mjs from tools/seo-config.json and the catalog — edit the generator -->";
export const WF_END = "<!-- /wf-seo -->";

/** The head block for one page as it lives at WebXR/<at>. */
export function wfBlock(page, at) {
  const repoOnly = !!page.repoOnly;
  const u = (t) => wfUrl(t, at);
  const self = repoOnly ? wfUrl(page.key.slice(5), at, { repoOnly: true }) : u(page.key);
  const img = u(page.og);
  const ld = page.ld(u);
  const lines = [
    WF_BEGIN,
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.desc)}">`,
    `<link rel="canonical" href="${esc(self)}">`,
    `<meta name="theme-color" content="${WF_CONFIG.themeColor}">`,
    `<link rel="manifest" href="${esc(u("manifest.webmanifest"))}">`,
    `<link rel="icon" href="${esc(u("icons/icon.svg"))}" type="image/svg+xml">`,
    `<link rel="apple-touch-icon" href="${esc(u("icons/icon-192.png"))}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(WF_CONFIG.siteName)}">`,
    `<meta property="og:locale" content="${esc(WF_CONFIG.locale)}">`,
    `<meta property="og:title" content="${esc(page.title)}">`,
    `<meta property="og:description" content="${esc(page.desc)}">`,
    `<meta property="og:url" content="${esc(self)}">`,
    `<meta property="og:image" content="${esc(img)}">`,
    `<meta property="og:image:alt" content="${esc(page.ogAlt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(page.title)}">`,
    `<meta name="twitter:description" content="${esc(page.desc)}">`,
    `<meta name="twitter:image" content="${esc(img)}">`,
    ...ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`),
    WF_END,
  ];
  return lines.join("\n");
}

// Tags the block owns: any copy of them outside it is removed first.
const WF_OWNED = [
  /^<title>[^\n]*<\/title>\s*\n/gm,
  /^<meta name="description"[^\n]*>\s*\n/gm,
  /^<meta name="theme-color"[^\n]*>\s*\n/gm,
  /^<link rel="(?:canonical|manifest|icon|apple-touch-icon)"[^\n]*>\s*\n/gm,
  /^<meta (?:property="og:|name="twitter:)[^\n]*>\s*\n/gm,
];

/** Put the block into one HTML document's head, replacing the last one. */
export function wfStamp(html, block) {
  const s = html.indexOf(WF_BEGIN);
  if (s >= 0) {
    const e = html.indexOf(WF_END, s);
    html = html.slice(0, s) + html.slice(e + WF_END.length).replace(/^\n/, "");
  }
  // Only the head before its first script or style is touched.
  const headEnd = Math.min(...["</head>", "<script", "<style"].map((t) => { const i = html.indexOf(t); return i < 0 ? html.length : i; }));
  let head = html.slice(0, headEnd);
  const rest = html.slice(headEnd);
  for (const re of WF_OWNED) head = head.replace(re, "");
  const anchor = head.match(/<meta name="viewport"[^>]*>\n?/) ?? head.match(/<meta charset[^>]*>\n?/) ?? head.match(/<head[^>]*>\n?/);
  if (!anchor) throw new Error("no <head> to stamp");
  const at = anchor.index + anchor[0].length;
  const nl = anchor[0].endsWith("\n") ? "" : "\n";
  head = head.slice(0, at) + nl + block + "\n" + head.slice(at);
  if (!/<html[^>]*\blang=/.test(head)) head = head.replace(/<html\b/, `<html lang="${WF_CONFIG.locale}"`);
  return head + rest;
}

// ------------------------------------------------------------ the 404 page

function wf404(page) {
  const u = (t) => wfUrl(t, "dist/404.html");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
${wfBlock(page, "dist/404.html")}
<link rel="stylesheet" href="shared/design.css">
<style>
  :root{--void:#050a10;--panel:#0b141d;--text:#edf6fb;--muted:#a9c2d0;--accent:#4fd1ff;--accent-ink:#03202b;--edge:rgba(126,170,200,.32)}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;background:var(--void);color:var(--text);font:17px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
  .skip{position:absolute;left:-9999px;top:0;background:var(--panel);color:var(--text);padding:12px 16px}
  .skip:focus{left:16px;top:8px;z-index:20000}
  header,main,footer{max-width:760px;margin:0 auto;padding:0 16px}
  header{padding-top:64px}
  .eyebrow{color:var(--muted);letter-spacing:.12em;text-transform:uppercase;font-size:14px;margin:0}
  h1{font-size:clamp(30px,6vw,46px);line-height:1.1;margin:10px 0 12px}
  .lead{color:var(--muted);margin:0 0 24px}
  nav ul{list-style:none;margin:0;padding:0;display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
  nav a,.wf-go{display:flex;align-items:center;min-height:48px;padding:10px 16px;border-radius:10px;border:1px solid var(--edge);background:var(--panel);color:var(--text);text-decoration:none;font-weight:600}
  nav a.primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
  a:focus-visible,button:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
  .wf-go{cursor:pointer;font:inherit;font-weight:600;width:100%}
  footer{color:var(--muted);font-size:15px;padding-top:32px;padding-bottom:40px}
  footer a{color:var(--accent)}
</style>
</head>
<body>
<a class="skip" href="#wf-main">Skip to the ways back</a>
<header>
  <p class="eyebrow">Error 404</p>
</header>
<main id="wf-main">
  <h1 data-tr="wf.nf.title">That page is not here</h1>
  <p class="lead" data-tr="wf.nf.lead">The address may be mistyped, or the page has moved. Pick where to go next:</p>
  <nav aria-label="Ways back">
    <ul>
      <li><a class="primary" href="${u("index.html")}" data-tr="wf.nf.home">Go to the homepage</a></li>
      <li><a href="${u("index.html")}#worlds-sec" data-tr="wf.nf.worlds">Choose a world</a></li>
      <li><a href="${u("index.html")}#finder" data-tr="wf.nf.programmes">Find a programme</a></li>
      <li><button type="button" class="wf-go" id="wf-nf-signin" data-tr="wf.nf.signin">Sign in</button></li>
    </ul>
  </nav>
</main>
<footer>
  <p data-tr="wf.nf.help">Still lost? The Guide button in the corner answers questions about every world and programme.</p>
</footer>
<script type="module">import { ctlMount } from "./shared/controls.js"; ctlMount({ world: "this page", except: { move: "A page, not a world: Tab walks the links.", look: "Scroll the page.", interact: "Enter opens the focused link.", map: "Each world keeps its own map.", view: "—", quality: "Set inside each world." } });
document.getElementById("wf-nf-signin").addEventListener("click", () => document.getElementById("gt-account")?.click());</script>
<script type="module">import { gdMount } from "./shared/guide.js"; gdMount({ root: "./" });</script>
</body>
</html>
`;
}

// ------------------------------------------------------------ run

export function wfSitemap(pages) {
  const loc = (k) => (WF_CONFIG.baseUrl ? WF_CONFIG.baseUrl + k : k);
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by tools/gen_seo.mjs: every public page of the published folder. The <loc>s are relative until tools/seo-config.json names a baseUrl. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter((p) => p.public).map((p) => `  <url><loc>${esc(loc(p.key))}</loc></url>`).join("\n")}
</urlset>
`;
}

function main() {
  const pages = wfPages();
  // The 404 page first, so the stamp loop finds it.
  const nf = pages.find((p) => p.key === "404.html");
  writeFileSync(join(DIST, "404.html"), wf404(nf));
  let stamped = 0;
  for (const page of pages) {
    for (const [file, at] of page.mirrors) {
      const path = join(WEBXR, file);
      if (!existsSync(path)) continue;
      const html = readFileSync(path, "utf8");
      const out = wfStamp(html, wfBlock(page, at));
      if (out !== html) writeFileSync(path, out);
      stamped += 1;
    }
  }
  // Captures and icons beside the pages.
  mkdirSync(join(DIST, "og"), { recursive: true });
  mkdirSync(join(DIST, "icons"), { recursive: true });
  for (const f of readdirSync(join(WEBXR, "home", "img")).filter((x) => x.endsWith(".jpg"))) copyFileSync(join(WEBXR, "home", "img", f), join(DIST, "og", f));
  for (const f of readdirSync(ASSETS)) {
    if (f.startsWith("og-")) copyFileSync(join(ASSETS, f), join(DIST, "og", f.slice(3)));
    else if (f.startsWith("icon")) copyFileSync(join(ASSETS, f), join(DIST, "icons", f));
  }
  writeFileSync(join(DIST, "manifest.webmanifest"), JSON.stringify({
    name: `${WF_CONFIG.siteName} — AR/VR Safety Training`, short_name: WF_CONFIG.siteName,
    description: pages[0].desc, start_url: "./index.html", scope: "./", display: "standalone",
    background_color: WF_CONFIG.backgroundColor, theme_color: WF_CONFIG.themeColor, lang: WF_CONFIG.locale,
    icons: [
      { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "icons/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  }, null, 2) + "\n");
  writeFileSync(join(DIST, "sitemap.xml"), wfSitemap(pages));
  writeFileSync(join(DIST, "robots.txt"), `# Generated by tools/gen_seo.mjs. Every page here is public.\nUser-agent: *\nAllow: /\n${
    WF_CONFIG.baseUrl ? `Sitemap: ${WF_CONFIG.baseUrl}sitemap.xml\n` : "# Sitemap: sitemap.xml beside this file (an absolute Sitemap line is written once tools/seo-config.json names a baseUrl).\n"}`);
  console.log(`[seo] stamped ${stamped} pages (${pages.filter((p) => p.public).length} public in the sitemap); wrote sitemap.xml, robots.txt, manifest.webmanifest, 404.html${WF_CONFIG.baseUrl ? ` for ${WF_CONFIG.baseUrl}` : " with relative URLs"}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
