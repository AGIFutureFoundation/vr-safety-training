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
//   ohSay(agent, event, { neutral, lang, variety, recent }) -> string   event: { type | about, t, jobId, to, siteName, task, reason, score, steps, lines, bid, z }
//     lang is "en" (the default) or "es"; an agent from ohAgentIn(agent, lang) speaks its own language (its style, padding and voice).
//   HIVE-4 (loop 10 round 4): the talk kinds (OH_CORES_TALK: an opener and a reply at a handoff, a question about a bid and its
//     answer, the auditor's report and the dispatcher's acknowledgement) and the day's memory (two sentences: the count, then the
//     site and the hive-clock time of the last one), slotted from the event: toName, hops, load, skill, count, kinds, lastSite,
//     clock. `variety: true` adds more cores, openers, closers and padding of the same kinds and skips any part used in the
//     agent's `recent` lines when another fits; without it the output is byte-identical to round 3's.
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

/** HIVE-6: the morning briefing's kinds. Facts come from the event: the queue's counts, the first award, the chain's length. */
export const OH_CORES_BRIEF = Object.freeze({
  brief_open: ["Good morning: {count} jobs on today's queue, {first} in the first hour", "Good start: {count} jobs today, {first} arriving in the first hour", "Today's queue holds {count} jobs, {first} of them in the first hour"],
  brief_first: ["My first job is {job} at {site}: {task}", "First up for me is {job} at {site}", "I start with {job} at {site}"],
  brief_steward: ["I review each job the governor allows, {count} on the queue today", "Every job the governor allows comes past me, {count} on today's queue"],
  brief_keeper: ["{supervisor} has a standing approval for simulated jobs, and a physical robot still needs a decision", "Simulated jobs run under the standing approval of {supervisor}; a physical robot needs a decision"],
  brief_keeper_sup: ["{supervisor} approves every job before it runs today", "Every job waits for {supervisor} before it runs today"],
  brief_auditor: ["I re-walk the chain every {every} closed jobs, starting from line {lines}", "Chain check every {every} closed jobs, from line {lines} on"],
  brief_none: ["Nothing on my board in the first {window} minutes; I am ready at {site}", "No job for me in the first {window} minutes, ready at {site}"],
  // HIVE-7: a one-line correction when the day's first award differs from what the briefing said (after the learner's approval)
  brief_fix: ["Change of plan, I start with {job} at {site}", "My first job is now {job} at {site}"],
  brief_fix_q: ["Change of plan, I start with {job} at {site}", "My first job is now {job} at {site}"],
});
export const OH_CORES_BRIEF_ES = Object.freeze({
  brief_open: ["Buenos días: {count} trabajos en la cola de hoy, {first} en la primera hora", "La cola de hoy tiene {count} trabajos, {first} en la primera hora"],
  brief_first: ["Mi primer trabajo es {job} en {site}", "Empiezo con {job} en {site}"],
  brief_steward: ["Reviso cada trabajo que el gobernador permite, {count} en la cola de hoy"],
  brief_keeper: ["{supervisor} tiene una aprobación vigente para trabajos simulados; un robot físico necesita una decisión"],
  brief_keeper_sup: ["{supervisor} aprueba cada trabajo antes de que se ejecute hoy"],
  brief_auditor: ["Reviso la cadena cada {every} trabajos cerrados, desde la línea {lines}"],
  brief_none: ["Nada en mi tablero en los primeros {window} minutos; listo en {site}"],
  brief_fix: ["Cambio de plan, empiezo con {job} en {site}", "Mi primer trabajo ahora es {job} en {site}"],
  brief_fix_q: ["Cambio de plan, empiezo con {job} en {site}", "Mi primer trabajo ahora es {job} en {site}"],
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

/**
 * HIVE-4: what agents say TO each other (each kind names its addressee as {toName}) and the day's memory. Every number, id, site
 * and name is a slot filled from the event (oh-hive.js fills them from the award, the winner's bid, the chain check and the hive's
 * own chain); a template carries no fact of its own. Each kind has variants short enough for its speakers' bands.
 */
export const OH_CORES_TALK = Object.freeze({
  handoff: ["{toName}, {job} at {site} is yours", "{toName}, please take {job} for {site}", "Over to you, {toName}: {job} at {site}", "{job} at {site} goes to you, {toName}, bid {bid}"],
  confirm: ["Confirmed, {toName}: I have {job} at {site}", "Got it, {toName}, {job} for {site} is with me", "Thanks, {toName}, I will take {job} at {site}", "{job} at {site} is mine, {toName}"],
  question_far: ["{toName}, your bid of {bid} on {job} comes from {hops} hops out; is it sound?", "{toName}, you are {hops} hops from {site}; why bid {bid} on {job}?", "{toName}, {job} is {hops} hops from you; can your bid of {bid} hold?", "{toName}, {site} is {hops} hops off; is {bid} on {job} right?", "A question, {toName}: why travel {hops} hops for {job} at {bid}?"],
  question_load: ["{toName}, you carry a load of {load}; why bid {bid} on {job}?", "{toName}, with a load of {load}, can you take {job} at {site}?", "{toName}, your load is {load}; is a bid of {bid} on {job} wise?", "{toName}, you hold a load of {load} already; will {job} at {site} fit?", "A question, {toName}: a load of {load} and a bid of {bid} on {job}?"],
  answer: ["{toName}, my skill for this task is {skill}, so {bid} still won", "Fair question, {toName}: skill {skill}, load {load}, {hops} hops, and no bid beat {bid}", "My skill here is {skill}, and {bid} was the top bid, {toName}", "{toName}, {bid} was the best bid on {job}, with skill {skill}", "It holds, {toName}: skill {skill} and the top bid at {bid}", "{toName}, no bid on {job} beat {bid}; my skill is {skill}"],
  report: ["{toName}, the chain after {job} holds {lines} lines, all intact", "{toName}, chain check done: {lines} lines, every one intact", "For you, {toName}: {lines} lines in the chain, none broken"],
  ack: ["Thanks, {toName}, {lines} intact lines noted on the board", "Noted, {toName}: {lines} lines checked, so the board keeps moving", "Good to hear, {toName}; {lines} lines intact and the queue goes on"],
  memory: ["That makes {count} {kinds} for me today", "Today I have done {count} {kinds} so far", "{count} {kinds} for me today, counting this one"],
  // HIVE-5: home after the last job (ohHive's homeward move). The site is the agent's home site, slotted from the move event.
  home: ["Heading back to {site}", "Back to {site} now", "Walking home to {site}", "Nothing left on my list, so back to {site}"],
});
/** HIVE-4: a second sentence for a kind (the memory's last site and its time on the hive clock; "reset" for cell entries and zone set-ups). */
export const OH_SECOND = Object.freeze({
  memory: ["The last was at {lastSite}, {clock} on the hive clock", "Last one: {lastSite}, {clock} hive time", "Before this, {lastSite} at {clock}"],
  memory_reset: ["I last reset {lastSite} at {clock} on the hive clock", "Last reset: {lastSite}, {clock} hive time", "The last one I reset was {lastSite}, at {clock} hive time"],
  brief_fix: ["The learner approved {approved} after the briefing", "That follows the approval of {approved} after the briefing"], // HIVE-7
  brief_fix_q: ["The queue moved after the briefing", "The queue changed since the briefing"],
});
/** HIVE-4 variety: more cores of the same kinds (used only with `variety: true`). */
export const OH_CORES_MORE = Object.freeze({
  announce: ["Fresh job {job} for {site}", "On the board now: {job} at {site}", "We have {job} waiting at {site}", "Incoming for {site}: {job}, {task}"],
  award: ["{job} for {site} is with me now", "I have {job} at {site}, bid {bid}"],
  move: ["Off to {site} for {job}", "Making my way to {site}, {job} in hand", "Bound for {site} to start {job}"],
  wait: ["{site} has a robot busy, so {job} holds", "{job} queues behind the running job at {site}"],
  dispatch: ["The simulated robot at {site} is running {job}", "{job} under way at {site}, simulated robot only", "Sim run for {job} begins at {site}"],
  complete: ["{job} closed out at {site}, score {score}", "Done with {job} at {site}: {score} in {steps} steps", "{site} reports {job} complete, scoring {score}"],
  refused: ["No run for {job} at {site}: the governor said {reason}", "The governor stopped {job} at {site} on {reason}"],
  veto: ["I hold {job} at {site} back: {reason}", "{job} at {site} gets my veto for {reason}"],
  approval: ["{job} at {site} asks for a physical robot, so the supervisor decides", "Supervisor, {job} at {site} names a physical robot; a simulated run or none?"],
  approved: ["{job} is cleared for the simulated robot at {site}, and only there", "The supervisor said yes to {job} at {site}, in the sim only"],
  declined: ["{job} at {site} stays closed: the supervisor declined it", "The supervisor said no to {job} at {site}, so it closes"],
  coach: ["{job} ended at {score} after {steps} steps; we look at {reason}", "Let us review {reason} on {job}: score {score}, {steps} steps"],
  audit: ["Chain walked after {job}: {lines} lines, all intact"],
});
/** HIVE-4 variety: more padding per agent (its own lexicon, by role key), more openers and closers of the same register and warmth. */
export const OH_PADS_MORE = Object.freeze({
  dispatcher: ["board is current", "next one up soon", "queue in good order"],
  "safety-steward": ["with the zone marked out", "after a fresh look", "with the stop in reach"],
  "maintenance-planner": ["kit checked twice", "rig prepped", "with the work order ready"],
  "consent-keeper": ["your call as always", "noted for you", "with your consent on record"],
  trainer: ["good effort all round", "learning as we go", "steady hands"],
  auditor: ["entry by entry", "as the log shows", "chain first"],
  logistics: ["carts lined up", "route set", "fast lane"],
});
export const OH_OPENER_MORE = Object.freeze({ "formal-warm": ["Pleased to say,", "Gladly,"], "formal-cool": ["For clarity,", "Logged:"], "casual-warm": ["Hey all,", "Alright team,"], "casual-cool": ["Okay then,", "Heads up:"] });
export const OH_CLOSER_MORE = Object.freeze({ "warm-careful": ["Thanks for checking with me", "Safe work, everyone"], "warm-brisk": ["Great going, all", "Nice one, team"], "cool-careful": ["Entered in the log", "Checked and closed"], "cool-brisk": ["Onward", "That is all"] });

/**
 * HIVE-4: the talk and the memory in Spanish, for the same slots as the English (machine-assisted, awaiting a native speaker's
 * review like the rest of the Spanish pack). Site names, job ids and agent names stay as the event has them; a task kind is named
 * from OH_TASK_NOUNS_ES by the event's task type, so a Spanish line keeps no English fragment but names.
 */
export const OH_CORES_TALK_ES = Object.freeze({
  handoff: ["{toName}, {job} en {site} es tuyo", "{toName}, toma {job} para {site}, por favor", "Te lo paso, {toName}: {job} en {site}", "{job} en {site} es para ti, {toName}, oferta {bid}"],
  confirm: ["Confirmado, {toName}: tengo {job} en {site}", "Entendido, {toName}, {job} para {site} queda conmigo", "Gracias, {toName}, me quedo con {job} en {site}", "{job} en {site} es mío, {toName}"],
  question_far: ["{toName}, tu oferta de {bid} por {job} viene de {hops} saltos; ¿es sólida?", "{toName}, estás a {hops} saltos de {site}; ¿por qué ofreces {bid} por {job}?", "{toName}, {job} está a {hops} saltos de ti; ¿se sostiene tu oferta de {bid}?", "{toName}, {site} queda a {hops} saltos; ¿es correcta la oferta de {bid}?", "Una pregunta, {toName}: ¿por qué viajar {hops} saltos por {job} con {bid}?"],
  question_load: ["{toName}, llevas una carga de {load}; ¿por qué ofreces {bid} por {job}?", "{toName}, con una carga de {load}, ¿puedes tomar {job} en {site}?", "{toName}, tu carga es {load}; ¿es prudente una oferta de {bid} por {job}?", "{toName}, ya llevas una carga de {load}; ¿cabe {job} en {site}?", "Una pregunta, {toName}: ¿una carga de {load} y una oferta de {bid} por {job}?"],
  answer: ["{toName}, mi habilidad para esta tarea es {skill}, así que {bid} ganó", "Buena pregunta, {toName}: habilidad {skill}, carga {load}, {hops} saltos, y ninguna oferta superó {bid}", "Mi habilidad aquí es {skill}, y {bid} fue la mejor oferta, {toName}", "{toName}, {bid} fue la mejor oferta por {job}, con habilidad {skill}", "Se sostiene, {toName}: habilidad {skill} y la mejor oferta, {bid}", "{toName}, ninguna oferta por {job} superó {bid}; mi habilidad es {skill}"],
  report: ["{toName}, la cadena tras {job} tiene {lines} líneas, todas intactas", "{toName}, revisión hecha: {lines} líneas, todas intactas", "Para ti, {toName}: {lines} líneas en la cadena, ninguna rota"],
  ack: ["Gracias, {toName}, anoto {lines} líneas intactas en el tablero", "Anotado, {toName}: {lines} líneas revisadas, el tablero sigue", "Qué bien, {toName}; {lines} líneas intactas y la cola sigue"],
  memory: ["Con este trabajo llevo {count} {kinds} hoy", "Hoy llevo {count} {kinds}, contando este trabajo", "Ya son {count} {kinds} para mí hoy"],
  home: ["Vuelvo a {site}", "Regreso a {site} ahora", "De vuelta a {site}", "No me queda nada pendiente, así que vuelvo a {site}"], // HIVE-5
});
export const OH_SECOND_ES = Object.freeze({
  memory: ["El trabajo anterior: {lastSite}, a las {clock}", "Antes: {lastSite}, a las {clock}", "Antes de este, {lastSite} a las {clock} de la colmena"],
  memory_reset: ["Reinicié por última vez {lastSite} a las {clock}", "Último reinicio: {lastSite}, {clock} en la colmena", "El último que reinicié fue {lastSite}, a las {clock}"],
  brief_fix: ["El aprendiz aprobó {approved} después de la reunión", "Sigue a la aprobación de {approved} tras la reunión"], // HIVE-7
  brief_fix_q: ["La cola cambió después de la reunión", "La cola se movió desde la reunión"],
});
/** HIVE-4: how a worker names a task kind in Spanish when it counts its day (by the event's task type). */
export const OH_TASK_NOUNS_ES = Object.freeze({ "rb-cell-entry": "entradas a la celda", "rb-cobot-zone-setup": "ajustes de zona", "rb-teleop-pick-place": "tareas de recoger y colocar", "rb-amr-fleet-routing": "rutas de almacén" });

/** The phrase packs by language: the cores, the reasons' calm phrases, the sentence that explains an approval request. */
export const OH_PACKS = Object.freeze({
  en: Object.freeze({ cores: OH_CORES, reasonPhrases: OH_REASON_PHRASES, approvalWhy: "the physical path is disabled, so only a simulated run is possible", fallbackPhrase: "a rule asked for it", talk: OH_CORES_TALK, second: OH_SECOND, more: OH_CORES_MORE, brief: OH_CORES_BRIEF }),
  es: Object.freeze({ cores: OH_CORES_ES, reasonPhrases: OH_REASON_PHRASES_ES, approvalWhy: "la vía física está desactivada, así que solo es posible una ejecución simulada", fallbackPhrase: "una regla lo pidió", talk: OH_CORES_TALK_ES, second: OH_SECOND_ES, taskNouns: OH_TASK_NOUNS_ES, brief: OH_CORES_BRIEF_ES }),
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
    // HIVE-4: the talk and memory slots (from the award, the winner's bid, the chain check and the hive's own chain).
    toName: ev.toName ?? "", hops: ev.hops ?? "", load: ev.load ?? "", skill: ev.skill ?? "", count: ev.count ?? "", first: ev.first ?? "", every: ev.every ?? "", window: ev.window ?? "", kinds: pack.taskNouns?.[ev.taskType] ?? ev.kinds ?? "", lastSite: ev.lastSite ?? "", clock: ev.clock ?? "",
    approved: ev.approved ?? "", // HIVE-7: the job the learner approved (the briefing's correction)
  };
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(slots[k] ?? ""));
}
// A sentence starts with a capital, unless it starts with an id (a job id stays exactly as the event has it).
function ohCap(s) { return /^[a-z]+-[0-9a-z]/.test(s) ? s : s.replace(/^\s*([a-z])/, (m, c) => m.replace(c, c.toUpperCase())); }
// After an opener, an ordinary capitalised word drops its capital; "I", ids and names keep theirs.
function ohAfterOpener(s, keep = []) { return /^(I\b|[A-Z][a-z]*[A-Z0-9-])/.test(s) || /^[A-Z][a-z]+ [A-Z]/.test(s) || keep.some((k) => k && s.startsWith(k)) ? s : s.replace(/^[A-Z]/, (c) => c.toLowerCase()); }
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
export function ohSay(agentIn, event = {}, { neutral = false, lang = null, variety = false, recent = null } = {}) {
  const want = ohLangFor(lang ?? agentIn?.lang ?? "en");
  // An agent asked for another language than its own is localised first (its style, padding and voice follow the language).
  const agent = agentIn && (agentIn.lang ?? "en") !== want ? ohAgentIn(agentIn, want) : agentIn;
  const pack = OH_PACKS[want];
  const kind = event.about ?? event.type;
  // HIVE-4: the talk kinds, the memory and the variety path are built by ohSayMore; round 3's kinds without variety stay below.
  if (agent && !neutral && (variety || (!pack.cores[kind] && (pack.talk?.[kind] || pack.brief?.[kind])))) return ohSayMore(agent, event, pack, kind, { variety, recent });
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

/** HIVE-4: the warmth and caution classes of a style (the same thresholds as ohStyleFromTraits). */
function ohClasses(agent) {
  const tr = agent?.traits ?? {};
  const warm = Number(tr.warmth ?? 0.5) >= 0.6, careful = Number(tr.caution ?? 0.5) >= 0.6;
  return { open: `${agent?.style?.register ?? "casual"}-${warm ? "warm" : "cool"}`, close: `${warm ? "warm" : "cool"}-${careful ? "careful" : "brisk"}` };
}
/** The longest literal run of a template (its words outside the slots): how a repeated template is recognised in recent lines. */
function ohLiteral(tpl) { return String(tpl).split(/\{\w+\}/).map((x) => x.replace(/^[\s,.:;?]+|[\s,.:;?]+$/g, "")).sort((a, b) => b.length - a.length)[0] ?? ""; }

/**
 * HIVE-4: a line for the talk kinds, the memory, or any kind with `variety`. The same grammar as ohSay (the band, the opener,
 * hedge and closer rates, padding from the agent's own lexicon), with more variants when `variety` is on, and with any variant,
 * opener, closer or pad already in the agent's `recent` lines skipped when another fits. Facts are slotted from the event only.
 */
function ohSayMore(agent, event, pack, kind, { variety = false, recent = null } = {}) {
  const tpls = [...(pack.cores[kind] ?? pack.talk?.[kind] ?? pack.brief?.[kind] ?? []), ...(variety ? pack.more?.[kind] ?? [] : [])];
  if (!tpls.length) return "";
  const st = agent.style ?? {};
  const band = st.band ?? [6, 14];
  const rnd = ohRng(ohFnv(`h4|${agent.id}|${kind}|${event.jobId ?? ""}|${event.t ?? 0}|${event.reason ?? ""}|${event.lines ?? ""}|${event.count ?? ""}|${event.toName ?? ""}`));
  const seen = (recent ?? []).join(" \n ").toLowerCase();
  const fresh = (xs, lit = (x) => x) => { if (!seen) return xs; const ys = xs.filter((x) => { const l = lit(x).toLowerCase(); return l.length < 4 || !seen.includes(l); }); return ys.length ? ys : xs; };
  const pick = (xs) => xs[Math.floor(rnd() * xs.length)];
  const cls = ohClasses(agent);
  const keep = [event.toName].filter(Boolean);
  // The core: a variant that fits the band and was not in the agent's recent lines (else the shortest).
  const all = tpls.map((tp) => ({ tp, text: ohFill(tp, event, pack) }));
  const fitting = all.filter((c) => ohWords(c.text).length <= band[1]);
  let core = (fitting.length ? pick(fresh(fitting, (c) => ohLiteral(c.tp))) : all.slice().sort((a, b) => ohWords(a.text).length - ohWords(b.text).length)[0]).text;
  const openers = fresh([...(st.openers ?? []), ...(variety && pack === OH_PACKS.en ? OH_OPENER_MORE[cls.open] ?? [] : [])]);
  if (openers.length && rnd() < st.openerRate) { const op = pick(openers); if (ohWords(`${op} ${core}`).length <= band[1]) core = `${op} ${ohAfterOpener(core, keep)}`; }
  if (OH_HEDGED.has(kind) && (st.hedges ?? []).length && rnd() < st.hedgeRate) {
    const h = pick(fresh(st.hedges));
    if (ohWords(`${core}, ${h}`).length <= band[1]) core = `${core}, ${h}`;
  }
  const allPads = [...(st.pad ?? []), ...(variety && pack === OH_PACKS.en ? OH_PADS_MORE[agent.key] ?? [] : []), ...(st.hedges ?? [])];
  const pads = fresh(allPads);
  // Fresh padding first; if the band's lower bound is still not reached, the agent's other pads (never one already in the sentence).
  const fit = (body) => { const a = ohFit(body, band, pads, rnd); return ohWords(a).length >= band[0] ? a : ohFit(a, band, allPads.filter((x) => !a.includes(x)), rnd); };
  const sentences = [ohEnd(ohCap(fit(core)))];
  // A second sentence: the reason's phrase (as in ohSay), or the memory's last site and time.
  if (OH_WHY.has(kind) && pack.reasonPhrases[event.reason]) sentences.push(ohEnd(ohCap(fit(kind === "approval" ? pack.approvalWhy : pack.reasonPhrases[event.reason]))));
  const second = pack.second?.[event.reset ? `${kind}_reset` : kind];
  if (second?.length) {
    const opts = second.map((tp) => ({ tp, text: ohFill(tp, event, pack) }));
    const fit2 = opts.filter((c) => ohWords(c.text).length <= band[1]);
    const s2 = (fit2.length ? pick(fresh(fit2, (c) => ohLiteral(c.tp))) : opts.slice().sort((a, b) => ohWords(a.text).length - ohWords(b.text).length)[0]).text;
    sentences.push(ohEnd(ohCap(fit(s2))));
  }
  const closers = fresh([...(st.closers ?? []), ...(variety && pack === OH_PACKS.en ? OH_CLOSER_MORE[cls.close] ?? [] : [])]);
  if (closers.length && rnd() < st.closerRate) sentences.push(ohEnd(ohCap(fit(pick(closers)))));
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
