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
    posts: /^(attendant|tender-station|spotter|badge-attendant|badge-supervisor|outside-operator|floor-watch|ground-crew|observer|observer-post)$/,
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
    evidence: "ids", test: /^(attendant|tender-station|spotter|badge-attendant|outside-operator|floor-watch|observer|observer-post)$/,
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

// ================================================================ avatar styles
//
// World detail (tools/briefs/worlds-detail-brief.md, console CARTOGRAPHER):
// crew figures — the learner's own and the people the worlds place — are
// built from one style space: body proportions, a wide range of skin tones,
// hair styles and head coverings, and trade PPE by category. The axes are
// independent by construction: no option on one axis is tied to, defaults
// from, or excludes an option on another, so no trade is tied to a skin tone,
// a gender or a body type. There is no gender axis at all. The learner picks
// a style on the account chip (shared/account.js); it is stored per profile
// through shared/profiles.js (key CT_AVATAR_KEY in GT_PROFILE_KEYS).
// Every top-level name is prefixed `ct`/`CT_` because the bundler
// concatenates every module into one scope. No imports: the three.js module is passed in (as `three`), so a bundle
// that never draws a figure (the Atlas) never loads three.js for it.

/** The profile-private store key the learner's own style lives under. */
export const CT_AVATAR_KEY = "vr-avatar-style-v1";

/** The declared mesh ceiling for one figure, whatever the style. */
export const CT_AVATAR_BUDGET = 12;

/** The style space. Every axis is a list of `{ id, label, ... }`. */
export const CT_AVATAR_STYLES = {
  body: [
    { id: "slender", label: "Slender", h: 1.0, w: 0.86 },
    { id: "average", label: "Average", h: 1.0, w: 1.0 },
    { id: "broad", label: "Broad", h: 1.0, w: 1.18 },
    { id: "tall", label: "Tall", h: 1.1, w: 0.98 },
    { id: "compact", label: "Compact", h: 0.9, w: 1.04 },
    { id: "full", label: "Full-figured", h: 0.98, w: 1.28 },
  ],
  // Twelve tones from very light to very deep, named by number only.
  skin: [
    { id: "tone-1", label: "Tone 1", hex: 0xf6e0d0 }, { id: "tone-2", label: "Tone 2", hex: 0xeccbb0 },
    { id: "tone-3", label: "Tone 3", hex: 0xe0b894 }, { id: "tone-4", label: "Tone 4", hex: 0xd4a47c },
    { id: "tone-5", label: "Tone 5", hex: 0xc49068 }, { id: "tone-6", label: "Tone 6", hex: 0xb07c56 },
    { id: "tone-7", label: "Tone 7", hex: 0x9a6846 }, { id: "tone-8", label: "Tone 8", hex: 0x86563a },
    { id: "tone-9", label: "Tone 9", hex: 0x70462e }, { id: "tone-10", label: "Tone 10", hex: 0x5c3824 },
    { id: "tone-11", label: "Tone 11", hex: 0x4a2c1c }, { id: "tone-12", label: "Tone 12", hex: 0x382014 },
  ],
  // Hair styles and head coverings on one axis: what sits on the head.
  hair: [
    { id: "cropped", label: "Cropped", shape: "cap-low" },
    { id: "short", label: "Short", shape: "cap" },
    { id: "curly", label: "Curly", shape: "puff" },
    { id: "coily", label: "Coily", shape: "puff-high" },
    { id: "long", label: "Long", shape: "long" },
    { id: "braids", label: "Braids", shape: "long-narrow" },
    { id: "locs", label: "Locs", shape: "long" },
    { id: "bun", label: "Bun", shape: "bun" },
    { id: "shaved", label: "Shaved", shape: "none" },
    { id: "hijab", label: "Hijab", shape: "wrap-full", covering: true },
    { id: "turban", label: "Turban", shape: "wrap-high", covering: true },
    { id: "headwrap", label: "Headwrap", shape: "wrap-high", covering: true },
    { id: "patka", label: "Patka", shape: "wrap-low", covering: true },
    { id: "kippah", label: "Kippah", shape: "disc", covering: true },
    { id: "cap", label: "Cap", shape: "brim", covering: true },
    { id: "beanie", label: "Beanie", shape: "cap", covering: true },
  ],
  hairColour: [
    { id: "black", label: "Black", hex: 0x16120f }, { id: "dark-brown", label: "Dark brown", hex: 0x3a2618 },
    { id: "brown", label: "Brown", hex: 0x6a4428 }, { id: "auburn", label: "Auburn", hex: 0x8a3a1e },
    { id: "blonde", label: "Blonde", hex: 0xd8b86a }, { id: "grey", label: "Grey", hex: 0x9a9a98 },
    { id: "white", label: "White", hex: 0xe8e6e0 }, { id: "navy", label: "Navy (covering)", hex: 0x1f2f5a },
    { id: "teal", label: "Teal (covering)", hex: 0x1c7f7a }, { id: "maroon", label: "Maroon (covering)", hex: 0x6a1f2a },
  ],
  // Trade PPE by category. Hard hat colours follow the site's own colour
  // code; nothing here says what a colour means.
  ppe: [
    { id: "none", label: "Everyday clothes", outfit: 0x3a6ea5 },
    { id: "hard-hat-hivis", label: "Hard hat and hi-vis", outfit: 0xd8ff3a, helmet: true, vest: true },
    { id: "electrical", label: "Arc-rated coveralls and hard hat", outfit: 0x2a3f6a, helmet: true },
    { id: "dive", label: "Dive gear", outfit: 0x1f3a4a, tank: true, mask: true },
    { id: "chef", label: "Chef whites", outfit: 0xf4f4f0, toque: true },
    { id: "scrubs", label: "Scrubs", outfit: 0x3a8a8a },
    { id: "flight-crew", label: "Flight crew uniform", outfit: 0x1f2f5a, trim: 0xf2c14b },
    { id: "marine", label: "Life vest and deck gear", outfit: 0x2b3542, vest: true, vestColour: 0xf07a1f },
    { id: "grounds", label: "Grounds crew hi-vis and ear defenders", outfit: 0x3d6b3a, vest: true, ears: true },
  ],
  hardHat: [
    { id: "white", label: "White", hex: 0xf4f4f0 }, { id: "yellow", label: "Yellow", hex: 0xf2c14b },
    { id: "orange", label: "Orange", hex: 0xf07a1f }, { id: "blue", label: "Blue", hex: 0x2a7de1 },
    { id: "green", label: "Green", hex: 0x3d9a4a }, { id: "red", label: "Red", hex: 0xd8322c },
  ],
};

/** The axes, in the order the picker shows them. */
export const CT_AVATAR_AXES = ["body", "skin", "hair", "hairColour", "ppe", "hardHat"];

/** The default style: the first option on every axis except a mid skin tone. */
export const CT_AVATAR_DEFAULT = Object.freeze({ body: "average", skin: "tone-6", hair: "short", hairColour: "dark-brown", ppe: "hard-hat-hivis", hardHat: "white" });

/** Any object to a valid style: unknown or missing ids fall back per axis, independently. */
export function ctAvatarNormalize(style = {}) {
  const out = {};
  for (const axis of CT_AVATAR_AXES) {
    const want = style?.[axis];
    out[axis] = CT_AVATAR_STYLES[axis].some((o) => o.id === want) ? want : CT_AVATAR_DEFAULT[axis];
  }
  return out;
}

/** One option's record on one axis. */
export function ctAvatarOption(axis, id) {
  return CT_AVATAR_STYLES[axis]?.find((o) => o.id === id) ?? CT_AVATAR_STYLES[axis]?.[0] ?? null;
}

/** The learner's own style from a Storage-shaped handle (profiles.js's gtStorage()). */
export function ctAvatarLoad(storage) {
  try { return ctAvatarNormalize(JSON.parse(storage?.getItem(CT_AVATAR_KEY) || "null") ?? {}); } catch (_) { return ctAvatarNormalize({}); }
}

/** Store the learner's own style; tells open worlds with a `ct:avatar` event. */
export function ctAvatarSave(style, storage) {
  const clean = ctAvatarNormalize(style);
  try { storage?.setItem(CT_AVATAR_KEY, JSON.stringify(clean)); } catch (_) { /* private mode: kept for this page only */ }
  try { globalThis.dispatchEvent?.(new Event("ct:avatar")); } catch (_) { /* headless */ }
  return clean;
}

/**
 * The i-th figure of a crowd: the trade cycles fastest and every other axis
 * steps once per round, so every option on every axis turns up and each PPE
 * category is worn across every body, skin tone and hair style —
 * no trade clothing travels with one skin tone or body type
 * (tools/check_worlds_detail.mjs counts it).
 */
export function ctAvatarVariety(i, { ppe = null } = {}) {
  const S = CT_AVATAR_STYLES, n = Math.max(0, Math.floor(i));
  // The trade cycles fastest; every other axis steps with the round, so each
  // trade meets every body, skin tone and hair style as the crowd grows.
  const k = n % S.ppe.length, q = Math.floor(n / S.ppe.length);
  const at = (axis, v) => S[axis][((v % S[axis].length) + S[axis].length) % S[axis].length].id;
  return ctAvatarNormalize({ body: at("body", q + k), skin: at("skin", q * 5 + k), hair: at("hair", q * 3 + k), hairColour: at("hairColour", q * 7 + k), ppe: ppe ?? at("ppe", k), hardHat: at("hardHat", q + 2 * k) });
}

/**
 * Build a standing figure for `style` (about 1.7 m at the "average" body)
 * into a new three.Group, feet at y = 0, facing +z. At most
 * CT_AVATAR_BUDGET meshes; `userData.parts` names head, torso, legs,
 * headwear and any PPE part so a world can recolour or hide it.
 */
export function ctAvatarFigure(three, style = {}) {
  const s = ctAvatarNormalize(style);
  const body = ctAvatarOption("body", s.body), skin = ctAvatarOption("skin", s.skin).hex;
  const hair = ctAvatarOption("hair", s.hair), hairHex = ctAvatarOption("hairColour", s.hairColour).hex;
  const ppe = ctAvatarOption("ppe", s.ppe), hat = ctAvatarOption("hardHat", s.hardHat).hex;
  const mat = (color, o = {}) => new three.MeshStandardMaterial({ color, roughness: o.rough ?? 0.8, metalness: o.metal ?? 0, emissive: o.emissive ?? 0x000000 });
  const g = new three.Group();
  const parts = {};
  const add = (name, geo, m, x, y, z) => { const mesh = new three.Mesh(geo, m); mesh.position.set(x, y, z); mesh.castShadow = true; g.add(mesh); parts[name] = mesh; return mesh; };
  const H = body.h, W = body.w;
  add("legs", new three.CylinderGeometry(0.17 * W, 0.14 * W, 0.78 * H, 8), mat(ppe.id === "chef" || ppe.id === "scrubs" ? ppe.outfit : 0x2a2f36, { rough: 0.9 }), 0, 0.39 * H, 0);
  add("torso", new three.CapsuleGeometry(0.23 * W, 0.56 * H, 4, 8), mat(ppe.outfit), 0, 1.06 * H, 0);
  const headY = 1.58 * H;
  add("head", new three.SphereGeometry(0.14, 12, 10), mat(skin, { rough: 0.7 }), 0, headY, 0);
  // What sits on the head: hair, or a covering, drawn in the chosen colour.
  const hm = mat(hairHex, { rough: 0.85 });
  const sh = hair.shape;
  if (sh === "cap-low") add("headwear", new three.SphereGeometry(0.145, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.38), hm, 0, headY + 0.005, 0);
  else if (sh === "cap") add("headwear", new three.SphereGeometry(0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), hm, 0, headY + 0.01, 0);
  else if (sh === "puff") add("headwear", new three.SphereGeometry(0.19, 12, 10), hm, 0, headY + 0.05, -0.02);
  else if (sh === "puff-high") add("headwear", new three.SphereGeometry(0.21, 12, 10), hm, 0, headY + 0.09, -0.02);
  else if (sh === "long" || sh === "long-narrow") {
    add("headwear", new three.SphereGeometry(0.155, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), hm, 0, headY + 0.01, 0);
    add("hairBack", new three.BoxGeometry(sh === "long" ? 0.28 : 0.2, 0.34, 0.08), hm, 0, headY - 0.14, -0.1);
  } else if (sh === "bun") {
    add("headwear", new three.SphereGeometry(0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), hm, 0, headY + 0.01, 0);
    add("bun", new three.SphereGeometry(0.07, 10, 8), hm, 0, headY + 0.1, -0.12);
  } else if (sh === "wrap-full") {
    // A hijab: the head and neck wrapped, the face open.
    add("headwear", new three.SphereGeometry(0.165, 14, 10, Math.PI * 0.2, Math.PI * 1.6), hm, 0, headY, 0);
    add("drape", new three.CylinderGeometry(0.15, 0.24 * W, 0.22, 12), hm, 0, headY - 0.2, 0);
  } else if (sh === "wrap-high") add("headwear", new three.CylinderGeometry(0.15, 0.165, 0.16, 14), hm, 0, headY + 0.08, -0.01);
  else if (sh === "wrap-low") add("headwear", new three.CylinderGeometry(0.15, 0.155, 0.09, 14), hm, 0, headY + 0.06, 0);
  else if (sh === "disc") add("headwear", new three.CylinderGeometry(0.08, 0.08, 0.015, 12), hm, 0, headY + 0.135, -0.02);
  else if (sh === "brim") {
    add("headwear", new three.SphereGeometry(0.152, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), hm, 0, headY + 0.01, 0);
    add("brim", new three.BoxGeometry(0.2, 0.015, 0.12), hm, 0, headY + 0.03, 0.15);
  }
  // PPE by category: a hard hat rides over any hair or covering.
  if (ppe.helmet) {
    add("hardHat", new three.SphereGeometry(0.175, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(hat, { rough: 0.4 }), 0, headY + 0.05, 0);
    add("hardHatBrim", new three.CylinderGeometry(0.2, 0.2, 0.015, 14), mat(hat, { rough: 0.4 }), 0, headY + 0.05, 0.02);
  }
  if (ppe.vest) add("vest", new three.CylinderGeometry(0.25 * W, 0.25 * W, 0.42 * H, 10, 1, true), mat(ppe.vestColour ?? 0xd8ff3a, { emissive: 0x202000 }), 0, 1.12 * H, 0);
  if (ppe.tank) add("tank", new three.CylinderGeometry(0.09, 0.09, 0.56, 8), mat(0xd9d9d0, { rough: 0.5, metal: 0.4 }), 0, 1.1 * H, -0.27 * W);
  if (ppe.mask) add("mask", new three.BoxGeometry(0.2, 0.09, 0.06), mat(0x4fd1ff, { emissive: 0x1a5a70 }), 0, headY + 0.02, 0.13);
  if (ppe.toque) add("toque", new three.CylinderGeometry(0.15, 0.13, 0.2, 12), mat(0xffffff), 0, headY + 0.17, 0);
  if (ppe.trim) add("trim", new three.BoxGeometry(0.3 * W, 0.04, 0.02), mat(ppe.trim, { rough: 0.4 }), 0, 1.22 * H, 0.235 * W);
  if (ppe.ears) add("ears", new three.TorusGeometry(0.15, 0.025, 6, 12, Math.PI), mat(0xd8322c), 0, headY + 0.02, 0);
  g.userData.parts = parts;
  g.userData.ctAvatar = s;
  return g;
}
