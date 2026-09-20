/**
 * Crew roles: the same procedure, split between two people.
 *
 * Several stations in this platform are authored as one learner doing a job
 * that nobody does alone. A confined-space entry has an attendant and an
 * entrant. A crane pick has an operator and a signaller. Hot work has a
 * welder and a fire watch. Played as one person, all of that collapses into
 * a single ordered list and the single most important property of the job
 * disappears: the two people stand in different places, can see different
 * things, and each one's duty is invisible to the other. The way these jobs
 * kill people is not that somebody forgot a step — it is that each of them
 * assumed the other had done it.
 *
 * A role view does not change the procedure. It changes who performs each
 * step. The steps this role owns are played exactly as authored; the rest
 * become watch steps — the learner has to confirm the other person has done
 * them before the procedure moves on, and cannot do them instead.
 *
 *   varied      who performs a step, and therefore what the learner practises
 *   never       the steps, their ids, their targets, their order, the hazards,
 *               or the reason any of it is right
 *
 * The hard part is not the view, it is the split. A role split that is wrong
 * teaches a wrong division of duties to everyone who plays it, which is worse
 * than not splitting at all — so everything below is built to decline. A
 * station is split only when the station itself contains the evidence: the
 * second person exists in the scene as something the learner interacts with,
 * every step attributes to exactly one of the two roles with no evidence
 * pointing the other way, and both roles end up owning real work. Anything
 * less and splitByRole() reports the station as single-role and says why.
 */

/**
 * Role archetypes.
 *
 * These are derived from what the stations actually contain, not from a
 * taxonomy of trades. Each pair is two posts in one procedure: two places a
 * person physically stands, with different information at each. `post` is
 * what the role may never stop doing, because that is the duty a role view
 * exists to teach.
 */
export const ROLES = {
  attendant: {
    id: "attendant", name: "Attendant", pair: "permit-space", counterpart: "entrant",
    post: "At the opening. Holds the permit and the log, isolates and ventilates the space, watches the meter and the walls, and never goes in.",
    // Ids that ARE this person or the post they hold: a step reaching for one
    // of them is by definition not performed by them. Only posts belong here.
    // The coworker trying to climb in is a person in the scene but not a post,
    // so stopping them stays the attendant's own duty.
    posts: /^(attendant|tender-station|spotter|badge-attendant|badge-supervisor|outside-operator|floor-watch|ground-crew)$/,
  },
  entrant: {
    id: "entrant", name: "Entrant", pair: "permit-space", counterpart: "attendant",
    post: "Inside the space or below grade. Does the work the entry was opened for, and can see none of what is happening at the surface.",
    posts: /^(entrant|badge-entrant|entrant-descend|buddy-present)$/,
  },
  operator: {
    id: "operator", name: "Operator", pair: "lift", counterpart: "signaller",
    post: "At the controls. Sets the machine up, reads the chart, and moves only on one person's signal — because from the cab the load is the one thing that cannot always be seen.",
    // The radio to the crane is the operator's post, not the ground crew's:
    // whoever reaches for it is calling the cab, so they are not in it.
    posts: /^(crane-radio|crane-radio-clear)$/,
  },
  signaller: {
    id: "signaller", name: "Signaller / rigger", pair: "lift", counterpart: "operator",
    post: "On the ground with the load. Rigs it, keeps the zone under it clear, and is the only voice the operator answers to.",
    posts: /^(signal-person|signaller-radio|rigger-radio|deck-check|marshal-wands)$/,
  },
  welder: {
    id: "welder", name: "Welder", pair: "hot-work", counterpart: "fire-watch",
    post: "Behind the hood. Under a dark lens with an arc in front of them, they cannot see where their own sparks land.",
    posts: null,
  },
  "fire-watch": {
    id: "fire-watch", name: "Fire watch", pair: "hot-work", counterpart: "welder",
    post: "Outside the hood with the extinguisher. Clears and shields the radius, watches where the sparks go, and stays on after the arc stops.",
    posts: null,
  },
  // Not a job title: the honest name for how this platform runs today, and
  // what a station reports when it cannot be split. Naming it keeps every
  // caller on one code path instead of special-casing a null.
  solo: {
    id: "solo", name: "Whole crew", pair: null, counterpart: null,
    post: "One learner performs every duty in the procedure.",
    posts: null,
  },
};

/**
 * The two-role procedures this platform contains, and the evidence that
 * proves a station is one of them.
 *
 * `evidence` is deliberately about the scene rather than the prose. Any
 * station can mention a spotter in a `why`; only a station that actually
 * models one has an interactable the learner can reach for. That is the line
 * between a procedure written for two people and a procedure written for one
 * with a second person described in the margin. Hot work is the exception and
 * says so: its fire watch is a duty (a step the learner holds) rather than a
 * person in the scene, so its evidence is the duty.
 */
export const PAIRS = [
  {
    id: "permit-space", name: "Permit space", roles: ["attendant", "entrant"],
    evidence: "ids", test: /^(attendant|tender-station|spotter|badge-attendant|outside-operator|floor-watch)$/,
    signals: {
      attendant: [
        /\bpermit\b|\bwork order\b|\bsize ?-?up\b/,
        /\bcone\b|\bbarrier|\bbarricade|\bguard rail\b|guard the (opening|excavation|hatch)/,
        /\bisolat|lock ?-?out|lock and tag|\btag ?-?out|\bblank\b|blanking plate|feed valve/,
        /\bventilat|\bblower\b|\bduct\b/,
        /\batmospher|gas meter|4-gas|\boxygen\b|\bmeter\b/,
        /\btripod\b|\bretrieval\b|\bwinch\b|\bbelay\b|mechanical advantage|\breeve\b|rig the system/,
        /\bheadcount\b|tool tally|everyone is out|account for everyone/,
        /\bspoil\b|\bthe edge\b|above grade|at the opening|at the surface/,
        /\bladder\b|trench box|protective (box|system)/,
        /\bbackfill|secure the space|hand ?-?over|sign the (permit|plan)|close the permit/,
        /competent[- ]person|classif(y|ication)|inspect the (trench|walls)/,
        /grade[- ]control|\bwaypoint|machine control|\bgrader\b/,
        /assign the .*role|\bbadge\b/,
        /hold the crew|stop the (coworker|crew)/,
      ],
      entrant: [
        /below grade|\bin the trench\b|inside the space|\bat the bottom\b|climb down|\bdown the ladder\b/,
        // The patient is packaged from inside the hole and hauled out from
        // above, so "the patient" alone says nothing about which post.
        /package the patient|\bairway\b/,
        /make the repair|the repair to|\brefractory\b|complete the .*repair/,
        /maintain contact|hold contact|continuous communication/,
      ],
    },
  },
  {
    id: "lift", name: "Lift", roles: ["operator", "signaller"],
    evidence: "ids", test: /^(signal-person|signaller-radio|rigger-radio|crane-radio|deck-check|marshal-wands)$/,
    signals: {
      operator: [
        /\boutrigger|\bstabilizer|\bpad\b/,
        /\blevel\b|\bbubble\b|\bplumb\b/,
        // "load chart" and "capacity plate", never bare "rated capacity" —
        // a shackle carries a rated capacity too, and matching it turned the
        // rigger's own shackle inspection into a contested step.
        /load chart|capacity plate|\bthe chart\b/,
        /\bboom\b|\bswing\b|\bslew\b|\bradius\b|\bluff\b/,
        /\bhoist\b|\blower\b|\braise\b|\bretract\b|\bextend\b|set ?-?down/,
        /\bcab\b|\bconsole\b|\bRCI\b|rated capacity indicator|anti-collision|\blever\b/,
        /\bwind\b|anemometer/,
        /lift plan|lift log|crane log|\bbriefing\b|pre-?lift/,
        /\bAGV\b|\bwaypoint|\bdry-?run\b|machine control/,
      ],
      signaller: [
        /\bsling\b|\bshackle\b|\bhook block\b|\brigging rack\b|\bthe rigging\b/,
        /\btag line\b/,
        /\blashing|\bturnbuckle|twist-?lock|\brod\b/,
        /\bred zone\b|swing radius|under the (load|boom)/,
        /corner casting|\bspreader\b/,
      ],
    },
  },
  {
    id: "hot-work", name: "Hot work", roles: ["welder", "fire-watch"],
    evidence: "text", test: /\bfire watch\b/,
    signals: {
      welder: [
        /\barc\b|\bbead\b|\bpuddle\b|\belectrode\b|\bamperage\b|\bcurrent\b|\bweld\b/,
        /\bhelmet\b|\blens\b|\bshade\b|\bleathers\b|\bgloves\b|\bjacket\b/,
        /work clamp|return lead/,
        /\bfume\b|extraction/,
        /hot work permit|\bthe permit\b/,
      ],
      "fire-watch": [
        /\bcombustible/,
        /fire blanket|\bthe blanket\b|\bshielded?\b/,
        /extinguisher|\bthe watch\b|\btimer\b/,
        /\bsparks?\b|\bsmoulder|hot work area/,
      ],
    },
  },
];

/** A role must own this much of the procedure for the split to mean anything. */
const MIN_ROLE_STEPS = 2;

function pairOf(id) { return PAIRS.find((p) => p.id === id) ?? null; }

/** SmartCiti.X stations carry `name`; Trade Skills rooms only carry `title`. */
function stationName(station) { return station?.name ?? station?.title ?? station?.id ?? "station"; }

/** Every interactable id a station's steps and interruptions can reach for. */
function interactableIds(station) {
  const ids = new Set();
  for (const step of station.steps ?? []) {
    if (step.target) ids.add(step.target);
    for (const t of step.targets ?? []) ids.add(t);
  }
  for (const it of station.interrupts ?? []) if (it.target) ids.add(it.target);
  return [...ids];
}

/**
 * The two halves of a step's text, kept apart on purpose.
 *
 * `action` is what the learner does — the title, the cue, the ids of the
 * things they touch. `why` is the reason it is right, and it routinely names
 * the other role ("the attendant never leaves the hole") in a step that role
 * does not perform. Scoring the two together is how a splitter talks itself
 * into a confident wrong answer, so `why` is only ever consulted when the
 * action text said nothing at all.
 */
function stepText(step) {
  const ids = [step.target, ...(step.targets ?? [])].filter(Boolean);
  const names = Object.values(step.itemNames ?? {});
  return {
    ids,
    action: [step.id, ...ids, ...names, step.title ?? "", step.cue ?? ""].join(" ").toLowerCase(),
    why: (step.why ?? "").toLowerCase(),
  };
}

function score(signals, text) {
  let n = 0;
  for (const re of signals) if (re.test(text)) n += 1;
  return n;
}

/**
 * Attribute one step to one of a pair's two roles, or to neither.
 *
 * Three rules, in order, and each one refuses rather than guesses:
 *
 *  1. You cannot be the person you are reaching for. A step whose target is
 *     the attendant, the spotter or the signal person is performed by the
 *     other role — that is what makes it a coordination step at all.
 *  2. Otherwise the action text decides, and only when one role's evidence is
 *     the only evidence. A step with signals on both sides is a step the
 *     author wrote for two people at once; splitting it either way invents a
 *     division of duties the station never stated.
 *  3. A step whose action text says nothing falls back to its reason, under
 *     the same one-sided rule.
 */
function attribute(step, pair) {
  const [a, b] = pair.roles;
  const text = stepText(step);

  const reaches = (roleId) => {
    const posts = ROLES[roleId].posts;
    return !!posts && text.ids.some((id) => posts.test(id));
  };
  if (reaches(a) && !reaches(b)) return { role: b, by: "post" };
  if (reaches(b) && !reaches(a)) return { role: a, by: "post" };
  if (reaches(a) && reaches(b)) return { role: null, by: "both-posts" };

  for (const [field, by] of [["action", "action"], ["why", "why"]]) {
    const sa = score(pair.signals[a], text[field]);
    const sb = score(pair.signals[b], text[field]);
    if (sa > 0 && sb === 0) return { role: a, by };
    if (sb > 0 && sa === 0) return { role: b, by };
    if (sa > 0 && sb > 0) return { role: null, by: "contested" };
  }
  return { role: null, by: "silent" };
}

function declined(station, reason, unassigned = []) {
  const assignments = {};
  for (const step of station.steps ?? []) assignments[step.id] = "solo";
  return { split: false, pair: null, roles: [ROLES.solo], assignments, basis: {}, unassigned, reason };
}

/**
 * Which role owns each step of an authored station.
 *
 * Returns `{ split, pair, roles, assignments, basis, unassigned, reason }`. When
 * `split` is false the station is single-role: `roles` is the whole crew,
 * every step is assigned to it, and `reason` says in one sentence what the
 * station did not provide. `unassigned` is the diagnostic — the steps that
 * defeated the split — and it is empty when no split was attempted, because
 * the station models nobody to split with.
 *
 * A split is only returned when every single step attributed cleanly. A
 * procedure with one orphan step is precisely the failure this feature exists
 * to teach about, so it is not a thing to ship in the feature itself.
 */
export function splitByRole(station) {
  const steps = station?.steps ?? [];
  if (!steps.length) return declined(station ?? { steps: [] }, "the station has no steps");

  const ids = interactableIds(station);
  const text = [stationName(station), station.trade ?? "",
    ...steps.map((s) => `${s.title ?? ""} ${s.cue ?? ""} ${s.why ?? ""}`),
    ...(station.interrupts ?? []).map((i) => `${i.kind ?? ""} ${i.alert ?? ""} ${i.why ?? ""}`)].join(" ").toLowerCase();

  const matched = PAIRS.filter((p) => (p.evidence === "ids" ? ids.some((id) => p.test.test(id)) : p.test.test(text)));
  if (!matched.length) {
    return declined(station, "no second role is modelled in this station — the other person is not something the learner can reach for");
  }
  if (matched.length > 1) {
    // Three posts is a different exercise from two, and picking the loudest
    // pair would be inventing the crew structure rather than reading it.
    return declined(station, `more than one crew pairing is modelled here (${matched.map((p) => p.name).join(", ")}) — a two-role view would have to pick one`);
  }

  const pair = matched[0];
  const [a, b] = pair.roles;
  const assignments = {};
  // Which of the three rules decided each step, so an author reviewing a
  // split can see what it read rather than only what it concluded.
  const basis = {};
  const unassigned = [];
  for (const step of steps) {
    const { role, by } = attribute(step, pair);
    basis[step.id] = by;
    if (role) assignments[step.id] = role; else unassigned.push(step.id);
  }
  if (unassigned.length) {
    return declined(station,
      `${unassigned.length} of ${steps.length} step(s) could not be attributed to one side of a ${pair.name.toLowerCase()} pair without guessing`,
      unassigned);
  }

  const owned = { [a]: [], [b]: [] };
  for (const step of steps) owned[assignments[step.id]].push(step.id);
  for (const roleId of pair.roles) {
    if (owned[roleId].length < MIN_ROLE_STEPS) {
      return declined(station,
        `every duty here belongs to the ${ROLES[roleId === a ? b : a].name.toLowerCase()} — the ${ROLES[roleId].name.toLowerCase()} owns ${owned[roleId].length} step(s), so this is a one-post procedure with a second person in the scene`);
    }
  }

  const roles = pair.roles.map((id) => ({
    ...ROLES[id],
    owns: owned[id].length,
    watches: steps.length - owned[id].length,
    share: Math.round((owned[id].length / steps.length) * 100) / 100,
  }));
  return { split: true, pair: pair.id, roles, assignments, basis, unassigned: [], reason: null };
}

/**
 * Turn a step the learner does not own into a watch step.
 *
 * The kind has to change — the whole point is that they do not run the gauge,
 * hold the line or spin the valve — but nothing else may be lost, so the
 * authored kind and every target the step had are kept verbatim under
 * `watch`. What the learner is left with is one deliberate act: look at the
 * thing the other person was supposed to have dealt with, and confirm it.
 * That is the drill. It is also the only moment in a two-person job where the
 * assumption that kills people is available to be caught.
 */
function watchStep(step, mine, theirs) {
  const targets = [step.target, ...(step.targets ?? [])].filter(Boolean);
  const out = { ...step };
  // Kind-specific configuration would make the engine run the task rather
  // than a confirmation, so it moves wholesale onto `watch`.
  for (const key of ["targets", "anyOrder", "gauge", "track", "turn", "drag", "seconds",
    "itemNames", "itemNotes", "decoyNotes", "outOfOrderNote", "holdBreakNote"]) delete out[key];
  out.kind = "select";
  out.target = step.target ?? targets[0];
  out.title = `Confirm — ${step.title}`;
  out.cue = `${theirs.name} does this one. Check it is done, then carry on.`;
  out.why = `${step.why} This is ${theirs.name.toLowerCase()}'s step, not yours. You confirm it because the way a two-person job goes wrong is each of you assuming the other one did it.`;
  out.watch = {
    of: step.kind,
    by: theirs.id,
    byName: theirs.name,
    for: mine.id,
    targets,
    // Kept so a HUD can still name the items the other person worked through.
    itemNames: step.itemNames ?? null,
  };
  return out;
}

/**
 * One role's view of a station, as a room the Session engine plays unchanged.
 *
 * Same id, same order, same targets, same hazards, same reasons. The steps
 * this role owns are the authored steps; the rest are watch steps. An
 * interruption whose answer is this role's own post is dropped, because an
 * alarm that says the attendant has left the hole cannot be answered by the
 * attendant — every other interruption stays, since noticing is a duty both
 * posts have.
 *
 * A station that cannot be split honestly returns itself, so a caller never
 * has to branch on whether the split succeeded.
 */
export function roleView(station, roleId, split = splitByRole(station)) {
  if (!split.split) return station;
  const mine = ROLES[roleId];
  if (!mine || !split.roles.some((r) => r.id === roleId)) return null;
  const theirs = ROLES[mine.counterpart];

  const steps = station.steps.map((step) =>
    (split.assignments[step.id] === roleId ? { ...step } : watchStep(step, mine, theirs)));

  const interrupts = (station.interrupts ?? []).filter((it) =>
    !(mine.posts && it.target && mine.posts.test(it.target)));

  const owned = steps.filter((s) => !s.watch).length;
  return {
    ...station,
    id: `crew:${station.id}:${roleId}`,
    index: "◈",
    name: `${stationName(station)} — ${mine.name}`,
    title: `${station.title ?? stationName(station)} · ${mine.name}`,
    tagline: `${mine.post} The rest of the procedure belongs to the ${theirs.name.toLowerCase()} — you confirm it, you do not do it.`,
    steps,
    interrupts,
    isCrewView: true,
    crew: {
      baseId: station.id, baseName: stationName(station), pair: split.pair,
      role: roleId, roleName: mine.name, counterpart: theirs.id, counterpartName: theirs.name,
      owns: owned, watches: steps.length - owned,
      droppedInterrupts: (station.interrupts ?? []).length - interrupts.length,
    },
    build: (root) => station.build(root),
  };
}

/** Every playable view of a station — one per role, or the station itself. */
export function roleViews(station, split = splitByRole(station)) {
  if (!split.split) return [station];
  return split.roles.map((r) => roleView(station, r.id, split));
}

/** A one-line description an instructor can read before issuing it. */
export function describeSplit(station, split = splitByRole(station)) {
  if (!split.split) return `${stationName(station)} · single-role · ${split.reason}`;
  const parts = split.roles.map((r) => `${r.name} ${r.owns}/${station.steps.length}`);
  return `${stationName(station)} · ${pairOf(split.pair)?.name ?? split.pair} pair · ${parts.join(" · ")}`;
}
