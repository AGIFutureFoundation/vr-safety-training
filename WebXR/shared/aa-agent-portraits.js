// AGENT-AVATARS — portraits for the Omega Hive's software agents and the VBRIDGE
// personas (console AGENT-AVATARS, docs/consoles/AGENT-AVATARS.md).
// SmartCiti.X Holodeck · Powered by AGI Corp.
//
// An agent is software, and its portrait says so: no face, no skin. It wears the
// agent outfit set — a visor where a face would be, a high-visibility vest with a
// neutral glyph for its role (a shape, never a logo or a name), and a tablet —
// over the same head and torso silhouette the 3D figure is revolved from
// (av-sprites.js AV_PARTS, which tools/gen_avatars.mjs copies from kit.js), in a
// hologram tint of the agent's accent colour.
//
// Crisp at any pixel ratio: `aaPortraitPng` rasterises the SVG at size × device
// pixel ratio once and caches the PNG, so a roster of 48 px cards on a 2× screen
// shows 96 px images, and the same agent twice is one raster. Off a browser (the
// checkers) it resolves with the SVG itself, and a `raster` hook can be passed.
//
// Nothing here draws a person, loads a file or calls a network. Built for
// createElement/textContent pages (the instructor console forbids markup from
// strings): `aaMountAgentRoster` never sets innerHTML. Every top-level name starts
// with `aa`/`AA_` (the bundler shares one scope).
//
//   aaAgentLook(agent)                         -> { glyph, accent, outfit, key }
//   aaPortraitSvg(agent, { size, kind })       -> SVG markup (portrait | token)
//   aaPortraitPng(agent, { size, dpr, kind, raster }) -> Promise<data URL>, cached per agent, size and dpr
//   aaPortraitImg(agent, { size, dpr, kind })  -> <img> showing the SVG at once, swapped for the cached 2× PNG
//   aaPortraitCacheStats()                     -> { entries, hits, rasters }
//   aaRoleLabel(agent)                         -> the short role a label shows ("dispatcher")
//   aaMountAgentRoster(el, { agents, siteName, size }) -> { render(agents), cards() }
//   AA_VBRIDGE_PERSONAS                        -> the four VBRIDGE personas (client, provider, evaluator, governor)

import { AV_PARTS } from "./av-sprites.js";

/** The four VBRIDGE personas as agents. Mirrors av-characters.js's registry
 * entries (same ids, names, roles, glyphs and accents — check_agent_avatars
 * holds them equal) so a page that never loads the registry still has them. */
export const AA_VBRIDGE_PERSONAS = Object.freeze([
  { id: "agent-client", name: "Client agent", role: "External agent that requests a robot job (ACP-shaped; mocked in this build)", roleLabel: "client (mock)", avatar: { glyph: "client", accent: 0xd8b86a, outfit: "agent" } },
  { id: "agent-provider", name: "Robot-site agent", role: "SmartCiti.X provider agent that runs a policy in the simulator (ACP-shaped)", roleLabel: "provider", avatar: { glyph: "provider", accent: 0xf07a1f, outfit: "agent" } },
  { id: "agent-evaluator", name: "Evaluator", role: "Scores a delivered episode against the station's own rubric (ACP-shaped)", roleLabel: "evaluator", avatar: { glyph: "evaluator", accent: 0x8fe3ff, outfit: "agent" } },
  { id: "agent-governor", name: "Safety governor", role: "Allowlist, speed and separation limits, e-stop first, stale-policy refusal, audit log (every agent command passes it)", roleLabel: "safety governor", avatar: { glyph: "governor", accent: 0xd8322c, outfit: "agent" } },
].map((a) => Object.freeze({ ...a, avatar: Object.freeze(a.avatar) })));

/** The neutral glyphs an agent's vest can carry, by keyword. Shapes only. */
export const AA_GLYPHS = Object.freeze(["dispatch", "steward", "maintenance", "consent", "trainer", "auditor", "logistics", "client", "provider", "evaluator", "governor", "guide", "task", "learner", "tutor"]);
const AA_GLYPH_WORDS = [
  [/dispatch/i, "dispatch"], [/steward|safety|shield/i, "steward"], [/mainten|wrench|repair/i, "maintenance"], [/consent|privacy|keeper/i, "consent"],
  [/train|coach|teach/i, "trainer"], [/audit|ledger|log\b/i, "auditor"], [/logist|route|supply|box/i, "logistics"], [/client/i, "client"],
  [/provider|robot-site/i, "provider"], [/evaluat|score/i, "evaluator"], [/governor/i, "governor"], [/guide/i, "guide"], [/tutor/i, "tutor"], [/learner/i, "learner"],
];

const aaHex = (c) => (typeof c === "number" ? `#${(c >>> 0).toString(16).padStart(6, "0").slice(-6)}` : /^#[0-9a-f]{6}$/i.test(String(c ?? "")) ? String(c) : "#8fe3ff");
const aaF = (n) => (Math.round(n * 10) / 10).toString();
const aaEsc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** A stable 32-bit hash of a string (FNV-1a). */
export function aaHash(s) {
  let h = 2166136261;
  for (const ch of String(s ?? "")) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}

/** The short role a label shows: the agent's `roleLabel`, else a short `role`, else its id's words ("oh-safety-steward" → "safety steward"). */
export function aaRoleLabel(agent) {
  if (agent?.roleLabel) return String(agent.roleLabel);
  const r = String(agent?.role ?? "").trim();
  if (r && r.length <= 28 && !/[.;:]/.test(r)) return r.toLowerCase();
  const id = String(agent?.id ?? "agent").replace(/^(oh|agent|aa)-/, "").replace(/-/g, " ").trim();
  return id || "agent";
}

/** An agent's portrait look: its glyph (by the glyph it names, else by its id and role words), accent and outfit. */
export function aaAgentLook(agent) {
  const av = agent?.avatar ?? {};
  const named = String(av.glyph ?? "");
  const glyph = AA_GLYPHS.includes(named) ? named : (AA_GLYPH_WORDS.find(([re]) => re.test(`${named} ${agent?.id ?? ""} ${agent?.role ?? ""}`))?.[1] ?? "task");
  const accent = typeof av.accent === "number" ? av.accent : typeof av.accent === "string" && /^#?[0-9a-f]{6}$/i.test(av.accent) ? parseInt(av.accent.replace("#", ""), 16) : (aaHash(agent?.id) & 0x7f7f7f) | 0x406080;
  const outfit = String(av.outfit ?? "agent");
  return { kind: "agent-figure", glyph, accent, outfit, key: `${glyph}-${accent.toString(16)}-${outfit}` };
}

/** A revolved profile's front silhouette, mirrored, as an SVG path (sprite units). */
function aaProfilePath(profile, cx, cy, k, sx = 1) {
  const right = profile.map(([r, y]) => [cx + r * k * sx, cy - y * k]);
  const left = [...right].reverse().map(([x, y]) => [2 * cx - x, y]);
  return `M${[...right, ...left].map(([x, y]) => `${aaF(x)} ${aaF(y)}`).join("L")}Z`;
}

/** The neutral glyph for a role, centred at (x, y), radius r, drawn in `ink`. */
function aaGlyph(glyph, x, y, r, ink) {
  const s = (d) => `<path d="${d}" stroke="${ink}" stroke-width="${aaF(r * 0.22)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const p = (dx, dy) => `${aaF(x + dx * r)} ${aaF(y + dy * r)}`;
  switch (glyph) {
    case "dispatch": return s(`M${p(-0.6, 0.5)}L${p(0, -0.1)}L${p(0.6, 0.5)}M${p(0, -0.1)}L${p(0, -0.6)}`);
    case "steward": return s(`M${p(0, -0.6)}L${p(0.5, -0.4)}L${p(0.5, 0.05)}Q${p(0.5, 0.45)} ${p(0, 0.62)}Q${p(-0.5, 0.45)} ${p(-0.5, 0.05)}L${p(-0.5, -0.4)}ZM${p(0, -0.25)}V${aaF(y + 0.15 * r)}`);
    case "governor": return s(`M${p(0, -0.6)}L${p(0.5, -0.4)}L${p(0.5, 0.05)}Q${p(0.5, 0.45)} ${p(0, 0.62)}Q${p(-0.5, 0.45)} ${p(-0.5, 0.05)}L${p(-0.5, -0.4)}Z`) + `<circle cx="${aaF(x)}" cy="${aaF(y)}" r="${aaF(r * 0.16)}" fill="#d8322c"/>`;
    case "maintenance": return s(`M${p(-0.5, 0.5)}L${p(0.2, -0.2)}M${p(0.05, -0.45)}A${aaF(r * 0.3)} ${aaF(r * 0.3)} 0 1 0 ${p(0.45, -0.05)}`);
    case "consent": return s(`M${p(-0.4, -0.05)}L${p(-0.1, 0.3)}L${p(0.45, -0.35)}`);
    case "trainer": return s(`M${p(-0.55, -0.45)}H${aaF(x + 0.55 * r)}V${aaF(y + 0.2 * r)}H${aaF(x - 0.55 * r)}ZM${p(0, 0.2)}L${p(0, 0.6)}`);
    case "auditor": return s(`M${p(-0.45, -0.45)}H${aaF(x + 0.45 * r)}M${p(-0.45, 0)}H${aaF(x + 0.45 * r)}M${p(-0.45, 0.45)}H${aaF(x + 0.15 * r)}`);
    case "logistics": return s(`M${p(-0.5, -0.3)}L${p(0, -0.55)}L${p(0.5, -0.3)}V${aaF(y + 0.35 * r)}L${p(0, 0.6)}L${p(-0.5, 0.35)}ZM${p(-0.5, -0.3)}L${p(0, -0.05)}L${p(0.5, -0.3)}M${p(0, -0.05)}V${aaF(y + 0.6 * r)}`);
    case "client": return s(`M${p(-0.45, 0.1)}L${p(0, -0.4)}L${p(0.45, 0.1)}M${p(0, -0.4)}V${aaF(y + 0.55 * r)}`);
    case "provider": return s(`M${p(-0.45, -0.1)}L${p(0, 0.4)}L${p(0.45, -0.1)}M${p(0, 0.4)}V${aaF(y - 0.55 * r)}`);
    case "evaluator": return s(`M${p(-0.45, 0)}L${p(-0.1, 0.35)}L${p(0.5, -0.35)}`);
    case "guide": return s(`M${p(0, -0.05)}V${aaF(y + 0.3 * r)}M${p(-0.3, -0.3)}Q${p(0, -0.7)} ${p(0.3, -0.3)}`);
    default: return s(`M${p(-0.5, -0.35)}H${aaF(x + 0.5 * r)}V${aaF(y + 0.35 * r)}H${aaF(x - 0.5 * r)}ZM${p(-0.2, 0)}H${aaF(x + 0.2 * r)}`);
  }
}

/** The portrait's inner drawing (64 × 64 box): hologram head with a visor, halo, vest with glyph, tablet. No face. */
function aaFigureInner(look, kind) {
  const P = AV_PARTS, a = aaHex(look.accent), out = [];
  const k = kind === "token" ? 150 : 118, cx = 32, cy = kind === "token" ? 36 : 30;
  if (kind === "portrait") {
    const torso = P.TORSO_PROFILE.filter(([, y]) => y >= 1.16).map(([r, y]) => [r * 1.5, y - 1.5]);
    torso.push([0.001, torso[torso.length - 1][1]]);
    out.push(`<path d="${aaProfilePath([[0.001, torso[0][1]], ...torso], cx, cy, k)}" fill="#d8ff3a"/>`); // the high-visibility vest
    out.push(`<rect x="${aaF(cx - 0.05 * k)}" y="${aaF(cy + 0.08 * k)}" width="${aaF(0.1 * k)}" height="${aaF(0.12 * k)}" fill="${a}" opacity="0.7"/>`); // a hologram neck
    out.push(`<rect x="${aaF(cx - 0.21 * k)}" y="${aaF(cy + 0.26 * k)}" width="${aaF(0.42 * k)}" height="${aaF(0.02 * k)}" fill="#dfe8ee"/>`);
    out.push(`<circle cx="${aaF(cx - 0.09 * k)}" cy="${aaF(cy + 0.2 * k)}" r="${aaF(0.05 * k)}" fill="#ffffff"/>`, aaGlyph(look.glyph, cx - 0.09 * k, cy + 0.2 * k, 0.04 * k, "#0b1a24"));
    out.push(`<rect x="${aaF(cx + 0.05 * k)}" y="${aaF(cy + 0.15 * k)}" width="${aaF(0.13 * k)}" height="${aaF(0.17 * k)}" rx="1.5" fill="#1d2a33" stroke="${a}" stroke-width="0.8"/>`); // the tablet
    out.push(`<rect x="${aaF(cx + 0.065 * k)}" y="${aaF(cy + 0.165 * k)}" width="${aaF(0.1 * k)}" height="${aaF(0.12 * k)}" fill="${a}" opacity="0.55"/>`);
  }
  out.push(`<path d="${aaProfilePath(P.HEAD_PROFILE, cx, cy, k, 0.95)}" fill="${a}" opacity="0.82"/>`); // a hologram head, no skin
  out.push(`<rect x="${aaF(cx - 0.105 * k)}" y="${aaF(cy - 0.035 * k)}" width="${aaF(0.21 * k)}" height="${aaF(0.055 * k)}" rx="${aaF(0.025 * k)}" fill="#0b1a24" stroke="${a}" stroke-width="0.8"/>`); // the visor, where a face would be
  out.push(`<ellipse cx="${aaF(cx)}" cy="${aaF(cy - 0.18 * k)}" rx="${aaF(0.1 * k)}" ry="${aaF(0.022 * k)}" fill="none" stroke="${a}" stroke-width="1.4"/>`); // the halo
  return out.join("");
}

/** An agent's portrait as SVG markup: "portrait" (head and shoulders, rounded square) or "token" (head, circle). */
export function aaPortraitSvg(agent, { size = 64, kind = "portrait", title = null } = {}) {
  const look = aaAgentLook(agent);
  const label = title ?? `${agent?.name ?? "Agent"} — software agent · ${aaRoleLabel(agent)}`;
  const clip = `aac${aaHash(`${look.key}|${agent?.id ?? ""}`).toString(36)}${kind[0]}`;
  const frame = kind === "token"
    ? `<clipPath id="${clip}"><circle cx="32" cy="32" r="31"/></clipPath><circle cx="32" cy="32" r="31" fill="#12303f"/>`
    : `<clipPath id="${clip}"><rect x="0" y="0" width="64" height="64" rx="10"/></clipPath><rect x="0" y="0" width="64" height="64" rx="10" fill="#12303f"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="${aaEsc(label)}"><title>${aaEsc(label)}</title>${frame}<g clip-path="url(#${clip})">${aaFigureInner(look, kind)}</g></svg>`;
}

export function aaPortraitSvgUrl(agent, opts = {}) { return `data:image/svg+xml;utf8,${encodeURIComponent(aaPortraitSvg(agent, opts))}`; }

const AA_PORTRAIT_CACHE = new Map();
const aaPortraitCounters = { hits: 0, rasters: 0 };

/** The device pixel ratio the page renders at (1 off a browser), clamped to 1..3. */
export function aaDpr() {
  let d = 1;
  try { d = Number(globalThis.devicePixelRatio) || 1; } catch (_) { d = 1; }
  return Math.min(3, Math.max(1, d));
}

/** Rasterise SVG markup to a PNG data URL at px × px in a browser (Image + canvas). */
function aaRasterBrowser(svg, px) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement("canvas"); c.width = px; c.height = px;
        const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(img, 0, 0, px, px);
        resolve(c.toDataURL("image/png"));
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error("aa: the portrait did not rasterise"));
    img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  });
}

/**
 * The portrait as a PNG data URL rasterised at size × dpr, cached per agent
 * look, size, dpr and kind. Off a browser it resolves with the SVG data URL
 * (nothing to rasterise with) unless `raster(svg, px)` is passed.
 */
export function aaPortraitPng(agent, { size = 48, dpr = aaDpr(), kind = "portrait", raster = null } = {}) {
  const px = Math.max(8, Math.round(size * dpr));
  const key = `${agent?.id ?? "?"}|${aaAgentLook(agent).key}|${kind}|${px}`;
  if (AA_PORTRAIT_CACHE.has(key)) { aaPortraitCounters.hits += 1; return AA_PORTRAIT_CACHE.get(key); }
  const svg = aaPortraitSvg(agent, { size: px, kind });
  const canRaster = typeof Image === "function" && typeof document !== "undefined" && typeof document.createElement === "function";
  const fn = raster ?? (canRaster ? aaRasterBrowser : null);
  aaPortraitCounters.rasters += fn ? 1 : 0;
  const p = fn ? Promise.resolve().then(() => fn(svg, px)).catch(() => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`) : Promise.resolve(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
  AA_PORTRAIT_CACHE.set(key, p);
  return p;
}

export function aaPortraitCacheStats() { return { entries: AA_PORTRAIT_CACHE.size, hits: aaPortraitCounters.hits, rasters: aaPortraitCounters.rasters }; }

/** An <img> for the portrait: the SVG at once (crisp, vector), then the cached size × dpr PNG once it is ready. */
export function aaPortraitImg(agent, { size = 48, dpr = aaDpr(), kind = "portrait" } = {}) {
  if (typeof document === "undefined" || typeof document.createElement !== "function") return null;
  const img = document.createElement("img");
  img.width = size; img.height = size; img.alt = `${agent?.name ?? "Agent"}, software agent`;
  img.className = "aa-portrait"; img.decoding = "async";
  img.src = aaPortraitSvgUrl(agent, { size: Math.round(size * dpr), kind });
  img.dataset.aaAgent = String(agent?.id ?? "");
  aaPortraitPng(agent, { size, dpr, kind }).then((url) => { if (/^data:image\/png/.test(url)) { img.src = url; img.dataset.aaRaster = `png@${dpr}x`; } }).catch(() => {});
  return img;
}

const AA_ROSTER_CSS = ".aa-roster{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;margin:6px 0}.aa-card{display:flex;gap:8px;align-items:center;border:1px solid var(--edge,#2c5a63);border-radius:10px;padding:6px 8px;min-width:0}.aa-card img{flex:none;border-radius:8px}.aa-card .aa-who{min-width:0}.aa-card b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.aa-card .aa-chip{display:inline-block;font-size:11px;padding:1px 6px;border-radius:9px;border:1px solid currentColor;opacity:.85;margin-right:4px}.aa-card .aa-role{font-size:12px;opacity:.85;display:block;overflow-wrap:anywhere}";

/**
 * A roster of agents with crisp portraits, built from createElement/textContent
 * only. Each card: the portrait, the name, a "software agent" chip, the short
 * role and the home site. Returns { render(agents), cards() }.
 */
export function aaMountAgentRoster(el, { agents = [], siteName = (id) => id, size = 48, title = null } = {}) {
  if (!el || typeof document === "undefined" || typeof document.createElement !== "function") return null;
  if (!document.getElementById?.("aa-roster-style")) { const s = document.createElement("style"); s.id = "aa-roster-style"; s.textContent = AA_ROSTER_CSS; document.head?.appendChild(s); }
  const box = document.createElement("div"); box.className = "aa-roster"; box.setAttribute("role", "list");
  if (title) { const h = document.createElement("h3"); h.textContent = title; el.appendChild(h); }
  el.appendChild(box);
  let list = [];
  function render(next = list) {
    list = (next ?? []).filter((a) => a && a.id);
    const cards = list.map((a) => {
      const card = document.createElement("div"); card.className = "aa-card"; card.setAttribute("role", "listitem"); card.dataset.aaAgent = a.id;
      const img = aaPortraitImg(a, { size }); if (img) card.appendChild(img);
      const who = document.createElement("div"); who.className = "aa-who";
      const b = document.createElement("b"); b.textContent = a.name ?? a.id;
      const chip = document.createElement("span"); chip.className = "aa-chip"; chip.textContent = "software agent";
      const role = document.createElement("span"); role.className = "aa-role"; role.textContent = `${aaRoleLabel(a)}${a.homeSite ? ` · ${siteName(a.homeSite) ?? a.homeSite}` : ""}`;
      who.append(b, chip, role); card.appendChild(who);
      return card;
    });
    box.replaceChildren(...cards);
    return cards.length;
  }
  render(agents);
  return { render, cards: () => [...box.children], el: box };
}
