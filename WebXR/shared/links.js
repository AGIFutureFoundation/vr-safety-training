// One rule for every station link a world builds (tools/briefs/links-brief.md).
//
// A station id is either a SmartCiti.X station (opened with `?sim=<id>`) or a
// Trade Skills room (the catalog's `app: "trades"` stations, opened in the
// Trade Skills app with `?room=<id>`). Every job board, briefing, grounds
// board and atlas card routes through lkStationLink so a room is never sent to
// SmartCiti.X, where it does not exist. Pure: no DOM, no storage, no imports.
//
// Paths are relative to the calling page's own folder (WebXR/<app>/), the way
// every world already writes its sibling links; tools/bundle_webxr.py rewrites
// "../trades/index.html" to "trade-skills-simulator.html" in the flat build.
// Every top-level name is prefixed `lk`/`LK_` because the bundler concatenates
// all modules into one scope.

/** The Trade Skills rooms (the catalog's `app: "trades"` stations). */
export const LK_TRADES_ROOMS = Object.freeze([
  "electrical", "salon", "kitchen", "phlebotomy", "welding", "devops", "plumbing", "pressure-washer", "paint-sprayer",
]);

/** The Trade Skills app's page, relative to a world's own folder. */
export const LK_TRADES_PAGE = "../trades/index.html";

/** True when `id` is a Trade Skills room rather than a SmartCiti.X station. */
export function lkIsTradesRoom(id) { return LK_TRADES_ROOMS.includes(String(id ?? "")); }

/**
 * The launch link for one station: `<runner>?sim=<id>&from=<app>` for a
 * SmartCiti.X station, `<trades>?room=<id>&from=<app>` for a Trade Skills
 * room, each with `&return=<page>#site=<siteId>` when `page` is given (the
 * way home the runner's "Back to <world>" button takes, docs/interop.md).
 */
export function lkStationLink(id, { runner = "../smartcity/index.html", trades = LK_TRADES_PAGE, from = null, page = null, siteId = null, extra = "" } = {}) {
  if (!id) throw new Error("lkStationLink needs a station id");
  const ret = page ? `${page}${siteId ? `#site=${encodeURIComponent(siteId)}` : ""}` : null;
  const back = ret ? `&return=${encodeURIComponent(ret)}` : "";
  const room = lkIsTradesRoom(id);
  const base = room ? trades : runner;
  return `${base}?${room ? "room" : "sim"}=${encodeURIComponent(id)}${from ? `&from=${encodeURIComponent(from)}` : ""}${back}${extra}`;
}

/** A world's `?site=` deep link to one of its sites, relative to the world's own page. */
export function lkSiteLink(siteId, page = "") { return `${page}?site=${encodeURIComponent(siteId)}`; }

/**
 * A job board's heading as a link to the site it describes (`?site=<id>` on
 * the world's own page), so the name always leads to the place it names.
 */
export function lkSiteHeading(el, site) {
  if (!el) return;
  el.textContent = "";
  const a = el.ownerDocument.createElement("a");
  a.id = "jb-site-link";
  a.href = lkSiteLink(site.id);
  a.textContent = site.name;
  a.style.color = "inherit";
  el.appendChild(a);
}

/** A station id as a label: "confined-space-entry" → "confined space entry". */
export function lkStationLabel(id) { return String(id ?? "").replace(/-/g, " "); }

/**
 * Fill a job board's station list (`ul`) with one row per station, each with
 * its own Start link from `linkFor(id)` — so a board with several stations
 * lets the learner choose instead of always launching the first. The list is
 * shown only when there is more than one station to choose from; `done(id)`
 * marks a station already passed. Returns the number of rows written.
 */
export function lkRenderStations(ul, ids, linkFor, { done = () => false } = {}) {
  if (!ul) return 0;
  ul.textContent = "";
  const list = (ids ?? []).filter(Boolean);
  for (const id of list) {
    const li = ul.ownerDocument.createElement("li");
    const name = ul.ownerDocument.createElement("span");
    name.textContent = `${done(id) ? "✓ " : ""}${lkStationLabel(id)}${lkIsTradesRoom(id) ? " · Trade Skills" : ""}`;
    const a = ul.ownerDocument.createElement("a");
    a.className = "btn primary lk-start";
    a.href = linkFor(id);
    a.dataset.station = id;
    a.textContent = "Start";
    a.setAttribute("aria-label", `Start ${lkStationLabel(id)}`);
    li.append(name, a);
    ul.appendChild(li);
  }
  ul.toggleAttribute("hidden", list.length < 2);
  return list.length;
}
