/**
 * Builds the Guide's knowledge base (console COMPASS,
 * tools/briefs/homepage-guide-brief.md) into WebXR/shared/guide-kb.js.
 *
 * Every chunk is taken from a source file in this repository, never written
 * from memory: the programmes and stations from WebXR/smartcity/catalog.json,
 * the worlds' sites, zones and landmarks from the shared world data modules,
 * the regatta courses, the controls table from shared/controls.js, the unions
 * from tools/unions.json, the headings and first paragraphs of docs/*.md and
 * docs/programmes/*.md, and a short FAQ whose every answer names the file it
 * came from. The only text about wojrc.org is the sourced quotation in
 * tools/briefs/wojrc-brief.md; any other sentence naming the organisation is
 * dropped from the chunks.
 *
 * Links are written for the published folder, WebXR/dist/ (the flat file
 * names the homepage's "flat" layout uses); guide.js resolves them against
 * the page's own root. Output is deterministic (no timestamps) so
 * tools/check_guide.mjs can re-run this and diff.
 *
 *     node tools/gen_guide_kb.mjs          (write)
 *     node tools/gen_guide_kb.mjs --stdout (print, write nothing)
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
export const GD_KB_CAP = 672 * 1024;

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const WEBXR = join(ROOT, "WebXR");
const REPO = "https://github.com/AGIFutureFoundation/vr-safety-training";
export const GD_KB_OUT = join(WEBXR, "shared", "guide-kb.js");
// Raised from 600 KB when the K-12 programmes and their stations joined the
// catalog (docs/consoles/SCHOLAR.md); the rows themselves are unchanged.
// Raised from 640 KB by QUESTMASTER-2 for the six per-world skill-gate chunks (Summit and Redwood were not in the KB); the file loads lazily when the Guide opens.
// catalog (docs/consoles/SCHOLAR.md), and from 640 KB when Redwood Reach's
// sites joined the worlds (docs/consoles/REDWOOD-2.md); the rows themselves
// are unchanged. The file loads lazily, when the Guide panel first opens.

const imp = (rel) => import(pathToFileURL(join(ROOT, rel)).href);
const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
/** Markdown to plain text: links to their words, code and emphasis marks dropped. */
const plain = (s) => clean(String(s ?? "")
  .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  .replace(/[`*_]+/g, "")
  .replace(/<[^>]+>/g, ""));
const firstSentence = (s) => { const t = clean(s); const m = t.match(/^.*?[.!?](\s|$)/); return clean(m ? m[0] : t); };
const clip = (s, n) => { const t = clean(s).replace(/[.]+$/, ""); return t.length <= n ? t : t.slice(0, t.lastIndexOf(" ", n - 1)).replace(/[,;:—-]+$/, "") + "…"; };

// ------------------------------------------------------------ wojrc.org rule
function wojrcSourced() {
  const md = readFileSync(join(ROOT, "tools/briefs/wojrc-brief.md"), "utf8");
  const quote = md.split("\n").filter((l) => l.startsWith("> ")).map((l) => l.slice(2).trim());
  if (quote.length < 3) throw new Error("tools/briefs/wojrc-brief.md: the sourced quotation was not found");
  return quote;
}
const WOJRC_RE = /wojrc|joyce/i;
/** Drop every sentence that names the organisation (titles are kept by the caller). */
function dropOrgSentences(text, title = "") {
  // A programme's own name ("... — wojrc.org programmes") is kept; any other mention drops its sentence.
  const t = title && WOJRC_RE.test(title) ? clean(text).split(clean(title)).join("\u0001") : clean(text);
  return clean(t.split(/(?<=[.!?])\s+(?=[A-Z0-9"“(\u0001])/).filter((s) => !WOJRC_RE.test(s)).join(" ").split("\u0001").join(clean(title)));
}

// ------------------------------------------------------------------ builders
const chunks = [];
function add(c) {
  const text = WOJRC_RE.test(c.text) && c.kind !== "sourced" ? dropOrgSentences(c.text, c.title) : clean(c.text);
  if (!text) return;
  chunks.push({ id: c.id, kind: c.kind, title: clean(c.title), text, links: c.links ?? [], src: c.src, ...(c.keys ? { keys: clean(c.keys) } : {}) });
}
const trackExists = (id) => existsSync(join(WEBXR, "home", "tracks", `${id}.html`));
const stationHref = (s) => (s.app === "trades" ? `trade-skills-simulator.html?room=${s.id}` : `smartcity-x.html?sim=${s.id}`);
const shortProg = (name) => clean(String(name).split(/\s+[—–-]\s+/)[0]);

async function build() {
  const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
  const byStation = new Map(catalog.stations.map((s) => [s.id, s]));
  const whyOf = new Map(); const progsOf = new Map();
  for (const c of catalog.curricula) for (const st of c.stations) {
    if (!whyOf.has(st.id) && st.why) whyOf.set(st.id, firstSentence(st.why));
    if (!progsOf.has(st.id)) progsOf.set(st.id, []);
    progsOf.get(st.id).push(c);
  }

  // Programmes.
  for (const c of catalog.curricula) {
    const links = trackExists(c.id) ? [{ label: `Open the ${shortProg(c.name)}`, href: `tracks/${c.id}.html` }] : [];
    add({ id: `programme:${c.id}`, kind: "programme", title: c.name, src: "WebXR/smartcity/catalog.json",
      text: `${c.name} is a training programme of ${c.stations.length} stations. ${clip(c.summary, 300)} Union: ${clip(c.union || "none named", 160)}. It maps to ${clip(c.certification, 180)}`,
      keys: `${c.union ?? ""} programme track course`, links });
  }

  // Stations.
  for (const s of catalog.stations) {
    const progs = progsOf.get(s.id) ?? [];
    const union = s.union || progs.find((p) => p.union)?.union || null;
    const why = whyOf.get(s.id);
    add({ id: `station:${s.id}`, kind: "station", title: s.name, src: "WebXR/smartcity/catalog.json",
      text: `${clip(s.tagline, 120)}. ${s.category}.${s.trade ? ` Trade: ${clip(s.trade, 70)}.` : ""}${union ? ` Union: ${clip(union, 80)}.` : ""}${why ? ` Why: ${clip(why, 140)}` : ""}${progs.length ? ` Part of ${progs.slice(0, 3).map((p) => shortProg(p.name)).join(", ")}.` : ""}`,
      keys: s.app === "trades" ? "Trade Skills room" : "", links: [{ label: `Start ${s.name}`, href: stationHref(s) }] });
  }
  for (const cat of catalog.categories) {
    add({ id: `category:${cat.name}`, kind: "category", title: cat.name, src: "WebXR/smartcity/catalog.json",
      text: `The ${cat.name} category holds ${cat.stations.length} stations, among them ${cat.stations.slice(0, 5).map((id) => byStation.get(id)?.name ?? id).join(", ")}.`,
      links: [{ label: "Open the programme finder", href: "index.html#catalog" }] });
  }

  // Worlds, their zones, landmarks and sites.
  const bw = await imp("WebXR/shared/bayworld-data.js");
  const dw = await imp("WebXR/shared/underwater-data.js");
  const fw = await imp("WebXR/shared/fairway-data.js");
  const sw = await imp("WebXR/shared/summit-data.js");
  const rw = await imp("WebXR/redwood/js/rw-data.js");
  const rg = await imp("WebXR/regatta/js/courses.js");
  const siteText = (site, world, zones) => {
    const zone = site.zone ? (zones.find((z) => z.id === site.zone)?.name ?? site.zone) : null;
    const st = (site.stations ?? []).map((id) => byStation.get(id)?.name ?? id);
    const pg = (site.programmes ?? []).map((id) => catalog.curricula.find((c) => c.id === id)).filter(Boolean).map((c) => shortProg(c.name));
    return `${site.name} is a site in ${world}${zone ? `, in ${zone}` : site.trade ? ` for ${site.trade.toLowerCase()}` : ""}.${st.length ? ` Its job board offers ${st.join(", ")}.` : ""}${pg.length ? ` Programmes: ${pg.join(", ")}.` : ""}`;
  };
  const worlds = [
    { key: "bayworld", name: "Bay World", page: "bayworld.html", zones: bw.BAY_ZONES, landmarks: bw.BAY_LANDMARKS, sites: bw.BAY_SITES, src: "WebXR/shared/bayworld-data.js" },
    { key: "underwater", name: "The Deep", page: "underwater.html", zones: dw.DEEP_ZONES, landmarks: dw.DEEP_LANDMARKS, sites: dw.DEEP_SITES, src: "WebXR/shared/underwater-data.js" },
    { key: "summit", name: "Sierra Summit", page: "summit.html", zones: sw.SM_ZONES, landmarks: sw.SM_LANDMARKS, sites: sw.SM_SITES, src: "WebXR/shared/summit-data.js" },
    { key: "redwood", name: "Redwood Reach", page: "redwood.html", zones: [], landmarks: rw.RW_LANDMARKS, sites: rw.RW_SITES, src: "WebXR/redwood/js/rw-data.js",
      blurb: `a ${Math.round(rw.RW_SIZE / 1000)} km coastal redwood and mixed forest with a river valley and estuary, fire roads, a fire lookout, a sawmill, a campground and trail network, a wildland fire station, a nursery and a rural substation. Walk or drive the fire roads; trunks and buildings block the way, the map has layers and fast travel to visited sites, and field tins hide lessons copied from real stations` },
  ];
  for (const w of worlds) {
    const spread = w.zones.length ? `across ${w.zones.length} zones: ${w.zones.map((z) => z.name).join(", ")}` : `for ${[...new Set(w.sites.map((s) => s.trade).filter(Boolean))].join(", ")}`;
    add({ id: `world:${w.key}`, kind: "world", title: w.name, src: w.src,
      text: `${w.name} is ${w.blurb ?? "an open world"} with ${w.sites.length} job sites ${spread}. Walk up to a site's job board to launch its stations; a pass is paid once and marks the board done.`,
      keys: "world open world explore" + (w.key === "redwood" ? " forest redwood trees fire road lookout sawmill" : ""), links: [{ label: `Open ${w.name}`, href: w.page }] });
    for (const z of w.zones) {
      const sites = w.sites.filter((s) => s.zone === z.id);
      add({ id: `zone:${w.key}:${z.id}`, kind: "zone", title: `${z.name} (${w.name})`, src: w.src,
        text: `${z.name} is a zone of ${w.name}.${z.blurb ? ` ${z.blurb}` : ""}${sites.length ? ` Sites here: ${sites.map((s) => s.name).join(", ")}.` : ""}`,
        links: sites[0] ? [{ label: `Take me to ${z.name}`, href: `${w.page}#site=${sites[0].id}` }] : [{ label: `Open ${w.name}`, href: w.page }] });
    }
    for (const l of w.landmarks) {
      if (!l.blurb) continue;
      add({ id: `landmark:${w.key}:${l.id}`, kind: "landmark", title: `${l.name} (${w.name})`, src: w.src,
        text: `${l.name}, a landmark in ${w.name}: ${l.blurb}`, links: [{ label: `Open ${w.name}`, href: w.page }] });
    }
    for (const s of w.sites) {
      add({ id: `site:${w.key}:${s.id}`, kind: "site", title: `${s.name} (${w.name})`, src: w.src, text: siteText(s, w.name, w.zones),
        links: [{ label: `Take me to ${s.name.replace(/^The /, "the ")}`, href: `${w.page}#site=${s.id}` }] });
    }
  }
  add({ id: "world:fairway", kind: "world", title: "Fairway Park", src: "WebXR/shared/fairway-data.js",
    text: `Fairway Park is a ${fw.FAIRWAY_HOLES.length}-hole golf course (par ${fw.FAIRWAY_HOLES.reduce((a, h) => a + h.par, 0)}) with a running track, a pitch, a basketball court, tennis courts and a maintenance yard where the grounds crew board sits.`,
    keys: "golf world", links: [{ label: "Open Fairway Park", href: "fairway.html" }] });
  add({ id: "world:regatta", kind: "world", title: "The Regatta", src: "WebXR/regatta/js/courses.js",
    text: `The Regatta sails the bay from Bay World's marina. Courses: ${rg.RG_COURSES.map((c) => c.name).join(", ")}.`,
    keys: "sailing yacht boat race world", links: [{ label: "Open the Regatta", href: "regatta.html" }] });
  for (const c of rg.RG_COURSES) {
    add({ id: `course:${c.id}`, kind: "course", title: `${c.name} (Regatta)`, src: "WebXR/regatta/js/courses.js",
      text: `${c.name}, a Regatta course: ${c.blurb ?? ""}`, links: [{ label: "Open the Regatta", href: "regatta.html" }] });
  }
  const apps = [
    ["smartcity", "SmartCiti.X", "smartcity-x.html", `SmartCiti.X is the station runner: ${catalog.apps.smartcity.stations} hands-on stations in ${catalog.categories.length} categories, in flat, AR and VR modes. Every job board and programme page launches its stations here.`],
    ["trades", "Trade Skills", "trade-skills-simulator.html", `Trade Skills is a shop of ${catalog.apps.trades.rooms} hands-on rooms (${catalog.stations.filter((s) => s.app === "trades").map((s) => s.name).join(", ")}), in flat and VR modes.`],
    ["holodeck", "The Holodeck", "holodeck.html", `The Holodeck builds prompt-generated procedures and can load any SmartCiti.X station by name, in flat and VR modes.`],
    ["atlas", "The Bay Atlas", "atlas.html", "The Bay Atlas is the map of Bay World and the Deep: every site, zone and landmark, with the programmes each site offers."],
    ["race", "The Race", "race.html", "The Race is the arcade's driving game, on its own tracks."],
    ["arcade", "The Arcade", "arcade.html", "The Arcade is a room of game cabinets."],
    ["instructor", "The instructor console", "instructor-console.html", "The instructor console is for trainers: a learner panel with each programme's progress, interruptions to inject, and a session log that downloads the records."],
  ];
  for (const [key, name, page, text] of apps) add({ id: `world:${key}`, kind: "world", title: name, src: "WebXR/smartcity/catalog.json and tools/bundle_webxr.py", text, links: [{ label: `Open ${name.replace(/^The /, "the ")}`, href: page }] });

  // San Francisco on the parish engine (GOLDEN-B, docs/parishes.md): the districts with region "san-francisco",
  // their sites, and the Bay Bridge's way out to Bay World (shared/sg-ways.js).
  {
    const NPR = await imp("WebXR/shared/np-parishes.js");
    const SGW = await imp("WebXR/shared/sg-ways.js");
    const sf = NPR.NP_PARISHES.filter((p) => p.region === "san-francisco");
    if (sf.length) {
      const ways = SGW.SG_WAYS.map((w) => `${w.name} leaves ${NPR.npParish(w.from.parish)?.name ?? "Downtown"} for ${w.to.name}, and Bay World's Atlas and map carry the way back`);
      add({ id: "world:san-francisco", kind: "world", title: "San Francisco districts", src: "WebXR/shared/np-parishes.js",
        keys: "san francisco sf district marina presidio golden gate bayview hunters point shipyard bay bridge",
        // SITEWORKS's procedural sites (tools/gen_sw_sites.mjs, blurbs open "A procedural") are counted, not listed, so the KB stays under its cap.
        text: `San Francisco's districts are streamed four-kilometre worlds on the parishes page: ${sf.map((p) => { const proc = p.sites.filter((s) => /^A procedural/.test(s.blurb ?? "")); return `${p.name} (${p.sites.filter((s) => !proc.includes(s)).map((s) => s.name).join(", ")}${proc.length ? `, plus ${proc.length} procedural sites` : ""})`; }).join("; ")}. Every job board opens real stations and brings you back to the site. ${ways.join(". ")}.`,
        links: sf.map((p) => ({ label: `Open ${p.name}`, href: `parishes.html?parish=${p.id}` })) });
    }
  }

  // Controls.
  const { ctlVerbs } = await imp("WebXR/shared/controls.js");
  for (const v of ctlVerbs) {
    add({ id: `control:${v.id}`, kind: "control", title: `Controls: ${v.label}`, src: "WebXR/shared/controls.js",
      text: `${v.label}: keyboard ${v.keys.join(", ")}; gamepad ${v.pad}; touch ${v.touch}; headset ${v.xr}.`, keys: "controls keys keyboard gamepad touch phone how do I" });
  }
  add({ id: "control:all", kind: "control", title: "The controls", src: "WebXR/shared/controls.js",
    text: `Every page shares one set of controls. ${ctlVerbs.map((v) => `${v.label}: ${v.keys.join(" or ")}`).join(". ")}. Press H, or the ? button at the top left, for the full table on any page.`,
    keys: "controls keys help keyboard" });

  // Unions.
  const unions = JSON.parse(readFileSync(join(ROOT, "tools/unions.json"), "utf8")).unions;
  for (const u of unions) {
    const progs = catalog.curricula.filter((c) => c.union && (c.union.includes(u.abbrev) || c.union.includes(u.name)));
    add({ id: `union:${u.id}`, kind: "union", title: `${u.name}${u.abbrev ? ` (${u.abbrev})` : ""}`, src: "tools/unions.json",
      text: `${u.name}${u.abbrev ? ` (${u.abbrev})` : ""}${u.local ? `, ${u.local}` : ""}.${u.note ? ` ${u.note}` : ""}${progs.length ? ` Programmes for this union: ${progs.map((c) => shortProg(c.name)).join(", ")}.` : ""}`,
      keys: `${(u.aliases ?? []).join(" ")} union local`,
      links: progs.filter((c) => trackExists(c.id)).slice(0, 2).map((c) => ({ label: `Open the ${shortProg(c.name)}`, href: `tracks/${c.id}.html` })) });
  }

  // Docs: each section's heading and first paragraph.
  const docFiles = [
    ...readdirSync(join(ROOT, "docs")).filter((f) => f.endsWith(".md")).map((f) => `docs/${f}`),
    ...readdirSync(join(ROOT, "docs/programmes")).filter((f) => f.endsWith(".md")).map((f) => `docs/programmes/${f}`),
    // SmartCiti.X on the agent network (docs/consoles/VIRTUALS.md).
    ...readdirSync(join(ROOT, "docs/virtuals")).filter((f) => f.endsWith(".md")).map((f) => `docs/virtuals/${f}`),
  ].sort();
  for (const rel of docFiles) {
    const lines = readFileSync(join(ROOT, rel), "utf8").split("\n");
    let docTitle = null, head = null, para = [], n = 0;
    const flush = () => {
      if (head && para.length && n < (rel.startsWith("docs/programmes/") || rel.startsWith("docs/virtuals/") ? 2 : 5)) { // five sections a doc: the KB holds its 672 KB cap as docs grow
        const text = plain(para.join(" "));
        if (text.length > 30) {
          add({ id: `doc:${rel.slice(5)}#${n}`, kind: "doc", title: head === docTitle ? docTitle : `${docTitle} — ${head}`, src: rel,
            text: clip(text, 280), links: [{ label: `Read ${rel.replace(/^docs\//, "")}`, href: `${REPO}/blob/main/${rel}` }] });
          n += 1;
        }
      }
      para = [];
    };
    let inCode = false, took = false;
    for (const line of lines) {
      if (/^```/.test(line)) { inCode = !inCode; continue; }
      if (inCode) continue;
      const h = line.match(/^(#{1,3})\s+(.*)$/);
      if (h) { flush(); head = plain(h[2]); if (!docTitle) docTitle = head; took = false; continue; }
      if (!head || took) continue;
      if (!line.trim()) { if (para.length) { flush(); took = true; } continue; }
      if (/^\s*(\||[-*]\s|\d+\.\s|>)/.test(line) && !para.length) continue;
      para.push(line);
    }
    flush();
  }

  // The sourced wojrc.org text, verbatim.
  const quote = wojrcSourced();
  add({ id: "sourced:wojrc", kind: "sourced", title: "About wojrc.org", src: "tools/briefs/wojrc-brief.md",
    text: `This is the text supplied from wojrc.org, quoted as given: ${quote.join(" ")} Joyce Guy is named by the sponsor of this edition as the person who runs the programmes. Nothing else about the organisation is sourced here.`,
    keys: "wojrc organisation organization who runs",
    links: trackExists("job-readiness-edition") ? [{ label: "Open the Job Readiness Edition", href: "tracks/job-readiness-edition.html" }] : [] });

  // The FAQ, each answer from a named source.
  const faq = [
    ["how-to-start", "How do I start?", "start begin play first new where how",
      "Open the homepage and pick a world or a programme. Bay World is the open world: walk up to a job board and it launches that site's stations. Each programme's page lists its stations with a Launch link, and every station runs in SmartCiti.X.",
      "WebXR/shared/passport.js, docs/interop.md", [{ label: "Open Bay World", href: "bayworld.html" }, { label: "Open the programme finder", href: "index.html#catalog" }]],
    ["progress-saved", "How is my progress saved?", "progress saved save record keep lost passport",
      "Every app keeps your progress in this browser. The passport is one record over all of them: each attempt writes one record, and a programme shows passed stations, stars and competency status. You can export a CSV transcript and xAPI statements. Clearing this browser's site data clears the records.",
      "docs/interop.md", [{ label: "Open the homepage", href: "index.html" }]],
    ["find-union", "How do I find my union?", "union local find my which",
      `Each programme names its union, and the platform names ${unions.length} unions in all. Ask me for your union by name or abbreviation, like IBEW or IUOE, and I will point you at its programmes, or search the programme finder by union.`,
      "tools/unions.json, WebXR/smartcity/catalog.json", [{ label: "Open the programme finder", href: "index.html#catalog" }]],
    ["phone", "What works on a phone?", "phone mobile touch tablet ipad android iphone work",
      "Bay World, the Regatta, the Deep and Fairway Park share one touch layer: a stick at the bottom left, round buttons of at least 48 pixels at the bottom right, clear of the notch, and a Low, Balanced or High quality toggle. Pages keep button text at 14 pixels or more on a phone.",
      "WebXR/shared/touch.js, WebXR/shared/controls.js", [{ label: "Open Bay World", href: "bayworld.html" }]],
    ["stars", "What does a star mean?", "star stars mean rating score pass mastery",
      "Stars are decided by corrections and time against par, not by raw score. A run passes at two or more stars with zero unsafe actions. Mastery is stricter: two or more stars, zero unsafe actions, every interruption answered, inside 1.5 times par.",
      "docs/WHITEPAPER.md", []],
    ["help-controls", "Where are the controls?", "controls keys help button",
      "Press H, or the ? button at the top left of any page, for the controls table: the key, the gamepad button, the touch control and the headset gesture for each action.",
      "WebXR/shared/controls.js", []],
    ["guide-what", "What can the Guide answer?", "guide you who are what can answer",
      "I answer only from this platform's own pages: the programmes and stations, the worlds and their sites, the controls, the unions and the docs. When nothing matches I say so. I run on this device and send nothing anywhere unless this site's owner has set a hosted answer service.",
      "WebXR/shared/guide.js", [{ label: "Open the programme finder", href: "index.html#catalog" }]],
    ["agent-network", "What is SmartCiti.X on the agent network?", "smartcitix agent network virtuals acp citi token",
      "In preparation, not live: a plan for other agents to hire station evaluations in simulation, synthetic datasets, curriculum queries and lessons. No learner data leaves your device, nothing is on-chain, and $Citi is only a name the owner chose.",
      "docs/virtuals/strategy.md", []],
  ];
  for (const [id, q, keys, a, src, links] of faq) add({ id: `faq:${id}`, kind: "faq", title: q, keys, text: a, src, links });

  // Skill-gated side games and quests (docs/skill-gates.md): one chunk per world naming every gated item and the
  // stations that open it, with the catalog's names. One per world, not per item: the knowledge base sits at its cap.
  const NM = await imp("WebXR/shared/gate-names-data.js");
  const SG = await imp("WebXR/shared/side-games-data.js");
  const BQ = await imp("WebXR/bayworld/js/quests.js");
  const RW = await imp("WebXR/redwood/js/rw-data.js");
  // The New Orleans parishes' games (SECONDLINE, docs/parish-play.md) sit in one chunk for the five parishes together.
  const SLP = await imp("WebXR/shared/sl-parish-play.js");
  const gateWorld = { bayworld: ["Bay World"], underwater: ["The Deep"], regatta: ["The Regatta"], fairway: ["Fairway Park"], summit: ["Sierra Summit"], redwood: ["Redwood Reach"], parishes: ["the New Orleans parishes"] };
  const gated = [...BQ.GATED_QUESTS.map((q) => ({ ...q, world: "bayworld" })), ...SG.QM_SIDE_GAMES, ...sw.SM_GATED, ...RW.RW_GATED, ...SLP.SL_GATED];
  const needOf = (g) => [
    ...[...(g.gate.stations ?? []), ...(g.gate.k12 ?? [])].map((id) => (NM.QM_STATION_NAMES[id] ? shortProg(NM.QM_STATION_NAMES[id]) : id.replace(/-/g, " "))),
    ...(g.gate.programmes ?? []).map((pr) => `${shortProg(catalog.curricula.find((c) => c.id === pr.id)?.name ?? pr.id)}${pr.minStars ? " (some of its stars)" : ""}`),
    ...(g.gate.quests ?? []).map((id) => BQ.ALL_QUESTS.find((q) => q.id === id)?.title ?? id),
  ].join(", ");
  for (const [key, [wname]] of Object.entries(gateWorld)) {
    const here = gated.filter((g) => g.world === key);
    if (!here.length) continue;
    add({ id: `gate:${key}`, kind: "sidegame", title: `Skill-gated side games in ${wname}`, src: "docs/skill-gates.md",
      text: `Skill-gated in ${wname}; a padlock until the named stations are done at one star or more. ${here.map((g) => `${g.title}: ${needOf(g)}`).join(". ")}.`,
      keys: "unlock locked side game skill gate padlock how do I", links: [] });
  }

  return chunks;
}

export async function gdBuildKb() {
  chunks.length = 0;
  const list = await build();
  // Compact rows: [kind, id, title, text, links as [label, href] pairs, source, keys].
  const kinds = [...new Set(list.map((c) => c.kind))];
  const srcs = [...new Set(list.map((c) => c.src))];
  const rows = list.map((c) => {
    // A station's one link is rebuilt by guide.js from its id: "S" SmartCiti.X, "T" Trade Skills.
    const st = c.kind === "station" && c.links.length === 1 && c.links[0].label === `Start ${c.title}`
      ? (c.links[0].href === `smartcity-x.html?sim=${c.id.slice(8)}` ? "S" : c.links[0].href === `trade-skills-simulator.html?room=${c.id.slice(8)}` ? "T" : null) : null;
    // A doc section's one link is rebuilt from its source path: "D".
    const dl = c.kind === "doc" && c.links.length === 1 && c.links[0].href === `${REPO}/blob/main/${c.src}` ? "D" : null;
    const row = [kinds.indexOf(c.kind), c.id, c.title, c.text, st ?? dl ?? c.links.map((l) => [l.label, l.href]), srcs.indexOf(c.src)];
    if (c.keys) row.push(c.keys);
    return row;
  });
  const kb = { version: 1, note: "Generated by tools/gen_guide_kb.mjs — do not edit.", repo: REPO, kinds, srcs, rows };
  return `// Generated by tools/gen_guide_kb.mjs from the catalog, the world data, the\n// controls table, the unions, the docs and the FAQ — edit those, not this file.\n// Loaded lazily by shared/guide.js when the Guide panel first opens.\nexport const GD_KB = ${JSON.stringify(kb)};\n`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const src = await gdBuildKb();
  if (process.argv.includes("--stdout")) process.stdout.write(src);
  else if (src.length > GD_KB_CAP) { console.error(`guide-kb.js would be ${(src.length / 1024).toFixed(0)} KB, over the ${GD_KB_CAP / 1024} KB cap`); process.exit(1); }
  else {
    writeFileSync(GD_KB_OUT, src);
    console.log(`Wrote WebXR/shared/guide-kb.js — ${chunks.length} chunks, ${(src.length / 1024).toFixed(0)} KB`);
  }
}
