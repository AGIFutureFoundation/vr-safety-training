/**
 * Incident replay: last week's near-miss, run on the station it happened on.
 *
 * A toolbox talk is somebody reading out what went wrong on the job and the
 * crew nodding. Nobody rehearses it, so the next crew meets the same event
 * cold. The platform already owns the hard part — real procedures, in a real
 * scene, with an interruption layer built for exactly this shape of thing
 * (something arrives while you are busy and you have seconds to break off) —
 * so a near-miss report should not need a new station written for it. It
 * needs the station that already exists, with the event dropped in at the
 * step where it happened.
 *
 * What a replay may and may not do is the whole design, and it is the same
 * line variants.js draws:
 *
 *   added       one interruption, hung off the step the report points at,
 *               answered by a control that is already in the scene
 *   never       the steps, their targets, their kinds, their order, the
 *               hazards, or the reason any of it is right
 *
 * The rule holds even when the report contradicts the procedure. If a crew
 * grounded before testing and got away with it, the replay still runs the
 * station's order; what the incident earns is an interruption, not a rewrite.
 * A drill that teaches the job as it was done wrong is worse than no drill.
 *
 * Nothing here writes safety advice. The learner-facing text of a replay is
 * the reporter's own sentence plus, where the answer is a control the station
 * already explains, that station's own words about it. Where neither is
 * available the text stays short and factual — see the `why` built in
 * buildReplay(). Invented lore on a union drill is how a platform loses a
 * hall, and the composeLesson() precedent in lessons.js applies here too:
 * refuse rather than fill in.
 */

// Words that identify nothing. Station ids and names are full of them —
// charge-POINT, valve-VAULT, boiler-ROOM, line-TRUCK — and a report that
// mentions "the room" or "the line" has not named a station. Matching on one
// of these is how a coffee-machine complaint becomes a chlorine drill.
const GENERIC = new Set([
  "point", "line", "cell", "room", "yard", "well", "deck", "access", "watch", "system",
  "station", "plant", "node", "hall", "pit", "ramp", "loft", "guard", "test", "power",
  "pour", "air", "lift", "chamber", "box", "truck", "site", "dock", "depot", "back",
  "fly", "stage", "data", "field", "job", "work", "crew", "shift", "area", "floor",
  "build", "machine",
  // "incident" is what every report in this feature is about, so it cannot be
  // what tells two of them apart. It only became reachable when the first
  // station ids carrying it shipped (critical-incident-debrief,
  // traffic-incident-management), and without it here "summarise last month's
  // incidents" scored as a report against one of them.
  "incident",
  // Every residential building has parking, and "more parking at the union
  // hall" is a request, not a report. The garage station is still named by
  // "garage" or by its full name; "parking" on its own names nothing.
  "parking",
  // "union" is on half the catalogue's tradesmen and every hall anyone
  // mentions, so it cannot tell stations apart either. It became reachable
  // with union-hall-and-dispatch, whose id and name both carry it, and
  // without it here "we need more parking at the union hall" scored as a
  // report against that station.
  "union",
  // "course" is a golf course, a training course and a course of action long
  // before it is the forklift course, so it names nothing on its own. It
  // became reachable with drive-light-vehicle-fleet-and-forklift-course.
  "course",
  // "miss" is what this whole feature is built to report — "we had a near
  // miss" — so it cannot also be what points the report at a station. It
  // became reachable with bb-reset-routine-after-a-miss, and without it here
  // "we had a near miss in the car park yesterday" scored as a report
  // against that station.
  "miss",
]);

const STOP = new Set([
  "the", "a", "an", "and", "or", "but", "of", "on", "in", "at", "to", "for", "with",
  "was", "were", "is", "are", "be", "been", "had", "has", "have", "did", "do", "done",
  "we", "they", "he", "she", "it", "i", "our", "his", "her", "their", "its", "my",
  "that", "this", "there", "then", "than", "so", "as", "by", "from", "up", "off",
  "out", "into", "over", "under", "about", "while", "during", "when", "after",
  "before", "just", "got", "get", "went", "came", "come", "one", "two", "some",
  "last", "week", "today", "morning", "afternoon", "night", "again", "still",
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
]);

/**
 * What kind of event a report describes, and what sort of control answers it.
 *
 * `words` recognises the event in the report. `wants` and `alsoWants` are
 * matched against the hit ids the station already registers, so the answer to
 * an injected event is always a control the scene has — this layer never
 * invents an interactable, because a target that is not in the scene is an
 * interruption nobody can answer and the engine scores it as an unsafe action.
 *
 * The two tiers matter more than they look. On a substation, a lock coming
 * off the hasp and a report of the wrong breaker being pulled both match
 * something, but "hold-tag" answers the first and "switching-order" does not;
 * without the split, whichever control happened to be registered first won.
 */
export const EVENTS = [
  { id: "energy-control", label: "Energy control",
    words: ["lock", "locks", "hasp", "lockout", "loto", "tag", "tagged", "tagout", "isolation", "re-energised", "re-energized", "reenergised", "energised", "energized", "back on", "switched on", "closed in", "wrong breaker"],
    wants: /lock|hasp|tag/, alsoWants: /isolat|breaker|disconnect|switch|valve/ },
  { id: "comms", label: "Control call",
    words: ["radio", "call", "called", "calling", "phone", "dispatch", "control centre", "control center", "supervisor", "foreman rang", "message"],
    wants: /radio|phone|comm|dispatch/, alsoWants: /handoff|hand-off|log|permit/ },
  { id: "intruder", label: "Somebody in the area",
    words: ["visitor", "walked in", "walked into", "wandered", "unescorted", "public", "bystander", "member of the public", "stranger", "no badge", "tourist", "driver got out"],
    wants: /visitor|figure|barrier|barricade|fence|gate|cone|stand|zone|exclusion/, alsoWants: /badge|permit|suit|hood|spotter|signal/ },
  { id: "atmosphere", label: "Atmosphere",
    words: ["gas", "alarm went off", "h2s", "hydrogen sulphide", "hydrogen sulfide", "oxygen", "fumes", "smoke", "vapour", "vapor", "leak", "chlorine", "co alarm", "monitor alarmed"],
    wants: /gas|meter|monitor|detector|sensor|alarm/, alsoWants: /vent|fan|blower|scba|respirator|mask|purge/ },
  { id: "plant-movement", label: "Plant movement",
    words: ["excavator", "swung", "forklift", "truck reversed", "vehicle", "backed up", "load swung", "crane moved", "started", "start-up", "reversing"],
    wants: /spotter|estop|e-stop|stop|horn|brake|chock/, alsoWants: /barrier|cone|zone|tagline|tag-line|guard|signal/ },
  { id: "dropped", label: "Dropped object",
    words: ["dropped", "fell", "falling", "came loose", "let go", "slipped out", "shackle", "tool fell", "load dropped"],
    wants: /tether|lanyard|net|shackle|hook|latch/, alsoWants: /harness|sling|barrier|cone|rail|zone/ },
  { id: "weather", label: "Weather",
    words: ["wind", "gust", "lightning", "storm", "rain came", "ice", "squall"],
    wants: /wind|weather|anemometer|abort|stop/, alsoWants: /tagline|tag-line|rail|harness|lanyard|chart/ },
  { id: "casualty", label: "Somebody hurt",
    words: ["injured", "hurt", "collapsed", "passed out", "unconscious", "cut himself", "cut herself", "burn", "casualty", "ambulance"],
    wants: /rescue|retrieval|tripod|eyewash|shower|first|kit/, alsoWants: /radio|phone|alarm|patient|stretcher/ },
  { id: "equipment-failure", label: "Equipment failure",
    words: ["burst", "failed", "failure", "tripped", "stopped working", "packed up", "hose", "seal", "pump quit", "breaker tripped", "went dead"],
    wants: /valve|shutoff|shut-off|estop|e-stop|isolat/, alsoWants: /stop|panel|breaker|pump|drain|gauge/ },
  { id: "lone-worker", label: "Left alone",
    words: ["walked off", "left alone", "on his own", "on her own", "nobody watching", "attendant left", "spotter left", "no attendant", "unattended"],
    wants: /spotter|attendant|watch/, alsoWants: /radio|tripod|retrieval|harness|permit/ },
];

const stem = (w) => (w.length > 5 ? w.replace(/(ing|ed|es|s)$/, "") : w);
const wordsOf = (s) => String(s ?? "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
const contentWords = (s) => [...new Set(wordsOf(s).filter((w) => w.length > 2 && !STOP.has(w)).map(stem))];
const deslug = (id) => String(id ?? "").replace(/[-_]/g, " ").trim();

/** One sentence in the reporter's own words, which is the only text a replay can honestly quote. */
function summarise(raw) {
  // Angle brackets are dropped rather than escaped. This text is quoted
  // verbatim into an interruption's alert, and the HUDs that render an alert
  // put it into the page as markup (react-ui.js uses dangerouslySetInnerHTML,
  // so the shared engine's feedback string is trusted by the time it gets
  // there). A crew's report never needs a tag; escaping would put "&lt;" in
  // front of a class, and leaving them in would put whatever was typed into
  // the page. Stripping is the only one of the three that is both safe and
  // readable, and it is done here so every caller gets it.
  const clean = String(raw).replace(/[<>]/g, " ").replace(/\s+/g, " ").trim();
  const cut = clean.length > 220 ? `${clean.slice(0, 217).replace(/\s+\S*$/, "")}…` : clean;
  const cased = cut.charAt(0).toUpperCase() + cut.slice(1);
  return /[.!?…]$/.test(cased) ? cased : `${cased}.`;
}

/**
 * The clause that says when it happened — "while the crew was testing dead".
 *
 * Kept as the reporter's words rather than resolved to a step here, because
 * parseIncident() only sees roster metadata: the steps live on the station
 * module, and buildReplay() is where the hint meets them.
 */
function extractStepHint(lower) {
  const m = lower.match(/\b(?:while|whilst|during|as|when|part ?way through|halfway through|midway through|just after|right after|straight after|after)\b\s+([^.,;]{4,80})/);
  return m ? m[1].replace(/\s+/g, " ").trim() : "";
}

function classify(lower) {
  let best = null, bestScore = 0;
  for (const ev of EVENTS) {
    const score = ev.words.filter((w) => lower.includes(w)).length;
    if (score > bestScore) { best = ev; bestScore = score; }
  }
  return best?.id ?? "unplanned";
}

export function findEvent(id) {
  return EVENTS.find((e) => e.id === id) ?? null;
}

/**
 * Which station a report is about.
 *
 * Only the station's own id and name identify it; the trade and tagline break
 * ties. A distinctive word is worth three because "substation" names one
 * station and "line" names nothing, and a station is only returned when it
 * scored on something distinctive — a report has to actually name a station.
 */
function matchStation(lower, roster) {
  const hay = ` ${lower} `;
  const scored = [];
  for (const s of roster) {
    if (!s?.id) continue;
    const nameWords = [...new Set([...wordsOf(s.id), ...wordsOf(s.name)])];
    let score = 0, distinctive = 0;
    const hit = [];
    for (const w of nameWords) {
      if (w.length < 3 || STOP.has(w)) continue;
      if (!new RegExp(`\\b${w}s?\\b`).test(hay)) continue;
      hit.push(w);
      if (GENERIC.has(w)) score += 1;
      else { score += 3; distinctive += 1; }
    }
    // The whole name said out loud — "the trench box job" — is as explicit as
    // a report ever gets. It outranks any amount of incidental word overlap,
    // and it counts as distinctive on its own: "data hall" names a station
    // even though neither of its words does.
    const phrase = String(s.name ?? "").toLowerCase();
    if (phrase && hay.includes(` ${phrase} `)) { score += 6; distinctive += 1; }
    for (const w of contentWords(`${s.trade ?? ""} ${s.tagline ?? ""}`)) {
      if (!GENERIC.has(w) && w.length > 4 && hay.includes(w)) score += 1;
    }
    if (distinctive && score >= 3) scored.push({ station: s, score, hit });
  }
  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score || a.station.id.length - b.station.id.length);
  return scored[0].station;
}

/**
 * Read a near-miss report.
 *
 * `roster` is the station metadata both apps publish — id, name, trade,
 * tagline — the same list composeLesson() takes. Returns null when the report
 * names no station on it, which is the common case for the things people type
 * into a box, and is a refusal rather than a failure: a replay of the wrong
 * station teaches the wrong job to the crew it actually happened to.
 *
 * `stepHint` is the reporter's own "while ..." clause, or "" when the report
 * did not say when it happened.
 */
export function parseIncident(text, roster = []) {
  const raw = String(text ?? "").replace(/\s+/g, " ").trim();
  if (raw.length < 8 || !Array.isArray(roster) || !roster.length) return null;
  const lower = raw.toLowerCase();
  const station = matchStation(lower, roster);
  if (!station) return null;
  return {
    stationId: station.id,
    stepHint: extractStepHint(lower),
    eventKind: classify(lower),
    summary: summarise(raw),
  };
}

/** Every control the learner could be asked to reach for, with where it came from. */
function controlsOf(base, steps) {
  const out = new Map();
  for (const step of steps) {
    // A `find` step's items are things to notice and report, not controls to
    // operate. Answering an alarm by clicking a cracked insulator is not a
    // response, so they stay out of the pool.
    if (step.kind === "find") continue;
    for (const t of step.targets ?? (step.target ? [step.target] : [])) {
      if (!out.has(t)) out.set(t, { id: t, step, fromInterrupt: false });
    }
  }
  for (const it of base.interrupts ?? []) {
    const known = out.get(it.target);
    if (known) known.fromInterrupt = true;
    else if (it.target) out.set(it.target, { id: it.target, step: null, fromInterrupt: true });
  }
  // Hazard ids are registered in the scene too, and selecting one is normally
  // scored as an unsafe action, so asking for one as the answer would mark a
  // learner down for obeying the drill. The exception is a hazard the station
  // already uses as an interruption target — crane-yard answers "somebody is
  // under the load" with its own swing-radius marker — because there the
  // author has decided the alarm makes that control the right thing to reach
  // for, and the engine routes the selection to the alarm while it is up.
  for (const id of Object.keys(base.hazards ?? {})) {
    if (!out.get(id)?.fromInterrupt) out.delete(id);
  }
  return [...out.values()];
}

/** The step the report points at, and how confident that placement is. */
function placeStep(steps, incident) {
  const hint = contentWords(incident.stepHint);
  const wide = contentWords(incident.summary);
  for (const [words, placement] of [[hint, "hinted"], [wide, "inferred"]]) {
    if (!words.length) continue;
    let best = null, bestScore = 0;
    for (const step of steps) {
      const hay = new Set(contentWords(`${step.id} ${step.title ?? ""} ${step.cue ?? ""}`));
      const score = words.filter((w) => hay.has(w)).length;
      if (score > bestScore) { best = step; bestScore = score; }
    }
    if (best) return { step: best, placement, matched: bestScore };
  }
  // Nothing in the report lines up with anything in the procedure. The event
  // still happened on this station, so the replay is worth running — but it
  // says so rather than implying the middle of the job is where it was.
  return { step: steps[Math.floor(steps.length / 2)], placement: "unplaced", matched: 0 };
}

/**
 * The control that answers the injected event.
 *
 * Ordered by how defensible the answer is: a control the event's own kind
 * points at, then one the station already uses as an interruption answer,
 * then one whose name the report itself uses. Nothing below that — an
 * arbitrary control would make a drill whose right answer has no relation to
 * what happened, and the honest move there is to build no replay at all.
 */
function pickTarget(controls, host, incident) {
  const event = findEvent(incident.eventKind);
  const hostControls = new Set([host.target, ...(host.targets ?? [])].filter(Boolean));
  // Rule two of this layer, and the engine's own checker enforces it as well:
  // an alarm answered by the control the learner already has in their hand is
  // a nudge, not an interruption — there is nothing to break off from.
  const open = controls.filter((c) => !hostControls.has(c.id));
  if (!open.length) return null;

  const said = new Set(contentWords(incident.summary));
  const rank = (c) => {
    let r = 0;
    if (event?.wants?.test(c.id)) r += 5;
    else if (event?.alsoWants?.test(c.id)) r += 3;
    // A control the station itself already uses as an interruption answer is
    // one the author decided is worth breaking off a step for. That is better
    // knowledge about this scene than anything this file can work out, so it
    // scores alongside a direct match on the kind of event.
    if (c.fromInterrupt) r += 3;
    if (contentWords(deslug(c.id)).some((w) => said.has(w))) r += 1;
    return r;
  };
  const ranked = open.map((c) => ({ c, r: rank(c) })).filter((x) => x.r > 0);
  if (!ranked.length) return null;
  ranked.sort((a, b) => b.r - a.r);
  return ranked[0].c;
}

/** What to call a control on screen: the station's own word for it, or its id read out. */
function labelFor(steps, id) {
  for (const step of steps) {
    const named = step.itemNames?.[id];
    if (named) return named;
  }
  // An id like "zone-pt-a" means nothing read out on its own, so the step it
  // belongs to says what it is — the station's words again, not this file's.
  const step = steps.find((s) => s.target === id);
  if (step?.title) return `${deslug(id)} (${step.title.toLowerCase()})`;
  return deslug(id);
}

/**
 * Build a replay room from an authored station and a parsed incident.
 *
 * Returns a room object of the same shape the Session engine already plays,
 * exactly as makeVariant() does, so scoring, records, xAPI and the debrief
 * need to know nothing about where it came from. The station's own steps are
 * copied through untouched and its own interruptions are kept: the only
 * difference between this and the station is one more thing that happens.
 *
 * Returns null when the incident belongs to a different station, or when no
 * control in the scene can be defended as the answer to this event.
 */
export function buildReplay(base, incident, { seconds = 12, delay = 3, stage = null } = {}) {
  if (!base?.steps?.length || !incident?.summary) return null;
  // A replay is a claim about a specific job. Building one from an incident
  // parsed against another station would put a real crew's event on the wrong
  // procedure, which is the one mistake this feature cannot make.
  if (incident.stationId && base.id && incident.stationId !== base.id) return null;

  // Trade Skills rooms carry a `title` and no `name`; SmartCiti.X stations
  // carry both and the name is the short one.
  const baseName = base.name ?? base.title ?? base.id;
  const steps = base.steps.map((step) => ({ ...step }));
  const { step: host, placement, matched } = placeStep(steps, incident);
  const target = pickTarget(controlsOf(base, steps), host, incident);
  if (!target) return null;

  const event = findEvent(incident.eventKind);
  const label = labelFor(steps, target.id);
  // The station's own sentence about that control, when it has one. This is
  // the only teaching text in a replay that was not written by the person who
  // reported the incident, and it is quoted rather than paraphrased.
  const stationWhy = target.step && target.step !== host ? target.step.why : "";

  // An event on a step that already has one of the station's own alarms is
  // not a conflict — it is what a busy step is like — but the two should not
  // be racing for the same window, so the reported one arrives first.
  const sharesStep = (base.interrupts ?? []).some((i) => i.after === host.id);

  const taken = new Set((base.interrupts ?? []).map((i) => i.id));
  let id = `incident-${incident.eventKind}`;
  for (let n = 2; taken.has(id); n++) id = `incident-${incident.eventKind}-${n}`;

  const injected = {
    id,
    kind: event?.label ?? "Reported incident",
    after: host.id,
    // Two seconds is the engine's floor for "the learner is busy by now".
    delay: sharesStep ? 2 : Math.max(2, Math.round(delay)),
    // Six seconds is the floor below which this stops measuring noticing and
    // starts measuring reflexes.
    seconds: Math.min(30, Math.max(6, Math.round(seconds))),
    alert: incident.summary,
    cue: "This is the report. Break off the step and deal with it.",
    target: target.id,
    why: stationWhy
      ? `Reported on this job: ${incident.summary} ${stationWhy}`
      : `Reported on this job: ${incident.summary} On this station it is answered at the ${label}.`,
    missNote: `Nothing was done about it and the procedure carried on, which is the part of the report worth rehearsing: ${incident.summary}`,
    wrongNote: `That is not it, and the event is still running. It is answered at the ${label}.`,
    // Where this came from, for the debrief and for anyone auditing a drill
    // that names a real crew's bad day.
    fromIncident: { eventKind: incident.eventKind, placement, stepHint: incident.stepHint },
  };

  const placedNote = placement === "unplaced"
    ? "The report did not say where in the job it happened, so it arrives mid-procedure."
    : `It arrives during "${host.title ?? host.id}", where the report puts it.`;

  return {
    ...base,
    id: `incident:${base.id}:${id}`,
    index: "▲",
    domain: "Incident replay",
    name: `${baseName} — incident replay`,
    title: `${base.title ?? baseName} · incident replay`,
    tagline: `${baseName}, run as authored, with one reported event added. ${placedNote}`,
    steps,
    interrupts: [...(base.interrupts ?? []).map((it) => ({ ...it })), injected],
    isReplay: true,
    replay: {
      baseId: base.id,
      baseName,
      eventKind: incident.eventKind,
      eventLabel: event?.label ?? "Reported incident",
      summary: incident.summary,
      stepHint: incident.stepHint,
      stepId: host.id,
      stepTitle: host.title ?? host.id,
      placement,
      matchedWords: matched,
      interruptId: id,
      target: target.id,
      targetLabel: label,
      seconds: injected.seconds,
      sharesStep,
      // Whether the teaching text leans on the station's own words or only on
      // the report. An instructor reviewing a drill should be able to see
      // which, because "grounded: false" means the answer is defensible but
      // the station never explained that control.
      grounded: !!stationWhy,
      // False means the event will fire with a banner and an unchanged room.
      // A caller that leaves this false is shipping a caption.
      staged: !!stage,
    },
    // `stage` is what makes the event something to notice rather than a
    // caption — see shared/incident-stage.js. It is injected rather than
    // imported so this module stays free of three.js, which is what lets the
    // prompt parser reach parseIncident() without dragging a renderer in.
    build: (root) => {
      const scene = base.build(root);
      return stage ? stage(scene, root, id) : scene;
    },
  };
}

/** A one-line description an instructor can read before issuing it. */
export function describeReplay(replay) {
  if (!replay?.replay) return "";
  const r = replay.replay;
  const where = r.placement === "unplaced" ? "no step given" : `at "${r.stepTitle}"`;
  return `${r.baseName} · ${r.eventLabel} ${where} · answered at ${r.target} in ${r.seconds}s · ${replay.steps.length} steps · ${replay.interrupts.length} interruptions`;
}
