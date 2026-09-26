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
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tracksSection } from "./gen_tracks.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const REPO = "https://github.com/AGIFutureFoundation/vr-safety-training";

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
    app: { smartcity: "smartcity/index.html", trades: "trades/index.html", holodeck: "holodeck/index.html", instructor: "instructor/index.html" },
    aside: { portal: "portal/index.html", verify: "verify/index.html", campus: "campus/index.html" },
    doc: (name) => `../docs/${name}`,
    accessibility: "ACCESSIBILITY.md",
    catalog: "smartcity/catalog.json",
    egg: "race/index.html",
    note: "Deep links, categories and launch parameters for every station are in",
  },
  flat: {
    out: "home.html",
    app: { smartcity: "smartcity-x.html", trades: "trade-skills-simulator.html", holodeck: "holodeck.html", instructor: "instructor-console.html" },
    // The portal, the verifier and the Safety Campus page have no single-file
    // bundle, so in the flat layout they are named where they actually live
    // rather than linked to a file that is not in the folder.
    aside: { portal: `${REPO}/tree/main/WebXR/portal`, verify: `${REPO}/tree/main/WebXR/verify`, campus: `${REPO}/tree/main/WebXR/campus` },
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
    --void:#050a10; --panel:#0b141d; --panel-2:#101b27; --raised:#142130; --raised-2:#192a3b;
    --text:#edf6fb; --muted:#93b2c3; --dim:#6f8ea2;
    --accent:#4fd1ff; --accent-2:#7ee6ff; --accent-ink:#03202b; --violet:#a079ff;
    --warn:#f2c14b; --danger:#f0645b; --good:#59c97b;
    --edge:rgba(126,170,200,.16); --edge-strong:rgba(126,170,200,.32);
    --r-sm:6px; --r-md:10px; --r-lg:14px;
    --shadow-1:0 6px 18px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.04);
    --shadow-2:0 24px 60px rgba(0,0,0,.55);
    --ring:0 0 0 3px rgba(79,209,255,.22);
    --sans:"Barlow", system-ui, -apple-system, "Segoe UI", sans-serif;
    --cond:"Barlow Condensed", "Barlow", system-ui, sans-serif;
    --surface-card:linear-gradient(180deg, var(--panel-2), var(--panel));
    --gutter:16px;
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
  .skip{position:absolute; left:-9999px; top:0; background:var(--raised); padding:10px 14px; border-radius:var(--r-sm); z-index:40}
  .skip:focus{left:var(--gutter); top:8px}
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
    min-height:54px; padding:8px var(--gutter); max-width:1120px; margin:0 auto;
  }
  .brandline{
    font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.1em;
    font-size:12px; color:var(--muted); margin:0;
    flex:1 1 auto; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .who{display:flex; align-items:center; gap:10px; flex:0 0 auto}
  .who-line{font-size:12.5px; color:var(--muted); max-width:46ch}
  .who-line b{color:var(--text); font-weight:600}
  button{font:inherit; color:inherit}
  .btn{
    background:var(--raised); color:var(--text); border:1px solid var(--edge-strong);
    border-radius:var(--r-sm); padding:8px 14px; cursor:pointer;
    font-family:var(--cond); font-weight:600; text-transform:uppercase; letter-spacing:.09em; font-size:12.5px;
  }
  .btn:hover{background:var(--raised-2)}
  .btn.primary{background:linear-gradient(180deg,var(--accent-2),var(--accent)); color:var(--accent-ink); border-color:transparent}
  .btn.quiet{background:transparent}
  .linkbtn{background:none; border:0; padding:0; color:var(--accent-2); cursor:pointer; text-decoration:underline}

  /* ---- hero ---- */
  .hero{padding:30px 0 6px}
  .hero h1{
    font-family:var(--cond); font-weight:700; text-transform:uppercase; letter-spacing:.012em;
    font-size:clamp(30px,8.4vw,60px); line-height:1.02; margin:12px 0 0; text-wrap:balance;
  }
  .hero h1 em{font-style:normal; color:var(--accent)}
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
  .continue .cont-line{margin:4px 0 10px; font-size:14px; color:var(--text)}
  .continue .cont-due{margin:10px 0 0; font-size:13px; color:var(--warn)}

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
  .foot{padding:26px var(--gutter) 40px; max-width:1120px; margin:0 auto}
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
    .grid{grid-template-columns:1fr 1fr}
    .foot ul{grid-template-columns:1fr 1fr}
  }
  @media (min-width:900px){
    .hero{padding:52px 0 10px}
    .apps{grid-template-columns:repeat(4,1fr)}
    .grid{grid-template-columns:repeat(3,1fr)}
    .foot ul{grid-template-columns:repeat(3,1fr)}
  }
  @media (prefers-reduced-motion:reduce){
    *{transition:none !important; animation:none !important}
    .app:hover{transform:none}
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
      const on = terms.every((t) => c.hay.includes(t));
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

  function showWho() {
    const line = Auth?.describe?.();
    whoEl.hidden = !line;
    outBtn.hidden = !line;
    openBtn.hidden = !!line;
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

  openBtn.addEventListener("click", () => { renderOptions(); dialog.showModal(); });
  document.getElementById("dlg-close").addEventListener("click", () => dialog.close());
  outBtn.addEventListener("click", () => {
    const also = confirm("Signed out. Also clear the training records stored in this browser?");
    Auth.signOut({ clearRecords: also });
    showWho();
  });

  import("./shared/auth.js").then(async (mod) => {
    const env = mod.makeAuthEnv();
    await mod.Auth.loadConfig(env);
    mod.Auth.load();
    Auth = {
      available: () => mod.availableProviders(mod.Auth.config, env),
      signIn: (id, opts) => mod.Auth.signIn(id, opts),
      signOut: (opts) => mod.Auth.signOut(opts),
      describe: () => mod.Auth.describe(),
    };
    openBtn.hidden = false;
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
  // hidden in twelve stations (shared/eggs.js). Read once on load — the find
  // itself always happens on a different page, so there is nothing here to
  // keep live.
  (function hardHatCounter() {
    const HARDHAT_KEY = "vr-training-hardhats-v1", HARDHAT_TOTAL = 12;
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

  // "Continue where you left off": the last station this browser actually
  // trained and a consecutive-day streak, read straight from the training
  // record's own localStorage key (WebXR/shared/records.js RECORDS_KEY) —
  // never synced, never estimated — the same direct-read pattern as the hard
  // hat counter above. "Due a refresher" mirrors shared/tracking.js's own
  // rule (a station whose last CLEAN run — two or more stars, no unsafe
  // action — is older than 90 days) without importing that module and its
  // procedure-engine dependencies onto the homepage.
  (function continueStrip() {
    var RECORDS_KEY = "vr-training-records-v1", REFRESHER_DAYS = 90, DAY_MS = 86400000;
    var list;
    try { list = JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]"); } catch (_) { list = []; }
    if (!Array.isArray(list) || !list.length) return;
    var last = list[list.length - 1];
    var href = (last.app === "trades" ? "trades/index.html?room=" : "smartcity/index.html?sim=") + encodeURIComponent(last.simId || "");
    var label = last.simName || last.simId || "a station";

    var days = {};
    for (var i = 0; i < list.length; i++) {
      var at = String(list[i].at || "");
      if (/^\\d{4}-\\d{2}-\\d{2}/.test(at)) days[at.slice(0, 10)] = true;
    }
    var dayKeys = Object.keys(days).sort();
    var streakDays = 0;
    if (dayKeys.length) {
      streakDays = 1;
      var cursor = new Date(dayKeys[dayKeys.length - 1] + "T00:00:00.000Z");
      for (;;) {
        cursor.setUTCDate(cursor.getUTCDate() - 1);
        if (days[cursor.toISOString().slice(0, 10)]) streakDays += 1; else break;
      }
    }

    var lastClean = {};
    for (var j = 0; j < list.length; j++) {
      var r = list[j];
      if (!r.passed || !r.simId) continue;
      var prev = lastClean[r.simId];
      if (!prev || String(r.at) > prev) lastClean[r.simId] = String(r.at);
    }
    var now = Date.now(), dueCount = 0;
    for (var stationId in lastClean) {
      var ageDays = Math.floor((now - new Date(lastClean[stationId]).getTime()) / DAY_MS);
      if (ageDays > REFRESHER_DAYS) dueCount += 1;
    }

    var line = document.getElementById("continue-line");
    var text = "Last station: " + label;
    if (streakDays > 1) text += " \\u00b7 " + streakDays + "-day training streak";
    line.textContent = text;
    var link = document.getElementById("continue-link");
    link.href = href;
    link.textContent = "Resume " + label;
    if (dueCount) {
      var dueEl = document.getElementById("continue-due");
      dueEl.hidden = false;
      dueEl.textContent = dueCount + " station" + (dueCount === 1 ? "" : "s") + " due a refresher (platform default: " + REFRESHER_DAYS + " days since the last clean run).";
    }
    document.getElementById("continue").hidden = false;
  })();
`;

function appCard(layout, { href, tint: t, count, name, blurb, go }) {
  return `      <a class="app" style="--tint:${t}" href="${href}">
        <span class="count">${esc(count)}</span>
        <h2>${esc(name)}</h2>
        <p>${esc(blurb)}</p>
        <span class="go">${esc(go)}</span>
      </a>`;
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

  const apps = [
    appCard(layout, {
      href: layout.app.smartcity, tint: "#4fd1ff", count: `${cityCount} stations`,
      name: "SmartCiti.X", go: "Enter SmartCiti.X",
      blurb: "Municipal and heavy-industrial procedures on one digital-twin plaza — isolation, entry, rigging, climbing, response and restoration, each station its own rank ladder and badge set.",
    }),
    appCard(layout, {
      href: layout.app.trades, tint: "#37d6c0", count: `${roomCount} rooms`,
      name: "Trade Skills Simulator", go: "Enter Trade Skills",
      blurb: "The bench version: one room per trade, the whole scene built around a single procedure with seeded hazards and graded skill gauges.",
    }),
    appCard(layout, {
      href: layout.app.holodeck, tint: "#a079ff", count: "Generator",
      name: "Holodeck", go: "Enter Holodeck",
      blurb: "Describe a procedure and it builds one, or name a station from the roster and it loads that exact one, hazards and interruptions included.",
    }),
    appCard(layout, {
      href: layout.app.instructor, tint: "#f2c14b", count: "Live",
      name: "Instructor Console", go: "Open the console",
      blurb: "The class as it runs: where each learner is, every unsafe action as it happens, and the commands an instructor can put in front of one of them.",
    }),
  ].join("\n");

  const rails = (catalog.curricula ?? []).map((c) => {
    const id = slug(c.id, "programme id");
    const n = (c.stations ?? []).length;
    return `      <a class="chip" href="${layout.app.smartcity}?programme=${id}">
        <b>${esc(c.name)}</b>
        <span>${n} stations · ${esc(c.union ?? "")}</span>
      </a>`;
  }).join("\n");

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
    ["Wallets and sharing", layout.doc("wallets-and-sharing.md")],
    ["Agent protocols", layout.doc("agent-protocols.md")],
  ].map(([label, href]) => `        <li><a href="${href}">${esc(label)}</a></li>`).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Training Simulators — every station</title>
<meta name="description" content="Every station in the training network on one page: ${stations.length} AR/VR simulators across ${categories.length} categories, with a deep link to each one.">
<meta name="generator" content="tools/gen_home.mjs">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&amp;family=Barlow:wght@400;500;600&amp;display=swap">
<style>${CSS}</style>
</head>
<body>
<!-- Generated by tools/gen_home.mjs from WebXR/smartcity/catalog.json — edit the generator, not this file. -->
<a class="skip" href="#catalog">Skip to the station list</a>

<header class="top">
  <div class="top-in">
    <p class="brandline">${esc(catalog.network ?? "Training simulators")}</p>
    <div class="who">
      <span class="who-line" id="who" hidden></span>
      <button class="btn" id="signin" type="button" hidden>Sign in</button>
      <button class="btn quiet" id="signout" type="button" hidden>Sign out</button>
    </div>
  </div>
</header>

<main class="wrap">
  <section class="hero">
    <p class="eyebrow">${stations.length} stations · ${categories.length} categories · ${(catalog.curricula ?? []).length} programmes</p>
    <h1>Pick the job.<br><em>Train the procedure.</em></h1>
    <p class="lead">Three simulators share one procedure engine, one apprentice profile and one training record:
    <b>SmartCiti.X</b>'s ${cityCount} municipal and industrial stations, the <b>Trade Skills Simulator</b>'s ${roomCount} benches,
    and the <b>Holodeck</b>'s prompt-built procedures. Every station names the union and the certification the work really
    needs, and scores what you touch and in what order — hazards, interruptions, holds and torque included.
    Pick an app, follow a programme, or search the roster.</p>
    <p class="devices">${esc(deviceLine(devicesMd))}</p>
    <div class="apps">
${apps}
    </div>
    <p class="aside">Also here: <a href="${layout.aside.portal}">the app map</a>,
    <a href="${layout.aside.verify}">the credential verifier</a> for an exported badge, and
    <a href="${layout.aside.campus}">Safety Campus</a>, the hazard-spotting web companion to the Unity headset build.</p>
    <p class="aside">Off by default: <button type="button" class="linkbtn" id="share-open">share your anonymised training engagement to help train agents and robots</button> —
    episode digests and roll-up scores only, never your name or free text, on the licence you choose, revocable any time.</p>
  </section>

  <section class="continue" id="continue" hidden>
    <p class="eyebrow">Continue where you left off</p>
    <p class="cont-line" id="continue-line"></p>
    <a class="btn primary" id="continue-link" href="#"></a>
    <p class="cont-due" id="continue-due" hidden></p>
  </section>

  <section class="find">
    <label class="eyebrow" for="q">Search the roster</label>
    <input id="q" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search"
      placeholder="Station, id, trade, category or standard — try confined space, IBEW, welding">
    <p class="count" id="count" role="status"></p>
    <p class="nohits" id="nohits" hidden>Nothing matches that. <button type="button" class="linkbtn" id="clear-q">Clear the search</button></p>
  </section>

  <section class="rails">
    <h2>Programmes</h2>
    <p class="sub">The ordered blocks a hall runs: each opens at the first station you have not yet passed, and crosses both
    apps the way an apprenticeship does.</p>
    <div class="rail">
${rails}
    </div>
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

<script type="module">${SCRIPT}</script>
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
