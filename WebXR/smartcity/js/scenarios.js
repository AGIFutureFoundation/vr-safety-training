// User-created scenarios: let a learner or instructor build their own drill
// out of a real simulator's real steps, and run it through the exact same
// procedure engine that scores every built-in SmartCiti.X station.
//
// A custom scenario never invents new 3D content or new hazards — it curates
// and reorders the *existing* steps of one base simulator (the station it was
// built from is what gets constructed and walked). That keeps every custom
// drill grounded in an authored, reviewed procedure instead of arbitrary
// user-typed text standing in for real training content, and it means the
// engine, the hazards, the gamified rank system and the 3D station all keep
// working exactly as they already do — nothing new to verify there.

const SCENARIO_STORE_KEY = "smartcity-custom-scenarios-v1";
const MAX_SCENARIOS = 30;

/**
 * Local-only library of custom scenario descriptors. A descriptor is plain
 * data (never functions), so it survives localStorage round-tripping:
 * { id, baseId, name, tagline, stepIds, parSeconds, createdAt }
 */
export const CustomScenarios = {
  list() {
    try {
      const raw = JSON.parse(localStorage.getItem(SCENARIO_STORE_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (_) { return []; }
  },

  get(id) { return this.list().find((e) => e.id === id) ?? null; },

  save(entry) {
    const all = this.list();
    const i = all.findIndex((e) => e.id === entry.id);
    if (i >= 0) all[i] = entry;
    else all.push(entry);
    // Oldest-first eviction rather than a hard refusal once the shelf is full —
    // a local library should keep working, not block a save with an error.
    while (all.length > MAX_SCENARIOS) all.shift();
    try { localStorage.setItem(SCENARIO_STORE_KEY, JSON.stringify(all)); } catch (_) { /* ignore */ }
    return entry;
  },

  remove(id) {
    const all = this.list().filter((e) => e.id !== id);
    try { localStorage.setItem(SCENARIO_STORE_KEY, JSON.stringify(all)); } catch (_) { /* ignore */ }
  },
};

/** A short, collision-safe id with no dependency on crypto.randomUUID. */
export function newScenarioId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Build a full room-shaped object from a base simulator plus a scenario
 * descriptor. The result is a real drop-in room: same build() (so the same
 * 3D station, the same interactables, the same hazards), same gamified
 * system (so it ranks and pays out in that trade's own currency), but with
 * `steps` narrowed and reordered to whatever the author kept. `Session`,
 * `Progress`, the hub and the leaderboard never need to know a room is
 * custom — they only ever see the shape they already understand.
 */
export function buildCustomRoom(baseSim, entry) {
  const byId = new Map(baseSim.steps.map((s) => [s.id, s]));
  const steps = entry.stepIds.map((id) => byId.get(id)).filter(Boolean);
  const fraction = baseSim.steps.length ? steps.length / baseSim.steps.length : 1;
  return {
    ...baseSim,
    id: `custom:${entry.id}`,
    index: "★",
    domain: "Custom",
    name: entry.name,
    title: `${entry.name} — Custom Drill`,
    tagline: entry.tagline?.trim() || `A custom drill built from ${baseSim.name}: ${steps.length} of ${baseSim.steps.length} steps.`,
    parSeconds: entry.parSeconds ?? Math.max(45, Math.round(baseSim.parSeconds * fraction)),
    steps,
    isCustom: true,
    baseId: baseSim.id,
    baseName: baseSim.name,
    build: (root) => baseSim.build(root),
  };
}

/**
 * Resolve every saved descriptor against the live base-sim catalogue into
 * playable room objects, silently dropping any whose base simulator no
 * longer exists (e.g. content was renamed) rather than crashing the hub.
 */
export function customRooms(simById) {
  const rooms = [];
  for (const entry of CustomScenarios.list()) {
    const base = simById[entry.baseId];
    if (base) rooms.push(buildCustomRoom(base, entry));
  }
  return rooms;
}
