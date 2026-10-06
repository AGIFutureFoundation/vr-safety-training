/**
 * Lesson automation: turn a sentence into a runnable programme of real
 * stations.
 *
 * The Holodeck could already summon one authored station by name. This is the
 * next thing a training director actually asks for — "put me a lockout
 * refresher together for the third-year apprentices" — which is not one
 * station, it is a sequence of them with a reason for the order, a points
 * target and a pass bar.
 *
 * Nothing here invents content. A lesson is a selection over the station
 * roster the two simulators already ship, scored with the points those
 * stations already award. That matters for a union hall: the certificate at
 * the end has to name procedures that exist and standards that are real.
 */

// What a prompt can ask for, and how to recognise it. Each facet reads the
// station metadata rather than a hand-maintained list, so a station added to
// either app is selectable the day it lands.
const FACETS = [
  { id: "lockout", label: "Energy control and isolation",
    words: ["lockout", "lock out", "loto", "isolation", "isolate", "energy control", "de-energise", "de-energize", "1910.147"],
    match: (s) => /lockout|isolat|energy control|1910\.147|70E|de-?energ/i.test(`${s.certification} ${s.tagline}`) },
  { id: "confined", label: "Permit-required confined space",
    words: ["confined", "permit space", "vault", "manhole", "1910.146", "entry"],
    match: (s) => /confined|permit space|1910\.146|vault|wet well|firebox/i.test(`${s.certification} ${s.tagline}`) },
  { id: "height", label: "Work at height and fall protection",
    words: ["height", "fall", "climb", "tower", "scaffold", "roof", "1926.502", "harness"],
    match: (s) => /fall protection|1926\.502|climb|scaffold|mast|tower|aerial|height/i.test(`${s.certification} ${s.tagline}`) },
  { id: "electrical", label: "Electrical safe work practice",
    words: ["electrical", "arc flash", "70e", "switching", "busway", "transformer", "volt"],
    match: (s) => /NFPA 70E|arc.?flash|1910\.269|switching|busway|kV|volt/i.test(`${s.certification} ${s.tagline}`) },
  { id: "rigging", label: "Rigging, lifting and suspended loads",
    words: ["rigging", "crane", "hoist", "lift", "load chart", "sling", "1926.1400"],
    match: (s) => /rigging|crane|hoist|1926\.1400|load chart|lashing|mooring/i.test(`${s.certification} ${s.tagline}`) },
  { id: "atmosphere", label: "Atmospheric and respiratory hazards",
    words: ["atmosphere", "gas", "respirator", "scba", "hazmat", "1910.134", "chlorine", "h2s"],
    match: (s) => /1910\.134|respirat|atmospher|gas|chlorine|hazmat|decon|abatement/i.test(`${s.certification} ${s.tagline}`) },
  { id: "machine", label: "Machine guarding and automation",
    words: ["machine", "guard", "robot", "press", "conveyor", "cnc", "automation"],
    match: (s) => /machine|guard|robot|press brake|conveyor|CNC|automation/i.test(`${s.certification} ${s.tagline} ${s.category}`) },
  { id: "awareness", label: "Situational awareness under interruption",
    words: ["awareness", "attention", "interruption", "distraction", "noticing"],
    match: (s) => (s.interruptCount ?? 0) > 0 },
];

// Union locals are named on the stations themselves; this pulls the acronym
// out of whatever prose the certification line uses.
const UNION_RE = /\b(IBEW|LIUNA|UA\b|CWA|IATSE|ILWU|IUOE|IUEC|IAFF|IAM|SIU|MEBA|MM&P|ATU|AFSCME|UAW|BMWED|IAEP|Ironworkers|Teamsters|IUPAT)\b/g;

export function unionsOf(station) {
  return [...new Set(String(station.certification ?? "").match(UNION_RE) ?? [])];
}

/** Level of the learner the prompt is asking about, which sets the pass bar. */
function audienceOf(lower) {
  if (/apprentice|first year|new hire|intro|basic|onboard/.test(lower)) return { id: "apprentice", label: "Apprentices", pass: 0.6, size: 4 };
  if (/journey|refresher|recert|annual/.test(lower)) return { id: "journeyman", label: "Journeymen", pass: 0.75, size: 5 };
  if (/lead|supervis|foreman|competent person|master/.test(lower)) return { id: "lead", label: "Leads and competent persons", pass: 0.85, size: 6 };
  return { id: "crew", label: "Working crew", pass: 0.7, size: 5 };
}

/**
 * Compose a lesson from a sentence.
 *
 * `roster` is the station metadata both apps already publish — id, name,
 * category, certification, tagline, stepCount, parSeconds and (where known)
 * interruptCount. Returns null when nothing in the sentence names anything
 * the roster can satisfy, because a lesson of arbitrary stations is worse
 * than telling the user it did not understand.
 */
export function composeLesson(text, roster, { max = 6 } = {}) {
  const lower = String(text ?? "").toLowerCase();
  const audience = audienceOf(lower);

  const facets = FACETS.filter((f) => f.words.some((w) => lower.includes(w)));
  const askedUnions = [...new Set(lower.toUpperCase().match(UNION_RE) ?? [])];
  const askedCategory = [...new Set(roster.map((s) => s.category).filter(Boolean))]
    .filter((c) => lower.includes(c.toLowerCase().split(" &")[0]));

  if (!facets.length && !askedUnions.length && !askedCategory.length) return null;

  // Score every station against what was asked. Facet match is the strongest
  // signal, then the union, then the sector.
  const scored = roster.map((s) => {
    let score = 0;
    const why = [];
    for (const f of facets) {
      if (f.match(s)) { score += 3; why.push(f.label); }
    }
    const us = unionsOf(s);
    if (askedUnions.length && us.some((u) => askedUnions.includes(u))) { score += 2; why.push(`${us.filter((u) => askedUnions.includes(u)).join(", ")} station`); }
    if (askedCategory.length && askedCategory.includes(s.category)) { score += 2; why.push(s.category); }
    // An interrupted procedure is worth more in any block, because noticing is
    // the part a procedural refresher usually leaves out.
    if ((s.interruptCount ?? 0) > 0) score += 1;
    return { station: s, score, why: [...new Set(why)] };
  }).filter((r) => r.score > 0);

  if (!scored.length) return null;

  // Order by fit, then shortest first, so a block opens with something a
  // learner can finish and builds toward the long procedures.
  scored.sort((a, b) => b.score - a.score || (a.station.stepCount ?? 0) - (b.station.stepCount ?? 0));
  const chosen = scored.slice(0, Math.min(max, audience.size));

  const steps = chosen.reduce((a, r) => a + (r.station.stepCount ?? 0), 0);
  const interrupts = chosen.reduce((a, r) => a + (r.station.interruptCount ?? 0), 0);
  const minutes = Math.round(chosen.reduce((a, r) => a + (r.station.parSeconds ?? 240), 0) / 60);
  // The points a station awards are a hundred per step plus its interruption
  // value; the target is the pass fraction of a clean run across the block.
  const perfect = steps * 100 + interrupts * 120;
  const target = Math.round(perfect * audience.pass);

  const unions = [...new Set(chosen.flatMap((r) => unionsOf(r.station)))];
  // The code, not the sentence around it. Matching to the next comma dragged
  // in half a clause — "NFPA 70E arc-flash PPE for the ve" — which is worse
  // than useless on a certificate.
  const STANDARD_RE = /\b(?:NFPA\s+\d+[A-Z]?|OSHA\s+29\s+CFR\s+[\d.]+(?:\([a-z0-9)(]+\))?|29\s+CFR\s+[\d.]+|ANSI\s+[A-Z]?[\d.]+[A-Z]?|ASTM\s+[A-Z]\d+|IEEE\s+\d+|1910\.\d+|1926\.\d+)/g;
  const standards = [...new Set(chosen.flatMap((r) =>
    (String(r.station.certification ?? "").match(STANDARD_RE) ?? []).map((x) => x.replace(/\s+/g, " ").trim())))]
    .slice(0, 8);

  const title = facets.length
    ? `${facets.map((f) => f.label).join(" + ")} — ${audience.label}`
    : `${(askedCategory[0] ?? unions.join("/"))} block — ${audience.label}`;

  return {
    id: `lesson-${Date.now().toString(36)}`,
    title,
    audience,
    prompt: text,
    facets: facets.map((f) => f.id),
    unions,
    standards,
    stations: chosen.map((r, i) => ({
      order: i + 1,
      app: r.station.app ?? "smartcity",
      id: r.station.id,
      name: r.station.name,
      steps: r.station.stepCount ?? 0,
      interrupts: r.station.interruptCount ?? 0,
      why: r.why.length ? r.why.join(" · ") : "Selected for sector fit",
    })),
    points: { perfect, target, pass: audience.pass },
    estimate: { minutes, steps, interrupts },
  };
}

/**
 * Whether a learner's records clear the lesson.
 *
 * Kept here rather than in the UI so the same arithmetic answers the learner's
 * progress bar, the instructor console and the certificate.
 */
export function lessonProgress(lesson, records = []) {
  const best = new Map();
  for (const rec of records) {
    const key = rec.simId ?? rec.roomId ?? rec.id;
    if (!key) continue;
    if (!best.has(key) || (rec.score ?? 0) > best.get(key)) best.set(key, rec.score ?? 0);
  }
  const done = lesson.stations.filter((s) => best.has(s.id));
  const scored = done.reduce((a, s) => a + (best.get(s.id) ?? 0), 0);
  return {
    stationsDone: done.length,
    stationsTotal: lesson.stations.length,
    points: scored,
    target: lesson.points.target,
    passed: done.length === lesson.stations.length && scored >= lesson.points.target,
    pct: lesson.points.target ? Math.min(1, scored / lesson.points.target) : 0,
  };
}
