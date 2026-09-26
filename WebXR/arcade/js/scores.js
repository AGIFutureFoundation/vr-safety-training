// Break Room Arcade — high-score tables.
//
// One localStorage key holds a small table (top ARCADE_TABLE_SIZE scores) per
// cabinet. Pure and store-injectable, exactly like race/js/sim.js's save
// helpers, so tools/check_arcade.mjs can round-trip it against a stubbed
// store without a browser.

export const ARCADE_STORAGE_KEY = "break-room-arcade-v1";
export const ARCADE_TABLE_SIZE = 8;
export const ARCADE_GAMES = ["spoolyard", "crewrun", "palletstacker"];

export function arNewScores() {
  const out = { v: 1 };
  for (const g of ARCADE_GAMES) out[g] = [];
  return out;
}

function cleanRow(r) {
  if (!r || typeof r.score !== "number" || !Number.isFinite(r.score)) return null;
  const name = String(r.name ?? "CREW").toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 3) || "CRW";
  return { name, score: Math.max(0, Math.round(r.score)) };
}

export function arLoadScores(store) {
  const fresh = arNewScores();
  try {
    const raw = store?.getItem?.(ARCADE_STORAGE_KEY);
    if (!raw) return fresh;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return fresh;
    for (const g of ARCADE_GAMES) {
      const rows = Array.isArray(data[g]) ? data[g].map(cleanRow).filter(Boolean) : [];
      rows.sort((a, b) => b.score - a.score);
      fresh[g] = rows.slice(0, ARCADE_TABLE_SIZE);
    }
    return fresh;
  } catch {
    return fresh;
  }
}

export function arStoreScores(store, data) {
  try {
    store?.setItem?.(ARCADE_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/**
 * Adds a score to one cabinet's table, keeping the top ARCADE_TABLE_SIZE,
 * highest first. Returns the updated table and the new row's rank (1-based)
 * if it made the table, or null if it did not.
 */
export function arSubmitScore(store, game, name, score) {
  if (!ARCADE_GAMES.includes(game)) throw new Error(`unknown cabinet: ${game}`);
  const data = arLoadScores(store);
  const table = data[game];
  const entry = cleanRow({ name, score });
  table.push(entry);
  table.sort((a, b) => b.score - a.score);
  const rankIdx = table.indexOf(entry);
  table.length = Math.min(table.length, ARCADE_TABLE_SIZE);
  data[game] = table;
  arStoreScores(store, data);
  return { data, table, rank: rankIdx >= 0 && rankIdx < ARCADE_TABLE_SIZE ? rankIdx + 1 : null };
}
