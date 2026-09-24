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
  </div>
</footer>
<div class="egg-toast" id="egg-toast" role="status" hidden>Night Highway Circuit — the hidden arcade racer, local multiplayer. Opening…</div>

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
