// OMEGA-HIVE — the agents that manage the robots: who they are, how they speak, how they sound
// (docs/omega-hive.md, docs/consoles/OMEGA-HIVE.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// "Omega Hive" is the feature name for the agent collective. Every agent here is SOFTWARE and says so: a named
// persona with a role, a home robot site, a non-human avatar look (an av-sprites.js agent badge, never a face),
// four personality traits, a speaking style DERIVED from those traits, and on-device voice parameters. The names
// are invented (one first name each, no real person). Robots are simulated; every job an agent touches passes
// VBRIDGE's safety governor (shared/vb-governor.js), and anything that would touch the disabled physical path
// becomes a question for the human supervisor. No model or network call exists anywhere in the hive: lines are
// built on the device from the agent's style and the event's own data (shared/oh-say.js).
//
// Plain data and pure functions, no imports (AGENT-AVATARS builds against a fixture of this shape):
//   OH_AGENTS = [{ id, key, name, role, label: "software agent", homeSite: "rb-site-…", avatar: { glyph, accent, outfit },
//                  voice: { lang: "en-US", rate, pitch, prefer: [voice-name hints] },
//                  traits: { warmth, formality, verbosity, caution } (each in [0, 1]),
//                  style: ohStyleFromTraits(traits, lexicon), lexicon: { pad }, skills: { [taskType]: 0..1 } }]
//   ohStyleFromTraits(traits, lexicon) -> { band: [lo, hi] words per sentence, register, openers, closers, hedges, pad,
//                                           openerRate, closerRate, hedgeRate }
//   avatar.glyph is one of av-sprites.js AV_GLYPHS (so avAgentLook(glyph, accent) draws it); avatar.outfit is one of
//   OH_OUTFITS (AGENT-AVATARS' agent outfit set: a tablet, a visor, a high-visibility vest with a neutral glyph).
//
// Every top-level name starts with `oh`/`OH_` (the bundler shares one scope).

export const OH_SCHEMA = "smartcitix.holodeck.omega-hive@1";
export const OH_FEATURE = "Omega Hive";
export const OH_AGENT_LABEL = "software agent";
export const OH_OUTFITS = Object.freeze(["tablet", "visor", "hivis-vest"]);
export const OH_TRAITS = Object.freeze(["warmth", "formality", "verbosity", "caution"]);

/** Opener phrases by register (formal or casual) and warmth (warm or cool). A style draws two or three. */
export const OH_OPENER_POOLS = Object.freeze({
  "formal-warm": ["Good news, everyone:", "With thanks,", "Kindly note:", "If I may,"],
  "formal-cool": ["For the record,", "Noted:", "Confirming:", "Please note:"],
  "casual-warm": ["Hey team,", "Okay friends,", "Right then,", "Hi all,"],
  "casual-cool": ["Okay,", "Right,", "So,", "Quick one:"],
});

/** Closing sentences by warmth and caution (each a sentence of its own; padded to the speaker's band). */
export const OH_CLOSER_POOLS = Object.freeze({
  "warm-careful": ["Thanks for keeping it safe", "Thank you for your patience", "Glad we checked first"],
  "warm-brisk": ["Nice work, everyone", "Good teamwork", "Cheers, all"],
  "cool-careful": ["Logged and verified", "Recorded in the chain", "Nothing further"],
  "cool-brisk": ["Moving on", "Next", "Done here"],
});

/** Hedges by caution: careful speakers name the safeguard, brisk ones name the pace. */
export const OH_HEDGE_POOLS = Object.freeze({
  careful: ["on the simulated robot only", "with the e-stop in reach", "if the governor agrees", "under the site's limits"],
  brisk: ["without delay", "right away", "as quick as the rules allow"],
});

/** The words a reason id is said with (the id itself is slotted beside it, from the event). Calm wording. */
export const OH_REASON_PHRASES = Object.freeze({
  "estop-held": "the e-stop is held",
  "physical-target": "it names a physical robot, and that path is disabled",
  malformed: "a field the governor needs is missing",
  "unknown-site": "no robot site with that id exists in the sim",
  "task-not-allowed": "that task is not on the site's allowlist",
  "unregistered-policy": "the policy is not in the registry",
  "stale-policy": "the policy was trained on revoked data",
  "over-speed": "the speed is above the site's limit",
  "inside-separation": "a person is inside the separation distance",
  "rate-limited": "the agent sent more requests this minute than the limit allows",
  anomalous: "it sits far outside what the site has accepted before",
  "steward-veto": "the safety steward asked for a person to look first",
  "supervisor-declined": "the supervisor declined it",
  "near-limit-with-person": "a person is inside the warning distance and the speed is close to the reduced limit",
  "unusual-payload": "the payload is well above what the site usually accepts",
});

// ---- A second language (VOICES, loop 10 round 2). The hive speaks English by default and Spanish when the page's language is
// Spanish. A language has its own phrase cores (oh-say.js OH_CORES / OH_CORES_ES), its own style pools below (openers, closers,
// hedges, the reasons' calm phrases, each agent's padding lexicon) and its own voice language and preferred local voice names. The
// style GRAMMAR (the band of words per sentence, the rates) is derived from the traits exactly as in English. Facts (job ids, site
// names, scores, counts, reason ids) are slotted from the event and are the same in every language. Proper names stay in English.
export const OH_LANGS = Object.freeze({ en: Object.freeze({ tag: "en-US", name: "English" }), es: Object.freeze({ tag: "es-US", name: "Español" }) });
/** The hive's language for a page language code ("es", "es-MX", "en-GB", "fr"...): a language it speaks, else English. */
export function ohLangFor(code) { const c = String(code ?? "en").toLowerCase().split(/[-_]/)[0]; return Object.prototype.hasOwnProperty.call(OH_LANGS, c) ? c : "en"; }

export const OH_OPENER_POOLS_ES = Object.freeze({
  "formal-warm": ["Buenas noticias:", "Con gusto,", "Le informo:", "Si me permite,"],
  "formal-cool": ["Para el registro,", "Anotado:", "Confirmo:", "Atención:"],
  "casual-warm": ["Hola equipo,", "Muy bien, amigos,", "Bueno,", "Hola a todos,"],
  "casual-cool": ["Bien,", "Listo,", "Entonces,", "Dato rápido:"],
});
export const OH_CLOSER_POOLS_ES = Object.freeze({
  "warm-careful": ["Gracias por cuidar la seguridad", "Gracias por su paciencia", "Qué bueno que revisamos primero"],
  "warm-brisk": ["Buen trabajo, equipo", "Buen trabajo en conjunto", "Saludos a todos"],
  "cool-careful": ["Registrado y verificado", "Anotado en la cadena", "Sin más"],
  "cool-brisk": ["Sigo", "Siguiente", "Listo aquí"],
});
export const OH_HEDGE_POOLS_ES = Object.freeze({
  careful: ["solo en el robot simulado", "con la parada de emergencia a mano", "si el gobernador está de acuerdo", "dentro de los límites del sitio"],
  brisk: ["sin demora", "de inmediato", "tan rápido como permiten las reglas"],
});
export const OH_REASON_PHRASES_ES = Object.freeze({
  "estop-held": "la parada de emergencia está activada",
  "physical-target": "nombra un robot físico y esa vía está desactivada",
  malformed: "falta un campo que el gobernador necesita",
  "unknown-site": "en la simulación no existe un sitio con ese id",
  "task-not-allowed": "esa tarea no está en la lista del sitio",
  "unregistered-policy": "la política no está en el registro",
  "stale-policy": "la política se entrenó con datos revocados",
  "over-speed": "la velocidad supera el límite del sitio",
  "inside-separation": "hay una persona dentro de la distancia de separación",
  "rate-limited": "el agente envió más solicitudes de las que permite el límite",
  anomalous: "queda muy lejos de lo que el sitio ha aceptado",
  "steward-veto": "la persona de seguridad pidió que alguien mire primero",
  "supervisor-declined": "la persona supervisora lo rechazó",
  "near-limit-with-person": "hay una persona cerca y la velocidad roza el límite reducido",
  "unusual-payload": "la carga es mucho mayor de lo habitual en el sitio",
});
/** Each agent's own padding phrases in Spanish, and the local voice names it prefers for Spanish (an order; a name the device lacks is skipped). */
export const OH_PADS_ES = Object.freeze({
  dispatcher: ["siguiente en el tablero", "la cola sigue avanzando", "por orden de llegada", "tablero actualizado"],
  "safety-steward": ["con la protección cerrada", "con cada persona contada", "según la regla de separación", "con el bloqueo verificado"],
  "maintenance-planner": ["herramientas listas", "después de los controles de bloqueo", "repuestos en el carro", "torque y etiquetas revisados"],
  "consent-keeper": ["con su decisión respetada", "como usted acordó", "con la elección en sus manos", "guardado en este dispositivo"],
  trainer: ["con calma y firmeza", "paso a paso", "aprendemos de cada ejecución", "buena práctica en todo"],
  auditor: ["según la cadena", "hash por hash", "tal como se registró", "línea por línea"],
  logistics: ["cajas rodando", "pasillos libres", "salto rápido", "en movimiento"],
});
export const OH_PREFER_ES = Object.freeze({
  dispatcher: ["Jorge", "Juan", "Pablo"], "safety-steward": ["Monica", "Helena", "Paulina"], "maintenance-planner": ["Diego", "Raul", "Jorge"],
  "consent-keeper": ["Paulina", "Sabina", "Monica"], trainer: ["Sabina", "Helena", "Paulina"], auditor: ["Pablo", "Jorge", "Diego"], logistics: ["Juan", "Raul", "Diego"],
});
const OH_POOLS = { en: { opener: OH_OPENER_POOLS, closer: OH_CLOSER_POOLS, hedge: OH_HEDGE_POOLS }, es: { opener: OH_OPENER_POOLS_ES, closer: OH_CLOSER_POOLS_ES, hedge: OH_HEDGE_POOLS_ES } };

function ohSeedOf(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; }
function ohPick(pool, n, seed) { const out = []; const xs = pool.slice(); let s = seed >>> 0; while (out.length < n && xs.length) { s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0; out.push(xs.splice(s % xs.length, 1)[0]); } return out; }

/**
 * The speaking style, derived from the four traits (and the agent's own small lexicon of padding phrases, which a
 * style keeps verbatim). Pure and deterministic: tools/check_omega_hive.mjs re-derives every agent's style and
 * compares.
 *   verbosity -> the sentence-length band: lo = 4 + round(10 v) words, hi = lo + 6
 *   formality -> the register (formal at 0.6 and above), the opener pool with warmth, and how often an opener is used
 *   warmth    -> the closer pool with caution (warm at 0.6 and above), and how often a closer is used
 *   caution   -> the hedges (careful at 0.6 and above) and how often a hedge is used
 */
export function ohStyleFromTraits(traits = {}, lexicon = {}, lang = "en") {
  const P = OH_POOLS[lang] ?? OH_POOLS.en;
  const t = (k) => Math.min(1, Math.max(0, Number(traits[k] ?? 0.5)));
  const w = t("warmth"), f = t("formality"), v = t("verbosity"), c = t("caution");
  const lo = 4 + Math.round(10 * v);
  const register = f >= 0.6 ? "formal" : "casual";
  const warm = w >= 0.6;
  const careful = c >= 0.6;
  const seed = ohSeedOf(`${w}|${f}|${v}|${c}|${(lexicon.pad ?? []).join("/")}`);
  return Object.freeze({
    band: Object.freeze([lo, lo + 6]),
    register,
    openers: Object.freeze(ohPick(P.opener[`${register}-${warm ? "warm" : "cool"}`], 2 + (f >= 0.8 ? 1 : 0), seed)),
    closers: Object.freeze(ohPick(P.closer[`${warm ? "warm" : "cool"}-${careful ? "careful" : "brisk"}`], 2, seed >>> 3)),
    hedges: Object.freeze(ohPick(P.hedge[careful ? "careful" : "brisk"], 2, seed >>> 5)),
    pad: Object.freeze((lexicon.pad ?? []).slice()),
    openerRate: +(0.25 + 0.6 * f).toFixed(3),
    closerRate: +(0.15 + 0.6 * w).toFixed(3),
    hedgeRate: +(0.1 + 0.6 * c).toFixed(3),
  });
}

/** Voice parameters from the traits: careful speakers are a little slower, warm ones a little higher. */
export function ohVoiceFor(traits, prefer = []) {
  const rate = +(0.85 + 0.3 * (1 - traits.caution) + 0.1 * (1 - traits.verbosity)).toFixed(2);
  const pitch = +(0.85 + 0.35 * traits.warmth).toFixed(2);
  return Object.freeze({ lang: "en-US", rate, pitch, prefer: Object.freeze(prefer.slice()) });
}

// The seven agents. Names are invented first names (none is a real person, none repeats a GRIOT character). Each
// pad list is the agent's own small lexicon: phrases only that agent uses to fill a sentence to its band.
const OH_DEFS = [
  { id: "oh-dispatcher", key: "dispatcher", name: "Orrin", role: "Dispatcher: announces each robot job, collects the agents' bids and awards the job to the best-placed agent.",
    homeSite: "rb-site-west-oakland-warehouse", avatar: { glyph: "task", accent: 0xd8b86a, outfit: "tablet" },
    traits: { warmth: 0.55, formality: 0.45, verbosity: 0.35, caution: 0.5 }, skills: { "rb-amr-fleet-routing": 0.4, "rb-cobot-zone-setup": 0.2, "rb-teleop-pick-place": 0.2, "rb-cell-entry": 0.2 },
    prefer: ["Alex", "Daniel", "Fred"], lexicon: { pad: ["next on the board", "keeping the queue moving", "in order of arrival", "board updated"] } },
  { id: "oh-safety-steward", key: "safety-steward", name: "Selka", role: "Safety steward: reviews every job the governor allows and may veto it; a veto only ever adds a refusal.",
    homeSite: "rb-site-soma-robot-cell", avatar: { glyph: "governor", accent: 0xd8322c, outfit: "hivis-vest" },
    traits: { warmth: 0.4, formality: 0.8, verbosity: 0.6, caution: 0.95 }, skills: {},
    prefer: ["Karen", "Moira", "Tessa"], lexicon: { pad: ["with the guard closed", "with every person accounted for", "by the separation rule", "with lockout verified"] } },
  { id: "oh-maintenance-planner", key: "maintenance-planner", name: "Brann", role: "Maintenance planner: takes cell-entry and zone set-up jobs, plans lockout and keeps the rigs ready.",
    homeSite: "rb-site-orleans-warehouse", avatar: { glyph: "provider", accent: 0x3d9a4a, outfit: "visor" },
    traits: { warmth: 0.6, formality: 0.3, verbosity: 0.5, caution: 0.7 }, skills: { "rb-cell-entry": 1, "rb-cobot-zone-setup": 0.7, "rb-amr-fleet-routing": 0.3 },
    prefer: ["Tom", "Lee", "Rishi"], lexicon: { pad: ["tools staged", "after the lockout checks", "spares on the cart", "torque and tags checked"] } },
  { id: "oh-consent-keeper", key: "consent-keeper", name: "Ivo", role: "Consent keeper: asks the human supervisor wherever a person's say is needed, and keeps the consent records straight.",
    homeSite: "rb-site-richland-drilling-robot", avatar: { glyph: "guide", accent: 0x8fe3ff, outfit: "tablet" },
    traits: { warmth: 0.85, formality: 0.65, verbosity: 0.75, caution: 0.85 }, skills: {},
    prefer: ["Samantha", "Fiona", "Veena"], lexicon: { pad: ["with your say respected", "as you agreed", "with the choice left to you", "kept on this device"] } },
  { id: "oh-trainer", key: "trainer", name: "Tamsa", role: "Trainer: takes pick-and-place and zone set-up jobs, and coaches after every run that did not finish clean.",
    homeSite: "rb-site-san-jose-robotics-lab", avatar: { glyph: "tutor", accent: 0xe58fd1, outfit: "visor" },
    traits: { warmth: 0.95, formality: 0.2, verbosity: 0.65, caution: 0.55 }, skills: { "rb-teleop-pick-place": 1, "rb-cobot-zone-setup": 0.9, "rb-cell-entry": 0.4 },
    prefer: ["Victoria", "Allison", "Kate"], lexicon: { pad: ["nice and steady", "one step at a time", "we learn from every run", "good practice all round"] } },
  { id: "oh-auditor", key: "auditor", name: "Quen", role: "Auditor: re-walks the audit chain after jobs close and reports whether every line is intact.",
    homeSite: "rb-site-soma-robot-cell", avatar: { glyph: "evaluator", accent: 0x9aa7ff, outfit: "tablet" },
    traits: { warmth: 0.2, formality: 0.95, verbosity: 0.25, caution: 0.75 }, skills: {},
    prefer: ["Oliver", "Serena", "Bruce"], lexicon: { pad: ["per the chain", "hash by hash", "as recorded", "line by line"] } },
  { id: "oh-logistics", key: "logistics", name: "Lio", role: "Logistics: takes the warehouse and port routing jobs and moves totes between the robot sites.",
    homeSite: "rb-site-west-oakland-port-automation", avatar: { glyph: "client", accent: 0xf07a1f, outfit: "hivis-vest" },
    traits: { warmth: 0.65, formality: 0.15, verbosity: 0.15, caution: 0.4 }, skills: { "rb-amr-fleet-routing": 1, "rb-teleop-pick-place": 0.5 },
    prefer: ["Ralph", "Junior", "Aaron"], lexicon: { pad: ["totes rolling", "lanes clear", "quick hop", "on the move"] } },
];

/** The seven agents of the Omega Hive, frozen. */
export const OH_AGENTS = Object.freeze(OH_DEFS.map((d) => Object.freeze({
  id: d.id, key: d.key, name: d.name, role: d.role, label: OH_AGENT_LABEL, homeSite: d.homeSite,
  avatar: Object.freeze({ ...d.avatar }),
  voice: ohVoiceFor(d.traits, d.prefer),
  traits: Object.freeze({ ...d.traits }),
  style: ohStyleFromTraits(d.traits, d.lexicon),
  lexicon: Object.freeze({ pad: Object.freeze(d.lexicon.pad.slice()) }),
  skills: Object.freeze({ ...d.skills }),
})));

export function ohAgent(id) { return OH_AGENTS.find((a) => a.id === id || a.key === id) ?? null; }

const ohAgentInCache = new Map();
/**
 * The agent as it speaks in `lang`: the same persona, traits and skills, with the style derived from the traits over that language's
 * pools and the agent's padding lexicon in that language, and the voice asking for that language (rate and pitch unchanged, preferred
 * local voice names for that language). English returns the agent itself. A Spanish line is therefore never read by an English voice:
 * with no local Spanish voice the agent is silent and its caption still shows.
 */
export function ohAgentIn(agent, lang = "en") {
  const l = ohLangFor(lang);
  if (!agent) return agent;
  if (l === "en") return agent.lang && agent.lang !== "en" ? (OH_AGENTS.find((a) => a.id === agent.id) ?? agent) : agent;
  const key = `${agent.id}|${l}`;
  if (ohAgentInCache.has(key)) return ohAgentInCache.get(key);
  const pad = OH_PADS_ES[agent.key] ?? [];
  const out = Object.freeze({ ...agent, lang: l, style: ohStyleFromTraits(agent.traits, { pad }, l), lexicon: Object.freeze({ pad: Object.freeze(pad.slice()) }),
    voice: Object.freeze({ lang: OH_LANGS[l].tag, rate: agent.voice.rate, pitch: agent.voice.pitch, prefer: Object.freeze((OH_PREFER_ES[agent.key] ?? []).slice()) }) });
  ohAgentInCache.set(key, out);
  return out;
}

/** A chip word for each trait (for roster cards): a word for high, one for low, none in the middle. */
export function ohTraitChips(traits = {}) {
  const word = (k, hi, lo) => (traits[k] >= 0.6 ? hi : traits[k] <= 0.4 ? lo : null);
  return [word("warmth", "warm", "reserved"), word("formality", "formal", "casual"), word("verbosity", "detailed", "brief"), word("caution", "cautious", "brisk")].filter(Boolean);
}
