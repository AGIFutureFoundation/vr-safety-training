// HIVE-3 — the hive's day, remembered, in two languages (console HIVE-3, docs/consoles/HIVE-3.md).
// SmartCiti.X Holodeck · Powered by AGI Corp.
//
// Four pieces over OMEGA-HIVE's hive (ohHive) and HIVE-IN-WORLD's robotics rooms. This module draws nothing and calls no
// network, voice, model or microphone; it reads the hive's own events and the page's own storage only.
//   1. Who stands in a robotics room (h3RoomPresence): the agents homed at the room's robot site, unless a job has sent them
//      elsewhere, and any agent the hive sends to that site for a job, until the job ends (completed, refused, vetoed or
//      declined). An agent whose last job has ended goes home. hw-hive-world.js stands them in the room: through the door to a
//      free agent spot, else a place by the door, and out through the door when they leave. At most H3_ROOM_FIGURES figures
//      are in a room at once (the cell hall's texture budget, measured with ixrMeasure, holds three; a fourth agent waits
//      outside until a figure has left).
//   2. Remembered settings (h3Settings): the hive panel's voice (on/off), "supervise every job" and the hive's language, kept
//      on this device under the signed-in profile's own namespace (profiles.js gtKeyFor: `h3-hive-settings-v1::id-<digest>`),
//      never uploaded, cleared on sign-out (auth.js signOut removes it). Demo, K-12 and signed-out sessions store nothing and
//      read nothing (the same gate the hive panel mounts behind: DATAWORKS' eligibility at the offer stage, and no ?demo).
//   3. The hive panel's text in Spanish (H3_PANEL_TEXT, h3PanelText, h3RoleIn, h3ChipIn): the panel's UI strings and the agents'
//      role sentences, picked by the hive's language like the agents' lines. English is unchanged. The Spanish is
//      machine-assisted and needs a native speaker's review (the platform's rule for every non-English table).
//   4. "A day in the hive" (H3_SCENE, h3SceneJobs, h3SceneHive): the scripted, seeded scene the parishes app plays on
//      sf-downtown for the reel (window.__parishTest.hiveScene()): a job arrives, the agents bid and one wins and walks out of
//      the cell hall's door to its site, the governor refuses one unsafe request (its reason captioned), and the learner
//      approves one job that names a robot (the simulated job runs; the physical path stays disabled).
//
// SEAMS (every top-level name carries the h3/H3_ prefix: the bundler shares one scope):
//   H3_ROOM_FIGURES                         3: figures a robotics room holds at once
//   h3RoomPresence({ agents, source })      -> { at(id), here(siteId), onChange(fn) -> off, jobsOf(id), dispose() }
//                                              onChange receives { agent, from, to, why: "move" | "job-ended", jobId, t }
//   H3_SETTINGS_KEY                         "h3-hive-settings-v1" (listed in profiles.js GT_PROFILE_KEYS)
//   h3SettingsAllowed({ signals, profile, demo })  -> { ok, reason }: may this session keep the hive's settings?
//   h3Settings({ storage, signals, profile, demo }) -> { allowed, reason, read(), write(patch), clear() }
//                                              read() -> { voice?, supervise?, lang? } ({} when not allowed or nothing stored)
//   H3_PANEL_TEXT                           { en: {...}, es: {...} }: every UI string of the hive panel
//   h3PanelText(lang)                       -> the table for that language (English for any other)
//   h3RoleIn(agent, lang) / h3ChipIn(chip, lang) -> the role sentence / a personality chip in that language
//   H3_SCENE                                the scene's beats (ids, start seconds, camera shot) and its duration
//   h3SceneJobs(seed)                       -> the scene's seeded job list (ohHive's `jobs` shape)
//   h3SceneHive(makeHive, { seed })         -> a hive over those jobs (the caller hands in OMEGA-HIVE's ohHive: no import)
//   H3_SCENE_PROLOGUE_STEPS                 4: hive steps taken before the scene's clock starts
//   h3SceneRelay(hive)                      -> { on, off, agents, jobs(), agentState(id), pending(), step(n), releaseThrough(type|fn),
//                                                releaseRun(type), releaseAll(), held(), released(), dispose() }: the hive's events,
//                                                held per step and handed on beat by beat

export const H3_ROOM_FIGURES = 3;

// ------------------------------------------------------------------------------------------------ 1. who is in a room

/**
 * The room-world's whereabouts of every agent: where the hive has it while it holds a job, and home otherwise. Read at once
 * from the hive (jobs() and agentState()), then kept in step with its award, move, complete and refused events.
 */
export function h3RoomPresence({ agents = [], source = null } = {}) {
  const home = new Map((agents ?? []).filter((a) => a?.id).map((a) => [a.id, a.homeSite ?? null]));
  const at = new Map(), jobs = new Map(), winnerOf = new Map();
  for (const id of home.keys()) jobs.set(id, new Set());
  try {
    const held = new Set((source?.pending?.() ?? []).filter((r) => r.reason === "supervise").map((r) => r.jobId));
    for (const j of source?.jobs?.() ?? []) {
      if (!j?.winner || !jobs.has(j.winner)) continue;
      if (j.status === "moving" || j.status === "running" || (j.status === "awaiting-approval" && held.has(j.jobId))) { jobs.get(j.winner).add(j.jobId); winnerOf.set(j.jobId, j.winner); }
    }
  } catch (_) { /* a source without jobs(): everyone starts at home */ }
  for (const [id, h] of home) {
    let s = null;
    if (jobs.get(id).size) { try { s = source?.agentState?.(id)?.site ?? null; } catch (_) { s = null; } }
    at.set(id, s ?? h);
  }
  const listeners = new Set();
  const set = (id, site, why, ev) => {
    const from = at.get(id) ?? null; if (from === site) return;
    at.set(id, site);
    for (const fn of [...listeners]) { try { fn({ agent: id, from, to: site, why, jobId: ev?.jobId ?? null, t: ev?.t ?? null }); } catch (_) { /* a listener never stops the others */ } }
  };
  const end = (id, jobId, ev) => { const js = jobs.get(id); if (!js) return; js.delete(jobId); if (!js.size) set(id, home.get(id) ?? null, "job-ended", ev); };
  const handlers = {
    award: (e) => { if (!jobs.has(e?.agent) || !e.jobId) return; jobs.get(e.agent).add(e.jobId); winnerOf.set(e.jobId, e.agent); },
    move: (e) => { if (!jobs.has(e?.agent) || !e.to) return; if (e.jobId) { jobs.get(e.agent).add(e.jobId); winnerOf.set(e.jobId, e.agent); } set(e.agent, e.to, "move", e); },
    complete: (e) => { if (e?.jobId) end(e.winner ?? winnerOf.get(e.jobId) ?? e.agent, e.jobId, e); },
    refused: (e) => { if (e?.jobId) end(e.winner ?? winnerOf.get(e.jobId) ?? e.agent, e.jobId, e); },
  };
  const subs = [];
  if (source && typeof source.on === "function") for (const [type, fn] of Object.entries(handlers)) { source.on(type, fn); subs.push([type, fn]); }
  return {
    at: (id) => at.get(id) ?? null,
    here: (siteId) => [...at.entries()].filter(([, s]) => s === siteId).map(([id]) => id),
    jobsOf: (id) => [...(jobs.get(id) ?? [])],
    onChange(fn) { if (typeof fn === "function") listeners.add(fn); return () => listeners.delete(fn); },
    dispose() { for (const [type, fn] of subs.splice(0)) { try { source.off?.(type, fn); } catch (_) { /* gone */ } } listeners.clear(); },
  };
}

// ------------------------------------------------------------------------------------------------ 2. remembered settings

export const H3_SETTINGS_KEY = "h3-hive-settings-v1";

/** May this session keep the hive's settings? Only a signed-in profile that is not K-12 and not the demo (the hive's own gate:
 * DATAWORKS' signals at the offer stage, and the page's ?demo flag). Unknown signals never store. */
export function h3SettingsAllowed({ signals = null, profile = null, demo = false } = {}) {
  const s = signals ?? {};
  if (demo || profile?.kind === "demo" || s.demo !== false) return { ok: false, reason: "demo" };
  if (profile?.kind !== "account" || s.signedIn !== true) return { ok: false, reason: "signed-out" };
  if (s.k12 !== false) return { ok: false, reason: "k12" };
  return { ok: true, reason: "ok" };
}

/** The hive panel's settings on this device: `storage` is the profile's own Storage (profiles.js gtStorage(), which lands the
 * key on `h3-hive-settings-v1::id-<digest>` for an account). Nothing is read or written unless h3SettingsAllowed says so. */
export function h3Settings({ storage = null, signals = null, profile = null, demo = false } = {}) {
  const gate = h3SettingsAllowed({ signals, profile, demo });
  const clean = (o) => {
    const out = {};
    if (typeof o?.voice === "boolean") out.voice = o.voice;
    if (typeof o?.supervise === "boolean") out.supervise = o.supervise;
    if (typeof o?.lang === "string" && /^[a-z]{2}$/.test(o.lang)) out.lang = o.lang;
    return out;
  };
  const read = () => {
    if (!gate.ok || !storage) return {};
    try { return clean(JSON.parse(storage.getItem(H3_SETTINGS_KEY) || "null") ?? {}); } catch (_) { return {}; }
  };
  return {
    allowed: gate.ok, reason: gate.reason, read,
    write(patch) {
      if (!gate.ok || !storage) return false;
      try { storage.setItem(H3_SETTINGS_KEY, JSON.stringify({ v: 1, ...read(), ...clean(patch) })); return true; } catch (_) { return false; }
    },
    clear() { if (!storage) return false; try { storage.removeItem(H3_SETTINGS_KEY); return true; } catch (_) { return false; } },
  };
}

// ------------------------------------------------------------------------------------------------ 3. the panel in Spanish

/** Every UI string of the Omega Hive panel (oh-panel.js). English is the panel's text as it was; the Spanish is
 * machine-assisted and needs a native speaker's review ("gobernador" stands for the safety governor). */
export const H3_PANEL_TEXT = Object.freeze({
  en: Object.freeze({
    aria: (f) => `${f}: software agents managing the simulated robots`,
    heading: (f) => `${f} — software agents managing the simulated robots`,
    note: "Seven software agents, not people, coordinate the robot jobs at the Holodeck's six robot sites. Every job passes the safety governor; anything that would touch a physical robot comes to you as a question, and approving lets only the simulated job run. Lines are written on this device from each agent's persona and the job's own data, with no model or network call. Voice is off until you turn it on, captions always show, and nothing listens.",
    review: "",
    label: "software agent",
    home: (site) => `Home: ${site}`,
    step: "Step",
    run: (n) => `Run ${n} steps`,
    voice: (on) => `Voice: ${on ? "on" : "off"}`,
    supervise: (on) => `Supervise every job: ${on ? "on" : "off"}`,
    superviseOn: "Every job waits for your approval before it runs.",
    superviseOff: "Routine simulated jobs the governor allows run under your standing approval; requests that name a physical robot always ask you.",
    language: "Language: English",
    languageTitle: "Show the hive in Spanish (the page reloads; your choice is kept on this device for your profile only).",
    waiting: (n) => `Waiting for you (${n})`,
    askSupervise: (r) => `${r.jobId} · ${r.task} at ${r.siteName}. The governor allowed it and you supervise every job: approve to let it run on the simulated robot, or decline.`,
    askPhysical: (r) => `${r.jobId} · ${r.task} at ${r.siteName}. It names a physical robot; that path is disabled in this build. Approve to run it on the simulated robot only, or decline.`,
    approve: "Approve (simulated only)",
    decline: "Decline",
    feed: "Agent captions",
    status: (t, m, v) => `Step ${t} · completed ${m.completed} · refused ${m.refused} · vetoed ${m.vetoed} · declined ${m.declined} · waiting for you ${m.awaitingApproval} · audit chain ${v.lines} line(s), ${v.ok ? "intact" : "BROKEN"}`,
  }),
  es: Object.freeze({
    aria: (f) => `${f}: agentes de software que gestionan los robots simulados`,
    heading: (f) => `${f} — agentes de software que gestionan los robots simulados`,
    note: "Siete agentes de software, no personas, coordinan los trabajos de robots en los seis sitios de robots del Holodeck. Cada trabajo pasa por el gobernador de seguridad; todo lo que tocaría un robot físico le llega a usted como una pregunta, y aprobar solo deja que se ejecute el trabajo simulado. Las frases se escriben en este dispositivo a partir de la personalidad de cada agente y de los datos del propio trabajo, sin llamadas a ningún modelo ni a la red. La voz está apagada hasta que usted la active, los subtítulos siempre se muestran y nada escucha.",
    review: "Texto en español asistido por máquina, pendiente de revisión por un hablante nativo.",
    label: "agente de software",
    home: (site) => `Sede: ${site}`,
    step: "Paso",
    run: (n) => `Ejecutar ${n} pasos`,
    voice: (on) => `Voz: ${on ? "activada" : "desactivada"}`,
    supervise: (on) => `Supervisar cada trabajo: ${on ? "sí" : "no"}`,
    superviseOn: "Cada trabajo espera su aprobación antes de ejecutarse.",
    superviseOff: "Los trabajos simulados de rutina que el gobernador permite se ejecutan con su aprobación permanente; las solicitudes que nombran un robot físico siempre le preguntan.",
    language: "Idioma: español",
    languageTitle: "Mostrar la colmena en inglés (la página se recarga; su elección se guarda en este dispositivo solo para su perfil).",
    waiting: (n) => `Esperando su decisión (${n})`,
    askSupervise: (r) => `${r.jobId} · ${r.task} en ${r.siteName}. El gobernador lo permitió y usted supervisa cada trabajo: apruebe para que se ejecute en el robot simulado, o rechácelo.`,
    askPhysical: (r) => `${r.jobId} · ${r.task} en ${r.siteName}. Nombra un robot físico; esa vía está desactivada en esta versión. Apruebe para ejecutarlo solo en el robot simulado, o rechácelo.`,
    approve: "Aprobar (solo simulado)",
    decline: "Rechazar",
    feed: "Subtítulos de los agentes",
    status: (t, m, v) => `Paso ${t} · completados ${m.completed} · rechazados ${m.refused} · vetados ${m.vetoed} · declinados ${m.declined} · esperando su decisión ${m.awaitingApproval} · cadena de auditoría ${v.lines} línea(s), ${v.ok ? "intacta" : "ROTA"}`,
  }),
});
export function h3PanelText(lang = "en") { return H3_PANEL_TEXT[lang] ?? H3_PANEL_TEXT.en; }

/** The agents' role sentences in Spanish (by role key); English stays the agent's own `role`. Machine-assisted, as above. */
export const H3_ROLES_ES = Object.freeze({
  dispatcher: "Despachador: anuncia cada trabajo de robot, recoge las ofertas de los agentes y adjudica el trabajo al agente mejor situado.",
  "safety-steward": "Responsable de seguridad: revisa cada trabajo que el gobernador permite y puede vetarlo; un veto solo añade un rechazo.",
  "maintenance-planner": "Planificador de mantenimiento: toma los trabajos de entrada a la celda y de configuración de zonas, planifica el bloqueo y mantiene los equipos listos.",
  "consent-keeper": "Guardián del consentimiento: consulta al supervisor humano siempre que hace falta la palabra de una persona y mantiene en orden los registros de consentimiento.",
  trainer: "Formador: toma los trabajos de recoger y colocar y de configuración de zonas, y orienta después de cada ejecución que no terminó limpia.",
  auditor: "Auditor: vuelve a recorrer la cadena de auditoría cuando se cierran los trabajos e informa si cada línea está intacta.",
  logistics: "Logística: toma los trabajos de rutas del almacén y del puerto y mueve contenedores entre los sitios de robots.",
});
export function h3RoleIn(agent, lang = "en") { return lang === "es" ? H3_ROLES_ES[agent?.key] ?? agent?.role ?? "" : agent?.role ?? ""; }

/** The personality chips (oh-hive-data.js ohTraitChips' words) in Spanish. */
export const H3_CHIPS_ES = Object.freeze({ warm: "cercano", reserved: "reservado", formal: "formal", casual: "informal", detailed: "detallista", brief: "breve", cautious: "prudente", brisk: "ágil" });
export function h3ChipIn(chip, lang = "en") { return lang === "es" ? H3_CHIPS_ES[chip] ?? chip : chip; }

// ------------------------------------------------------------------------------------------------ 4. "A day in the hive"

const H3_SOMA = "rb-site-soma-robot-cell";
/**
 * The scene: sf-downtown's SoMa robot cell (the cell hall), seeded and timed. `steps` are the hive steps the scene takes at each
 * beat's start (seconds on the scene clock); everything said and shown comes from the hive's own events at those steps.
 *   prologue  (before the clock starts) a cell-entry job brings the maintenance planner into the cell hall, and the trainer
 *             takes two pick-and-place jobs at the San José lab (so it is at capacity and does not bid next);
 *   arrive    a cobot zone set-up job arrives for the Richland drilling deck: the dispatcher announces it;
 *   award     the agents bid; the planner wins it;
 *   walk-out  the planner walks out of the cell hall's door, and outside, from the building's door, on towards its site;
 *   refusal   a cell-entry request with a person 1.2 m from the robot reaches the governor, which refuses it (its reason captioned);
 *   approval  a cell-entry job that names the physical robot: the governor refuses that path and the consent keeper asks the
 *             learner; the learner approves a simulated run only; it goes through the bidding and the governor again;
 *   run       the winner walks into the cell hall and the job runs on the simulated robot (the physical path stays disabled).
 */
export const H3_SCENE = Object.freeze({
  parish: "sf-downtown", site: H3_SOMA, style: "ixr-cell-hall", duration: 27,
  /** at: seconds on the scene clock; shot: where the camera is; steps: hive steps taken then (held, then released). */
  beats: Object.freeze([
    Object.freeze({ id: "intro", at: 0, shot: "room", steps: 0 }),
    Object.freeze({ id: "arrive", at: 0.5, shot: "room", steps: 1 }),
    Object.freeze({ id: "bids", at: 2.5, shot: "room", steps: 0 }),
    Object.freeze({ id: "award", at: 4.5, shot: "room", steps: 0 }),
    Object.freeze({ id: "walk-out", at: 6.5, shot: "room", steps: 0 }),
    Object.freeze({ id: "outside", at: 10, shot: "door", steps: 0 }),
    Object.freeze({ id: "refusal", at: 14, shot: "wide", steps: 3 }),
    Object.freeze({ id: "approval", at: 17.5, shot: "wide", steps: 1 }),
    Object.freeze({ id: "approved", at: 20, shot: "room", steps: 0 }),
    Object.freeze({ id: "walk-in", at: 21, shot: "room", steps: 1 }),
    Object.freeze({ id: "run", at: 24, shot: "room", steps: 3 }),
    Object.freeze({ id: "end", at: 27, shot: "room", steps: 0 }),
  ]),
});
export const H3_SCENE_PROLOGUE_STEPS = 4;

/** The scene's jobs (ohHive's `jobs` shape: { n, arriveT, spec }); the seed varies the jobs' own seeds, never the story. */
export function h3SceneJobs(seed = 1) {
  const s = (seed >>> 0) || 1;
  const client = (i) => ({ id: `client-mock-${1 + (i % 6)}`, name: "Mock client agent" });
  const job = (n, arriveT, request) => ({ n, arriveT, spec: { seed: (s * 1000 + 900 + n) >>> 0, client: client(n), request: { policyId: "vb-scripted-expert", target: { kind: "sim" }, ...request, note: `scene job ${n + 1}` } } });
  return [
    job(0, 1, { taskType: "rb-cell-entry", siteId: H3_SOMA, speed: 0.3, nearestPersonM: 8, payloadKg: 3 }),
    job(1, 3, { taskType: "rb-teleop-pick-place", siteId: "rb-site-san-jose-robotics-lab", speed: 0.15, nearestPersonM: 9, payloadKg: 1 }),
    job(2, 3, { taskType: "rb-teleop-pick-place", siteId: "rb-site-san-jose-robotics-lab", speed: 0.12, nearestPersonM: 10, payloadKg: 1.2 }),
    job(3, 5, { taskType: "rb-cobot-zone-setup", siteId: "rb-site-richland-drilling-robot", speed: 0.15, nearestPersonM: 9, payloadKg: 0.5 }),
    job(4, 6, { taskType: "rb-cell-entry", siteId: H3_SOMA, speed: 0.1, nearestPersonM: 1.2, payloadKg: 3 }),
    job(5, 9, { taskType: "rb-cell-entry", siteId: H3_SOMA, speed: 0.3, nearestPersonM: 8, payloadKg: 3, target: { kind: "physical" } }),
  ];
}

/** A hive over the scene's jobs (the caller hands in OMEGA-HIVE's hive factory, so this module imports nothing). No audit log: the scene writes
 * nothing to the learner's governance registry; the hive keeps its own chain. */
export function h3SceneHive(makeHive, { seed = 1 } = {}) {
  return typeof makeHive === "function" ? makeHive({ seed, jobs: h3SceneJobs(seed), nJobs: 6, ticksPerDay: 60 }) : null;
}

/**
 * The scene's paced view of a hive: step() runs hive steps and holds their events; release*() hands them on, in the hive's own
 * order, to whatever listens (the room's figures and presence, the caption bar), so one step's announce, bids, award and walk
 * can be shown seconds apart. jobs(), agentState() and pending() read the hive itself (a room opened mid-scene starts right).
 */
export function h3SceneRelay(hive) {
  const held = [], out = [], listeners = new Map();
  const unsub = hive && typeof hive.on === "function" ? hive.on("*", (e) => held.push(e)) : null;
  const emit = (e) => { out.push(e); for (const fn of [...(listeners.get(e.type) ?? []), ...(listeners.get("*") ?? [])]) { try { fn(e); } catch (_) { /* a listener never stops the scene */ } } return e; };
  /** Hand on the held events up to and including the first that `match` accepts, and the speak lines straight after it. */
  function releaseThrough(match) {
    const test = typeof match === "function" ? match : (e) => e.type === match;
    const i = held.findIndex(test); if (i < 0) return [];
    let j = i + 1; while (j < held.length && held[j].type === "speak") j += 1;
    return held.splice(0, j).map(emit);
  }
  return {
    hive, agents: hive?.agents ?? [],
    on(type, fn) { if (typeof fn === "function") { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(fn); } return () => this.off(type, fn); },
    off(type, fn) { const xs = listeners.get(type); if (xs) listeners.set(type, xs.filter((f) => f !== fn)); },
    jobs: () => hive?.jobs?.() ?? [], agentState: (id) => hive?.agentState?.(id) ?? null, pending: () => hive?.pending?.() ?? [],
    step(n = 1) { for (let i = 0; i < n; i += 1) hive?.step?.(); return held.length; },
    releaseThrough,
    /** Every held event of a run of `type` (consecutive bids), with their speak lines. */
    releaseRun(type) { const got = []; while (held.length && (held[0].type === type || (got.length && held[0].type === "speak"))) got.push(emit(held.shift())); return got; },
    releaseAll() { return held.splice(0).map(emit); },
    held: () => held.slice(), released: () => out.slice(),
    dispose() { try { unsub?.(); } catch (_) { /* gone */ } listeners.clear(); },
  };
}
