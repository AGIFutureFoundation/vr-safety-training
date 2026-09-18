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

const RECORDS_KEY = "vr-training-records-v1";
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

function loadRecords() {
  try {
    const raw = JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch (_) { return []; }
}

function saveRecords(list) {
  try { localStorage.setItem(RECORDS_KEY, JSON.stringify(list)); } catch (_) { /* private mode — run unsaved */ }
}

export const TrainingRecords = {
  /** Oldest first. */
  list() { return loadRecords(); },

  count() { return loadRecords().length; },

  /**
   * Append one attempt. `entry` is the plain data a finished Session yields
   * (see SmartCiti.X's showResults); this adds the id, timestamp and the
   * pass verdict so callers never compute it themselves.
   */
  record(entry) {
    const list = loadRecords();
    const full = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      at: new Date().toISOString(),
      ...entry,
    };
    full.passed = passed(full);
    list.push(full);
    if (list.length > MAX_ENTRIES) list.splice(0, list.length - MAX_ENTRIES);
    saveRecords(list);
    return full;
  },

  clear() { try { localStorage.removeItem(RECORDS_KEY); } catch (_) { /* ignore */ } },

  /**
   * Per-category roll-up for an instructor view: attempts, passes, distinct
   * stations passed, best stars. Categories come from the entries themselves
   * so a record from a since-renamed category still counts.
   */
  summary(list = loadRecords()) {
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
  "at", "learner", "learnerName", "learnerId", "homePage", "app", "simId", "simName", "category", "trade", "certification", "system",
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
 * `homePage` scopes the activity ids and is the fallback actor account
 * home; a record that carries a launch identity (learnerId/homePage from
 * shared/identity.js) uses that as the actor account instead, so the LRS
 * can join it to the LMS user. Extensions carry the assessment detail
 * (category, certification, stars, unsafe actions) that the core result
 * object has no field for.
 */
export function toXAPI(list, { actorName = "YOU", homePage = "https://smartciti.example" } = {}) {
  const ext = (k) => `${homePage}/xapi/ext/${k}`;
  return {
    statements: list.map((r) => ({
      id: r.id,
      timestamp: r.at,
      actor: {
        objectType: "Agent",
        name: r.learnerName ?? r.learner ?? actorName,
        account: { homePage: r.homePage ?? homePage, name: r.learnerId ?? r.learner ?? actorName },
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
          // The step-by-step review, so an LRS holds where a run went slow
          // or wrong rather than only what it scored.
          ...(r.debrief ? {
            [ext("clean-steps")]: r.debrief.cleanSteps | 0,
            [ext("median-step-seconds")]: r.debrief.medianSeconds ?? 0,
            [ext("slowest-step")]: r.debrief.slowest ? `${r.debrief.slowest.title} (${r.debrief.slowest.seconds}s)` : null,
            [ext("step-log")]: (r.debrief.steps ?? []).map((st) => ({
              id: st.id, seconds: st.seconds, corrections: st.corrections, hazards: st.hazards,
            })),
            // Interruptions are assessed separately from the procedure: an
            // LRS should be able to ask "who misses alarms" without unpicking
            // the step log to find out.
            ...(r.debrief.interrupts ? {
              [ext("interrupts-caught")]: r.debrief.interrupts.answered,
              [ext("interrupts-missed")]: r.debrief.interrupts.missed + r.debrief.interrupts.wrong,
              [ext("interrupt-log")]: r.debrief.interrupts.log.map((l) => ({
                id: l.id, outcome: l.outcome, seconds: l.seconds,
              })),
            } : {}),
          } : {}),
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

// ------------------------------------------------------------- credentials

/** Distinct certifications with a passing attempt — the latest pass for each. */
export function earnedCertifications(list) {
  const by = new Map();
  for (const r of list) {
    if (!r.passed || !r.certification) continue;
    const prev = by.get(r.certification);
    if (!prev || String(r.at) > String(prev.at)) by.set(r.certification, r);
  }
  return [...by.values()].sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

function badgeImage(label) {
  const safe = String(label).replace(/[<>&"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" rx="24" fill="#0b1219"/>` +
    `<circle cx="120" cy="104" r="62" fill="none" stroke="#37d6c0" stroke-width="10"/>` +
    `<text x="120" y="196" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#e6f0f6">${safe}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Open Badges 2.0 assertions — the portable credential format LMSs, wallets
 * and other training ecosystems ingest — one per certification with a
 * passing attempt. These are self-asserted by a static page: an issuer that
 * hosts the BadgeClass and Assertion URLs is what makes them verifiable, so
 * the ids are laid out as URLs under `homePage` ready for that host. The
 * evidence entry points at the same xAPI statement the LRS export carries.
 */
export function toOpenBadges(list, { issuerName = "SmartCiti.X Training Network", homePage = "https://smartciti.example", actorName = "YOU" } = {}) {
  return earnedCertifications(list).map((r) => {
    const home = r.homePage ?? homePage;
    const who = r.learnerId ?? r.learner ?? actorName;
    return {
      "@context": "https://w3id.org/openbadges/v2",
      type: "Assertion",
      id: `${home}/credentials/${r.id}`,
      recipient: { type: "url", hashed: false, identity: `${home}/learners/${encodeURIComponent(who)}`, name: r.learnerName ?? r.learner ?? actorName },
      issuedOn: r.at,
      verification: { type: "hosted" },
      badge: {
        type: "BadgeClass",
        id: `${homePage}/badges/${r.app ?? "app"}/${r.simId}`,
        name: `${r.simName ?? r.simId} — ${r.certification}`,
        description: `Passed the ${r.simName ?? r.simId} simulator (${r.category ?? "uncategorized"}): ${r.stars | 0} stars, ` +
          `${r.hazardHits | 0} unsafe actions, ${r.errors | 0} corrections. Maps to: ${r.certification}.`,
        image: badgeImage(r.simName ?? r.simId),
        criteria: { narrative: "Two or more stars with no unsafe action on the station's real ordered procedure, assessed by the SmartCiti.X procedure engine. Passing a simulator evidences readiness for the named certification; it is not the certification itself." },
        issuer: { type: "Profile", id: `${homePage}/issuer`, name: issuerName, url: homePage },
        tags: [r.category, r.trade].filter(Boolean),
      },
      evidence: [{ id: `${homePage}/xapi/statements/${r.id}`, narrative: `Score ${r.score | 0}, ${r.stars | 0} stars, ${r.seconds | 0} s against par ${r.parSeconds ?? "—"} s; xAPI statement ${r.id}.` }],
    };
  });
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
