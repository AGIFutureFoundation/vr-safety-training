// Fairway Park — best rounds, the crew leaderboard, and mini-game high
// scores. One localStorage key, pure and store-injectable, exactly like
// WebXR/arcade/js/scores.js, so tools/check_fairway_game.mjs round-trips it
// against a stubbed store with no browser.
//
// The golf leaderboard is keyed by a typed crew tag rather than the arcade's
// three-letter initials — the same free-text, twelve-character tag every
// other app's HUD and leaderboard uses (see shared/identity.js's tag()) —
// ranked by strokes relative to par (lower is better), ties broken by the
// lower raw stroke count.

export const FAIRWAY_STORAGE_KEY = "fairway-park-v1";
export const FAIRWAY_TABLE_SIZE = 10;
export const FAIRWAY_MINIGAMES = ["sprint", "freethrow", "penalties"];

/** The same crew-tag shape as shared/identity.js's tag(): up to 12 characters,
 *  collapsed whitespace, upper-cased. Kept local so this module never needs
 *  to import identity.js just for one line of formatting. */
export function fgCrewTag(name) {
  const s = String(name ?? "").replace(/\s+/g, " ").trim().slice(0, 12).trim().toUpperCase();
  return s || "CREW";
}

function freshData() {
  const out = { v: 1, rounds: [], best: null };
  for (const g of FAIRWAY_MINIGAMES) out[g] = [];
  return out;
}

function cleanRoundRow(r) {
  if (!r || typeof r.strokes !== "number" || typeof r.par !== "number") return null;
  if (!Number.isFinite(r.strokes) || !Number.isFinite(r.par)) return null;
  return {
    name: fgCrewTag(r.name),
    strokes: Math.max(1, Math.round(r.strokes)),
    par: Math.max(1, Math.round(r.par)),
    rel: Math.round(r.strokes) - Math.round(r.par),
    at: typeof r.at === "string" ? r.at : new Date().toISOString(),
  };
}

function cleanArcadeRow(r) {
  if (!r || typeof r.score !== "number" || !Number.isFinite(r.score)) return null;
  return { name: fgCrewTag(r.name), score: Math.max(0, Math.round(r.score)) };
}

function sortRounds(rows) {
  rows.sort((a, b) => a.rel - b.rel || a.strokes - b.strokes);
  return rows;
}

export function fgLoadScores(store) {
  const fresh = freshData();
  try {
    const raw = store?.getItem?.(FAIRWAY_STORAGE_KEY);
    if (!raw) return fresh;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return fresh;
    const rounds = Array.isArray(data.rounds) ? data.rounds.map(cleanRoundRow).filter(Boolean) : [];
    fresh.rounds = sortRounds(rounds).slice(0, FAIRWAY_TABLE_SIZE);
    fresh.best = fresh.rounds[0] ?? null;
    for (const g of FAIRWAY_MINIGAMES) {
      const rows = Array.isArray(data[g]) ? data[g].map(cleanArcadeRow).filter(Boolean) : [];
      rows.sort((a, b) => b.score - a.score);
      fresh[g] = rows.slice(0, FAIRWAY_TABLE_SIZE);
    }
    return fresh;
  } catch {
    return fresh;
  }
}

export function fgStoreScores(store, data) {
  try { store?.setItem?.(FAIRWAY_STORAGE_KEY, JSON.stringify(data)); return true; }
  catch { return false; }
}

/**
 * Submits a finished nine-hole round. Returns the updated table and the new
 * round's rank (1-based) if it made the leaderboard, or null.
 */
export function fgSubmitRound(store, name, strokes, par) {
  const data = fgLoadScores(store);
  const entry = cleanRoundRow({ name, strokes, par });
  data.rounds.push(entry);
  sortRounds(data.rounds);
  const rankIdx = data.rounds.indexOf(entry);
  data.rounds.length = Math.min(data.rounds.length, FAIRWAY_TABLE_SIZE);
  data.best = data.rounds[0] ?? null;
  fgStoreScores(store, data);
  return { data, table: data.rounds, rank: rankIdx >= 0 && rankIdx < FAIRWAY_TABLE_SIZE ? rankIdx + 1 : null };
}

/** Submits a mini-game score (higher is better), same shape as the arcade's. */
export function fgSubmitMinigame(store, game, name, score) {
  if (!FAIRWAY_MINIGAMES.includes(game)) throw new Error(`unknown mini-game: ${game}`);
  const data = fgLoadScores(store);
  const table = data[game];
  const entry = cleanArcadeRow({ name, score });
  table.push(entry);
  table.sort((a, b) => b.score - a.score);
  const rankIdx = table.indexOf(entry);
  table.length = Math.min(table.length, FAIRWAY_TABLE_SIZE);
  data[game] = table;
  fgStoreScores(store, data);
  return { data, table, rank: rankIdx >= 0 && rankIdx < FAIRWAY_TABLE_SIZE ? rankIdx + 1 : null };
}

/** The single best round ever posted in this browser, or null. */
export function fgBestRound(store) { return fgLoadScores(store).best; }
