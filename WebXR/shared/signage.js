import { box, cyl, group, decal, repaint, disposeTree } from "./kit.js";
import { UNIONS, UNIONS_BY_ID } from "./unions.js";
import { CURRICULA } from "../smartcity/js/curricula.js";

// Signage: the union sign at every station pad, ANSI Z535-format safety
// signs and the boards a job site posts.
//
// A union's logo is its trademark, and this repository reproduces none of
// them (tools/briefs/assets-brief.md, "Union signage"; docs/signage.md). What
// a sign carries instead is a wordmark typeset here from tools/unions.json —
// the abbreviation large, the full name small, the local where the
// repository names one with certainty, and a "Training partner" line naming
// the training fund the registry knows — in the platform's own palette unless
// the union's colour scheme is public and certain, which so far none is. A
// licensed deployment that holds permission to show a real logo lists the
// file in WebXR/assets/brand/manifest.json; when that file exists and loads,
// the sign shows it in place of the wordmark, and when it does not (the
// repository ships every `file` null), nothing changes. The safety signs use
// the Z535.2 header colours and layout with generic text: no manufacturer's
// artwork, no site's real numbers.
//
// Every sign is at most three meshes (post, backing, face), so the stage can
// put two beside a station and stay inside the headset budget; the budget
// itself is here so stage.js and tools/check_budget.mjs read one number.

export const STATION_MESH_BUDGET = 320;
export const SIGN_MESHES = { union: 3, safety: 3, board: 3 };

export const SIGN_PALETTE = {
  bg: "#0b141d", panel: "#101c27", fg: "#f4f8fb", muted: "#9fb0bf", accent: "#4fd1ff", edge: "#426174",
};
const SIGN_FONT_C = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
const SIGN_FONT = "'Barlow', Arial, sans-serif";

// ANSI Z535.2 signal-word panels: the word, its panel colour and lettering,
// and whether the safety alert symbol stands beside it (it does for the three
// hazard words, never for NOTICE or SAFETY FIRST).
export const ANSI_HEADERS = {
  "DANGER": { bg: "#c8102e", fg: "#ffffff", alert: true, italic: false },
  "WARNING": { bg: "#ff8200", fg: "#000000", alert: true, italic: false },
  "CAUTION": { bg: "#ffd100", fg: "#000000", alert: true, italic: false },
  "NOTICE": { bg: "#0072ce", fg: "#ffffff", alert: false, italic: true },
  "SAFETY FIRST": { bg: "#00843d", fg: "#ffffff", alert: false, italic: false },
};
export const PICTOGRAMS = ["none", "hazard", "prohibition", "mandatory"];
export const BOARD_KINDS = ["permit", "emergency", "osha-poster", "muster", "hot-work", "confined-space"];

// The dominant hazard of each trade category, as the sign beside the pad.
// Generic wording: the text a sign like this carries on any site, with no
// site's own numbers, names or procedures in it.
export const HAZARD_BY_CATEGORY = {
  "Energy & Power": { header: "DANGER", text: "High voltage. Qualified persons only. Lock out and test before touch.", pictogram: "hazard" },
  "Mobility & Transit": { header: "WARNING", text: "Moving vehicles and equipment. Stay in marked walkways.", pictogram: "hazard" },
  "Water & Environmental": { header: "CAUTION", text: "Confined space. Permit and attendant required before entry.", pictogram: "prohibition" },
  "Connectivity & Telecom": { header: "WARNING", text: "Work overhead. Hard hat area. Keep clear of the drop zone.", pictogram: "mandatory" },
  "Emergency Services": { header: "WARNING", text: "Hazardous atmosphere possible. Respiratory protection as briefed.", pictogram: "mandatory" },
  "Manufacturing & Automation": { header: "DANGER", text: "Moving machinery. Lock out before servicing. Guards stay on.", pictogram: "hazard" },
  "Building Systems & Facilities": { header: "CAUTION", text: "Hot surfaces and pressurised systems. Isolate before opening.", pictogram: "hazard" },
  "Construction & Structural Trades": { header: "WARNING", text: "Fall hazard. Fall protection required above 6 ft (1.8 m).", pictogram: "mandatory" },
  "Entertainment & Live Events": { header: "WARNING", text: "Overhead rigging. Hard hat area. No one under a moving load.", pictogram: "mandatory" },
  "Maritime & Ports": { header: "WARNING", text: "Container handling in progress. Stay clear of suspended loads.", pictogram: "hazard" },
  "Environmental Monitoring": { header: "NOTICE", text: "Air monitoring in progress. Do not move or shade the instruments.", pictogram: "none" },
  "Community Environmental Justice": { header: "CAUTION", text: "Contaminated soil. Do not disturb. Dust controls in force.", pictogram: "prohibition" },
  "Dental & Oral Health": { header: "CAUTION", text: "Biohazard. Sharps and aerosols. PPE required past this point.", pictogram: "mandatory" },
  "Culinary & Hospitality": { header: "CAUTION", text: "Hot surfaces and wet floors. Cut-resistant gloves at the slicer.", pictogram: "hazard" },
  "Sewing & Garment Trades": { header: "CAUTION", text: "Pinch points. Keep hands clear of the needle and the feed.", pictogram: "hazard" },
  "Surface Prep & Coatings": { header: "WARNING", text: "Lead and silica dust. Respirator and containment required.", pictogram: "mandatory" },
  "Youth Sports & Coaching": { header: "CAUTION", text: "Wet floor stops play. Report spills, injuries and head knocks to the coach.", pictogram: "hazard" },
};
const HAZARD_DEFAULT = { header: "NOTICE", text: "Authorised personnel only. Sign in at the gate before entering.", pictogram: "none" };

// The union a station carries when no programme lists it and its own
// certification names none the platform knows: the training fund that
// covers the category in the registry.
export const CATEGORY_DEFAULT_UNION = {
  "Energy & Power": "ibew", "Mobility & Transit": "atu", "Water & Environmental": "liuna",
  "Connectivity & Telecom": "cwa", "Emergency Services": "iaff", "Manufacturing & Automation": "uaw",
  "Building Systems & Facilities": "iuoe", "Construction & Structural Trades": "ironworkers",
  "Entertainment & Live Events": "iatse", "Maritime & Ports": "ilwu", "Environmental Monitoring": "afscme",
  "Community Environmental Justice": "liuna", "Dental & Oral Health": "seiu", "Culinary & Hospitality": "unite-here",
  "Sewing & Garment Trades": "workers-united", "Surface Prep & Coatings": "iupat",
  "Youth Sports & Coaching": "afscme",
};

// ------------------------------------------------------------- resolution

const signEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The unions a piece of the platform's own text names, in the order it names them. */
export function unionsNamed(text) {
  const hits = [];
  for (const u of UNIONS) {
    let best = -1;
    for (const alias of u.aliases ?? [u.abbrev]) {
      const re = new RegExp(`(^|[^A-Za-z0-9])${signEscape(alias)}(?![A-Za-z0-9])`);
      const m = re.exec(String(text ?? ""));
      if (m && (best < 0 || m.index < best)) best = m.index;
    }
    if (best >= 0) hits.push({ id: u.id, at: best });
  }
  return hits.sort((a, b) => a.at - b.at).map((h) => h.id);
}

/** Of several unions named together, the one whose training fund covers the category. */
function signPick(ids, category) {
  return ids.find((id) => (UNIONS_BY_ID[id]?.scope ?? []).includes(category)) ?? ids[0] ?? null;
}

/**
 * Which union sign a station carries and why: the first programme in
 * curricula.js that lists it (the shared openers get the programme the
 * catalog lists first), then its own certification, then the category
 * default. `station` is the sim module or any object with id, category
 * and certification.
 */
export function unionForStation(station, curricula = CURRICULA, app = "smartcity") {
  const id = station?.baseId ?? station?.id;
  const category = station?.category ?? null;
  const programme = curricula.find((c) => c.stations.some((s) => s.app === app && s.id === id)) ?? null;
  if (programme) {
    const named = unionsNamed(programme.union);
    const pick = signPick(named, category);
    if (pick) return { unionId: pick, programmeId: programme.id, source: "programme" };
  }
  const own = signPick(unionsNamed(station?.certification), category);
  if (own) return { unionId: own, programmeId: programme?.id ?? null, source: "certification" };
  const fallback = CATEGORY_DEFAULT_UNION[category] ?? null;
  return { unionId: fallback, programmeId: programme?.id ?? null, source: fallback ? "category" : "none" };
}

/** The safety sign a category's dominant hazard calls for. */
export function hazardSignFor(category) {
  return HAZARD_BY_CATEGORY[category] ?? HAZARD_DEFAULT;
}

// ----------------------------------------------------------- brand manifest

let signBrand = null;   // { manifest, url } once loaded, null before, false when absent

/** The WebXR root for the page asking: a source page sits one directory below it, a bundle two. */
function signageBase() {
  const here = typeof document !== "undefined" ? document.baseURI ?? "" : "";
  const m = here.match(/^(.*\/)(smartcity|trades|holodeck|instructor)\//);
  return m ? m[1] : (here ? new URL("../", here).href : "");
}

/**
 * The licensed-logo manifest, fetched once. Resolves to
 * `{ manifest, url }` or null: no fetch (headless), no file, or a manifest
 * that does not parse all mean "wordmarks only", which is the shipped state.
 */
export function loadBrandManifest(url = null) {
  if (signBrand !== null && !url) return Promise.resolve(signBrand || null);
  if (typeof fetch !== "function") { signBrand = false; return Promise.resolve(null); }
  const target = url ?? `${signageBase()}assets/brand/manifest.json`;
  return fetch(target)
    .then((r) => (r.ok ? r.json() : null))
    .then((manifest) => { signBrand = manifest ? { manifest, url: target } : false; return signBrand || null; })
    .catch(() => { signBrand = false; return null; });
}

/** The logo file a manifest lists for a union, resolved against the manifest, or null. */
export function brandFileFor(brand, unionId) {
  const entry = brand?.manifest?.unions?.[unionId];
  const file = entry && typeof entry === "object" ? entry.file : entry;
  if (typeof file !== "string" || !file) return null;
  try { return new URL(file, brand.url).href; } catch { return null; }
}

// ------------------------------------------------------------ canvas helpers

function signFit(g, text, weight, family, px, maxW, style = "") {
  g.font = `${style} ${weight} ${px}px ${family}`.trim();
  const w = g.measureText?.(text)?.width;
  const fitted = w && w > maxW ? Math.max(8, Math.floor(px * maxW / w)) : px;
  g.font = `${style} ${weight} ${fitted}px ${family}`.trim();
  return fitted;
}

function signWrap(g, text, maxW, maxLines) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const probe = line ? `${line} ${word}` : word;
    const w = g.measureText?.(probe)?.width ?? 0;
    if (w > maxW && line) { lines.push(line); line = word; } else line = probe;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[.,;:]$/, "")}…`;
    return kept;
  }
  return lines;
}

/** The registry title cut to the sign's line: the part before the em dash, or the whole thing shrunk. */
function signTrainingLine(u) {
  if (!u.trainingTitle) return "SmartCiti.X training programmes";
  const head = u.trainingTitle.split(" — ")[0].trim();
  return head.length >= 8 ? head : u.trainingTitle;
}

/** The safety alert symbol: a triangle with an exclamation mark, in the header's lettering colour. */
function signAlertSymbol(g, cx, cy, r, color) {
  g.strokeStyle = color; g.lineWidth = Math.max(2, r * 0.16); g.lineJoin = "round";
  g.beginPath();
  g.moveTo(cx, cy - r); g.lineTo(cx + r * 0.95, cy + r * 0.72); g.lineTo(cx - r * 0.95, cy + r * 0.72); g.closePath();
  g.stroke();
  g.fillStyle = color;
  g.fillRect(cx - r * 0.09, cy - r * 0.45, r * 0.18, r * 0.72);
  g.beginPath(); g.arc(cx, cy + r * 0.48, r * 0.11, 0, Math.PI * 2); g.fill();
}

function signPictogram(g, kind, cx, cy, r) {
  if (kind === "hazard") {
    g.strokeStyle = "#000"; g.lineWidth = Math.max(2, r * 0.14); g.lineJoin = "round";
    g.fillStyle = "#ffd100";
    g.beginPath(); g.moveTo(cx, cy - r); g.lineTo(cx + r * 0.95, cy + r * 0.7); g.lineTo(cx - r * 0.95, cy + r * 0.7); g.closePath();
    g.fill(); g.stroke();
    g.fillStyle = "#000";
    g.fillRect(cx - r * 0.09, cy - r * 0.42, r * 0.18, r * 0.66);
    g.beginPath(); g.arc(cx, cy + r * 0.45, r * 0.11, 0, Math.PI * 2); g.fill();
  } else if (kind === "prohibition") {
    g.fillStyle = "#000";
    g.fillRect(cx - r * 0.34, cy - r * 0.36, r * 0.68, r * 0.72);
    g.strokeStyle = "#c8102e"; g.lineWidth = Math.max(3, r * 0.2);
    g.beginPath(); g.arc(cx, cy, r * 0.82, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(cx - r * 0.58, cy - r * 0.58); g.lineTo(cx + r * 0.58, cy + r * 0.58); g.stroke();
  } else if (kind === "mandatory") {
    g.fillStyle = "#0072ce";
    g.beginPath(); g.arc(cx, cy, r * 0.9, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff";
    g.beginPath(); g.arc(cx, cy - r * 0.42, r * 0.18, 0, Math.PI * 2); g.fill();
    g.fillRect(cx - r * 0.3, cy - r * 0.16, r * 0.6, r * 0.5);
  }
}

// ---------------------------------------------------------------- the signs

/**
 * A sign face is authored in sRGB — the Z535 header colours are the point —
 * so its texture is tagged as such, or the renderer reads the canvas as
 * linear and a DANGER red comes out pink. Harmless under the headless stub.
 */
function signSrgbFace(face) {
  const tex = face.userData?.texture;
  if (tex) tex.colorSpace = "srgb";
  return face;
}

/** Post, backing plate and face: the three meshes every sign is built from. */
function signStand(parent, x, y, z, w, h, o) {
  const g = group(parent, x, y, z, o.ry ?? 0);
  const top = o.height ?? 1.55;
  const postColor = o.postColor ?? 0x4a535d;
  cyl(g, 0.028, 0.034, top, 0, top / 2, -0.02, postColor, { rough: 0.5, metal: 0.6, seg: 10 });
  box(g, w + 0.06, h + 0.06, 0.03, 0, top, 0, o.backColor ?? 0x2c343d, { rough: 0.7 });
  return { g, top };
}

/**
 * The union's sign: a wordmark typeset from tools/unions.json — never a logo —
 * unless a licensed deployment's manifest supplies a file that loads.
 * `opts`: ry, height, w, h, accentCss, brand (false to skip the manifest).
 */
export function unionSign(parent, x, y, z, unionId, opts = {}) {
  const u = UNIONS_BY_ID[unionId];
  if (!u) throw new Error(`unionSign: no union "${unionId}" in tools/unions.json`);
  const w = opts.w ?? 0.9, h = opts.h ?? 0.6;
  const pal = u.colors ? { ...SIGN_PALETTE, ...u.colors } : { ...SIGN_PALETTE, accent: opts.accentCss ?? SIGN_PALETTE.accent };
  const { g, top } = signStand(parent, x, y, z, w, h, opts);
  g.name = "union-sign";
  g.userData.unionId = u.id;

  const drawFooter = (c, cw, ch) => {
    c.fillStyle = pal.edge; c.fillRect(cw * 0.06, ch * 0.745, cw * 0.88, Math.max(1, Math.round(ch * 0.005)));
    c.textAlign = "left"; c.textBaseline = "middle";
    try { c.letterSpacing = "0.18em"; } catch { /* older canvas */ }
    c.fillStyle = pal.accent;
    signFit(c, "TRAINING PARTNER", 700, SIGN_FONT_C, Math.round(ch * 0.075), cw * 0.88);
    c.fillText("TRAINING PARTNER", cw * 0.06, ch * 0.815);
    try { c.letterSpacing = "0em"; } catch { /* older canvas */ }
    c.fillStyle = pal.muted;
    const line = signTrainingLine(u);
    signFit(c, line, 500, SIGN_FONT, Math.round(ch * 0.075), cw * 0.88);
    c.fillText(line, cw * 0.06, ch * 0.905);
  };
  const drawWordmark = (c, cw, ch) => {
    c.fillStyle = pal.bg; c.fillRect(0, 0, cw, ch);
    c.fillStyle = pal.accent; c.fillRect(0, 0, cw, Math.max(3, Math.round(ch * 0.035)));
    c.textAlign = "left"; c.textBaseline = "middle";
    const maxW = cw * 0.88;
    try { c.letterSpacing = "0.02em"; } catch { /* older canvas */ }
    c.fillStyle = pal.fg;
    signFit(c, u.abbrev, 800, SIGN_FONT_C, Math.round(ch * 0.30), maxW);
    c.fillText(u.abbrev, cw * 0.06, ch * 0.235);
    try { c.letterSpacing = "0em"; } catch { /* older canvas */ }
    c.fillStyle = pal.muted;
    c.font = `500 ${Math.round(ch * 0.072)}px ${SIGN_FONT}`;
    const nameLines = u.name === u.abbrev ? [] : signWrap(c, u.name, maxW, 2);
    nameLines.forEach((l, i) => c.fillText(l, cw * 0.06, ch * (0.45 + i * 0.095)));
    if (u.local) {
      c.fillStyle = pal.accent;
      signFit(c, u.local, 700, SIGN_FONT_C, Math.round(ch * 0.105), maxW);
      c.fillText(u.local, cw * 0.06, ch * (nameLines.length > 1 ? 0.665 : 0.6));
    }
    drawFooter(c, cw, ch);
  };
  const face = signSrgbFace(decal(g, w, h, 0, top, 0.017, drawWordmark, { px: opts.px ?? 512, glow: true, ei: 0.55, rough: 0.6 }));
  face.name = "union-sign-face";
  g.userData.face = face;

  // A licensed logo replaces the wordmark, never the footer. The manifest
  // ships with every file null, so in the repository this branch is never
  // taken; it exists so a deployment that holds permission has a place to
  // put the file (docs/signage.md).
  if (opts.brand !== false && typeof Image === "function") {
    loadBrandManifest().then((brand) => {
      const src = brandFileFor(brand, u.id);
      if (!src || !face.parent) return;
      const img = new Image();
      img.onload = () => {
        if (!face.parent) return;
        repaint(face, (c, cw, ch) => {
          c.fillStyle = pal.bg; c.fillRect(0, 0, cw, ch);
          const boxW = cw * 0.88, boxH = ch * 0.62;
          const k = Math.min(boxW / (img.naturalWidth || 1), boxH / (img.naturalHeight || 1));
          const dw = (img.naturalWidth || 1) * k, dh = (img.naturalHeight || 1) * k;
          c.drawImage(img, (cw - dw) / 2, ch * 0.06 + (boxH - dh) / 2, dw, dh);
          drawFooter(c, cw, ch);
        });
        g.userData.logo = src;
      };
      img.src = src;
    });
  }
  return g;
}

/**
 * ANSI Z535.2 safety sign: signal-word header in its colour with the safety
 * alert symbol where the standard puts one, a white message panel with
 * generic text and an optional hazard, prohibition or mandatory pictogram.
 */
export function safetySign(parent, x, y, z, opts = {}) {
  const header = ANSI_HEADERS[opts.header] ? opts.header : "NOTICE";
  const spec = ANSI_HEADERS[header];
  const pictogram = PICTOGRAMS.includes(opts.pictogram) ? opts.pictogram : "none";
  const text = opts.text ?? HAZARD_DEFAULT.text;
  const w = opts.w ?? 0.6, h = opts.h ?? 0.85;
  const { g, top } = signStand(parent, x, y, z, w, h, { height: 1.45, ...opts, backColor: 0x1f262d });
  g.name = "safety-sign";
  g.userData.header = header;
  const face = signSrgbFace(decal(g, w, h, 0, top, 0.017, (c, cw, ch) => {
    c.fillStyle = "#ffffff"; c.fillRect(0, 0, cw, ch);
    const bd = Math.max(3, Math.round(cw * 0.025));
    c.fillStyle = "#000"; c.fillRect(0, 0, cw, ch);
    c.fillStyle = "#ffffff"; c.fillRect(bd, bd, cw - bd * 2, ch - bd * 2);
    const headH = ch * 0.22;
    c.fillStyle = spec.bg; c.fillRect(bd, bd, cw - bd * 2, headH);
    c.textBaseline = "middle";
    let left = cw * 0.08;
    if (spec.alert) { signAlertSymbol(c, cw * 0.15, bd + headH / 2, headH * 0.34, spec.fg); left = cw * 0.29; }
    c.textAlign = "left";
    c.fillStyle = spec.fg;
    signFit(c, header, 800, "Arial, Helvetica, sans-serif", Math.round(headH * 0.62), cw * 0.92 - left, spec.italic ? "italic" : "");
    c.fillText(header, left, bd + headH / 2);
    // Message panel: pictogram on the left when there is one, the text beside
    // or across, in the heavy sans the standard's examples are set in.
    const bodyTop = bd + headH + ch * 0.05;
    const bodyH = ch - bodyTop - bd - ch * 0.05;
    let textLeft = cw * 0.08, textW = cw * 0.84;
    if (pictogram !== "none") {
      const r = Math.min(cw * 0.2, bodyH * 0.22);
      signPictogram(c, pictogram, cw * 0.5, bodyTop + r * 1.05, r);
    }
    c.fillStyle = "#000"; c.textAlign = "left"; c.textBaseline = "top";
    const px = Math.round(ch * 0.062);
    c.font = `700 ${px}px Arial, Helvetica, sans-serif`;
    const lines = signWrap(c, text, textW, 5);
    const start = pictogram !== "none" ? bodyTop + Math.min(cw * 0.2, bodyH * 0.22) * 2.3 : bodyTop;
    lines.forEach((l, i) => c.fillText(l, textLeft, start + i * px * 1.25));
  }, { px: opts.px ?? 384, glow: true, ei: 0.2, rough: 0.6 }));
  face.name = "safety-sign-face";
  g.userData.face = face;
  return g;
}

/** Copy for each jobsite board; generic, with nothing a real site would fill in already filled in. */
const SIGN_BOARDS = {
  "permit": { title: "PERMIT TO WORK", band: "#22303c", bg: "#f2efe6",
    rows: ["Permit no. ______  Issued to ______", "Work: ______  Location: ______", "Isolations: ______  Gas test: ______", "Valid from ____ to ____   Issuer ______", "Hand back signed by ______ at ____"] },
  "emergency": { title: "EMERGENCY", band: "#c8102e", bg: "#f6f1ea",
    rows: ["Emergency services: 911", "Site first aider: named on the sign-in board", "Nearest A&E: named on the induction board", "Muster point: green sign, follow the arrows", "Report every incident before leaving site"] },
  "osha-poster": { title: "OSHA POSTER", band: "#1d3a6b", bg: "#f2efe6",
    rows: ["Post the current federal poster here", "(Job Safety and Health: It's the Law)", "and the state-plan poster where one applies.", "Required at every workplace, in a place", "employees see it. This board is the placeholder."] },
  "muster": { title: "MUSTER POINT", band: "#00843d", bg: "#e8f5ea",
    rows: ["Assemble here on the alarm", "Report to the headcount marshal", "Stay until stood down", "Do not go back for belongings"] },
  "hot-work": { title: "HOT WORK AREA", band: "#ff8200", bg: "#f6f1ea",
    rows: ["Hot work permit required", "Fire watch posted during and after", "Combustibles cleared to 35 ft (11 m)", "Extinguisher within reach", "Permit expires: ____"] },
  "confined-space": { title: "CONFINED SPACE", band: "#c8102e", bg: "#f6f1ea",
    rows: ["Permit required before entry", "Attendant at the opening at all times", "Atmosphere tested in order: O2, LEL, toxics", "Rescue plan in place before the first entry", "No entry alone"] },
};

/** A jobsite board of one of BOARD_KINDS: post, backing and one printed face. */
export function jobsiteBoard(parent, x, y, z, opts = {}) {
  const kind = BOARD_KINDS.includes(opts.kind) ? opts.kind : "permit";
  const spec = SIGN_BOARDS[kind];
  const w = opts.w ?? 1.0, h = opts.h ?? 0.7;
  const { g, top } = signStand(parent, x, y, z, w, h, { height: 1.5, ...opts });
  g.name = `board-${kind}`;
  g.userData.kind = kind;
  const face = signSrgbFace(decal(g, w, h, 0, top, 0.017, (c, cw, ch) => {
    c.fillStyle = spec.bg; c.fillRect(0, 0, cw, ch);
    c.fillStyle = spec.band; c.fillRect(0, 0, cw, ch * 0.2);
    c.fillStyle = "#ffffff"; c.textAlign = "left"; c.textBaseline = "middle";
    signFit(c, spec.title, 700, SIGN_FONT_C, Math.round(ch * 0.13), cw * 0.9);
    c.fillText(spec.title, cw * 0.05, ch * 0.1);
    c.fillStyle = "#1d262e";
    const px = Math.round(ch * 0.075);
    c.font = `${px}px Arial, sans-serif`;
    spec.rows.forEach((row, i) => {
      const yy = ch * 0.31 + i * ch * 0.13;
      c.fillStyle = "#8a949c"; c.fillRect(cw * 0.05, yy + ch * 0.065, cw * 0.9, 1);
      c.fillStyle = "#1d262e"; c.fillText(row, cw * 0.06, yy);
    });
  }, { px: opts.px ?? 512, rough: 0.8 }));
  face.name = `board-${kind}-face`;
  g.userData.face = face;
  return g;
}

// ------------------------------------------------------ the station's signs

// Where the two signs stand: flanking the walk in from the gate (apron.js
// puts the gate at bearing 0, the walk 1.3 m either side of it with cones at
// 1.35 m), outside the 3.2 m circle the widest station needs, turned a little
// toward the learner as they come through the gate. Indoors there is no gate
// and the learner starts at the door (interiors.js), so the signs stand
// nearer, just inside the door and flanking the way in, where the door
// frames them. In AR the learner's own room is the site, so the union sign
// stands just off the pad in front of them and the safety sign is not built.
export const SIGN_SPOTS = {
  union: { r: 3.9, bearing: 0.58, ry: -0.3 },
  safety: { r: 3.9, bearing: -0.58, ry: 0.3 },
  // 2.7 m aside and 2.7 m ahead of the door: inside a 72° camera's frame
  // from the door, and 2.9 m or more from the pad, past the 2.7 m footprint
  // of the widest indoor station.
  indoor: { x: 2.7, ahead: 2.7, minZ: 1.5, ry: 0.7 },
  arUnion: { x: -1.0, z: -2.4, ry: 0 },
};

/** The two spots for a station: outdoors from the bearing table, indoors relative to the door. */
export function signSpots(opts = {}) {
  if (opts.indoor) {
    const z = Math.max(SIGN_SPOTS.indoor.minZ, (opts.spawn?.z ?? 4.4) - SIGN_SPOTS.indoor.ahead);
    return {
      union: { x: SIGN_SPOTS.indoor.x, z, ry: -SIGN_SPOTS.indoor.ry },
      safety: { x: -SIGN_SPOTS.indoor.x, z, ry: SIGN_SPOTS.indoor.ry },
    };
  }
  const at = (s) => ({ x: Math.sin(s.bearing) * s.r, z: Math.cos(s.bearing) * s.r, ry: s.ry });
  return { union: at(SIGN_SPOTS.union), safety: at(SIGN_SPOTS.safety) };
}

/** Meshes under a group, counted the way tools/check_budget.mjs counts them. */
export function signMeshCount(root) {
  let n = 0;
  root.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) n += 1; });
  return n;
}

/**
 * The signage the stage places for one station: its union sign, always, and
 * the safety sign for its category when the station's own meshes leave room
 * under STATION_MESH_BUDGET. `opts.meshesUsed` is the station's count when
 * known; when it is not yet known the safety sign is built and `fit()` takes
 * it down again if the station turns out to fill the budget, which is what
 * app.js does once the station has been built.
 */
export function stationSignage(parent, station, opts = {}) {
  const budget = opts.budget ?? STATION_MESH_BUDGET;
  const plan = unionForStation(station, opts.curricula ?? CURRICULA);
  const hazard = hazardSignFor(station?.category);
  const g = group(parent);
  g.name = "station-signage";
  const spots = signSpots(opts);
  let union = null, safety = null, skippedSafety = false;
  if (plan.unionId) {
    if (opts.ar) {
      union = unionSign(g, SIGN_SPOTS.arUnion.x, 0, SIGN_SPOTS.arUnion.z, plan.unionId, { ry: SIGN_SPOTS.arUnion.ry, w: 0.72, h: 0.48, height: 1.35, accentCss: opts.accentCss, brand: opts.brand });
    } else {
      union = unionSign(g, spots.union.x, 0, spots.union.z, plan.unionId, { ry: spots.union.ry, accentCss: opts.accentCss, brand: opts.brand });
    }
  }
  const room = (used) => used + signMeshCount(g) + SIGN_MESHES.safety <= budget;
  if (!opts.ar) {
    if (opts.meshesUsed == null || room(opts.meshesUsed)) {
      safety = safetySign(g, spots.safety.x, 0, spots.safety.z, { ...hazard, ry: spots.safety.ry });
    } else {
      skippedSafety = true;
    }
  }
  const result = {
    root: g, union, safety, plan, hazard,
    get skippedSafety() { return skippedSafety; },
    meshes: () => signMeshCount(g),
    /** Called once the station is built: takes the safety sign down if the pair would breach the budget. */
    fit(meshesUsed) {
      if (safety && meshesUsed + signMeshCount(g) > budget) {
        g.remove(safety);
        disposeTree?.(safety);
        safety = null; result.safety = null;
        skippedSafety = true;
      }
      return { meshes: signMeshCount(g), skippedSafety };
    },
  };
  return result;
}
