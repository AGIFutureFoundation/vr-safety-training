// Training records — the auditable attempt log an employer, union hall or
// LMS actually needs from a simulator, as opposed to the gamified profile in
// game.js (XP, ranks, leaderboards) which is there to motivate.
//
// Every finished run appends one immutable entry. Entries carry what an
// assessment record needs (station, category, the real certification the
// station maps to, score, stars, corrections, unsafe actions, time vs par,
// pass/fail against a stated rule) and nothing it must not (no biometrics,
// no free text beyond the learner's own crew tag). Storage is this browser
// only, like everything else in these apps; export is the hand-off — CSV for
// a spreadsheet or HR system, xAPI 1.0.3 statements for a Learning Record
// Store.
//
// Shared by every app on this engine; SmartCiti.X is the first to wire it.

const KEY = "vr-training-records-v1";
const MAX_ENTRIES = 1000;

/**
 * The pass rule, stated once so the results card, the export and the
 * summary can never disagree: no unsafe action, at most one correction,
 * and finished inside 1.5x par (which is exactly the engine's 2-star
 * threshold, so stars >= 2 already encodes the time and correction limits).
 */
export function passed(entry) {
  return (entry.stars | 0) >= 2 && (entry.hazardHits | 0) === 0;
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch (_) { return []; }
}

function save(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (_) { /* private mode — run unsaved */ }
}

export const TrainingRecords = {
  /** Oldest first. */
  list() { return load(); },

  count() { return load().length; },

  /**
   * Append one attempt. `entry` is the plain data a finished Session yields
   * (see SmartCiti.X's showResults); this adds the id, timestamp and the
   * pass verdict so callers never compute it themselves.
   */
  record(entry) {
    const list = load();
    const full = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      at: new Date().toISOString(),
      ...entry,
    };
    full.passed = passed(full);
    list.push(full);
    if (list.length > MAX_ENTRIES) list.splice(0, list.length - MAX_ENTRIES);
    save(list);
    return full;
  },

  clear() { try { localStorage.removeItem(KEY); } catch (_) { /* ignore */ } },

  /**
   * Per-category roll-up for an instructor view: attempts, passes, distinct
   * stations passed, best stars. Categories come from the entries themselves
   * so a record from a since-renamed category still counts.
   */
  summary(list = load()) {
    const by = new Map();
    for (const r of list) {
      const key = r.category ?? "Uncategorized";
      if (!by.has(key)) by.set(key, { category: key, attempts: 0, passes: 0, stations: new Set(), stationsPassed: new Set(), bestStars: 0 });
      const s = by.get(key);
      s.attempts += 1;
      s.stations.add(r.simId);
      if (r.passed) { s.passes += 1; s.stationsPassed.add(r.simId); }
      s.bestStars = Math.max(s.bestStars, r.stars | 0);
    }
    return [...by.values()].map((s) => ({
      category: s.category, attempts: s.attempts, passes: s.passes,
      stations: s.stations.size, stationsPassed: s.stationsPassed.size, bestStars: s.bestStars,
    }));
  },
};

// -------------------------------------------------------------------- export

const CSV_COLUMNS = [
  "at", "learner", "app", "simId", "simName", "category", "trade", "certification", "system",
  "score", "stars", "errors", "hazardHits", "holdBreaks", "seconds", "parSeconds", "passed",
  "badges", "level", "levelName", "id",
];

function csvCell(v) {
  if (v == null) return "";
  const s = Array.isArray(v) ? v.join("; ") : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** RFC 4180 CSV, one row per attempt, columns in CSV_COLUMNS order. */
export function toCSV(list) {
  const lines = [CSV_COLUMNS.join(",")];
  for (const r of list) lines.push(CSV_COLUMNS.map((c) => csvCell(r[c])).join(","));
  return lines.join("\r\n") + "\r\n";
}

/** ISO 8601 duration from whole seconds, e.g. 125 -> "PT2M5S". */
export function isoDuration(seconds) {
  const s = Math.max(0, Math.round(seconds | 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${sec || (!h && !m) ? `${sec}S` : ""}`;
}

/**
 * xAPI 1.0.3 statements — the standard a Learning Record Store ingests.
 * `homePage` scopes the actor account and activity ids; pass the real
 * deployment origin when exporting from a hosted install. Extensions carry
 * the assessment detail (category, certification, stars, unsafe actions)
 * that the core result object has no field for.
 */
export function toXAPI(list, { actorName = "YOU", homePage = "https://smartciti.example" } = {}) {
  const ext = (k) => `${homePage}/xapi/ext/${k}`;
  return {
    statements: list.map((r) => ({
      id: r.id,
      timestamp: r.at,
      actor: {
        objectType: "Agent",
        name: r.learner ?? actorName,
        account: { homePage, name: r.learner ?? actorName },
      },
      verb: {
        id: r.passed ? "http://adlnet.gov/expapi/verbs/passed" : "http://adlnet.gov/expapi/verbs/failed",
        display: { "en-US": r.passed ? "passed" : "failed" },
      },
      object: {
        objectType: "Activity",
        id: `${homePage}/${r.app ?? "app"}/${r.simId}`,
        definition: {
          name: { "en-US": r.simName ?? r.simId },
          description: { "en-US": `${r.trade ?? ""}${r.certification ? ` — ${r.certification}` : ""}`.trim() },
          type: "http://adlnet.gov/expapi/activities/simulation",
        },
      },
      result: {
        score: { raw: r.score | 0, min: 0 },
        success: !!r.passed,
        completion: true,
        duration: isoDuration(r.seconds),
        extensions: {
          [ext("stars")]: r.stars | 0,
          [ext("corrections")]: r.errors | 0,
          [ext("unsafe-actions")]: r.hazardHits | 0,
          [ext("hold-breaks")]: r.holdBreaks | 0,
          [ext("par-seconds")]: r.parSeconds ?? null,
          [ext("badges")]: r.badges ?? [],
        },
      },
      context: {
        platform: "SmartCiti.X ~VR Simulators",
        extensions: {
          [ext("category")]: r.category ?? null,
          [ext("certification")]: r.certification ?? null,
          [ext("system")]: r.system ?? null,
          [ext("learner-level")]: r.level ?? null,
        },
      },
    })),
  };
}

/** Browser-only: hand the learner a file. No-op outside a DOM. */
export function download(filename, text, mime = "text/plain") {
  if (typeof document === "undefined" || typeof URL?.createObjectURL !== "function") return false;
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
