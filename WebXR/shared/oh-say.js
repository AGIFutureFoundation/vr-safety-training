// OMEGA-HIVE — personality in words (docs/omega-hive.md, docs/consoles/OMEGA-HIVE.md).
//
// ohSay(agent, event) builds the line an agent says about a hive event, on the device, from two things only:
//   * the agent's style grammar (oh-hive-data.js ohStyleFromTraits: the sentence-length band, openers, closers,
//     hedges and the agent's own padding lexicon), and
//   * the event's own payload: every fact in a line (a job id, a site name, a reason id, a score, a count) is slotted
//     from the event, never invented. ohGrounded(line, event) re-checks that, and tools/check_omega_hive.mjs runs it
//     over every line of a seeded day.
// The choice of template, opener, hedge, padding and closer is seeded by the agent and the event, so the same event
// always gives the same line. Wording is calm (the Kids rule's scan runs over every line in the checker).
//
// No model, no network: ohDialogueAdapter(agent) has the agent-protocols.js / GRIOT shape for a deployment that
// wants a hosted model later. It starts unconfigured and refuses, before any network code, with "configure per the
// provider's current documentation"; even configured it only ever calls a transport the deployment hands in, and a
// reply is used only when ohGrounded() passes on it — otherwise the on-device line is spoken.
//
// SEAM:
//   ohSay(agent, event, { neutral, lang }) -> string   event: { type | about, t, jobId, to, siteName, task, reason, score, steps, lines, bid, z }
//     lang is "en" (the default) or "es"; an agent from ohAgentIn(agent, lang) speaks its own language (its style, padding and voice).
//   ohGrounded(line, event, { siteNames }) -> { ok, facts: [string], missing: [string] }
//   ohWords(text) -> [word], ohSentences(text) -> [sentence]
//   ohDialogueAdapter(agent, { transport }) -> { describe(), configure(fields), respond(event) -> Promise<{ ok, line, source, reason? }> }
//
// Every top-level name starts with `oh`/`OH_` (the bundler shares one scope).

import { OH_REASON_PHRASES, OH_REASON_PHRASES_ES, ohLangFor, ohAgentIn } from "./oh-hive-data.js";

export const OH_REFUSAL = "configure per the provider's current documentation";

/** Core sentences by event kind. Slots in braces are filled from the event; a template carries no fact of its own. */
export const OH_CORES = Object.freeze({
  announce: ["New job {job} at {site}", "Job {job} is in for {site}", "Posting {job} for {site}: {task}"],
  award: ["I will take {job} at {site}", "{job} at {site} is mine with a bid of {bid}", "Taking {job} for {site}, my bid was {bid}"],
  move: ["Heading to {site} for {job}", "On my way to {site} for {job}", "Walking over to {site} for {job}"],
  wait: ["{job} waits for the robot at {site}", "The robot at {site} is busy, so {job} waits its turn"],
  dispatch: ["{job} is running on the simulated robot at {site}", "Starting {job} at {site} on the simulated robot", "{job} is live in the sim at {site}"],
  complete: ["{job} finished at {site} with a score of {score}", "{job} is done at {site}, score {score} over {steps} steps", "Wrapped {job} at {site} with a score of {score}"],
  halted: ["{job} stopped at {site} on {reason}", "The run of {job} at {site} stopped on {reason}"],
  refused: ["The governor refused {job} at {site}: {reason}", "{job} at {site} is refused for {reason}"],
  veto: ["I am vetoing {job} at {site}: {reason}", "Veto on {job} at {site} for {reason}"],
  approval: ["{job} at {site} names a physical robot, so I am asking the supervisor", "The supervisor decides on {job} at {site}: a simulated run or none"],
  approved: ["The supervisor approved {job} for the simulated robot at {site} only", "{job} may now run in the sim at {site}, never on a physical robot"],
  declined: ["The supervisor declined {job} at {site}, so it will not run", "{job} at {site} was declined by the supervisor and is closed"],
  coach: ["{job} scored {score} over {steps} steps, so we review {reason}", "On {job} the score was {score}, and the review starts at {reason}"],
  audit: ["The audit chain holds {lines} lines and every one is intact", "Chain check after {job}: {lines} lines, all intact"],
  audit_broken: ["The audit chain breaks at line {lines}, so the hive stops for a person", "Chain check after {job} failed at line {lines}"],
  standing: ["Standing approval from {supervisor} covers governor-allowed simulated jobs only", "{supervisor} has a standing approval for simulated jobs the governor allows"],
  // HIVE-IN-WORLD: "supervise every job" (the learner approves each job before it runs).
  supervise: ["{job} at {site} passed the governor and waits for the supervisor", "The supervisor reviews {job} at {site} before it runs"],
  supervise_on: ["{supervisor} now approves every job before it runs", "Every job waits for {supervisor} before it runs"],
});

/**
 * The same kinds in Spanish (VOICES, loop 10 round 2): written for the same slots, so a line's facts still come from the event alone.
 * Each kind has a variant short enough for the narrowest band (6 to 12 words with a four-word site name), and the approval, approved,
 * declined and standing kinds, which only the consent keeper says, fit its band (12 to 18).
 */
export const OH_CORES_ES = Object.freeze({
  // No {task} slot in Spanish: a task's label is the registry's English name, and a Spanish line keeps no English fragment but names.
  announce: ["Nuevo trabajo {job} en {site}", "Entra el trabajo {job} para {site}", "Anuncio {job} para {site}"],
  award: ["Me quedo con {job} en {site}", "{job} en {site} es mío, con una oferta de {bid}", "Tomo {job} para {site}, mi oferta fue {bid}"],
  move: ["Voy a {site} por {job}", "Camino a {site} para {job}", "Me acerco a {site} para {job}"],
  wait: ["{job} espera al robot en {site}", "El robot de {site} está ocupado, así que {job} espera su turno"],
  dispatch: ["{job} corre en el robot simulado de {site}", "Empiezo {job} en {site} con el robot simulado", "{job} está activo en la simulación de {site}"],
  complete: ["{job} terminó en {site} con una puntuación de {score}", "{job} está listo en {site}, puntuación {score} en {steps} pasos", "Cierro {job} en {site} con una puntuación de {score}"],
  halted: ["{job} se detuvo en {site} por {reason}", "La ejecución de {job} en {site} se detuvo por {reason}"],
  refused: ["El gobernador rechazó {job} en {site}: {reason}", "{job} en {site} se rechaza por {reason}"],
  veto: ["Veto {job} en {site}: {reason}", "Veto sobre {job} en {site} por {reason}"],
  approval: ["{job} en {site} nombra un robot físico, así que pregunto a la persona supervisora", "La persona supervisora decide sobre {job} en {site}: una ejecución simulada o ninguna"],
  approved: ["La persona supervisora aprobó {job} solo para el robot simulado de {site}", "{job} ya puede correr en la simulación de {site}, nunca en un robot físico"],
  declined: ["La persona supervisora rechazó {job} en {site}, así que no correrá", "{job} en {site} fue rechazado por la persona supervisora y queda cerrado"],
  coach: ["{job} sacó {score} en {steps} pasos, así que revisamos {reason}", "En {job} la puntuación fue {score}, y la revisión empieza en {reason}"],
  audit: ["La cadena de auditoría tiene {lines} líneas y todas están intactas", "Revisión de la cadena tras {job}: {lines} líneas, todas intactas"],
  audit_broken: ["La cadena se rompe en la línea {lines}: me detengo", "La revisión tras {job} falló en la línea {lines}"],
  standing: ["La aprobación permanente de {supervisor} cubre solo trabajos simulados que el gobernador permite", "{supervisor} tiene una aprobación permanente para trabajos simulados que el gobernador permite"],
  supervise: ["{job} en {site} pasó el gobernador y espera a la persona supervisora", "La persona supervisora revisa {job} en {site} antes de que se ejecute"],
  supervise_on: ["{supervisor} aprueba ahora cada trabajo antes de que se ejecute", "Cada trabajo espera a {supervisor} antes de ejecutarse"],
});

/** The phrase packs by language: the cores, the reasons' calm phrases, the sentence that explains an approval request. */
export const OH_PACKS = Object.freeze({
  en: Object.freeze({ cores: OH_CORES, reasonPhrases: OH_REASON_PHRASES, approvalWhy: "the physical path is disabled, so only a simulated run is possible", fallbackPhrase: "a rule asked for it" }),
  es: Object.freeze({ cores: OH_CORES_ES, reasonPhrases: OH_REASON_PHRASES_ES, approvalWhy: "la vía física está desactivada, así que solo es posible una ejecución simulada", fallbackPhrase: "una regla lo pidió" }),
});

/** Kinds whose reason gets a sentence of its own: the reason's calm phrase (OH_REASON_PHRASES), fitted to the band. */
const OH_WHY = new Set(["refused", "veto", "halted", "approval"]);

/** Which kinds take a hedge (a safeguard or a pace phrase) after the core sentence. */
const OH_HEDGED = new Set(["award", "move", "dispatch", "approval", "approved", "wait"]);

function ohFnv(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; }
function ohRng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Words: whitespace tokens that carry a letter or a digit. */
export function ohWords(text) { return String(text ?? "").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)); }
/** Sentences: split after . ! ? followed by a space (decimals and ids carry no space after their dot). */
export function ohSentences(text) { return String(text ?? "").split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => ohWords(s).length); }

function ohFill(tpl, ev, pack = OH_PACKS.en) {
  const reason = ev.reason ?? "";
  const slots = {
    job: ev.jobId ?? "", site: ev.siteName ?? ev.to ?? "", task: (ev.task ?? "").replace(/^./, (c) => c.toLowerCase()), reason, phrase: pack.reasonPhrases[reason] ?? pack.fallbackPhrase,
    score: ev.score ?? "", steps: ev.steps ?? "", lines: ev.lines ?? "", bid: ev.bid ?? "", z: ev.z ?? "", supervisor: ev.supervisor ?? "",
  };
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(slots[k] ?? ""));
}
// A sentence starts with a capital, unless it starts with an id (a job id stays exactly as the event has it).
function ohCap(s) { return /^[a-z]+-[0-9a-z]/.test(s) ? s : s.replace(/^\s*([a-z])/, (m, c) => m.replace(c, c.toUpperCase())); }
// After an opener, an ordinary capitalised word drops its capital; "I", ids and names keep theirs.
function ohAfterOpener(s) { return /^(I\b|[A-Z][a-z]*[A-Z0-9-])/.test(s) || /^[A-Z][a-z]+ [A-Z]/.test(s) ? s : s.replace(/^[A-Z]/, (c) => c.toLowerCase()); }
function ohEnd(s) { return /[.!?]$/.test(s) ? s : `${s}.`; }

/**
 * Fit one sentence body to the band: pad with the agent's own phrases (then its hedges) until it reaches the lower
 * bound, without passing the upper bound when a shorter phrase fits.
 */
function ohFit(body, band, pads, rnd) {
  let s = body; const used = new Set();
  for (let guard = 0; guard < 6 && ohWords(s).length < band[0]; guard += 1) {
    const room = band[1] - ohWords(s).length;
    const fits = pads.filter((p) => !used.has(p) && ohWords(p).length <= room);
    const pool = fits.length ? fits : pads.filter((p) => !used.has(p));
    if (!pool.length) break;
    const p = pool[Math.floor(rnd() * pool.length)]; used.add(p);
    s = `${s}, ${p}`;
  }
  return s;
}

/**
 * The line an agent says about an event. `event.about` (or `event.type`) picks the core kind. With `neutral: true`
 * every agent speaks the bare core sentence (no opener, hedge, padding or closer): the control for the
 * distinctiveness eval, where only the role is left to tell speakers apart.
 */
export function ohSay(agentIn, event = {}, { neutral = false, lang = null } = {}) {
  const want = ohLangFor(lang ?? agentIn?.lang ?? "en");
  // An agent asked for another language than its own is localised first (its style, padding and voice follow the language).
  const agent = agentIn && (agentIn.lang ?? "en") !== want ? ohAgentIn(agentIn, want) : agentIn;
  const pack = OH_PACKS[want];
  const kind = event.about ?? event.type;
  const cores = pack.cores[kind];
  if (!agent || !cores) return "";
  const st = agent.style ?? {};
  const band = st.band ?? [6, 14];
  const rnd = ohRng(ohFnv(`${agent.id}|${kind}|${event.jobId ?? ""}|${event.t ?? 0}|${event.reason ?? ""}|${event.lines ?? ""}`));
  // The core: the variant whose length suits the band best (the seed breaks ties between the ones that fit).
  const filled = cores.map((c) => ohFill(c, event, pack));
  const why = (kind) => (kind === "approval" ? pack.approvalWhy : pack.reasonPhrases[event.reason]);
  if (neutral) return [ohEnd(ohCap(filled[Math.floor(rnd() * filled.length)]))].concat(OH_WHY.has(kind) && pack.reasonPhrases[event.reason] ? [ohEnd(ohCap(why(kind)))] : []).join(" ");
  const fitting = filled.filter((c) => ohWords(c).length <= band[1]);
  let core = (fitting.length ? fitting : filled.slice().sort((a, b) => ohWords(a).length - ohWords(b).length).slice(0, 1))[Math.floor(rnd() * (fitting.length || 1))];
  const opener = (st.openers ?? []).length && rnd() < st.openerRate ? st.openers[Math.floor(rnd() * st.openers.length)] : "";
  if (opener && ohWords(`${opener} ${core}`).length <= band[1]) core = `${opener} ${ohAfterOpener(core)}`;
  if (OH_HEDGED.has(kind) && (st.hedges ?? []).length && rnd() < st.hedgeRate) {
    const h = st.hedges[Math.floor(rnd() * st.hedges.length)];
    if (ohWords(`${core}, ${h}`).length <= band[1]) core = `${core}, ${h}`;
  }
  const pads = [...(st.pad ?? []), ...(st.hedges ?? [])];
  const sentences = [ohEnd(ohCap(ohFit(core, band, pads, rnd)))];
  if (OH_WHY.has(kind) && pack.reasonPhrases[event.reason]) sentences.push(ohEnd(ohCap(ohFit(why(kind), band, pads, rnd))));
  if ((st.closers ?? []).length && rnd() < st.closerRate) sentences.push(ohEnd(ohCap(ohFit(st.closers[Math.floor(rnd() * st.closers.length)], band, pads, rnd))));
  return sentences.join(" ");
}

/**
 * Every fact in a line must come from its event: numbers, job ids, site ids and names, agent ids and reason ids.
 * `siteNames` is the list of known site names (RB_SITES' names); a site name in the line must be the event's.
 */
export function ohGrounded(line, event = {}, { siteNames = [] } = {}) {
  const text = String(line ?? "");
  const src = JSON.stringify(Object.fromEntries(Object.entries(event).filter(([k]) => k !== "text" && k !== "caption")));
  const facts = [];
  for (const m of text.matchAll(/vbjob-[0-9a-f]+|rb-site-[a-z0-9-]+|oh-[a-z-]+[a-z]/gi)) facts.push(m[0]);
  for (const name of siteNames) if (name && text.includes(name)) facts.push(name);
  const scrub = facts.reduce((s, f) => s.split(f).join(" "), text);
  for (const m of scrub.matchAll(/(?<![A-Za-z])\d+(?:\.\d+)?/g)) facts.push(m[0]);
  for (const id of Object.keys(OH_REASON_PHRASES)) if (new RegExp(`(^|[^a-z-])${id}([^a-z-]|$)`).test(scrub)) facts.push(id);
  for (const m of scrub.matchAll(/\brule [a-z0-9-]+/g)) facts.push(m[0]);
  const missing = facts.filter((f) => !src.includes(f));
  return { ok: missing.length === 0, facts, missing };
}

/**
 * The adapter shape (agent-protocols.js, GRIOT's grAgentAdapter): unconfigured, it refuses before any network code.
 * A deployment configures `endpoint` and `model` from the provider's own documentation AND hands in a transport;
 * there is no default transport and no fetch here. A reply is used only when every fact in it is grounded in the
 * event; otherwise the on-device line is the one spoken.
 */
export function ohDialogueAdapter(agent, { transport = null } = {}) {
  const config = { endpoint: null, model: null };
  const missing = () => Object.keys(config).filter((k) => config[k] == null || config[k] === "").concat(typeof transport === "function" ? [] : ["transport"]);
  return {
    describe() { const m = missing(); return { agent: agent?.id ?? null, fields: Object.keys(config), configured: m.length === 0, missing: m, note: "on-device lines are the default; nothing is sent while unconfigured" }; },
    configure(next = {}) { for (const k of Object.keys(config)) if (k in next) config[k] = next[k] ?? null; return this.describe(); },
    async respond(event = {}) {
      const local = ohSay(agent, event);
      if (missing().length) return { ok: false, reason: OH_REFUSAL, line: local, source: "on-device" };
      let reply = null;
      try { reply = await transport({ endpoint: config.endpoint, model: config.model, agent: agent.id, event }); } catch (_) { reply = null; }
      const text = typeof reply?.text === "string" ? reply.text.slice(0, 400) : "";
      if (text && ohGrounded(text, event).ok) return { ok: true, line: text, source: "configured" };
      return { ok: true, line: local, source: "on-device", note: "the reply carried a fact the event does not, so the on-device line is spoken" };
    },
  };
}
