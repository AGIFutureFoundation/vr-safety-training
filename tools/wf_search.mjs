/**
 * The homepage searches' forgiving match (console WAYFINDER): a typed word
 * matches a card when the card's text holds it, a synonym of it, its stem, or
 * a word one or two letters off (a typo). Synonyms are search vocabulary, not
 * claims: everyday trade words beside the union abbreviations and names the
 * catalog's programmes pair with them (tools/unions.json aliases), so
 * "electrician" finds IBEW programmes and "IBEW" finds the electrical ones.
 *
 * gen_home.mjs writes wfSearchScript(catalog) as a module before the page's
 * own scripts; it sets window.wfHit and fills both searches from ?q=, which
 * is the homepage's WebSite SearchAction target (tools/gen_seo.mjs).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Everyday words people type for a trade, each group searched as one. */
export const WF_WORD_GROUPS = [
  ["electrician", "electrical", "electric", "wireman", "lineman", "lineworker"],
  ["plumber", "plumbing", "pipefitter", "pipefitting", "steamfitter"],
  ["welder", "welding", "fabricator"],
  ["carpenter", "carpentry", "framer", "joiner"],
  ["nurse", "nursing", "healthcare", "hospital", "clinical"],
  ["diver", "diving", "scuba", "underwater"],
  ["crane", "rigging", "rigger", "hoist", "lifting"],
  ["driver", "trucker", "trucking", "teamster", "teamsters"],
  ["firefighter", "fire", "rescue"],
  ["police", "officer", "responder"],
  ["cook", "chef", "kitchen", "culinary"],
  ["painter", "painting", "sprayer"],
  ["roofer", "roofing"],
  ["mechanic", "maintenance", "technician"],
  ["dentist", "dental", "hygienist"],
  ["sailor", "seafarer", "maritime", "marine", "deckhand"],
  ["hotel", "housekeeping", "hospitality"],
  ["warehouse", "logistics", "forklift"],
  ["teacher", "classroom", "school", "k12"],
  ["hvac", "heating", "boiler", "refrigeration"],
];

/** Union abbreviation ↔ the words of the programmes that name it, from the catalog. */
export function wfSynonyms(catalog) {
  const unions = JSON.parse(readFileSync(join(ROOT, "tools", "unions.json"), "utf8")).unions;
  const syn = new Map();
  const add = (a, b) => { if (a === b) return; if (!syn.has(a)) syn.set(a, new Set()); syn.get(a).add(b); };
  for (const g of WF_WORD_GROUPS) for (const a of g) for (const b of g) add(a, b);
  const byId = new Map((catalog.stations ?? []).map((st) => [st.id, st]));
  for (const prog of catalog.curricula ?? []) {
    const line = String(prog.union ?? "");
    const named = unions.filter((u) => [u.abbrev, ...(u.aliases ?? [])].some((a) => a && new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(line)));
    // A programme naming one or two unions pairs them with its own name; a multi-union edition would pair everything with everything.
    if (!named.length || named.length > 2) continue;
    // The programme's name and its stations' trades: what the union's members do.
    const trades = (prog.stations ?? []).map((st) => byId.get(st.id)?.trade ?? "").join(" ");
    const words = new Set(`${prog.name} ${named.length === 1 ? trades : ""}`.toLowerCase().match(/[a-z0-9]{4,}/g) ?? []);
    for (const u of named) {
      const abbr = u.abbrev.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (abbr.length < 2) continue;
      // Only everyday trade words cross over (with their whole group), so "IBEW" does not match "the".
      for (const g of WF_WORD_GROUPS) if (g.some((w) => words.has(w))) for (const w of g) { add(abbr, w); add(w, abbr); }
    }
  }
  return Object.fromEntries([...syn].map(([k, v]) => [k, [...v].sort()]));
}

/** The client module: window.wfHit(card, term) and the ?q= prefill. */
export function wfSearchScript(catalog) {
  return `
  // Forgiving search (tools/wf_search.mjs): text, synonym, stem, then a typo.
  const WF_SYN = ${JSON.stringify(wfSynonyms(catalog))};
  function wfEdits(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j), prev2 = null;
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      let best = i;
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev2[j - 2] + 1);
        best = Math.min(best, cur[j]);
      }
      if (best > max) return max + 1;
      prev2 = prev; prev = cur;
    }
    return prev[b.length];
  }
  const wfStem = (t) => t.replace(/(ings|ing|ers|er|es|s)$/, "");
  window.wfHit = (card, raw) => {
    const t = raw.toLowerCase();
    const hay = card.hay;
    if (hay.includes(t)) return true;
    for (const s of WF_SYN[t] || []) if (hay.includes(s)) return true;
    const st = wfStem(t);
    if (st.length >= 4 && st !== t) {
      if (hay.includes(st)) return true;
      for (const s of WF_SYN[st] || []) if (hay.includes(s)) return true;
    }
    if (t.length < 4) return false;
    card.words = card.words || [...new Set(hay.match(/[a-z0-9]{3,}/g) || [])];
    const max = t.length >= 7 ? 2 : 1;
    return card.words.some((w) => wfEdits(t, w.length > t.length + max ? w.slice(0, t.length) : w, max) <= max);
  };
  // ?q= fills both searches (the WebSite SearchAction lands here) and opens the finder.
  const wfQ = new URLSearchParams(location.search).get("q");
  if (wfQ) {
    for (const id of ["hm-find-q", "q"]) { const el = document.getElementById(id); if (el) el.value = wfQ.slice(0, 80); }
    addEventListener("load", () => document.getElementById("finder")?.scrollIntoView({ block: "start" }));
  }
`;
}
