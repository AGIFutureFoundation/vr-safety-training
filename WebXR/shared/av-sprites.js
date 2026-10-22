// AVATARS — portrait and token sprites for every character (console AVATARS,
// docs/avatars.md, docs/consoles/AVATARS.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// Every sprite is drawn here, procedurally, as SVG, from the SAME parts the 3D
// figure is built from: the head, hair, helmet, cap, glasses and respirator
// profiles that shared/kit.js revolves into meshes (`FIGURE_PARTS`), and the
// outfit presets (`OUTFITS`) that dress standingFigure(). Those tables are
// copied into the generated block below by tools/gen_avatars.mjs, so this file
// imports nothing that imports three.js and the account chip on a flat page
// stays light; tools/check_avatars.mjs fails when the copy drifts from kit.js.
//
// A revolved profile is a list of [radius, y] rings. Seen from the front it is
// a silhouette: the right edge is the profile, the left edge its mirror. That
// is all a portrait needs — the outline of the head, of the hair mass over it,
// of the helmet shell — so a sprite and a figure can never disagree about the
// shape of a hard hat.
//
// Robots and software agents are not people and do not get a face: a robot
// sprite is its rig (AMR, cobot arm, cell robot, gantry, teleop arm) and an
// agent sprite is a badge with a small node graph and a glyph for its role.
//
// No image files, no third-party art, no likeness of anyone real. Every
// top-level name starts with `av` or `AV_` (the bundler shares one scope).
//
//   avSpriteSvg(look, { kind: "portrait" | "token", size }) -> SVG markup
//   avLookFromStyle(ctStyle, outfitName?)                   -> a human look from crew.js's style space
//   avLookFromOutfit(outfitName, seed)                      -> a human look from a kit.js outfit alone
//   avRobotLook(rig, accent?) / avAgentLook(glyph, accent?) -> non-human looks
//   avLookKey(look)                                         -> a short deterministic key (atlas frame id)

import { CT_AVATAR_STYLES, ctAvatarNormalize, ctAvatarOption } from "./crew.js";

// BEGIN GENERATED FIGURE PARTS (tools/gen_avatars.mjs — do not edit by hand)
export const AV_PARTS = Object.freeze({"HEAD_PROFILE":[[0.001,-0.23],[0.052,-0.214],[0.05,-0.145],[0.07,-0.12],[0.098,-0.095],[0.104,-0.055],[0.111,-0.01],[0.112,0.03],[0.108,0.07],[0.092,0.105],[0.055,0.124],[0.001,0.131]],"HAIR_STYLES":[{"profile":[[0.07,-0.05],[0.118,0.022],[0.121,0.058],[0.118,0.09],[0.1,0.115],[0.06,0.132],[0.001,0.139]],"sx":1,"sz":1.05,"dz":0.002,"tilt":-0.16},{"profile":[[0.072,-0.058],[0.124,0.018],[0.131,0.056],[0.129,0.092],[0.114,0.12],[0.07,0.141],[0.001,0.15]],"sx":1.02,"sz":1.09,"dz":-0.01,"tilt":-0.15},{"profile":[[0.058,-0.1],[0.106,-0.082],[0.122,-0.04],[0.13,0.006],[0.13,0.054],[0.121,0.094],[0.094,0.122],[0.046,0.139],[0.001,0.144]],"sx":1.12,"sz":1.18,"dz":-0.028,"tilt":-0.1},{"profile":[[0.07,-0.05],[0.118,0.022],[0.121,0.058],[0.116,0.092],[0.096,0.114],[0.066,0.13],[0.05,0.14],[0.06,0.152],[0.044,0.167],[0.001,0.175]],"sx":1,"sz":1.05,"dz":0,"tilt":-0.15},{"profile":[[0.05,-0.17],[0.094,-0.15],[0.112,-0.11],[0.126,-0.06],[0.132,0],[0.13,0.056],[0.12,0.098],[0.09,0.126],[0.042,0.142],[0.001,0.148]],"sx":1.3,"sz":1.18,"dz":-0.04,"tilt":-0.08},{"profile":[[0.072,-0.04],[0.116,0.028],[0.118,0.062],[0.115,0.092],[0.098,0.116],[0.058,0.132],[0.001,0.138]],"sx":0.99,"sz":1.02,"dz":0.002,"tilt":-0.18}],"HELMET_PROFILE":[[0.118,0.034],[0.126,0.048],[0.155,0.064],[0.148,0.078],[0.14,0.1],[0.118,0.13],[0.07,0.156],[0.001,0.166]],"CAP_PROFILE":[[0.116,0.03],[0.121,0.042],[0.126,0.058],[0.124,0.092],[0.111,0.12],[0.074,0.143],[0.001,0.152]],"CAP_PEAK_R":[0.62,0.56,0.16,0,0,0,0],"CAP_PEAK_Y":[0.022,0.014,0.002,0,0,0,0],"GLASSES_PROFILE":[[0.1,-0.012],[0.114,-0.004],[0.117,0.01],[0.104,0.018]],"RESPIRATOR_PROFILE":[[0.06,0],[0.058,0.025],[0.048,0.055],[0.03,0.072],[0.001,0.078]],"EAR_PROFILE":[[0.001,-0.086],[0.046,-0.076],[0.056,-0.052],[0.05,-0.028],[0.001,-0.014]],"PELVIS_PROFILE":[[0.001,0.775],[0.12,0.79],[0.148,0.835],[0.15,0.895],[0.132,0.935],[0.001,0.95]],"TORSO_PROFILE":[[0.001,0.905],[0.13,0.925],[0.148,1],[0.152,1.06],[0.176,1.16],[0.196,1.25],[0.198,1.3],[0.182,1.338],[0.134,1.374],[0.062,1.393],[0.001,1.4]],"HARNESS_PROFILE":[[0.001,0.965],[0.13,0.968],[0.156,0.975],[0.158,1.02],[0.13,1.03],[0.13,1.252],[0.196,1.26],[0.199,1.292],[0.13,1.3],[0.001,1.303]],"TOOLBELT_PROFILE":[[0.001,0.93],[0.15,0.936],[0.172,0.95],[0.176,0.996],[0.164,1.014],[0.001,1.02]],"SKIN_TONES":[15782587,14925211,13869949,12421216,10644808,8738359,6963496,5058335],"HAIR_TONES":[1709330,2892573,4599839,6965806,10122304,13941639,9407882,10634028],"WORK_TONES":[3625055,3951191,3099235,4872802,3365461,5917506,4478015,3817808],"TROUSER_TONES":[3094336,3423559,2699319,3884112,4014912,2897474],"FACE_SET":[{"brow":0,"open":0.62,"mouth":0.06,"ex":0.292,"mw":0.19,"lip":0.55,"browW":1,"lash":0.6},{"brow":0.22,"open":0.74,"mouth":0.2,"ex":0.3,"mw":0.22,"lip":0.8,"browW":0.86,"lash":1},{"brow":-0.2,"open":0.44,"mouth":-0.1,"ex":0.284,"mw":0.17,"lip":0.42,"browW":1.18,"lash":0.3},{"brow":0.1,"open":0.56,"mouth":0,"ex":0.296,"mw":0.2,"lip":0.62,"browW":0.94,"lash":0.5},{"brow":-0.1,"open":0.6,"mouth":-0.18,"ex":0.288,"mw":0.16,"lip":0.48,"browW":1.1,"lash":0.4},{"brow":0.16,"open":0.5,"mouth":0.12,"ex":0.304,"mw":0.21,"lip":0.72,"browW":0.9,"lash":0.8}],"IRIS_TONES":["#4a3a26","#3c2a1f","#5b4630","#3f5a53","#4c6274","#2e2320"]});
export const AV_OUTFITS = Object.freeze({"construction":{"helmet":true,"vest":true,"gloves":true,"glasses":true},"clinical":{"scrubCap":true,"glasses":true,"gloves":15262424},"marine":{"vest":true,"gloves":true},"kitchen":{"cap":15921386,"gloves":15262424},"office":{},"sport":{},"firefighter":{"helmet":14169130,"vest":true,"bands":15909195,"gloves":2830131,"boots":1777186},"diver":{"diveHood":true,"mask":true,"gloves":2830131,"boots":2830131},"welder":{"helmet":2040358,"mask":2759176,"cloth":7031342,"trousers":3813671,"gloves":9071174,"boots":1777186},"lineworker":{"helmet":15909195,"harness":true,"cloth":2768746,"trousers":2768746,"gloves":9071174,"boots":1777186},"silica":{"helmet":15909195,"respirator":10133928,"vest":true,"gloves":true},"robotTech":{"cap":2831682,"glasses":true,"toolBelt":true,"pouch":14168620,"cloth":3820122,"gloves":4872806},"aiTrainer":{"scrubCap":1777186,"mask":1316634,"gloves":3817808,"cloth":3817808},"longshore":{"helmet":15759903,"vest":15759903,"bands":14674158,"gloves":true,"glasses":true,"cloth":2831682},"healthcare":{"scrubCap":3836554,"glasses":true,"gloves":15262424,"cloth":3836554,"trousers":3108719},"chef":{"cap":16053488,"cloth":16053488,"trousers":2764081}});
// END GENERATED FIGURE PARTS

/** The sprite schema version, carried in the atlas frames file. */
export const AV_SPRITE_VERSION = 1;

/** Byte budget for the atlas (SVG) plus its frames (JSON), together. */
export const AV_ATLAS_BUDGET_BYTES = 160 * 1024;

export const AV_RIGS = Object.freeze(["amr", "cobot", "cell", "gantry", "teleop"]);
export const AV_GLYPHS = Object.freeze(["guide", "task", "learner", "tutor", "client", "provider", "evaluator", "governor"]);

const avHex = (c) => typeof c === "number" ? `#${c.toString(16).padStart(6, "0")}` : String(c ?? "#888");
const avF = (n) => (Math.round(n * 10) / 10).toString();

/** Shade a hex colour by `k` (-1 .. 1). */
export function avShade(color, k) {
  const h = avHex(color).replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map(ch).map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Map crew.js's hair shapes onto kit.js's six revolved hair masses. */
const AV_SHAPE_TO_STYLE = {
  "cap-low": 5, cap: 0, puff: 1, "puff-high": 1, long: 4, "long-narrow": 4, bun: 3, none: null,
  "wrap-full": "hijab", "wrap-high": "wrap", "wrap-low": "wrap", disc: "disc", brim: "cap",
};

/**
 * A human look from the learner's own style (crew.js CT_AVATAR_STYLES) and,
 * optionally, a kit.js outfit for the gear; without one the style's own PPE
 * category decides (hard hat, scrubs, chef, dive, marine, grounds, flight crew).
 */
export function avLookFromStyle(style = {}, outfitName = null) {
  const s = ctAvatarNormalize(style);
  const skin = ctAvatarOption("skin", s.skin).hex;
  const hairOpt = ctAvatarOption("hair", s.hair);
  const hair = ctAvatarOption("hairColour", s.hairColour).hex;
  const ppe = ctAvatarOption("ppe", s.ppe);
  const hat = ctAvatarOption("hardHat", s.hardHat).hex;
  const look = {
    kind: "human", skin, hair, hairStyle: AV_SHAPE_TO_STYLE[hairOpt.shape] ?? 0, covering: !!hairOpt.covering,
    face: s.body === "slender" ? 1 : s.body === "broad" ? 2 : s.body === "tall" ? 3 : s.body === "compact" ? 4 : s.body === "full" ? 5 : 0,
    cloth: ppe.outfit, trousers: 0x2a2f36, helmet: null, cap: null, scrubCap: null, diveHood: null,
    glasses: null, mask: null, respirator: null, vest: null, bands: null, harness: null, toolBelt: null, pouch: null, gloves: null,
  };
  if (outfitName && AV_OUTFITS?.[outfitName]) return avApplyOutfit(look, AV_OUTFITS[outfitName], outfitName);
  if (ppe.helmet) look.helmet = hat;
  if (ppe.vest) { look.vest = ppe.vestColour ?? 0xd8ff3a; look.bands = 0xdfe8ee; }
  if (ppe.mask) { look.mask = 0x4fd1ff; look.diveHood = 0x1f3a4a; }
  if (ppe.toque) look.cap = 0xffffff;
  if (ppe.id === "scrubs") look.scrubCap = 0x3a8a8a;
  if (ppe.ears) look.earDefenders = 0xd8322c;
  look.outfit = ppe.id;
  return look;
}

/** Lay a kit.js outfit preset over a look: gear the outfit names, colours it names. */
export function avApplyOutfit(look, outfit, name) {
  const o = { ...look, outfit: name };
  const tint = (v, d) => (v === true ? d : v ?? null);
  o.helmet = tint(outfit.helmet, 0xffcc00);
  o.cap = tint(outfit.cap, 0xd8532a);
  o.scrubCap = tint(outfit.scrubCap, 0x5b8fae);
  o.diveHood = tint(outfit.diveHood, 0x14171a);
  o.mask = tint(outfit.mask, 0x33434f);
  o.glasses = o.mask ? null : tint(outfit.glasses, 0xaebfcb);
  o.respirator = tint(outfit.respirator, 0x9aa1a8);
  o.vest = outfit.vest === true ? (outfit.cloth ?? look.cloth) : outfit.vest ?? null;
  o.bands = o.vest ? (outfit.bands ?? 0xdfe8ee) : null;
  o.harness = tint(outfit.harness, 0x2b2f33);
  o.toolBelt = outfit.toolBelt ? (outfit.pouch ?? 0xc08a4a) : null;
  o.gloves = tint(outfit.gloves, 0xd8a63a);
  if (outfit.cloth) o.cloth = outfit.cloth;
  if (outfit.trousers) o.trousers = outfit.trousers;
  return o;
}

/**
 * A human look from an outfit and a seed alone — a station's crew member,
 * a crew-role archetype: skin, hair and face come off the seed the way
 * figureLook() picks them, from the same tone tables.
 */
export function avLookFromOutfit(outfitName, seed = 0) {
  const P = AV_PARTS;
  const n = Math.abs(Math.floor(seed)) >>> 0;
  const base = {
    kind: "human",
    skin: P.SKIN_TONES[n % P.SKIN_TONES.length],
    hair: P.HAIR_TONES[(n >>> 5) % P.HAIR_TONES.length],
    hairStyle: (n >>> 3) % P.HAIR_STYLES.length,
    face: (n >>> 9) % P.FACE_SET.length,
    cloth: P.WORK_TONES[(n >>> 2) % P.WORK_TONES.length],
    trousers: P.TROUSER_TONES[(n >>> 4) % P.TROUSER_TONES.length],
    covering: false,
  };
  return avApplyOutfit(base, AV_OUTFITS?.[outfitName] ?? {}, outfitName);
}

/** A robot persona's look: its rig and an accent. */
export function avRobotLook(rig, accent = 0xf07a1f) {
  return { kind: "robot", rig: AV_RIGS.includes(rig) ? rig : "amr", accent, body: 0x8a94a0, dark: 0x2b3542 };
}

/** A software agent's look: a badge glyph and an accent. */
export function avAgentLook(glyph, accent = 0x8fe3ff) {
  return { kind: "agent", glyph: AV_GLYPHS.includes(glyph) ? glyph : "task", accent, dark: 0x0b1a24 };
}

/** The Guide's own look (shared/guide.js shows it in the panel header). */
export const AV_GUIDE_LOOK = Object.freeze(avAgentLook("guide", 0x8fe3ff));

/** A short deterministic key for a look, used as the atlas frame id. */
export function avLookKey(look) {
  const parts = look.kind === "human"
    ? ["h", look.outfit ?? "-", look.skin, look.hair, look.hairStyle, look.face, look.cloth, look.helmet, look.cap, look.scrubCap, look.diveHood, look.glasses, look.mask, look.respirator, look.vest, look.harness, look.toolBelt, look.covering ? 1 : 0]
    : look.kind === "robot" ? ["r", look.rig, look.accent] : ["a", look.glyph, look.accent];
  let h = 2166136261;
  for (const ch of parts.join("|")) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return `${look.kind[0]}${h.toString(36)}`;
}

// ------------------------------------------------------------ the painter

/** A revolved profile's front silhouette as an SVG path, in sprite units. */
function avProfilePath(profile, cx, cy, k, sx = 1) {
  if (!profile?.length) return "";
  const right = profile.map(([r, y]) => [cx + r * k * sx, cy - y * k]);
  const left = [...right].reverse().map(([x, y]) => [2 * cx - x, y]);
  const pts = [...right, ...left];
  return `M${pts.map(([x, y]) => `${avF(x)} ${avF(y)}`).join("L")}Z`;
}

/**
 * A revolved part as markup. Drawn inline for a single sprite; inside an atlas
 * (`ctx.defs` is a Map) the path is written once under `<defs>` and every
 * sprite that shares the shape refers to it with <use>, which is what keeps
 * fifty-odd heads under the byte budget.
 */
function avShape(ctx, name, profile, cx, cy, k, sx, attrs) {
  if (!ctx?.defs) return `<path d="${avProfilePath(profile, cx, cy, k, sx)}" ${attrs}/>`;
  const id = `avd-${name}-${ctx.kind[0]}`;
  if (!ctx.defs.has(id)) ctx.defs.set(id, `<path id="${id}" d="${avProfilePath(profile, cx, cy, k, sx)}"/>`);
  return `<use href="#${id}" ${attrs}/>`;
}

/** A face: brows, eyes, a nose shadow and a mouth, from kit.js's FACE_SET. */
function avFace(look, cx, cy, k) {
  const P = AV_PARTS;
  const f = P.FACE_SET[((look.face % P.FACE_SET.length) + P.FACE_SET.length) % P.FACE_SET.length] ?? P.FACE_SET[0];
  const iris = P.IRIS_TONES[(look.face * 7) % P.IRIS_TONES.length];
  const ex = 0.012 * k + f.ex * 0.14 * k, ey = cy - 0.012 * k, er = 0.016 * k * (0.7 + f.open * 0.5);
  const ink = "#241c17", brow = avHex(look.hair);
  const out = [];
  for (const sx of [-1, 1]) {
    const x = cx + sx * ex;
    out.push(`<ellipse cx="${avF(x)}" cy="${avF(ey)}" rx="${avF(er * 1.25)}" ry="${avF(er)}" fill="#f2ece6"/>`);
    out.push(`<circle cx="${avF(x)}" cy="${avF(ey)}" r="${avF(er * 0.62)}" fill="${iris}"/>`);
    out.push(`<circle cx="${avF(x)}" cy="${avF(ey)}" r="${avF(er * 0.3)}" fill="${ink}"/>`);
    const by = ey - er * 1.9 - f.brow * 0.01 * k;
    out.push(`<path d="M${avF(x - er * 1.4 * f.browW)} ${avF(by + er * 0.3)}Q${avF(x)} ${avF(by - er * 0.5)} ${avF(x + er * 1.4 * f.browW)} ${avF(by + er * 0.2)}" stroke="${brow}" stroke-width="${avF(er * 0.5)}" fill="none" stroke-linecap="round"/>`);
  }
  out.push(`<path d="M${avF(cx - 0.006 * k)} ${avF(cy + 0.03 * k)}Q${avF(cx)} ${avF(cy + 0.04 * k)} ${avF(cx + 0.008 * k)} ${avF(cy + 0.03 * k)}" stroke="${avShade(look.skin, -0.25)}" stroke-width="${avF(0.004 * k)}" fill="none"/>`);
  const mw = f.mw * 0.16 * k, my = cy + 0.068 * k;
  out.push(`<path d="M${avF(cx - mw)} ${avF(my)}Q${avF(cx)} ${avF(my + f.mouth * 0.02 * k + 0.006 * k)} ${avF(cx + mw)} ${avF(my)}" stroke="${avShade(look.skin, -0.45)}" stroke-width="${avF(0.006 * k * (0.6 + f.lip * 0.6))}" fill="none" stroke-linecap="round"/>`);
  return out.join("");
}

/** The human sprite: head and shoulders (portrait) or the head alone (token). */
function avHuman(look, kind, ctx = null) {
  const P = AV_PARTS;
  const k = kind === "token" ? 150 : 118;             // sprite px per metre
  const cx = 32, cy = kind === "token" ? 36 : 30;      // head centre in the 64 x 64 box
  const skin = avHex(look.skin), out = [];
  const hs = P.HAIR_STYLES[(typeof look.hairStyle === "number" ? look.hairStyle : 0) % P.HAIR_STYLES.length];

  if (kind === "portrait") {
    // Shoulders and chest: the top of TORSO_PROFILE, with the head at y 1.5 m.
    const torso = P.TORSO_PROFILE.filter(([, y]) => y >= 1.16).map(([r, y]) => [r * 1.5, y - 1.5]);
    torso.push([0.001, torso[torso.length - 1][1]]);
    const coat = avHex(look.vest ?? look.cloth);
    out.push(avShape(ctx, "torso", [[0.001, torso[0][1]], ...torso], cx, cy, k, 1, `fill="${coat}"`));
    // A neck, in skin, over the collar.
    out.push(`<rect x="${avF(cx - 0.05 * k)}" y="${avF(cy + 0.08 * k)}" width="${avF(0.1 * k)}" height="${avF(0.12 * k)}" fill="${avShade(skin, -0.12)}"/>`);
    if (look.vest) {
      const b = avHex(look.bands ?? 0xdfe8ee);
      out.push(`<rect x="${avF(cx - 0.21 * k)}" y="${avF(cy + 0.24 * k)}" width="${avF(0.42 * k)}" height="${avF(0.02 * k)}" fill="${b}"/>`);
      out.push(`<rect x="${avF(cx - 0.06 * k)}" y="${avF(cy + 0.14 * k)}" width="${avF(0.02 * k)}" height="${avF(0.2 * k)}" fill="${b}"/>`);
      out.push(`<rect x="${avF(cx + 0.04 * k)}" y="${avF(cy + 0.14 * k)}" width="${avF(0.02 * k)}" height="${avF(0.2 * k)}" fill="${b}"/>`);
    }
    if (look.harness) {
      const h = avHex(look.harness);
      out.push(`<path d="M${avF(cx - 0.12 * k)} ${avF(cy + 0.12 * k)}L${avF(cx - 0.03 * k)} ${avF(cy + 0.34 * k)}M${avF(cx + 0.12 * k)} ${avF(cy + 0.12 * k)}L${avF(cx + 0.03 * k)} ${avF(cy + 0.34 * k)}" stroke="${h}" stroke-width="${avF(0.028 * k)}" fill="none"/>`);
    }
  }
  // The skull, from HEAD_PROFILE, squeezed 0.95 in x exactly as personHead() does.
  out.push(avShape(ctx, "head", P.HEAD_PROFILE, cx, cy, k, 0.95, `fill="${skin}"`));
  // Both ears, from EAR_PROFILE, at the sides.
  for (const sx of [-1, 1]) {
    out.push(`<ellipse cx="${avF(cx + sx * 0.108 * k)}" cy="${avF(cy + 0.05 * k)}" rx="${avF(0.016 * k)}" ry="${avF(0.03 * k)}" fill="${avShade(skin, -0.1)}"/>`);
  }
  out.push(avFace(look, cx, cy, k));
  // What sits on the head, in personHead()'s order: hood, scrub cap, cap, helmet, hair.
  if (look.diveHood) {
    out.push(avShape(ctx, "hood", P.CAP_PROFILE, cx, cy, k, 1.02 * 1.06, `fill="${avHex(look.diveHood)}"`));
  } else if (look.scrubCap) {
    out.push(avShape(ctx, "scrub", P.CAP_PROFILE, cx, cy, k, 0.97, `fill="${avHex(look.scrubCap)}"`));
  } else if (look.cap) {
    out.push(avShape(ctx, "cap", P.CAP_PROFILE, cx, cy, k, 0.95, `fill="${avHex(look.cap)}"`));
    // The peak, dead ahead, from CAP_PEAK_R: a shallow ellipse below the brim ring.
    out.push(`<ellipse cx="${avF(cx)}" cy="${avF(cy - 0.028 * k)}" rx="${avF(0.116 * (1 + P.CAP_PEAK_R[0] * 0.14) * k)}" ry="${avF(0.017 * k)}" fill="${avShade(look.cap, -0.25)}"/>`);
  } else if (look.helmet) {
    out.push(avShape(ctx, "helmet", P.HELMET_PROFILE, cx, cy, k, 0.95, `fill="${avHex(look.helmet)}"`));
    out.push(`<path d="M${avF(cx - 0.11 * k)} ${avF(cy + 0.02 * k)}Q${avF(cx)} ${avF(cy + 0.11 * k)} ${avF(cx + 0.11 * k)} ${avF(cy + 0.02 * k)}" stroke="#1b1e22" stroke-width="${avF(0.006 * k)}" fill="none"/>`);
  } else if (look.covering) {
    // A head covering from the learner's style space: a wrap over the whole crown.
    out.push(avShape(ctx, "wrap", P.HAIR_STYLES[1].profile, cx, cy, k, 1.06, `fill="${avHex(look.hair)}"`));
  } else if (hs && look.hairStyle !== null) {
    out.push(avShape(ctx, `hair${look.hairStyle % P.HAIR_STYLES.length}`, hs.profile, cx, cy, k, 0.95 * hs.sx, `fill="${avHex(look.hair)}"`));
  }
  if (look.mask) {
    out.push(avShape(ctx, "mask", P.GLASSES_PROFILE, cx, cy + 0.01 * k, k * 1.22, 1.05 / 1.22, `fill="${avHex(look.mask)}" opacity="0.88"`));
  } else if (look.glasses) {
    out.push(avShape(ctx, "glasses", P.GLASSES_PROFILE, cx, cy, k, 1, `fill="${avHex(look.glasses)}" opacity="0.55"`));
  }
  if (look.respirator) {
    const rp = P.RESPIRATOR_PROFILE;
    const w = rp[0][0] * 1.15 * k, h = rp[rp.length - 1][1] * k;
    out.push(`<ellipse cx="${avF(cx)}" cy="${avF(cy + 0.045 * k + h * 0.3)}" rx="${avF(w)}" ry="${avF(h * 0.75)}" fill="${avHex(look.respirator)}"/>`);
    out.push(`<circle cx="${avF(cx)}" cy="${avF(cy + 0.065 * k)}" r="${avF(0.02 * k)}" fill="${avShade(look.respirator, -0.3)}"/>`);
  }
  if (look.earDefenders) {
    for (const sx of [-1, 1]) out.push(`<rect x="${avF(cx + sx * 0.11 * k - 0.02 * k)}" y="${avF(cy + 0.01 * k)}" width="${avF(0.04 * k)}" height="${avF(0.07 * k)}" rx="2" fill="${avHex(look.earDefenders)}"/>`);
  }
  return out.join("");
}

/** A robot sprite: the rig itself, no face. */
function avRobot(look) {
  const a = avHex(look.accent), b = avHex(look.body), d = avHex(look.dark), out = [];
  switch (look.rig) {
    case "amr":
      out.push(`<rect x="10" y="26" width="44" height="20" rx="4" fill="${b}"/>`, `<rect x="10" y="26" width="44" height="5" rx="2" fill="${a}"/>`,
        `<circle cx="20" cy="48" r="5" fill="${d}"/>`, `<circle cx="44" cy="48" r="5" fill="${d}"/>`,
        `<rect x="26" y="18" width="12" height="8" rx="2" fill="${d}"/>`, `<circle cx="32" cy="22" r="2" fill="${a}"/>`,
        `<circle cx="49" cy="38" r="3" fill="#d8322c"/>`);
      break;
    case "cobot":
      out.push(`<rect x="18" y="48" width="28" height="6" rx="2" fill="${d}"/>`, `<rect x="27" y="30" width="10" height="20" rx="4" fill="${b}"/>`,
        `<path d="M32 32L46 18" stroke="${b}" stroke-width="8" stroke-linecap="round"/>`, `<circle cx="32" cy="32" r="5" fill="${a}"/>`,
        `<circle cx="46" cy="18" r="4" fill="${a}"/>`, `<path d="M46 18L52 10M46 18L54 18" stroke="${d}" stroke-width="3" stroke-linecap="round"/>`);
      break;
    case "cell":
      out.push(`<rect x="8" y="12" width="48" height="42" fill="none" stroke="${a}" stroke-width="2.5"/>`,
        `<path d="M8 20H56M8 28H56M8 36H56M8 44H56" stroke="${a}" stroke-width="1" opacity="0.5"/>`,
        `<rect x="24" y="44" width="16" height="6" fill="${d}"/>`, `<path d="M32 44L32 30L42 22" stroke="${b}" stroke-width="6" stroke-linecap="round" fill="none"/>`,
        `<circle cx="42" cy="22" r="3.5" fill="${d}"/>`, `<rect x="48" y="30" width="6" height="8" fill="#d8322c"/>`);
      break;
    case "gantry":
      out.push(`<path d="M12 54V16H52V54" stroke="${b}" stroke-width="5" fill="none"/>`, `<rect x="8" y="12" width="48" height="6" fill="${a}"/>`,
        `<rect x="26" y="18" width="12" height="8" fill="${d}"/>`, `<path d="M32 26V38" stroke="${d}" stroke-width="2"/>`,
        `<rect x="22" y="38" width="20" height="8" fill="${a}"/>`, `<rect x="10" y="50" width="44" height="4" fill="${d}"/>`);
      break;
    default: // teleop arm: a base, a reach, a gripper and the operator's control link
      out.push(`<rect x="14" y="48" width="24" height="6" rx="2" fill="${d}"/>`, `<path d="M26 48L26 32L40 22" stroke="${b}" stroke-width="7" stroke-linecap="round" fill="none"/>`,
        `<circle cx="26" cy="32" r="4" fill="${a}"/>`, `<path d="M40 22L46 16M40 22L48 24" stroke="${d}" stroke-width="3" stroke-linecap="round"/>`,
        `<path d="M50 48Q56 40 50 32" stroke="${a}" stroke-width="2" fill="none" stroke-dasharray="3 2"/>`, `<circle cx="50" cy="48" r="3" fill="${a}"/>`);
  }
  return out.join("");
}

/** An agent sprite: a hexagon badge, a node graph, a glyph for the role. */
function avAgent(look) {
  const a = avHex(look.accent), d = avHex(look.dark);
  const hex = "M32 6L55 19V45L32 58L9 45V19Z";
  const out = [`<path d="${hex}" fill="${d}" stroke="${a}" stroke-width="2.5"/>`,
    `<path d="M22 40L32 24L42 40M22 40H42" stroke="${a}" stroke-width="1.5" fill="none" opacity="0.55"/>`,
    `<circle cx="22" cy="40" r="3" fill="${a}"/>`, `<circle cx="32" cy="24" r="3" fill="${a}"/>`, `<circle cx="42" cy="40" r="3" fill="${a}"/>`];
  switch (look.glyph) {
    case "guide": out.push(`<path d="M32 30L32 36" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`, `<circle cx="32" cy="42" r="1.8" fill="#fff"/>`, `<path d="M28 28Q32 22 36 28" stroke="#fff" stroke-width="2" fill="none"/>`); break;
    case "learner": out.push(`<circle cx="32" cy="33" r="6" fill="none" stroke="#fff" stroke-width="2"/>`, `<path d="M26 44Q32 38 38 44" stroke="#fff" stroke-width="2" fill="none"/>`); break;
    case "tutor": out.push(`<path d="M25 30H39V40H25Z" fill="none" stroke="#fff" stroke-width="2"/>`, `<path d="M28 35H36" stroke="#fff" stroke-width="2"/>`); break;
    case "client": out.push(`<path d="M24 36L32 28L40 36" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`, `<path d="M32 28V44" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`); break;
    case "provider": out.push(`<path d="M24 32L32 40L40 32" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`, `<path d="M32 24V40" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`); break;
    case "evaluator": out.push(`<path d="M25 34L30 39L40 28" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`); break;
    case "governor": out.push(`<path d="M32 26L40 29V35Q40 41 32 44Q24 41 24 35V29Z" fill="none" stroke="#fff" stroke-width="2.2"/>`, `<circle cx="32" cy="35" r="2.5" fill="#d8322c"/>`); break;
    default: out.push(`<rect x="26" y="29" width="12" height="10" rx="2" fill="none" stroke="#fff" stroke-width="2"/>`, `<path d="M29 34H35" stroke="#fff" stroke-width="2"/>`);
  }
  return out.join("");
}

/**
 * The sprite for a look as SVG markup. `kind` is "portrait" (head and
 * shoulders in a rounded square) or "token" (the head in a circle, for the
 * account chip and rosters). `size` sets width and height; the drawing is a
 * 64 x 64 box either way. `title` becomes the SVG's accessible name.
 */
export function avSpriteSvg(look, { kind = "portrait", size = 64, title = "", bg = null, id = null, defs = null } = {}) {
  const ctx = { kind, defs };
  const inner = look?.kind === "robot" ? avRobot(look) : look?.kind === "agent" ? avAgent(look) : avHuman(look ?? avLookFromOutfit("office", 0), kind, ctx);
  const clipId = `avc${id ?? avLookKey(look ?? {})}${kind[0]}`;
  const back = bg ?? (look?.kind === "human" ? avShade(look.cloth ?? 0x37505f, 0.55) : look?.kind === "robot" ? "#dfe8ee" : "#12303f");
  const frame = kind === "token"
    ? `<clipPath id="${clipId}"><circle cx="32" cy="32" r="31"/></clipPath><circle cx="32" cy="32" r="31" fill="${back}"/>`
    : `<clipPath id="${clipId}"><rect x="0" y="0" width="64" height="64" rx="10"/></clipPath><rect x="0" y="0" width="64" height="64" rx="10" fill="${back}"/>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="${esc(title)}"${title ? "" : ' aria-hidden="true"'}>` +
    (title ? `<title>${esc(title)}</title>` : "") + frame + `<g clip-path="url(#${clipId})">${inner}</g></svg>`;
}

/** The same sprite as a `data:` URL for an <img> or a CSS background. */
export function avSpriteDataUrl(look, opts = {}) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(avSpriteSvg(look, opts))}`;
}
