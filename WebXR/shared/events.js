/**
 * Random events: the ambient-event scheduler every SmartCiti.X station gets
 * for free, without a single station file being touched.
 *
 * A station that never varies teaches the answer key on the second run — a
 * different problem from the one shared/variants.js solves. A variant makes
 * the *assessment* harder to memorise (hints off, alarms moved, the clock
 * tighter). This module makes the *run* feel less like a fixed diorama:
 * weather drifts, a truck goes by, a crew member wanders through, the radio
 * clicks on, a tool clatters off a bench, a mast light flickers at night.
 * None of it is graded and none of it is a step — see the two rules below.
 *
 * This module is pure and knows nothing about three.js, SIMS_META or the DOM.
 * It decides WHEN an ambient beat happens and WHAT it is (a kind plus a
 * small, already-resolved payload — which weather kind, which vehicle), from
 * a seed and the plain facts the caller (smartcity/js/app.js) hands it. The
 * caller is the one holding the live scene, so it is the one that turns a
 * fired event into a mesh, a light or a spoken line; this module never
 * reaches for THREE, so it is automatically a no-op wherever the caller's own
 * three.js or SIMS_META is stubbed or missing — there is nothing here for
 * that to break.
 *
 * Two rules, held by tools/check_events.mjs:
 *
 *   1. An ambient event changes the SCENE, never the PROCEDURE or the SCORE.
 *      It never touches session.step, session.index or session.score, and it
 *      never counts as a hazard. If a kind cannot be shown honestly for a
 *      station (weather indoors, a road where there is none, a radio line
 *      with nothing real to say) it is simply not offered — see eligible().
 *   2. Everything here is seeded. The same room id + seed always produces the
 *      same ambient timeline and the same interrupt-timing jitter, so an
 *      instructor can replay a learner's exact run with `?seed=`.
 *
 * The other half of "less scripted" is timing variance on the station's OWN
 * declared interruptions (shared/game.js): a seeded jitter of up to ±40% on
 * each one's `delay`, and — where a station declares more than two — a
 * seeded reshuffle of which of the extra ones lands on which of their steps.
 * The first two interruptions keep the step they were authored on; only the
 * timing (and, for the extras, the assignment among themselves) varies. See
 * varyInterruptTiming() below. What never varies: which control answers an
 * interruption, its wording, or the fact that it fires at all.
 */

// ---------------------------------------------------------------- utilities

/** Small deterministic PRNG (same xorshift as shared/variants.js, kept local
 *  so this module imports nothing). A string seed is hashed to a 32-bit
 *  start value; a number seed is used directly. */
export function eventsRng(seed) {
  let s = (typeof seed === "string"
    ? [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
    : (seed >>> 0)) || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/** Fisher-Yates, seeded. */
export function shuffleSeeded(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(list, rand) {
  return list.length ? list[Math.floor(rand() * list.length) % list.length] : null;
}

// ---------------------------------------------------------------- on/off

/** `?events=on` / `?events=off` from the URL, or null when it says nothing. */
export function eventsFromQuery(search = "") {
  const q = new URLSearchParams(search ?? "").get("events");
  return q === "on" ? "on" : q === "off" ? "off" : null;
}

/**
 * Whether this attempt runs with events on.
 *
 *   explicit        "on" | "off" | null — the `?events=` override, if any
 *   ladderLevel     the ladder rung this task is running as part of, or null
 *   isVariant       true for an assessment/pressure variant (shared/variants.js)
 *   instructorArmed true when an instructor is driving THIS run's interruption
 *                   themselves — a live CMD_INTERRUPT, or the station opened
 *                   under a ladder task's own `?interrupt=` condition. Either
 *                   way the room they staged must not compete with a
 *                   randomly-timed one, so this always wins over `?events=on`.
 *
 * Default on for level 11+ of a ladder and for assessment variants (both are
 * meant to be less predictable than a first pass); off in the base run.
 */
export function eventsEnabled({ explicit = null, ladderLevel = null, isVariant = false, instructorArmed = false } = {}) {
  if (instructorArmed) return false;
  if (explicit === "off") return false;
  if (explicit === "on") return true;
  if (isVariant) return true;
  if (Number.isFinite(ladderLevel) && ladderLevel >= 11) return true;
  return false;
}

// --------------------------------------------------------- interrupt timing

/**
 * Seeded jitter on a station's own declared interruptions: never changes
 * which step one is armed on, its target, its wording, or the number of
 * them — only:
 *
 *   - each interruption's `delay`, by up to ±40% (never under the 2s floor
 *     tools/check_interrupts.mjs already holds every delay to)
 *   - where a station declares MORE than two, which of the ones after the
 *     first two lands on which of their own steps — a seeded reshuffle among
 *     that group only, and only where the swap stays valid: an interruption
 *     never lands on a step whose own target is the interruption's answer,
 *     which would turn it from something to notice into a nudge (the same
 *     rule shared/variants.js and tools/check_interrupts.mjs already hold
 *     every interruption to). A swap that would break that is left as it was
 *     rather than silently dropped.
 *
 * Returns `room` unchanged (same reference) when it has no interruptions to
 * vary, so a caller never needs to branch on whether anything changed.
 */
export function varyInterruptTiming(room, { seed = 0, rand = null } = {}) {
  const list = room?.interrupts;
  if (!Array.isArray(list) || list.length === 0) return room;
  const rng = rand ?? eventsRng(`${room.id ?? "room"}:${seed}:events-timing`);

  const jittered = list.map((it) => {
    const factor = 1 + (rng() * 2 - 1) * 0.4; // ±40%
    const delay = Math.max(2, Math.round((Number(it.delay) || 3) * factor));
    return { ...it, delay };
  });

  if (jittered.length <= 2) return { ...room, interrupts: jittered };

  const head = jittered.slice(0, 2);
  const extra = jittered.slice(2);
  const steps = room.steps ?? [];
  const order = shuffleSeeded(extra.map((it) => it.after), rng);
  const reassigned = extra.map((it, i) => {
    const after = order[i];
    if (after === it.after) return it;
    const host = steps.find((s) => s.id === after);
    if (!host) return it; // the step this extra would move to no longer exists — leave it
    const conflict = host.target === it.target || (host.targets ?? []).includes(it.target);
    return conflict ? it : { ...it, after };
  });
  return { ...room, interrupts: [...head, ...reassigned] };
}

// ---------------------------------------------------------------- ambient events

/** Every ambient kind this scheduler can plan. The caller renders each one;
 *  this module only ever decides when and (for the kinds that need it) which
 *  variant of it — a weather kind, a vehicle. */
export const AMBIENT_KINDS = ["weather-shift", "vehicle-pass", "crew-walkthrough", "radio-call", "dropped-tool", "mast-light"];

const VEHICLE_KINDS = ["pickup", "sedan", "cargoVan", "boxTruck"];

/** Whether `kind` can be honestly shown for this station, given only what the
 *  caller told us about it — never invented, only withheld. */
function eligible(kind, ctx) {
  const { room, night, weatherKinds, radioLine } = ctx;
  switch (kind) {
    case "weather-shift": return !room.indoor && Array.isArray(weatherKinds) && weatherKinds.length > 1;
    case "vehicle-pass": return !!ctx.hasRoad;
    case "mast-light": return !room.indoor && !!night;
    case "radio-call": return typeof radioLine === "string" && radioLine.trim().length > 0;
    case "crew-walkthrough": return !room.indoor;
    case "dropped-tool": return true;
    default: return false;
  }
}

/** The plain-language line this event's own log entry and the HUD chip show.
 *  Everything in it is either a fixed description of the beat itself or a
 *  value the caller already resolved (a weather kind, a radio line lifted
 *  from the station's own supportLine/crew post) — nothing is invented here. */
function describe(kind, payload, ctx) {
  switch (kind) {
    case "weather-shift": return `The weather turned to ${payload.weatherKind}.`;
    case "vehicle-pass": return "A kit vehicle passed on the district road.";
    case "crew-walkthrough": return "A crew member walked through and stopped to watch.";
    case "radio-call": return `Radio: ${ctx.radioLine}`;
    case "dropped-tool": return "A tool clattered off a bench nearby.";
    case "mast-light": return "The mast light flickered.";
    default: return kind;
  }
}

/**
 * Build one run's ambient timeline up front, seeded — an instructor can hand
 * a learner the same `?seed=` and see the same beats land at the same
 * moments. `ctx`:
 *
 *   seed         anything JSON-ish; usually the station id or `?seed=`
 *   parSeconds   the run's own par, to space events across its length
 *   weatherKinds the kinds this station may honestly shift to (empty/absent
 *                for an indoor station — see shared/weather.js's WEATHER_KINDS)
 *   night        true when the stage is standing at its night hour
 *   hasRoad      true when this station's district has traffic to pass
 *   radioLine    a short, real line the station could plausibly say over the
 *                radio (its own supportLine, or a crew post from
 *                shared/crew.js's splitByRole) — omit rather than invent one
 *
 * Returns `[]` when nothing on the station is eligible for any kind, or when
 * the run is too short to hold even one beat.
 */
export function planAmbientEvents(room, {
  seed = 0, parSeconds = null, weatherKinds = [], night = false, hasRoad = false, radioLine = null, rand = null,
} = {}) {
  const rng = rand ?? eventsRng(`${room?.id ?? "room"}:${seed}:events-ambient`);
  const span = Math.max(30, parSeconds ?? room?.parSeconds ?? 180);
  const ctx = { room: room ?? {}, night, weatherKinds, hasRoad, radioLine };
  const pool = AMBIENT_KINDS.filter((k) => eligible(k, ctx));
  if (!pool.length) return [];

  // Roughly one beat every 30-45s of the run, capped so a short station is
  // not swamped and a long one does not go quiet for minutes at a time.
  const count = Math.max(1, Math.min(5, Math.round(span / 38)));
  const order = shuffleSeeded(pool, rng);
  const slot = span / (count + 1);
  const events = [];
  for (let i = 0; i < count; i++) {
    const kind = order[i % order.length];
    const jitter = (rng() * 2 - 1) * slot * 0.3;
    const at = Math.max(4, Math.min(span - 3, Math.round(slot * (i + 1) + jitter)));
    const payload = kind === "weather-shift"
      ? { weatherKind: pick(weatherKinds.filter((w) => w !== room?.weather), rng) ?? pick(weatherKinds, rng) }
      : kind === "vehicle-pass" ? { vehicleKind: pick(VEHICLE_KINDS, rng) }
      : {};
    events.push({ id: `amb-${i}-${kind}`, kind, at, payload, text: describe(kind, payload, ctx) });
  }
  events.sort((a, b) => a.at - b.at);
  return events;
}

/**
 * The live scheduler for one run: builds the timeline once (or holds none,
 * when `enabled` is false or the query turned events off) and fires each
 * beat in `tick()` once the session's clock reaches it.
 *
 * `tick(session)` is the only thing called every frame. It:
 *   - never fires while the session is finished or already mid-interrupt
 *     (rule 1 above: an ambient beat must never compete with, or be mistaken
 *     for, a real interruption)
 *   - never reads or writes anything on `session` beyond `.elapsed`,
 *     `.finished` and `.activeInterrupt`
 *   - returns the fired event (for the caller to render and log), or null
 *
 * `disable()` turns off everything still to come — called the moment an
 * instructor takes over this run's interruptions live (CMD_INTERRUPT),
 * because from that instant the room is theirs to stage, not the seed's.
 * Whatever already fired stays in `log`.
 */
export function createEventScheduler(room, opts = {}) {
  const { seed = 0, enabled = true, onFire = null } = opts;
  let live = !!enabled;
  const timeline = live ? planAmbientEvents(room, { seed, ...opts }) : [];
  const log = [];
  let idx = 0;
  return {
    get enabled() { return live; },
    get timeline() { return timeline; },
    get log() { return log; },
    disable() { live = false; },
    tick(session) {
      if (!live || !session || session.finished || session.activeInterrupt) return null;
      if (idx >= timeline.length) return null;
      const next = timeline[idx];
      if ((session.elapsed || 0) < next.at) return null;
      idx += 1;
      const entry = { id: next.id, kind: next.kind, payload: next.payload, text: next.text, at: Math.round((session.elapsed || 0) * 10) / 10 };
      log.push(entry);
      onFire?.(entry);
      return entry;
    },
  };
}
