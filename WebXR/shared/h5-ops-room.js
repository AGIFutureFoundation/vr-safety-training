// HIVE-5 — the hive in its own room (console `h5`, docs/consoles/HIVE-5.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// ENV-HD-4 built the hive's operations room (`hd4-hive-ops`): seven consoles in an arc facing a video wall, an agent spot behind
// each console (room.spots.agent, one per role) and a screens seam (hd4OpsScreens). This module fills the room from the hive:
// 1. The screens show the hive. Each console screen paints its agent's card: the name, the "software agent" label, the role, the
//    four traits as bars, the jobs it holds and its last lines. The video wall paints the day's feed (left panel) and the
//    governor's refusals with their reasons (right panel) with the day's counts. Everything is read from the hive's own events,
//    jobs and metrics (h5HiveModel), never invented, and drawn through hd4OpsScreens(room).paint(...). The canvases are the room's
//    own (ENV-HD-4 allocated and counted them), so painting adds no texture byte. Words appear only on the screens (the console's
//    own UI text), never on floors or walls. Small screens (balanced and the phone: 128 × 64 cells, a 256 × 64 wall) take the
//    agent's colour, the trait bars and a talk light; HIVE-6 adds a compact card in words there (name,
//    "software agent", the queue and its first job, the last line's head; the wall: the last captions and refusals by job id).
// 2. The hive stands in its room. When the learner enters, every agent that holds no job stands at its console's spot, facing the
//    video wall. An agent the hive gives a job walks out through the door and is released; when its last job ends it walks back in
//    to its console (h3RoomPresence, the rooms' own presence). The figures are AGENT-AVATARS' figures, lightened for this room by
//    h5LiteFigure (each primitive part rebuilt with fewer segments: the same parts, colours, label, visor and halo) so that seven
//    of them fit IX_BUDGET with the room. The phone tier builds no figures (AGENT-AVATARS' rule); balanced draws the label and
//    caption canvases at H5_OPS_TEXTURE_SCALE.balanced so the room stays inside IXR_TEX_BUDGET.
// Agents are software and say so: the figure's label, hologram tint, visor and halo come with it, and every card says "software
// agent". No network, no voice, no model call: this module positions figures and paints canvases from the hive's own data.
//
// SEAMS (every top-level name carries h5/H5_: the bundler shares one scope; three.js comes from the caller):
//   H5_OPS_TEXTURE_SCALE                 { high: 1, balanced: 0.35, low: 0 }: label and caption canvas scale in the ops room
//   H5_LITE_CAPS                         the segment caps h5LiteFigure applies, by geometry type
//   H5_SCREEN_TEXT                       the screens' own words by language (en, es)
//   h5IsOpsRoom(room)                    -> true for the hive operations room
//   h5LiteFigure(THREE, group, caps?)    -> { before, after } triangles; rebuilds each primitive part coarser, once per figure
//   h5HiveModel(source, agents)          -> { t, lang, metrics, card(agentId), feed(n), refusals(n) } from the hive's own data
//   h5PaintConsole(ctx, w, h, card, text?) and h5PaintWall(ctx, w, h, model, text?)
//   h5MountOpsRoom({ three, room, agents, source, tier, reducedMotion, mount, repaintMs })
//       -> { room, placed, avatars, presence, animate(t, dt), sync(), paint(), standing(), painted(), counts(), log(), dispose() } | null
//   hw-hive-world.js's hwSyncRoom hands the ops room to h5MountOpsRoom (the robot rooms keep hwMountRoomAgents).
//   HIVE-7: the figures show the mood. The mount listens for the hive's `mood` events (HIVE-6's moods option) and seeds each agent
//   from hive.mood(id) as the room opens; each figure's glow (the high tier's one glow mesh: visor band, eyes, halo, badge; the
//   balanced figure's halo) pulses in brightness only, by mood (H5_MOOD_GLOW: calm steady, busy a quick shallow pulse, concerned a
//   slow deeper one, relieved a slow faint one). The role colour's hue is unchanged, no geometry is added, nothing touches a face
//   or a bone (AVATARS-HD's posture is theirs), reduced motion holds the glow steady, and the phone tier builds no figure.
//   H5_MOOD_GLOW                         { calm, busy, concerned, relieved } -> { hz, depth } (brightness 1 - depth .. 1)
//   h5MoodGlow(mood, t, reducedMotion)   -> the glow's brightness factor at time t (seconds)
//   mount.moods()                        -> { [agentId]: { mood, cause, glow } } (glow: the factor last applied, or null unbuilt)

import { aaMountAgentAvatars } from "./aa-agent-avatars.js";
import { h3RoomPresence } from "./h3-hive-day.js";
import { HD4_OPS_STYLE, hd4OpsScreens } from "./hd4-rooms.js";
import { OH_AGENT_LABEL, OH_REASON_PHRASES } from "./oh-hive-data.js";
import { ohClock } from "./oh-hive.js";
import { VB_REASONS } from "./vb-shared-data.js";
import { RB_SITES } from "./rb-robotics-data.js";

export const H5_OPS_TEXTURE_SCALE = Object.freeze({ high: 1, balanced: 0.35, low: 0 });
export const H5_LITE_CAPS = Object.freeze({
  SphereGeometry: Object.freeze({ widthSegments: 8, heightSegments: 6 }),
  CapsuleGeometry: Object.freeze({ capSegments: 2, radialSegments: 6 }),
  CylinderGeometry: Object.freeze({ radialSegments: 6 }),
  ConeGeometry: Object.freeze({ radialSegments: 6 }),
  TorusGeometry: Object.freeze({ radialSegments: 3, tubularSegments: 12 }),
  CircleGeometry: Object.freeze({ segments: 8 }),
});
export const H5_SCREEN_TEXT = Object.freeze({
  en: Object.freeze({ queue: "Queue", none: "nothing held", lines: "Last lines", quiet: "no lines yet", feed: "Today's feed", refusals: "Governor refusals", noRefusals: "No refusals yet",
    by: { governor: "governor", steward: "safety steward", supervisor: "learner" },
    counts: (m) => [`Completed ${m.completed} · refused ${m.refused} · vetoed ${m.vetoed}`, `Dispatched jobs checked ${m.dispatchedChecked} of ${m.dispatched} · physical dispatches ${m.physicalDispatched}`],
    clock: (t) => `hive minute ${t} (${ohClock(t)})`, traits: ["warmth", "formality", "verbosity", "caution"] }),
  es: Object.freeze({ queue: "Cola", none: "nada pendiente", lines: "Últimas líneas", quiet: "aún sin líneas", feed: "Lo de hoy", refusals: "Rechazos del gobernador", noRefusals: "Aún sin rechazos",
    by: { governor: "gobernador", steward: "responsable de seguridad", supervisor: "aprendiz" },
    counts: (m) => [`Completados ${m.completed} · rechazados ${m.refused} · vetados ${m.vetoed}`, `Trabajos revisados ${m.dispatchedChecked} de ${m.dispatched} · envíos físicos ${m.physicalDispatched}`],
    clock: (t) => `minuto ${t} de la colmena (${ohClock(t)})`, traits: ["calidez", "formalidad", "locuacidad", "cautela"] }),
});

export const H5_MOOD_GLOW = Object.freeze({
  calm: Object.freeze({ hz: 0, depth: 0 }),
  busy: Object.freeze({ hz: 0.9, depth: 0.12 }),
  concerned: Object.freeze({ hz: 0.35, depth: 0.28 }),
  relieved: Object.freeze({ hz: 0.2, depth: 0.08 }),
});
/** The glow's brightness factor for a mood at time t (seconds): 1 when calm, unknown or reduced motion; never above 1. */
export function h5MoodGlow(mood, t = 0, reducedMotion = false) {
  const g = H5_MOOD_GLOW[mood];
  if (!g || reducedMotion || !g.hz || !g.depth) return 1;
  return 1 - g.depth * (0.5 - 0.5 * Math.cos(2 * Math.PI * g.hz * (Number(t) || 0)));
}
/** Set a figure's glow brightness (its own material's colour times k, from the colour it was built with). */
function h5ApplyGlow(fig, k) {
  const parts = fig?.userData?.parts ?? {};
  for (const m of [parts.glow, parts.halo]) {
    const c = m?.material?.color;
    if (!c || !Number.isFinite(c.r)) continue;
    const ud = (m.userData = m.userData ?? {});
    if (!ud.h7Base) ud.h7Base = [c.r, c.g, c.b];
    c.r = ud.h7Base[0] * k; c.g = ud.h7Base[1] * k; c.b = ud.h7Base[2] * k;
  }
}

export function h5IsOpsRoom(room) { return !!(room && room.id === HD4_OPS_STYLE); }

/** Lighten one figure for the ops room: each mesh's primitive geometry (sphere, capsule, cylinder, cone, torus, circle) rebuilt
 * with at most the caps' segments, the same parameters otherwise. The meshes, materials and transforms stay, so the avatar mount
 * still poses and shows every part. Done once per figure (group.userData.h5Lite). */
export function h5LiteFigure(THREE, group, caps = H5_LITE_CAPS) {
  if (!THREE || !group || typeof group.traverse !== "function") return null;
  if (group.userData?.h5Lite) return group.userData.h5Lite;
  const tris = (g) => Math.round((g?.index ? g.index.count : g?.attributes?.position?.count ?? 0) / 3);
  let before = 0, after = 0;
  group.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh) return;
    const g = o.geometry, t0 = tris(g); before += t0;
    const cap = caps?.[g?.type], Ctor = THREE[g?.type];
    if (!cap || typeof Ctor !== "function" || !g.parameters) { after += t0; return; }
    const p = { ...g.parameters }; let changed = false;
    for (const [k, v] of Object.entries(cap)) if (Number.isFinite(p[k]) && p[k] > v) { p[k] = v; changed = true; }
    let ng = null;
    if (changed) { try { ng = new Ctor(...Object.values(p)); } catch (_) { ng = null; } }
    if (!ng) { after += t0; return; }
    try { g.dispose?.(); } catch (_) { /* a stub geometry */ }
    o.geometry = ng; after += tris(ng);
  });
  group.userData = group.userData ?? {};
  group.userData.h5Lite = { before, after };
  return group.userData.h5Lite;
}

const h5Site = (id) => RB_SITES.find((s) => s.id === id)?.name ?? id;
const h5Why = (id) => VB_REASONS.find((r) => r.id === id)?.text ?? OH_REASON_PHRASES[id] ?? id ?? "";
const h5Try = (fn, d) => { try { const v = fn(); return v ?? d; } catch (_) { return d; } };

/** What the screens show, from the hive's own events, jobs, pending requests and metrics only. */
export function h5HiveModel(source, agents = []) {
  const ev = h5Try(() => source?.events?.(), []);
  const jobs = h5Try(() => source?.jobs?.(), []);
  const pend = h5Try(() => source?.pending?.(), []);
  const metrics = h5Try(() => source?.metrics?.(), null);
  const t = h5Try(() => source?.now?.(), ev.length ? ev[ev.length - 1].t : 0);
  const speaks = ev.filter((e) => e.type === "speak");
  const roster = agents ?? [];
  const lang = roster.find((a) => a?.lang)?.lang === "es" ? "es" : "en";
  return {
    t, lang, metrics,
    card(id) {
      const a = roster.find((x) => x?.id === id); if (!a) return null;
      const held = jobs.filter((j) => j.winner === id && ["queued", "moving", "running", "awaiting-approval"].includes(j.status)).map((j) => ({ jobId: j.jobId, site: h5Site(j.site), status: j.status }));
      const queue = a.key === "consent-keeper" ? pend.map((p) => ({ jobId: p.jobId, site: p.siteName ?? h5Site(p.to), status: p.reason })) : held;
      const mine = speaks.filter((e) => e.agent === id);
      const lines = mine.slice(-3).map((e) => ({ t: e.t, clock: ohClock(e.t), text: String(e.text ?? ""), to: e.toName ?? null, memory: !!e.memory }));
      return { id, name: a.name, label: a.label ?? OH_AGENT_LABEL, role: String(a.key ?? "").replace(/-/g, " "), key: a.key, accent: a.avatar?.accent ?? 0x7b6cf0, traits: a.traits ?? {}, queue, lines, spoke: mine.length, talking: !!mine.length && mine[mine.length - 1].t === t };
    },
    feed(n = 5) { return speaks.slice(-n).map((e) => ({ t: e.t, clock: ohClock(e.t), agent: e.agent, caption: String(e.caption ?? e.text ?? "") })); },
    refusals(n = 4) { return ev.filter((e) => e.type === "refused").slice(-n).map((e) => ({ t: e.t, clock: ohClock(e.t), jobId: e.jobId, site: e.siteName ?? h5Site(e.to), by: e.by ?? "", reason: e.veto ?? e.reason ?? "", why: h5Why(e.veto ?? e.reason) })); },
  };
}

const h5Hex = (n) => `#${(Number(n) >>> 0).toString(16).padStart(6, "0").slice(-6)}`;
/** The longest head of `text` that fits `maxW` (an ellipsis when cut). */
function h5Fit(g, text, maxW) {
  const s = String(text ?? "");
  const w = (x) => { const m = g.measureText?.(x); return Number.isFinite(m?.width) ? m.width : x.length * 7; };
  if (w(s) <= maxW) return s;
  let lo = 0, hi = s.length;
  while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); if (w(`${s.slice(0, mid)}…`) <= maxW) lo = mid; else hi = mid - 1; }
  return `${s.slice(0, lo).trimEnd()}…`;
}
/** Up to `max` lines of `text` wrapped to `maxW` (the last one cut with an ellipsis). */
function h5Wrap(g, text, maxW, max = 2) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean), out = [];
  if (max <= 1) return [h5Fit(g, words.join(" "), maxW)];
  const w = (x) => { const m = g.measureText?.(x); return Number.isFinite(m?.width) ? m.width : x.length * 7; };
  let cur = "";
  for (let i = 0; i < words.length; i += 1) {
    const next = cur ? `${cur} ${words[i]}` : words[i];
    if (w(next) <= maxW || !cur) { cur = next; continue; }
    out.push(cur); cur = words[i];
    if (out.length === max - 1) { cur = words.slice(i).join(" "); break; }
  }
  if (cur) out.push(cur);
  if (out.length > max) out.length = max;
  if (out.length) out[out.length - 1] = h5Fit(g, out[out.length - 1], maxW);
  return out;
}

/** One console screen: the agent's card (words on a large cell; colour, bars and a talk light on a small one). */
export function h5PaintConsole(g, w, h, card, text = H5_SCREEN_TEXT[card?.lang] ?? H5_SCREEN_TEXT.en) {
  g.fillStyle = "#0d1724"; g.fillRect(0, 0, w, h);
  if (!card) return 0;
  const acc = h5Hex(card.accent), band = Math.max(3, Math.round(h * 0.16));
  g.fillStyle = acc; g.fillRect(0, 0, w, band);
  const traits = ["warmth", "formality", "verbosity", "caution"];
  if (w < 256) { // HIVE-6: a small screen (balanced, 128 × 64): a compact card in words (name, "software agent", the queue and its
    // first job, the last line's head), the agent's colour, its trait bars and a talk light; the same canvas, no byte added
    const s2 = w / 128, fnt = (px, bold = false) => `${bold ? "700 " : ""}${Math.max(6, Math.round(px * s2))}px system-ui, sans-serif`;
    let n = 0; const say = (t, x, y, maxW) => { g.fillText(h5Fit(g, t, maxW), x, y); n += 1; };
    const hb = Math.max(band, Math.round(12 * s2)); g.fillStyle = acc; g.fillRect(0, 0, w, hb);
    g.textBaseline = "middle";
    g.fillStyle = "#0b1018"; g.font = fnt(10, true); say(card.name, 4 * s2, hb / 2, w * 0.6);
    g.fillStyle = "#c9d6e3"; g.font = fnt(8); say(card.label, 4 * s2, hb + 7 * s2, w - 8 * s2);
    g.fillStyle = "#e8eef4"; say(`${text.queue} ${card.queue.length}${card.queue[0] ? ` · ${card.queue[0].jobId}` : ""}`, 4 * s2, hb + 17 * s2, w - 8 * s2);
    const last = card.lines[card.lines.length - 1];
    g.fillStyle = "#b7c7d8"; g.font = fnt(7); say(last ? `${last.clock} ${last.text}` : text.quiet, 4 * s2, hb + 27 * s2, w - 8 * s2);
    traits.forEach((k, i) => { const v = Math.max(0, Math.min(1, Number(card.traits?.[k]) || 0)); g.fillStyle = "#24364a"; g.fillRect(w * 0.04, h * (0.8 + i * 0.05), w * 0.5, h * 0.03); g.fillStyle = acc; g.fillRect(w * 0.04, h * (0.8 + i * 0.05), w * 0.5 * v, h * 0.03); });
    g.fillStyle = card.talking ? "#8fe3ff" : "#3a4b5e"; g.beginPath(); g.arc(w * 0.88, h * 0.86, h * 0.08, 0, Math.PI * 2); g.fill();
    return n;
  }
  let words = 0;
  const S = w / 512; // 512 × 256 is the desktop high tier's cell
  const font = (px, bold = false) => `${bold ? "600 " : ""}${Math.round(px * S)}px system-ui, sans-serif`;
  const put = (s, x, y, maxW) => { const v = h5Fit(g, s, maxW); g.fillText(v, x, y); words += 1; return v; };
  g.textBaseline = "middle";
  g.fillStyle = "#0b1018"; g.font = font(22, true); put(card.name, 12 * S, band / 2, 150 * S);
  g.font = font(15, true); put(`${card.label} · ${card.role}`, 168 * S, band / 2, w - 180 * S);
  // the four traits as bars
  g.font = font(13);
  traits.forEach((k, i) => {
    const y = band + (22 + i * 24) * S, v = Math.max(0, Math.min(1, Number(card.traits?.[k]) || 0));
    g.fillStyle = "#9fb3c8"; put(text.traits[i] ?? k, 12 * S, y, 78 * S);
    g.fillStyle = "#24364a"; g.fillRect(92 * S, y - 5 * S, 70 * S, 10 * S); g.fillStyle = acc; g.fillRect(92 * S, y - 5 * S, 70 * S * v, 10 * S);
  });
  // the queue: the jobs it holds (the consent keeper: the learner's waiting requests)
  const qx = 178 * S, qw = w - qx - 12 * S;
  g.fillStyle = "#e8eef4"; g.font = font(14, true); put(`${text.queue} (${card.queue.length})`, qx, band + 20 * S, qw);
  g.font = font(13); g.fillStyle = "#c9d6e3";
  if (!card.queue.length) put(text.none, qx, band + 40 * S, qw);
  card.queue.slice(0, 2).forEach((q, i) => put(`${q.jobId} · ${q.site} · ${q.status}`, qx, band + (40 + i * 18) * S, qw));
  // the last lines
  const ly = band + 98 * S;
  g.fillStyle = "#37d6c0"; g.fillRect(12 * S, ly - 6 * S, w - 24 * S, Math.max(1, 1.5 * S));
  g.fillStyle = "#e8eef4"; g.font = font(14, true); put(text.lines, 12 * S, ly + 8 * S, 200 * S);
  g.font = font(13);
  if (!card.lines.length) { g.fillStyle = "#9fb3c8"; put(text.quiet, 12 * S, ly + 28 * S, w - 24 * S); }
  const rows = card.lines.slice(-3), lh = 17 * S;
  let y = ly + 28 * S;
  for (const [i, l] of rows.entries()) {
    g.fillStyle = i === rows.length - 1 ? "#ffffff" : "#b7c7d8";
    for (const part of h5Wrap(g, `${l.clock} ${l.text}`, w - 24 * S, i === rows.length - 1 ? 2 : 1)) { if (y > h - 6 * S) break; g.fillText(part, 12 * S, y); words += 1; y += lh; }
  }
  if (card.talking) { g.fillStyle = "#8fe3ff"; g.beginPath(); g.arc(w - 14 * S, band + 14 * S, 6 * S, 0, Math.PI * 2); g.fill(); }
  return words;
}

/** The video wall: the day's feed on the left panel, the governor's refusals and the day's counts on the right. */
export function h5PaintWall(g, w, h, model, text = H5_SCREEN_TEXT[model?.lang] ?? H5_SCREEN_TEXT.en, agents = []) {
  g.fillStyle = "#0b1420"; g.fillRect(0, 0, w, h);
  if (!model) return 0;
  const half = w / 2;
  const accent = (id) => h5Hex(agents.find((a) => a.id === id)?.avatar?.accent ?? 0x8fd3ff);
  if (w < 1024) { // HIVE-6: a small wall (balanced, 256 × 64): the feed's last captions and the last refusals by job id, in words
    const s2 = h / 64, fnt = (px, bold = false) => `${bold ? "700 " : ""}${Math.max(6, Math.round(px * s2))}px system-ui, sans-serif`;
    let n = 0; const say = (t, x, y, maxW) => { g.fillText(h5Fit(g, t, maxW), x, y); n += 1; };
    g.textBaseline = "middle";
    g.fillStyle = "#16263a"; g.fillRect(0, 0, half, 11 * s2); g.fillStyle = "#2a2116"; g.fillRect(half, 0, half, 11 * s2);
    g.fillStyle = "#e8eef4"; g.font = fnt(8, true); say(`${text.feed} · ${ohClock(model.t)}`, 3 * s2, 6 * s2, half - 6 * s2);
    g.fillStyle = "#ffd9a0"; say(text.refusals, half + 3 * s2, 6 * s2, half - 6 * s2);
    g.font = fnt(7);
    model.feed(4).forEach((l, i) => { g.fillStyle = accent(l.agent); g.fillRect(2 * s2, (15 + i * 12) * s2, 2 * s2, 8 * s2); g.fillStyle = "#dfe8f1"; say(`${l.clock} ${l.caption}`, 6 * s2, (19 + i * 12) * s2, half - 9 * s2); });
    const refs = model.refusals(3);
    if (!refs.length) { g.fillStyle = "#c9d6e3"; say(text.noRefusals, half + 3 * s2, 19 * s2, half - 6 * s2); }
    refs.forEach((r, i) => { g.fillStyle = "#ffb347"; g.fillRect(half + 2 * s2, (15 + i * 12) * s2, 2 * s2, 8 * s2); g.fillStyle = "#f2f5f8"; say(`${r.clock} ${r.jobId}`, half + 6 * s2, (19 + i * 12) * s2, half - 9 * s2); });
    if (model.metrics) { g.fillStyle = "#9fe6d8"; say(text.counts(model.metrics)[1].split(" · ").pop(), half + 3 * s2, 58 * s2, half - 6 * s2); }
    return n;
  }
  let words = 0;
  const S = h / 256;
  const font = (px, bold = false) => `${bold ? "600 " : ""}${Math.round(px * S)}px system-ui, sans-serif`;
  const put = (s, x, y, maxW) => { g.fillText(h5Fit(g, s, maxW), x, y); words += 1; };
  g.textBaseline = "middle";
  // left: the day's feed (the last five captions, each up to two lines)
  g.fillStyle = "#16263a"; g.fillRect(0, 0, half, 30 * S);
  g.fillStyle = "#e8eef4"; g.font = font(17, true); put(`${text.feed} · ${text.clock(model.t)}`, 12 * S, 15 * S, half - 24 * S);
  g.font = font(14);
  let y = 46 * S;
  for (const l of model.feed(5)) {
    g.fillStyle = accent(l.agent); g.fillRect(10 * S, y - 7 * S, 4 * S, 14 * S);
    g.fillStyle = "#dfe8f1";
    for (const part of h5Wrap(g, `${l.clock} ${l.caption}`, half - 34 * S, 2)) { if (y > h - 8 * S) break; g.fillText(part, 22 * S, y); words += 1; y += 18 * S; }
    y += 6 * S;
  }
  // right: the governor's refusals with their reasons, then the day's counts
  g.fillStyle = "#2a2116"; g.fillRect(half, 0, half, 30 * S);
  g.fillStyle = "#ffd9a0"; g.font = font(17, true); put(text.refusals, half + 12 * S, 15 * S, half - 24 * S);
  const refs = model.refusals(4);
  y = 48 * S;
  if (!refs.length) { g.fillStyle = "#c9d6e3"; g.font = font(14); put(text.noRefusals, half + 12 * S, y, half - 24 * S); }
  for (const r of refs) {
    g.fillStyle = "#ffb347"; g.fillRect(half + 10 * S, y - 7 * S, 4 * S, 34 * S);
    g.fillStyle = "#f2f5f8"; g.font = font(14, true); put(`${r.clock} ${r.jobId} · ${r.site}`, half + 22 * S, y, half - 34 * S);
    g.fillStyle = "#c9d6e3"; g.font = font(13); put(`${text.by[r.by] ?? r.by}: ${r.why}`, half + 22 * S, y + 17 * S, half - 34 * S);
    y += 40 * S;
  }
  if (model.metrics) {
    g.fillStyle = "#16263a"; g.fillRect(half, h - 40 * S, half, 40 * S); g.fillStyle = "#9fe6d8"; g.font = font(13);
    text.counts(model.metrics).forEach((line, i) => put(line, half + 12 * S, h - (29 - i * 17) * S, half - 24 * S));
  }
  return words;
}

/** Stand the hive in its operations room and paint its screens (see the header). */
export function h5MountOpsRoom({ three = null, room = null, agents = [], source = null, tier = "high", reducedMotion = false, mount = aaMountAgentAvatars, repaintMs = 400 } = {}) {
  if (!h5IsOpsRoom(room) || !room.group) return null;
  const roster = (agents ?? []).filter((a) => a?.id);
  const spots = room.spots?.agent ?? [];
  const spotOf = (a) => spots.find((s) => s.role === a?.key) ?? null;
  const door = room.door && Number.isFinite(+room.door.x) && Number.isFinite(+room.door.z) ? room.door : { x: 0, z: (Number(room.d) || 14) / 2 - 1.1 };
  const P = "h5-ops:";
  const place = new Map();
  for (const s of spots) place.set(`${P}spot:${s.role}`, { x: s.x, z: s.z, yaw: (Number(s.yaw) || 0) + Math.PI, spot: s }); // a spot's yaw is the learner's; the figure faces +z at 0
  place.set(`${P}exit`, { x: door.x, z: door.z, yaw: 0 });
  const scale = H5_OPS_TEXTURE_SCALE[tier] ?? 1;
  const relay = source && typeof source.on === "function" ? { // everything but the hive's own moves (the room has its own places)
    on: (type, fn) => { if (type !== "move") source.on(type, fn); },
    off: (type, fn) => { if (type !== "move") source.off?.(type, fn); },
  } : null;
  const avatars = roster.length && typeof mount === "function" ? mount({
    three, parent: room.group, agents: roster, source: relay, tier, reducedMotion,
    siteAt: (id) => (place.has(id) ? { x: 0, y: 0, z: 0 } : null), // a robot site is off this room: the figure waits unbuilt
    spotFor: (_a, id) => { const q = place.get(id); return q ? { x: q.x, y: 0, z: q.z, yaw: q.yaw } : null; },
    textureScale: scale > 0 ? scale : 1,
  }) : null;
  const presence = h3RoomPresence({ agents: roster, source });
  const inRoom = new Set(), leaving = new Set(), log = [], placed = [];
  const tNow = () => avatars?.clock?.() ?? 0;
  const lite = () => { for (const a of roster) { const g = avatars?.figure?.(a.id); if (g && !g.userData?.h5Lite) h5LiteFigure(three, g); } };
  const wants = (a) => !!spotOf(a) && presence.jobsOf(a.id).length === 0; // at its console while it holds no job
  function arrive(a, walkIn) {
    const turning = leaving.delete(a.id); // walking out and handed back: it turns round where it is
    inRoom.add(a.id); placed.push({ agent: a, spot: spotOf(a) });
    if (walkIn && !turning && !reducedMotion) avatars.handle({ type: "move", agent: a.id, to: `${P}exit` }); // appears in the doorway
    avatars.handle({ type: "move", agent: a.id, to: `${P}spot:${a.key}` }); // the first placement jumps; from the doorway it walks
    log.push({ t: tNow(), agent: a.id, what: "in", walked: !!walkIn && !reducedMotion });
    lite();
  }
  function leave(a) {
    inRoom.delete(a.id);
    const i = placed.findIndex((p) => p.agent.id === a.id); if (i >= 0) placed.splice(i, 1);
    log.push({ t: tNow(), agent: a.id, what: "out" });
    if (reducedMotion) { avatars.release?.(a.id); return; }
    leaving.add(a.id);
    avatars.handle({ type: "move", agent: a.id, to: `${P}exit` });
  }
  let opened = false;
  function sync() {
    if (!avatars) return 0;
    for (const a of roster) {
      const want = wants(a);
      if (want && !inRoom.has(a.id)) arrive(a, opened);
      else if (!want && inRoom.has(a.id)) leave(a);
    }
    opened = true;
    return inRoom.size;
  }
  // the screens: repainted from the hive's data after it changes (at most once per repaintMs)
  const screens = hd4OpsScreens(room);
  let dirty = true, lastPaint = -Infinity, painted = new Set();
  const onAny = () => { dirty = true; };
  try { source?.on?.("*", onAny); } catch (_) { /* a source without "*": painted on enter only */ }
  function paint() {
    if (!screens) return 0;
    const model = h5HiveModel(source, roster);
    const text = H5_SCREEN_TEXT[model.lang] ?? H5_SCREEN_TEXT.en;
    const done = new Set();
    for (const a of roster) { const card = model.card(a.id); if (card && screens.paint(a.id, (g, w, h) => h5PaintConsole(g, w, h, card, text))) done.add(a.id); }
    if (screens.paint("wall", (g, w, h) => h5PaintWall(g, w, h, model, text, roster))) done.add("wall");
    painted = done; dirty = false;
    return done.size;
  }
  // HIVE-7: the moods (HIVE-6's `mood` events; seeded from hive.mood(id) as the room opens)
  const moodOf = new Map(), glowOf = new Map();
  for (const a of roster) { const m = h5Try(() => source?.mood?.(a.id), null); if (m?.mood) moodOf.set(a.id, { mood: m.mood, cause: m.cause ?? null }); }
  const onMood = (e) => { if (e?.agent && e.mood) moodOf.set(e.agent, { mood: e.mood, cause: e.cause ?? null }); };
  try { source?.on?.("mood", onMood); } catch (_) { /* a source without moods: every figure stays calm */ }
  function glow(t) {
    for (const a of roster) {
      const fig = avatars?.figure?.(a.id);
      if (!fig) { glowOf.delete(a.id); continue; }
      const m = moodOf.get(a.id)?.mood ?? "calm", k = h5MoodGlow(m, t, reducedMotion);
      h5ApplyGlow(fig, k); glowOf.set(a.id, k);
      fig.userData.h7Mood = m;
    }
  }
  sync(); paint(); glow(0);
  return {
    room, placed, avatars, presence, screens,
    animate(t, dt) {
      sync();
      avatars?.animate(t, dt, null);
      glow(t);
      for (const id of [...leaving]) { const s = avatars?.state(id); if (!s || !s.walking) { leaving.delete(id); avatars?.release?.(id); } } // out of the doorway: gone
      if (dirty && Number(t) * 1000 - lastPaint >= repaintMs) { paint(); lastPaint = Number(t) * 1000; }
    },
    sync, paint,
    standing() { return [...inRoom].filter((id) => { const s = avatars?.state(id); return !!avatars?.figure?.(id) && !!s?.visible && !s.walking; }); }, // a built figure (the phone tier builds none)
    painted() { return [...painted]; },
    moods() { const o = {}; for (const a of roster) { const m = moodOf.get(a.id); o[a.id] = { mood: m?.mood ?? "calm", cause: m?.cause ?? null, glow: glowOf.has(a.id) ? glowOf.get(a.id) : null }; } return o; },
    leaving() { return [...leaving]; },
    log() { return log.slice(); },
    counts() {
      const c = avatars?.counts?.() ?? { figures: 0, meshes: 0, sprites: 0, triangles: 0, textureBytes: 0 };
      return { ...c, agents: inRoom.size, leaving: leaving.size, spots: spots.length, painted: painted.size };
    },
    dispose() {
      try { source?.off?.("*", onAny); } catch (_) { /* gone */ }
      try { source?.off?.("mood", onMood); } catch (_) { /* gone */ }
      presence.dispose();
      try { avatars?.dispose(); } catch (_) { /* the room's own exit already disposed the meshes */ }
    },
  };
}
