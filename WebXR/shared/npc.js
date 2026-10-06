// NPC characters that pass knowledge along (console GRIOT, docs/consoles/GRIOT.md).
//
// A griot keeps what was said and says it again, exactly. The characters here
// are journeyworkers, foremen, a levee inspector, a pilot, a teacher, a
// ranger, a nurse, a stagehand, a chef … placed at the worlds' sites with a
// small routine (work a spot on the pad, walk to a second spot, take a break,
// walk back), each carrying a knowledge pack that tools/gen_npc.mjs copied
// verbatim from the Guide's knowledge base, the union and standards
// registries and the catalog's station text — never written here. The
// dialogue engine is deterministic and on-device and has three moves: greet,
// teach one line with its source, hand off (a station link, a field lesson,
// a side quest or a treasure hint). An agent adapter in shared/
// agent-protocols.js's shape lets a deployment point a character at a model
// later; until every field is configured it refuses without touching the
// network, and even a configured reply is only spoken when it is one of the
// pack's own lines, verbatim.
//
// The figures come from shared/crew.js's avatar space (ctAvatarFigure, at
// most CT_AVATAR_BUDGET meshes each); movement is property writes on the
// group, the way shared/wildlife.js animates — animated only within
// GR_ANIMATE_RADIUS of the learner, hidden beyond GR_HIDE_RADIUS. The
// three.js module comes from the caller as `three`, so a bundle that never
// draws a figure never loads it. Every top-level name is prefixed `gr`/`GR_`
// (tools/bundle_webxr.py concatenates every module into one scope).

import { GR_ROSTER } from "./npc-data.js";
import { ctAvatarFigure, ctAvatarVariety, CT_AVATAR_BUDGET } from "./crew.js";
import { lkStationLink } from "./links.js";
import { avCharacter, avSpriteFor } from "./av-characters.js";

export const GR_ANIMATE_RADIUS = 150;
export const GR_HIDE_RADIUS = 600;
export const GR_TALK_RADIUS = 4;
export const GR_KEY = "KeyG";
export const GR_REFUSAL = "configure per the provider's current documentation";
const GR_WORK_BOB = 0.05;

// ------------------------------------------------------------------ roster

/** Every character, or those of one world ("bayworld", "summit", "redwood", "parish"). */
export function grCharacters(world = null) {
  return world ? GR_ROSTER.filter((c) => c.world === world) : GR_ROSTER.slice();
}
export function grCharacter(id) { return GR_ROSTER.find((c) => c.id === id) ?? null; }

/** The avatar style of a character: crew.js's crowd stepper with the role's PPE. */
export function grStyle(ch) { return ctAvatarVariety(ch.style?.i ?? 0, { ppe: ch.style?.ppe ?? null }); }

/** A human line naming where a line came from (for the panel's small print). */
export function grSourceLabel(src = {}) {
  if (src.kb) return `the Guide's notes (${src.kb})`;
  if (src.union) return `the union registry (${src.union})`;
  if (src.standard) return `the standards registry (${src.standard})`;
  if (src.station) return `the station "${src.station}"`;
  return "this platform's own pages";
}

// --------------------------------------------------------------- retrieval
// The Guide's own tokenizer and BM25 (shared/guide.js gdTokens/gdSearch), in
// miniature over one character's pack: a few lines, scored on the spot.

const grStop = new Set(("a an and are as at be by can could do does for from get go how i if in into is it its me my of on or please " +
  "show should tell than that the their them then there these this to up us was we what when where which who why will with would you your about any have has want take find open").split(" "));

export function grTokens(text) {
  const out = [];
  for (let w of String(text ?? "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/)) {
    if (!w || grStop.has(w)) continue;
    if (w.length > 4 && w.endsWith("ies")) w = w.slice(0, -3) + "y";
    else if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
    else if (w.length > 5 && w.endsWith("ed")) w = w.slice(0, -2);
    else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
    if (w.length > 4 && w.endsWith("e")) w = w.slice(0, -1);
    out.push(w);
  }
  return out;
}

/** The pack line that best answers a question, or null when nothing matches. */
export function grRetrieve(pack, question) {
  const q = [...new Set(grTokens(question))];
  if (!q.length || !pack?.length) return null;
  const docs = pack.map((l) => { const t = grTokens(l.topic), toks = [...t, ...t, ...grTokens(l.text)]; const tf = new Map(); for (const w of toks) tf.set(w, (tf.get(w) ?? 0) + 1); return { tf, len: toks.length }; });
  const df = new Map(); for (const d of docs) for (const w of d.tf.keys()) df.set(w, (df.get(w) ?? 0) + 1);
  const avg = docs.reduce((a, d) => a + d.len, 0) / docs.length, n = docs.length;
  const idf = (w) => { const d = df.get(w) ?? 0; return d ? Math.log(1 + (n - d + 0.5) / (d + 0.5)) : 0; };
  let best = null, bs = 0;
  docs.forEach((d, i) => {
    let s = 0, matched = 0;
    for (const w of q) { const f = d.tf.get(w); if (!f) continue; matched += 1; s += (idf(w) + 0.2) * (f * 2.2) / (f + 1.2 * (0.25 + 0.75 * d.len / avg)); }
    s *= 0.5 + 0.5 * (matched / q.length);
    if (s > bs) { bs = s; best = pack[i]; }
  });
  return best;
}

// ----------------------------------------------------------------- dialogue

const GR_NO_MATCH = "That is not in my notes, and I only pass along what is written down. Ask me about the work here, or ask the Guide.";

/**
 * The three moves, deterministic: greet (a template — role and place, no
 * fact), teach (one pack line, verbatim, with its source: the best match to
 * `question`, else the line at `seed`), hand off (the hand-off at `seed`).
 * Returns { greet, teach: { text, src, topic } | null, noMatch, handoff }.
 */
/** A role inside a sentence: ordinary words in lower case, a capitalised name or acronym kept ("K-12 teacher", "CDL driver"). */
export function grRoleText(role) { return String(role ?? "").replace(/\b([A-Z])([a-z])/g, (m, a, b) => a.toLowerCase() + b); }

export function grDialogue(ch, { question = "", seed = 0 } = {}) {
  const n = Math.max(0, Math.floor(seed));
  const where = ch.siteName ? ` at ${ch.siteName}` : "";
  const greet = `${ch.name} here — ${grRoleText(ch.role)}${where}. I only pass along what is written down; ask me about the work here.`;
  let teach = null, noMatch = false;
  if (String(question).trim()) { teach = grRetrieve(ch.pack, question); noMatch = !teach; }
  else if (ch.pack.length) teach = ch.pack[n % ch.pack.length];
  const handoff = ch.handoffs.length ? ch.handoffs[n % ch.handoffs.length] : null;
  return { greet, teach, noMatch, noMatchText: noMatch ? GR_NO_MATCH : null, handoff };
}

/**
 * Resolve a hand-off for a page: a station opens through links.js, a lesson
 * through the world's own opener (`hooks.openLesson(id)`) or its K-12 station
 * link, a quest through `hooks.openQuest(id)` or the quest log's key, a
 * treasure as its hint (the ledger's own line, never a location).
 * Returns { kind, id, label, href?, action?, text }.
 */
export function grResolveHandoff(h, hooks = {}) {
  if (!h) return null;
  const from = hooks.from ?? null, page = hooks.page ?? null, runner = hooks.runner ?? "../smartcity/index.html";
  if (h.kind === "station") return { ...h, href: lkStationLink(h.id, { runner, from, page, siteId: h.siteId ?? null }), text: `Take the ${h.label} station.` };
  if (h.kind === "lesson") {
    const open = typeof hooks.openLesson === "function" ? () => hooks.openLesson(h.id) : null;
    return { ...h, action: open, href: open ? null : lkStationLink(h.station, { runner, from, page }), text: `There is a field lesson nearby: ${h.label}.` };
  }
  if (h.kind === "quest") {
    const open = typeof hooks.openQuest === "function" ? () => hooks.openQuest(h.id) : null;
    return { ...h, action: open, text: `A quest is posted here: ${h.label}.${open ? "" : ` Open the quest log.`}` };
  }
  if (h.kind === "treasure") return { ...h, text: `A hint, if you like hunting: ${h.hint}` };
  return { ...h, text: h.label ?? "" };
}

// ------------------------------------------------------------ agent adapter

/**
 * An adapter in shared/agent-protocols.js's shape for one character. Fields
 * start unset; `respond()` refuses — nothing sent — while any is unset. A
 * configured endpoint is posted the turn and the pack, and its reply is
 * spoken only when it is one of the pack's lines verbatim (`grAcceptHosted`);
 * otherwise the on-device dialogue speaks. `describe()` never guesses.
 */
export function grAcceptHosted(ch, text) {
  const t = String(text ?? "").trim();
  return ch.pack.find((l) => l.text === t) ?? null;
}

export function grAgentAdapter(ch, { fetchImpl } = {}) {
  const fields = ["endpoint", "model"];
  const config = { endpoint: null, model: null };
  const missing = () => fields.filter((f) => config[f] == null || config[f] === "");
  return {
    id: `npc:${ch.id}`, fields: [...fields],
    describe() { const m = missing(); return { id: `npc:${ch.id}`, character: ch.id, fields: [...fields], config: { ...config }, configured: m.length === 0, missing: m }; },
    configure(next = {}) { for (const f of fields) if (f in next) config[f] = next[f] ?? null; return this.describe(); },
    async respond(turn = {}) {
      const local = grDialogue(ch, turn);
      if (missing().length) return { ok: false, provider: `npc:${ch.id}`, reason: GR_REFUSAL, missing: missing(), fallback: local };
      const fetchFn = fetchImpl ?? (typeof fetch === "function" ? fetch : null);
      if (!fetchFn) return { ok: false, provider: `npc:${ch.id}`, reason: "This environment cannot reach the network.", fallback: local };
      try {
        const res = await fetchFn(config.endpoint, { method: "POST", mode: "cors", credentials: "omit", headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "respond", model: config.model, character: { id: ch.id, name: ch.name, role: ch.role }, pack: ch.pack, turn }) });
        let body = null; try { body = await res.json(); } catch { /* no body */ }
        const line = grAcceptHosted(ch, body?.text);
        return { ok: !!res?.ok && !!line, provider: `npc:${ch.id}`, status: res?.status ?? null, teach: line ?? local.teach, hosted: !!line, fallback: local };
      } catch (err) { return { ok: false, provider: `npc:${ch.id}`, reason: err?.message ?? "the request failed", fallback: local }; }
    },
  };
}

// --------------------------------------------------------------- placement

/** Normalise a world's site record: `{ id, name, kind?, position | at }` → `{ id, name, kind, pos: [x, z] }`. */
export function grSiteOf(s) {
  const p = s.position ?? s.at ?? s.pos ?? [0, 0];
  return { id: s.id, name: s.name, kind: s.kind ?? null, pos: [p[0], p.length === 3 ? p[2] : p[1]], raw: s };
}

/**
 * Site-kind spellings the parish modules use for the roster's kinds (ASSAYER, the Bayou run): PARISH's Orleans says
 * `pump`, `streetcar`, `rail`; DELTA's parishes say `pumping-station`. A kind maps to itself when it is not listed.
 */
export const GR_PARISH_KIND_ALIAS = { pump: "pump-station", "pumping-station": "pump-station", streetcar: "streetcar-barn", rail: "rail-yard", events: "stadium", seawall: "levee",
  // BAYMAP's Oakland kinds: a K-12 school is the teacher's campus, a community clinic the nurse's hospital, a shoreline
  // the ranger's wetland, and the storm-drain utility yard (stormwater outfalls) the drainage pump operator's station.
  school: "campus", clinic: "hospital", shoreline: "wetland", utility: "pump-station",
  // A transit corridor or transit barn is the bus-lift mechanic's depot (the character's stations are bus lift stations).
  transit: "streetcar-barn", "transit-barn": "streetcar-barn" };

/** The site a character stands at among `sites` (by id, or by kind for a parish character), or null. */
export function grSiteFor(ch, sites) {
  const list = sites.map(grSiteOf);
  if (ch.site) return list.find((s) => s.id === ch.site) ?? null;
  if (ch.siteKind) return list.find((s) => s.kind === ch.siteKind) ?? list.find((s) => GR_PARISH_KIND_ALIAS[s.kind] === ch.siteKind) ?? null;
  return null;
}

/** The two routine points of a character at a site: [[x, z], [x, z]]. */
export function grRoutinePoints(ch, site) {
  const [sx, sz] = site.pos;
  return [[sx + ch.routine.work[0], sz + ch.routine.work[1]], [sx + ch.routine.rest[0], sz + ch.routine.rest[1]]];
}

/**
 * Where a character is in its loop at time t (seconds): work at A for
 * workSeconds, walk to B at speed, rest at B for restSeconds, walk back.
 * Pure; returns { x, z, yaw, phase: "work"|"walk"|"rest", bob }.
 */
export function grRoutineAt(ch, site, t) {
  const [A, B] = grRoutinePoints(ch, site);
  const r = ch.routine;
  const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const walk = Math.max(0.5, len / Math.max(0.1, r.speed));
  const period = r.workSeconds + walk + r.restSeconds + walk;
  let u = ((t % period) + period) % period;
  const face = (from, to) => Math.atan2(to[0] - from[0], to[1] - from[1]);
  if (u < r.workSeconds) return { x: A[0], z: A[1], yaw: face(A, site.pos), phase: "work", bob: Math.abs(Math.sin(u * 2.4)) * GR_WORK_BOB };
  u -= r.workSeconds;
  if (u < walk) { const k = u / walk; return { x: A[0] + (B[0] - A[0]) * k, z: A[1] + (B[1] - A[1]) * k, yaw: face(A, B), phase: "walk", bob: Math.abs(Math.sin(u * 6)) * 0.04 }; }
  u -= walk;
  if (u < r.restSeconds) return { x: B[0], z: B[1], yaw: face(B, A), phase: "rest", bob: 0 };
  u -= r.restSeconds;
  const k = u / walk;
  return { x: B[0] + (A[0] - B[0]) * k, z: B[1] + (A[1] - B[1]) * k, yaw: face(B, A), phase: "walk", bob: Math.abs(Math.sin(u * 6)) * 0.04 };
}

/** Build one character's figure (crew.js) into a new group, feet at y = 0. */
export function grBuildFigure(three, ch) {
  const g = ctAvatarFigure(three, grStyle(ch));
  g.userData.npc = { id: ch.id, name: ch.name, role: ch.role };
  g.name = `npc-${ch.id}`;
  return g;
}

// ------------------------------------------------------------------ the DOM

// A real page, not the checkers' DOM stub (which has createElement alone).
const grHasDom = typeof document !== "undefined" && typeof document.getElementById === "function" && !!document.body && typeof addEventListener === "function";
const grEsc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const GR_CSS = `
#gr-prompt{position:fixed;left:50%;bottom:calc(120px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9980;max-width:calc(100vw - 32px);
  padding:8px 14px;border-radius:20px;background:rgba(8,22,32,.88);color:#fff;border:1px solid rgba(160,210,235,.5);font:600 14px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif;
  display:flex;gap:10px;align-items:center}
#gr-prompt[hidden]{display:none}
#gr-prompt button{min-height:36px;min-width:64px;border-radius:18px;border:1px solid rgba(160,210,235,.6);background:#8fe3ff;color:#0b1a24;font:700 14px system-ui,sans-serif;cursor:pointer}
#gr-panel{position:fixed;z-index:9996;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(440px,calc(100vw - 24px));max-height:min(70vh,560px);
  display:flex;flex-direction:column;background:#0b1a24;color:#eef7fb;border:1px solid rgba(160,210,235,.45);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.5);
  font:15px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden}
#gr-panel[hidden]{display:none}
#gr-panel header{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid rgba(160,210,235,.25)}
#gr-panel h2{margin:0;font-size:16px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#gr-panel .gr-face{display:inline-flex;flex:none;border-radius:50%;overflow:hidden}#gr-panel .gr-face svg{display:block}
#gr-panel .gr-log{flex:1;overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:8px}
#gr-panel .gr-msg{padding:8px 10px;border-radius:10px;background:#12303f;overflow-wrap:anywhere}
#gr-panel .gr-msg.gr-you{align-self:flex-end;background:#1d4a5e}
#gr-panel .gr-src{display:block;margin-top:4px;font-size:12px;color:#b9d3de}
#gr-panel .gr-hand{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
#gr-panel .gr-hand a,#gr-panel .gr-hand button{color:#0b1a24;background:#8fe3ff;border-radius:14px;padding:6px 12px;min-height:36px;text-decoration:none;font-weight:600;font-size:14px;border:0;cursor:pointer}
#gr-panel form{display:flex;gap:6px;padding:10px 12px;border-top:1px solid rgba(160,210,235,.25)}
#gr-panel input{flex:1;min-width:0;font:16px system-ui,sans-serif;padding:8px 10px;border-radius:8px;border:1px solid rgba(160,210,235,.5);background:#07131b;color:#fff}
#gr-panel button{font:600 14px system-ui,sans-serif;min-height:36px;min-width:36px;padding:0 10px;border-radius:8px;border:1px solid rgba(160,210,235,.5);background:#12303f;color:#fff;cursor:pointer}
#gr-panel a:focus-visible,#gr-panel button:focus-visible,#gr-panel input:focus-visible,#gr-prompt button:focus-visible{outline:3px solid #ffd166;outline-offset:2px}
`;

/** The panel's body for one dialogue, as HTML (pure; the checker renders it headless). */
export function grRenderDialogueHtml(ch, d, resolved = null) {
  const parts = [`<div class="gr-msg">${grEsc(d.greet)}</div>`];
  if (d.teach) parts.push(`<div class="gr-msg">${grEsc(d.teach.text)}<span class="gr-src">— from ${grEsc(grSourceLabel(d.teach.src))}</span></div>`);
  else if (d.noMatchText) parts.push(`<div class="gr-msg">${grEsc(d.noMatchText)}</div>`);
  const h = resolved ?? grResolveHandoff(d.handoff);
  if (h) {
    const btn = h.href ? `<a href="${grEsc(h.href)}" data-handoff="${grEsc(h.kind)}:${grEsc(h.id)}">${grEsc(h.kind === "station" ? "Start" : h.kind === "lesson" ? "Open the lesson" : h.kind === "quest" ? "Open the quest" : "Noted")}</a>`
      : h.action ? `<button type="button" data-handoff="${grEsc(h.kind)}:${grEsc(h.id)}">${grEsc(h.kind === "lesson" ? "Open the lesson" : "Open the quest")}</button>` : "";
    parts.push(`<div class="gr-msg">${grEsc(h.text)}${btn ? `<div class="gr-hand">${btn}</div>` : ""}</div>`);
  }
  return parts.join("");
}

function grInjectCss() {
  if (!grHasDom || document.getElementById("gr-style")) return;
  const s = document.createElement("style"); s.id = "gr-style"; s.textContent = GR_CSS; document.head.appendChild(s);
}

// ------------------------------------------------------------------- mount

/**
 * Mount the characters of `world` into a page. hooks:
 *   three      the three.js module (required to draw figures)
 *   root       the group to add figures to
 *   sites      the world's site records ({ id, name, kind?, position | at })
 *   groundAt   (x, z) → y (default 0)
 *   pos        () → [x, z] of the learner, or null when not playing
 *   from, page, runner   for links.js (the way home)
 *   openLesson(id), openQuest(id)   the world's own openers (optional)
 *   keys       false to skip the G key and the prompt (default true)
 *   onTalk(entry)  called when a dialogue opens (optional)
 * Returns { world, characters: [{ ch, site, figure, points }], animate(t, dt),
 * near(x, z), talk(entry, question?), close(), open, dispose() }.
 */
export function grMount(world, hooks = {}) {
  const worldKey = String(world).startsWith("parish") ? "parish" : String(world);
  const three = hooks.three ?? null;
  const groundAt = typeof hooks.groundAt === "function" ? hooks.groundAt : () => 0;
  const sites = hooks.sites ?? [];
  const characters = [];
  for (const ch of grCharacters(worldKey)) {
    const site = grSiteFor(ch, sites);
    if (!site) continue;
    const points = grRoutinePoints(ch, site);
    let figure = null;
    if (three && hooks.root) {
      figure = grBuildFigure(three, ch);
      const p = grRoutineAt(ch, site, 0);
      figure.position.set(p.x, groundAt(p.x, p.z), p.z); figure.rotation.y = p.yaw;
      hooks.root.add(figure);
    }
    characters.push({ ch, site, figure, points, phase: "work", x: points[0][0], z: points[0][1], offset: (ch.style?.i ?? 0) * 3.7 });
  }
  let clock = 0;
  let open = null;

  function animate(t, dt = 0) {
    clock = t;
    const here = hooks.pos?.() ?? null;
    for (const e of characters) {
      const p = grRoutineAt(e.ch, e.site, t + e.offset);
      e.x = p.x; e.z = p.z; e.phase = p.phase;
      if (!e.figure) continue;
      const d = here ? Math.hypot(here[0] - p.x, here[1] - p.z) : 0;
      e.figure.visible = d <= GR_HIDE_RADIUS;
      if (d > GR_ANIMATE_RADIUS) continue;
      if (open?.entry === e) { // a character being spoken to turns to the learner and stands still
        e.figure.rotation.y = here ? Math.atan2(here[0] - e.figure.position.x, here[1] - e.figure.position.z) : p.yaw;
        continue;
      }
      e.figure.position.set(p.x, groundAt(p.x, p.z) + p.bob, p.z);
      e.figure.rotation.y = p.yaw;
    }
  }

  /** The character within GR_TALK_RADIUS of (x, z), nearest first, or null. */
  function near(x, z, r = GR_TALK_RADIUS) {
    let best = null, bd = r;
    for (const e of characters) {
      const fx = e.figure ? e.figure.position.x : e.x, fz = e.figure ? e.figure.position.z : e.z;
      const d = Math.hypot(x - fx, z - fz);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  // The DOM: a prompt when a character is near, the panel when talking.
  let prompt = null, panel = null, visits = 0;
  function ensureDom() {
    if (!grHasDom || panel) return;
    grInjectCss();
    prompt = document.createElement("div"); prompt.id = "gr-prompt"; prompt.hidden = true; prompt.className = "gd-avoid";
    prompt.innerHTML = `<span class="gr-prompt-text"></span><button type="button" id="gr-talk" aria-label="Talk">Talk</button>`;
    prompt.querySelector("#gr-talk").addEventListener("click", () => { const e = near(...(hooks.pos?.() ?? [Infinity, Infinity])); if (e) talk(e); });
    panel = document.createElement("section"); panel.id = "gr-panel"; panel.hidden = true; panel.className = "gd-avoid";
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "false"); panel.setAttribute("aria-labelledby", "gr-title");
    panel.innerHTML = `<header><span id="gr-face" class="gr-face" aria-hidden="true"></span><h2 id="gr-title"></h2><button type="button" id="gr-close" aria-label="Close">Close</button></header>
<div class="gr-log" aria-live="polite"></div>
<form id="gr-form"><label for="gr-q" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">Ask about the work here</label>
<input id="gr-q" type="text" autocomplete="off" placeholder="Ask about the work here…" enterkeyhint="send"><button type="submit" id="gr-send">Ask</button></form>`;
    panel.querySelector("#gr-close").addEventListener("click", close);
    panel.querySelector("#gr-form").addEventListener("submit", (ev) => { ev.preventDefault(); const q = panel.querySelector("#gr-q"); const text = q.value; q.value = ""; if (open && text.trim()) ask(text); });
    // Keys typed in the panel stay in the panel: the world behind never walks while you type.
    panel.addEventListener("keydown", (ev) => { if (ev.key === "Escape") { ev.preventDefault(); close(); } ev.stopPropagation(); });
    panel.addEventListener("keyup", (ev) => ev.stopPropagation());
    document.body.appendChild(prompt); document.body.appendChild(panel);
  }

  function say(html, you = false) {
    const log = panel.querySelector(".gr-log");
    const div = document.createElement("div");
    if (you) { div.className = "gr-msg gr-you"; div.textContent = html; } else { div.innerHTML = html; }
    log.appendChild(div); log.scrollTop = log.scrollHeight;
  }
  function wireHandoff(resolved) {
    if (!resolved?.action) return;
    panel.querySelector(`[data-handoff="${resolved.kind}:${resolved.id}"]`)?.addEventListener("click", () => { close(); resolved.action(); });
  }

  /** Open the dialogue with a character (the three moves; `question` retrieves a line instead of the seeded one). */
  function talk(entry, question = "") {
    if (!entry) return null;
    visits += 1;
    const d = grDialogue(entry.ch, { question, seed: visits - 1 });
    const resolved = grResolveHandoff(d.handoff, hooks);
    open = { entry, dialogue: d, resolved };
    if (grHasDom) {
      ensureDom();
      panel.querySelector("#gr-title").textContent = `${entry.ch.name} · ${entry.ch.role}`;
      const face = panel.querySelector("#gr-face");
      if (face) face.innerHTML = avSpriteFor(avCharacter(entry.ch.id), { kind: "token", size: 36 });
      panel.querySelector(".gr-log").innerHTML = grRenderDialogueHtml(entry.ch, d, resolved);
      wireHandoff(resolved);
      panel.hidden = false; prompt.hidden = true;
      panel.querySelector("#gr-q")?.focus();
    }
    hooks.onTalk?.(open);
    return open;
  }
  function ask(question) {
    if (!open) return null;
    const d = grDialogue(open.ch ?? open.entry.ch, { question, seed: visits });
    if (grHasDom && panel) {
      say(question, true);
      say(d.teach ? `<div class="gr-msg">${grEsc(d.teach.text)}<span class="gr-src">— from ${grEsc(grSourceLabel(d.teach.src))}</span></div>` : `<div class="gr-msg">${grEsc(d.noMatchText)}</div>`);
    }
    return d;
  }
  function close() { open = null; if (panel) panel.hidden = true; }

  let lastNear = null;
  function tick() { // the prompt follows the learner; the G key opens the talk
    if (!grHasDom || hooks.keys === false) return;
    const here = hooks.pos?.() ?? null;
    const e = here ? near(here[0], here[1]) : null;
    if (e !== lastNear) {
      lastNear = e;
      ensureDom();
      if (e && !open) { prompt.querySelector(".gr-prompt-text").textContent = `G — talk to ${e.ch.name}, ${grRoleText(e.ch.role)}`; prompt.hidden = false; }
      else prompt.hidden = true;
      if (!e && open) close();
    }
  }
  const onKey = (ev) => {
    if (ev.code !== GR_KEY || ev.repeat || ev.target?.tagName === "INPUT" || ev.target?.tagName === "TEXTAREA") return;
    const here = hooks.pos?.() ?? null;
    const e = here ? near(here[0], here[1]) : null;
    if (e) { ev.preventDefault(); ev.stopImmediatePropagation(); if (open) close(); else talk(e); }
  };
  if (grHasDom && hooks.keys !== false) addEventListener("keydown", onKey, true);

  return {
    world: worldKey, characters,
    animate(t, dt = 0) { animate(t, dt); tick(); },
    near, talk, ask, close, get open() { return open; },
    meshCount() { let n = 0; for (const e of characters) e.figure?.traverse((o) => { if (o.isMesh) n += 1; }); return n; },
    dispose() { if (grHasDom) removeEventListener("keydown", onKey, true); for (const e of characters) e.figure?.parent?.remove(e.figure); prompt?.remove(); panel?.remove(); characters.length = 0; },
  };
}

/** The declared mesh ceiling for one mounted world's figures (a check_npc budget). */
export function grMeshBudget(world) { return grCharacters(world).length * CT_AVATAR_BUDGET; }
