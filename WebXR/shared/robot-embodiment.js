// Embodiment — what a station looks like to a machine with an arm.
//
// shared/robot.js gives a station a policy: a skill-parameterised agent that
// sees the Session and emits select / press / rotate / drop. That is enough to
// exercise a procedure and mine it for decisions, and it is not enough to
// train a robot. A robot does not "select the sharps container"; it moves an
// end effector to a pose, approaches along a normal, closes on the object with
// a grasp that suits the job, and applies a bounded force — and in a dental
// operatory it does all of that a hand's width from a person's face.
//
// This module is that missing half, and only that half: for every interactable
// a station built, a 3D target pose derived from the scene itself; for every
// step, the grasp the step kind implies and the most force the robot may use;
// and for the room, the volumes around the people in it that an end effector
// must not enter. It is pure data over the objects the station already made —
// no three.js, no DOM — so Node can import it directly and a checker can hold
// every station to it.
//
// Two rules carry the safety of the thing:
//
//   * A step marked `noRobot` is never performed by the robot. In an embodied
//     episode it is handed to the clinician: the procedure continues (the
//     robot is learning to work beside a hygienist, not instead of one) and
//     the trajectory records that decision as the human's, with no pose, no
//     force and no credit.
//   * Entering a keep-out volume is a violation unless the step itself says
//     the patient is part of it, by declaring a `forceClass` — including
//     `"none"`, which means "you may reach in and look, you may not touch".
//     A station that reaches for a patient without saying so fails the
//     checker, which is the point: the declaration is the safety case.
//
// The dental rule set the fifteen Unspoken Smiles stations are annotated to
// lives in docs/robot-training.md, next to the dataset layout.

import { RobotAgent, applyAction, observe } from "./robot.js";

// ------------------------------------------------------------------ constants

/** How far off the surface the end effector stages before it closes, in metres. */
export const STANDOFF = 0.12;

/** The grasp each step kind implies. This is the whole mapping — a station
 * never names a grasp, it names a step kind, and the kind is what says how the
 * hand has to behave. */
export const GRASP_BY_KIND = {
  select: "touch",                     // momentary contact, then release
  sequence: "touch",
  find: "touch",
  hold: "sustained-contact",           // press and stay pressed for step.seconds
  press: "sustained-contact",
  track: "continuous-adjustment",      // modulate to hold a value in a band
  gauge: "continuous-adjustment",      // set a dial, then commit
  turn: "wrist-rotation",              // torque about the approach axis
  drag: "pick-and-place",              // lift here, place there
  drive: "vehicle-control",            // throttle, brake and steer through the vehicle's own controls
};

/** Max contact force classes, weakest first. */
export const FORCE_CLASSES = ["none", "light", "firm"];

/** The ceiling a step kind gets when the station declares nothing: a control
 * is pressed lightly; a valve wheel and a carried cassette need real force. */
export const FORCE_BY_KIND = {
  select: "light", sequence: "light", find: "light", hold: "light",
  press: "light", track: "light", gauge: "light", turn: "firm", drag: "firm",
  // A drive step is performed through the vehicle's controls, never by
  // pushing on the world: the robot may drive (noRobot stays false), and the
  // force it may put on anything outside the cab is none.
  drive: "none",
};

/** Default keep-out radii, in metres, by what the volume is around. */
export const ZONE_RADIUS = { head: 0.2, torso: 0.3, body: 0.3, site: 0.12, bystander: 0.45 };
/** Height of the centre of a standing person's keep-out sphere, in metres. */
export const BYSTANDER_CENTRE_Y = 1.1;

// An id names part of a person when it carries one of these words…
const PERSON_ID_RE = /(^|-)(patient|face|mouth|airway|child)(-|$)/;
// …unless it also carries one of these, which are things, not people. Every
// one of these was a real false positive in the dental set: `face-shield` is
// PPE on a stand, `mouth-mirror` is an instrument on the bracket table, and a
// keep-out volume around either one would sit in the middle of the equipment.
const THING_ID_RE = /(mirror|retractor|prop|gauze|camera|shield|sleeve|barrier|wipe|cup|brush|tip|handpiece|mask|box|card|panel|form|log|kit|bin|bag|sign|strip|pad|cassette|table|stand|chart)/;

/** Whether an interactable's id names part of a person. */
export function isPersonId(id) { return PERSON_ID_RE.test(id) && !THING_ID_RE.test(id); }

export const LICENCE_NOTE = "synthetic, generated from the SmartCiti.X procedures";

// ------------------------------------------------------------------- 3D maths
//
// Deliberately hand-rolled rather than borrowed from three.js: this module has
// to run in Node against the checkers' stub three, where matrixWorld is never
// updated and getWorldPosition() returns the local position. Walking the parent
// chain ourselves gives the same answer in the browser and in a checker, which
// is the only way a pose in a dataset means anything.

const rot = (v, a, i, j) => {
  const c = Math.cos(a), s = Math.sin(a), out = v.slice();
  out[i] = v[i] * c - v[j] * s;
  out[j] = v[i] * s + v[j] * c;
  return out;
};
/** Apply an XYZ Euler to a vector: Z first, then Y, then X (three.js's own
 * default order for the single-axis rotations these stations use). */
export function rotateXYZ(v, x = 0, y = 0, z = 0) {
  let out = v;
  if (z) out = rot(out, z, 0, 1);
  if (y) out = rot(out, y, 2, 0);
  if (x) out = rot(out, x, 1, 2);
  return out;
}
const round3 = (v) => v.map((n) => Math.round(n * 1000) / 1000);
const unit = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
// Named for its arity, not just `dist`: these shared modules are concatenated
// into one bundle, where a bare `dist` already belongs to hands.js.
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * Where an object actually is in the room, and which way it faces: the object's
 * local origin carried up the parent chain through every scale, rotation and
 * offset, plus the accumulated rotation applied to +Z (the face a decal,
 * a panel and a control are all built on in this kit).
 */
export function worldPlacement(obj) {
  let p = [0, 0, 0], rx = 0, ry = 0, rz = 0;
  for (let o = obj; o; o = o.parent) {
    const s = o.scale ?? {}, r = o.rotation ?? {}, t = o.position ?? {};
    p = [p[0] * (s.x ?? 1), p[1] * (s.y ?? 1), p[2] * (s.z ?? 1)];
    p = rotateXYZ(p, r.x ?? 0, r.y ?? 0, r.z ?? 0);
    p = [p[0] + (t.x ?? 0), p[1] + (t.y ?? 0), p[2] + (t.z ?? 0)];
    rx += r.x ?? 0; ry += r.y ?? 0; rz += r.z ?? 0;
  }
  return { position: round3(p), normal: round3(unit(rotateXYZ([0, 0, 1], rx, ry, rz))), euler: round3([rx, ry, rz]) };
}

/** The pose an end effector works this object from: the contact point, the
 * approach normal, and the staging point a standoff back along it. */
export function poseFor(obj, o = {}) {
  const { position, normal, euler } = worldPlacement(obj);
  const standoff = o.standoff ?? STANDOFF;
  return {
    position, normal, euler, standoff,
    approach: round3([position[0] + normal[0] * standoff, position[1] + normal[1] * standoff, position[2] + normal[2] * standoff]),
  };
}

/** A pose for every interactable the station registered. */
export function stationPoses(api, o = {}) {
  const poses = {};
  for (const [id, obj] of Object.entries(api.hits ?? {})) if (obj) poses[id] = poseFor(obj, o);
  return poses;
}

// ---------------------------------------------------------- keep-out volumes

/** The top of the object tree a station's hits hang from, when no root is passed. */
function rootOf(api) {
  const first = Object.values(api.hits ?? {}).find(Boolean);
  let o = first;
  while (o?.parent) o = o.parent;
  return o ?? null;
}

function walk(obj, fn) {
  if (!obj) return;
  fn(obj);
  for (const c of obj.children ?? []) walk(c, fn);
}

/**
 * The volumes an end effector must not enter: the people in the room.
 *
 *   * anything a station tagged `userData.patient` — the patient's head and
 *     torso, tagged at the point the figure is built;
 *   * any interactable whose id names part of a person (see isPersonId) —
 *     `patient-airway`, `face-inspect`, `floor-of-mouth`: the small volumes
 *     around the anatomy a procedure works on;
 *   * a default head volume at a chair tagged `userData.patientChair`, for the
 *     stations where the chair is empty right now and will not be for long;
 *   * every other person in the room (`userData.crew`, which citykit's
 *     standingFigure already sets) — a robot keeps out of the assistant at the
 *     next bench for the same reason it keeps out of the patient.
 */
export function keepOutZones(api, o = {}) {
  // A hazard is a decoy prop, never a person: `leave-patient` is a sign about
  // walking away from a sedated chair and `mouth-to-mouth` is a pocket mask on
  // a shelf, and a keep-out volume around either one would sit in mid-air.
  const hazards = new Set(Object.keys(o.hazards ?? {}));
  const zones = [];
  const seen = new Set();
  const push = (z) => { if (!seen.has(z.id)) { seen.add(z.id); zones.push(z); } };
  const root = o.root ?? rootOf(api);
  const n = {};
  const next = (part) => (n[part] = (n[part] ?? 0) + 1) - 1;
  walk(root, (obj) => {
    const tag = obj.userData?.patient;
    if (tag) {
      const part = (typeof tag === "object" && tag.part) || "body";
      const { position } = worldPlacement(obj);
      push({
        id: `patient-${part}-${next(part)}`, label: `patient ${part}`, kind: "sphere", source: "userData.patient",
        part, center: position, radius: (typeof tag === "object" && tag.radius) || ZONE_RADIUS[part] || ZONE_RADIUS.body,
      });
    }
    const chair = obj.userData?.patientChair;
    if (chair) {
      const off = (typeof chair === "object" && chair.offset) || [0, 1.3, 0];
      const { position } = worldPlacement(obj);
      push({
        id: `chair-head-${next("chair")}`, label: "head volume at the chair", kind: "sphere", source: "userData.patientChair",
        part: "head", center: round3([position[0] + off[0], position[1] + off[1], position[2] + off[2]]),
        radius: (typeof chair === "object" && chair.radius) || ZONE_RADIUS.head,
      });
    }
    if (obj.userData?.crew) {
      const { position } = worldPlacement(obj);
      push({
        id: `bystander-${next("bystander")}`, label: "person at work in the room", kind: "sphere", source: "userData.crew",
        part: "bystander", center: round3([position[0], position[1] + BYSTANDER_CENTRE_Y, position[2]]),
        radius: ZONE_RADIUS.bystander,
      });
    }
  });
  for (const [id, obj] of Object.entries(api.hits ?? {})) {
    if (!obj || hazards.has(id) || !isPersonId(id)) continue;
    push({
      id: `site-${id}`, label: `patient site — ${id}`, kind: "sphere", source: "id",
      part: "site", center: worldPlacement(obj).position, radius: ZONE_RADIUS.site,
    });
  }
  return zones;
}

/** The zone a point lies inside, nearest centre first, or null. */
export function zoneAt(zones, point) {
  let best = null, bestD = Infinity;
  for (const z of zones) {
    const d = dist3(z.center, point);
    if (d <= z.radius && d < bestD) { best = z; bestD = d; }
  }
  return best;
}
/** The nearest zone to a point, inside it or not — the robot's clearance. */
export function nearestZone(zones, point) {
  let best = null, bestD = Infinity;
  for (const z of zones) {
    const d = dist3(z.center, point) - z.radius;
    if (d < bestD) { best = z; bestD = d; }
  }
  return best ? { id: best.id, clearance: Math.round(bestD * 1000) / 1000 } : null;
}

// ------------------------------------------------------------ step embodiment

const targetsOf = (step) => (step.kind === "sequence" || step.kind === "find" ? step.targets ?? [] : step.target ? [step.target] : []);

/** The force ceiling for a step, and where that number came from. */
export function forceFor(step) {
  if (step.noRobot) return { maxForce: "none", forceSource: "noRobot", declared: step.forceClass ?? null };
  if (step.forceClass) {
    if (!FORCE_CLASSES.includes(step.forceClass)) throw new Error(`${step.id}: forceClass ${step.forceClass} is not one of ${FORCE_CLASSES.join(" | ")}`);
    return { maxForce: step.forceClass, forceSource: "declared", declared: step.forceClass };
  }
  return { maxForce: FORCE_BY_KIND[step.kind] ?? "light", forceSource: "kind-default", declared: null };
}

/**
 * Whether this step is allowed to put the end effector inside a keep-out
 * volume, and for which ids. Declaring a `forceClass` is the declaration —
 * the station saying "the patient is part of this step, and this is the most
 * force it may ever take". `noRobot` authorises nothing, because the robot is
 * not the one doing it.
 */
export function patientContactAllowed(step) {
  return !!step && !step.noRobot && !!step.forceClass;
}

/** Everything a robot needs to attempt one step. */
export function stepEmbodiment(step, poses, o = {}) {
  const force = forceFor(step);
  const ids = targetsOf(step);
  const zones = o.zones ?? [];
  const targets = ids.map((id) => {
    const pose = poses[id] ?? null;
    const zone = pose ? zoneAt(zones, pose.position) : null;
    return { id, pose, zone: zone ? zone.id : null, keepOutPart: zone ? zone.part : null };
  });
  const emb = {
    stepId: step.id, kind: step.kind, title: step.title,
    grasp: GRASP_BY_KIND[step.kind] ?? "touch",
    ...force,
    noRobot: !!step.noRobot,
    operator: step.noRobot ? "human" : "robot",
    patientContact: patientContactAllowed(step),
    note: step.robotNote ?? null,
    targets,
  };
  if (step.kind === "turn") emb.turns = step.turn?.turns ?? 1;
  if (step.kind === "hold") emb.seconds = step.seconds ?? null;
  if (step.kind === "track") { emb.seconds = step.seconds ?? null; emb.band = step.track?.green ?? [0.42, 0.62]; }
  if (step.kind === "gauge") emb.band = step.gauge?.green ?? [0.44, 0.62];
  if (step.kind === "drive") {
    emb.band = step.drive?.speedBand ?? null;
    emb.drive = {
      path: step.drive?.path ?? [], laneWidth: step.drive?.laneWidth ?? null, reverse: !!step.drive?.reverse,
      checks: (step.drive?.checks ?? []).map((c) => ({ at: c.at, kind: c.kind })),
      units: step.drive?.units ?? "mph",
    };
  }
  if (step.kind === "drag") {
    const to = step.drag?.to;
    emb.place = { id: to ?? null, pose: to ? poses[to] ?? null : null, radius: step.drag?.radius ?? 0.35 };
  }
  return emb;
}

// ------------------------------------------------------- the embodiment layer

const CACHE = new WeakMap();

/** The observation schema written into a dataset's manifest. */
export function observationSchema() {
  return {
    inherits: "shared/robot.js observe(): stepIndex, stepId, kind, targets, remaining, anyOrder, gauge, track, hold, turn, interrupt, score, streak, errors, hazardHits, elapsed",
    adds: {
      grasp: `one of ${[...new Set(Object.values(GRASP_BY_KIND))].join(" | ")}`,
      maxForce: FORCE_CLASSES.join(" | "),
      forceSource: "noRobot | declared | kind-default",
      noRobot: "true when this step is the clinician's, never the robot's",
      operator: "robot | human",
      pose: "{ position[3], normal[3], approach[3], standoff, euler[3] } for the step's primary target, in station metres",
      poses: "one pose per target of this step, in the order the step names them",
      place: "pick-and-place only: the drop pose and its radius",
      drive: "vehicle-control only: the path, lane width, speed band and the checks the route asks for",
      keepOut: "{ zones, inside, part, authorised, nearest: { id, clearance } } for the pose the robot is working",
    },
  };
}

/** The action space, described for a dataset's manifest. */
export function actionSpace() {
  return {
    types: {
      select: "{ id } — touch an interactable",
      commit: "{ id, at } — set a dial to `at` (0..1) and commit the reading",
      press: "{ id } — begin sustained contact",
      release: "{} — end sustained contact",
      rotate: "{ id, delta } — signed fraction of a turn about the approach axis",
      drop: "{ id, distance } — release a carried object `distance` metres from its socket",
      drive: "{ throttle, steer, check } — throttle in [-1, 1] (below zero brakes), steer in [-1, 1] (positive to the right of travel), and a check kind (mirror-left | mirror-right | signal-left | signal-right | horn | gear-down | gear-up | lights) or null",
      wait: "{} — no motion this tick",
    },
    grasps: GRASP_BY_KIND,
    forceClasses: FORCE_CLASSES,
    note: "Actions are applied through shared/robot.js applyAction() unchanged — the embodiment layer adds the pose, the grasp and the force ceiling each action is carried out under, it does not change what the engine accepts.",
  };
}

/**
 * Everything about a built station a robot needs, computed once per build and
 * cached against the api object so an observation is cheap.
 */
export function buildEmbodiment(room, api, o = {}) {
  const poses = stationPoses(api, o);
  const zones = keepOutZones(api, { ...o, hazards: room.hazards });
  const steps = {};
  for (const step of room.steps) steps[step.id] = stepEmbodiment(step, poses, { zones });
  const emb = {
    station: room.id, stationName: room.name ?? room.title,
    standoff: o.standoff ?? STANDOFF,
    poses, keepOut: zones, steps,
    stepOrder: room.steps.map((s) => s.id),
    noRobotSteps: room.steps.filter((s) => s.noRobot).map((s) => ({ id: s.id, title: s.title, why: s.robotNote ?? null })),
    contactSteps: room.steps.filter((s) => s.forceClass && !s.noRobot).map((s) => ({ id: s.id, forceClass: s.forceClass })),
    missingPoses: Object.keys(api.hits ?? {}).filter((id) => !poses[id]),
    actionSpace: actionSpace(),
    observationSchema: observationSchema(),
  };
  CACHE.set(api, emb);
  return emb;
}

/** The cached embodiment for a built station, building it on first ask. */
export function embodimentFor(room, api, o = {}) {
  const hit = CACHE.get(api);
  if (hit && (!room || hit.station === room.id)) return hit;
  return buildEmbodiment(room, api, o);
}

/** The keep-out account for one pose under one step. */
export function keepOutFor(emb, step, id) {
  const pose = emb.poses[id] ?? null;
  if (!pose) return { zones: emb.keepOut.length, inside: null, part: null, authorised: true, nearest: null };
  const zone = zoneAt(emb.keepOut, pose.position);
  const allowed = patientContactAllowed(step) && targetsOf(step).concat(step?.drag?.to ?? []).includes(id);
  return {
    zones: emb.keepOut.length,
    inside: zone ? zone.id : null, part: zone ? zone.part : null,
    authorised: !zone || allowed,
    nearest: nearestZone(emb.keepOut, pose.position),
  };
}

/**
 * observe() with the body attached: the same observation the policy runner
 * logs, plus the pose the end effector would work, the grasp the step implies,
 * the force it may use and where that pose stands relative to the people in
 * the room. `api` is the station's build() result; the embodiment is cached
 * against it, so pass `{ room, root }` the first time if the caller has them.
 */
export function observeEmbodied(session, api, o = {}) {
  const base = observe(session);
  const room = o.room ?? session.room;
  const emb = embodimentFor(room, api, o);
  const step = session.step;
  if (!step) return { ...base, keepOut: { zones: emb.keepOut.length, inside: null, part: null, authorised: true, nearest: null } };
  const se = emb.steps[step.id] ?? stepEmbodiment(step, emb.poses, { zones: emb.keepOut });
  const primary = se.targets[0]?.id ?? null;
  return {
    ...base,
    grasp: se.grasp, maxForce: se.maxForce, forceSource: se.forceSource,
    noRobot: se.noRobot, operator: se.operator,
    turns: se.turns ?? null, band: se.band ?? null, seconds: se.seconds ?? null,
    pose: primary ? emb.poses[primary] ?? null : null,
    poses: se.targets.map((t) => ({ id: t.id, pose: t.pose, zone: t.zone })),
    place: se.place ?? null,
    keepOut: primary ? keepOutFor(emb, step, primary) : { zones: emb.keepOut.length, inside: null, part: null, authorised: true, nearest: null },
  };
}

// ------------------------------------------------------------ embodied episode

/** The id an action reaches for, or null for the ones that move nothing. */
function actedId(action) { return action.type === "release" || action.type === "wait" ? null : action.id ?? null; }

/**
 * One embodied episode, headless. Same policy, same engine, same seeds as
 * shared/robot.js runEpisode() — what is added is the body: every decision
 * carries the pose it was made at, the grasp, the force ceiling and its
 * standing against the keep-out volumes, and a step the station marked
 * `noRobot` is handed to the clinician rather than attempted.
 *
 * A handed-off step is still simulated, so the procedure's order and rhythm
 * survive in the trajectory — the record simply says `operator: "human"` and
 * carries no pose, no force and no keep-out account, because none of it was
 * the robot's.
 */
export function runEmbodiedEpisode(room, api, {
  skill = 1, seed = 1, dt = 0.05, maxTicks = 20000, trajectory = true, SessionClass, hooks = {}, root, standoff,
} = {}) {
  const emb = embodimentFor(room, api, { root, standoff });
  const hitIds = Object.keys(api.hits ?? {});
  const hazardIds = Object.keys(room.hazards ?? {}).filter((id) => hitIds.includes(id));
  const agent = new RobotAgent({ skill, seed, hitIds, hazardIds });
  const records = [];
  let lastFeedback = null;
  const session = new SessionClass(room, {
    onStep: (step, s) => { api.onStep?.(step, s); hooks.onStep?.(step, s); },
    onStepComplete: (step, s) => { api.onStepComplete?.(step, s); hooks.onStepComplete?.(step, s); },
    onFeedback: (fb, s) => { lastFeedback = fb; api.onFeedback?.(fb, s); hooks.onFeedback?.(fb, s); },
    onHazard: (id, s) => { api.onHazard?.(id, s); hooks.onHazard?.(id, s); },
    onFinish: (s, summary) => hooks.onFinish?.(s, summary),
  });
  session.start();
  let ticks = 0, decisions = 0, robotDecisions = 0, handoffs = 0, violations = 0;
  const violationLog = [], handoffSteps = new Set();
  while (!session.finished && ticks < maxTicks) {
    const before = session.score;
    const step = session.step;
    const human = !!step?.noRobot && !session.activeInterrupt;
    const obs = trajectory ? observeEmbodied(session, api, { room, root, standoff }) : null;
    const action = agent.act(session);
    lastFeedback = null;
    applyAction(session, action);
    session.tick(dt);
    try { api.animate?.(ticks * dt, dt, session); } catch (_) { /* a room's cosmetics must not break a run */ }
    ticks += 1;
    if (action.type === "wait" && session.score === before) continue;
    if (action.type !== "wait") decisions += 1;
    const id = actedId(action);
    let keepOut = null, violation = false;
    if (human) { if (action.type !== "wait") { handoffs += 1; if (step) handoffSteps.add(step.id); } }
    else if (action.type !== "wait") {
      robotDecisions += 1;
      if (id) {
        keepOut = keepOutFor(emb, session.activeInterrupt ? { id: "interrupt", kind: "select", target: session.activeInterrupt.target } : step ?? {}, id);
        if (keepOut.inside && !keepOut.authorised) {
          violation = true; violations += 1;
          violationLog.push({ t: +(ticks * dt).toFixed(2), step: step?.id ?? null, id, zone: keepOut.inside, part: keepOut.part });
        }
      }
    }
    if (trajectory) {
      const se = step ? emb.steps[step.id] ?? null : null;
      records.push({
        t: +(ticks * dt).toFixed(2), obs, action,
        operator: human ? "human" : "robot",
        pose: human || !id ? null : emb.poses[id] ?? null,
        grasp: human ? null : se?.grasp ?? null,
        maxForce: human ? null : se?.maxForce ?? null,
        keepOut, keepOutViolation: violation,
        reward: session.score - before,
        feedback: lastFeedback ? lastFeedback.kind : null,
        hazard: !!lastFeedback?.hazard,
      });
    }
  }
  const summary = {
    finished: session.finished, score: session.score, stars: session.stars, errors: session.errors,
    hazardHits: session.hazardHits, holdBreaks: session.holdBreaks, seconds: +session.elapsed.toFixed(1),
    precision: +session.precision.toFixed(3), earned: [...session.earned],
    decisions, robotDecisions, handoffs, handoffSteps: [...handoffSteps],
    keepOutViolations: violations, ticks,
    passed: session.finished && session.stars >= 2 && session.hazardHits === 0 && violations === 0,
  };
  return { summary, records, session, embodiment: emb, violations: violationLog };
}

/** One probe of a station at one skill: the success rate, mean score and the
 * keep-out violations that skill costs. This is one point on a difficulty
 * curve, and it is deliberately callable on its own so a browser can walk the
 * ladder a probe at a time without blocking a frame for a whole calibration. */
export function probeSkill(room, api, { skill = 1, episodes = 6, seed = 1, SessionClass, dt, root } = {}) {
  let passes = 0, score = 0, violations = 0, handoffs = 0, hazards = 0;
  for (let i = 0; i < episodes; i++) {
    const { summary } = runEmbodiedEpisode(room, api, { skill, seed: seed * 1000 + i, trajectory: false, SessionClass, dt, root });
    if (summary.passed) passes += 1;
    score += summary.score; violations += summary.keepOutViolations; handoffs += summary.handoffs; hazards += summary.hazardHits;
  }
  return {
    skill: +skill.toFixed(3), episodes,
    successRate: +(passes / episodes).toFixed(3), meanScore: Math.round(score / episodes),
    keepOutViolations: violations, handoffsPerEpisode: +(handoffs / episodes).toFixed(1),
    unsafeActionsPerEpisode: +(hazards / episodes).toFixed(2),
  };
}

/** The skill ladder a difficulty curve is drawn on. */
export const DIFFICULTY_LADDER = [0, 0.25, 0.5, 0.75, 1];

/**
 * The embodied curriculum: the same idea as shared/robot.js calibrate(), with
 * the pass rule that a run entering a keep-out volume is not a pass however
 * well it scored. Walks a fixed ladder rather than bisecting, so the curve is
 * comparable station to station and a UI can draw it as it fills.
 */
export function calibrateEmbodied(room, api, { band = [0.6, 0.8], episodes = 6, seed = 1, SessionClass, dt, root, ladder = DIFFICULTY_LADDER, refine = 3 } = {}) {
  const history = ladder.map((skill) => probeSkill(room, api, { skill, episodes, seed, SessionClass, dt, root }));
  const within = (h) => h.successRate >= band[0] && h.successRate <= band[1];
  // A five-rung ladder is coarse, and several of these stations go from never
  // passing to always passing between two rungs. Bisect that gap a few times so
  // the curve has points where it is actually changing.
  for (let i = 0; i < refine && !history.some(within); i++) {
    const sorted = history.slice().sort((a, b) => a.skill - b.skill);
    const below = sorted.filter((h) => h.successRate < band[0]).pop();
    const above = sorted.find((h) => h.successRate > band[1]);
    if (!below || !above || above.skill - below.skill < 0.02) break;
    history.push(probeSkill(room, api, { skill: (below.skill + above.skill) / 2, episodes, seed, SessionClass, dt, root }));
  }
  history.sort((a, b) => a.skill - b.skill);
  const inBand = history.filter(within);
  const centre = (band[0] + band[1]) / 2;
  const optimal = inBand.length
    ? inBand[0]
    : { ...history.slice().sort((a, b) => Math.abs(a.successRate - centre) - Math.abs(b.successRate - centre))[0], note: "closest probe — no probe on the ladder landed inside the band" };
  return { optimal, band, episodes, ladder, history };
}
