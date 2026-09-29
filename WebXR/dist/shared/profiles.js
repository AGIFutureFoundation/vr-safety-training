// A private experience per person on one device, and a free demo that keeps
// nothing (console GATE, tools/briefs/signin-brief.md, docs/sign-in.md).
//
// Every progress store — the training records, the learner passport, the
// episode log, the Bay World and Deep careers, and the quest stores — reads
// and writes through gtStorage() instead of `localStorage` directly. Which
// physical key that lands on depends on who is here:
//
//   This device   nobody signed in: the original, un-namespaced keys, exactly
//                 as before. The first time anybody signs in on this device,
//                 that data is adopted once into the "This device" profile
//                 (recorded in GT_REGISTRY_KEY) — in place, never moved, never
//                 deleted — so it reappears the moment they sign out.
//   An account    signed in (shared/auth.js's `vr-training-auth-v1`): every
//                 key gets a `::id-<digest>` suffix. The digest is the learner
//                 id folded through a salted FNV-1a pair in the style of
//                 episodes.js's hashCrewTag(), so no e-mail address, wallet
//                 address or provider subject is ever part of a storage key.
//                 Data minimisation, not cryptography.
//   Demo          "Try the free demo": everything these stores write goes to
//                 sessionStorage under `::demo` and dies with the tab. Nothing
//                 is written to localStorage while the demo is on.
//
// This module has no imports and touches no network. The bundler concatenates
// every module into one scope, so every top-level name here starts with `gt`.

const GT_AUTH_KEY = "vr-training-auth-v1";
const GT_DEMO_KEY = "vr-training-demo-v1";
const GT_SALT_KEY = "vr-training-profile-salt-v1";
export const GT_REGISTRY_KEY = "vr-training-profiles-v1";

/** The stores that are private to a profile. Everything else passes through untouched. */
export const GT_PROFILE_KEYS = [
  "vr-training-records-v1",
  "vr-passport-v1",
  "qm-side-games-v1",
  "vr-training-episodes-v1", "vr-training-episodes-current-v1",
  "bayworld-career-v1", "underwater-career-v1",
  "bayworld-quests-v1", "underwater-dives-v1", "underwater-activities-v1",
  // The treasure ledger (shared/treasures.js, docs/treasures.md).
  "vr-treasures-v1",
  "redwood-career-v1",
  // The learner's own avatar style (shared/crew.js's CT_AVATAR_KEY), picked on the account chip.
  "vr-avatar-style-v1",
  // The organisation layer (shared/org.js, docs/enterprise.md): organisations, cohorts, members, audit.
  "vr-org-v1",
  // Seat billing (shared/payments.js, docs/payments.md): checkout sessions, receipts, licences, the budget agent.
  "vr-payments-v1",
  // The person's membership level (shared/pm-membership.js, docs/payments.md §7).
  "vr-membership-v1",
  // DEAN's versions and modules (shared/dn-modules.js, docs/modules.md).
  "vr-dean-v1",
];

function gtLocal() { try { return globalThis.localStorage ?? null; } catch (_) { return null; } }
function gtSession() { try { return globalThis.sessionStorage ?? null; } catch (_) { return null; } }

/** 32-bit FNV-1a as hex — the same mixing episodes.js uses. */
function gtFnv1a(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

function gtSalt() {
  const ls = gtLocal();
  let s = null;
  try { s = ls?.getItem(GT_SALT_KEY) ?? null; } catch (_) { s = null; }
  if (!s) {
    const bytes = new Uint8Array(12);
    try { globalThis.crypto.getRandomValues(bytes); } catch (_) { for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256); }
    s = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    try { ls?.setItem(GT_SALT_KEY, s); } catch (_) { /* private mode: a per-load salt */ }
  }
  return s;
}

const gtHashCache = new Map();
/** A learner id folded to `id-<16 hex>`: the only form of it that is ever part of a key. */
export function gtHashId(id) {
  const t = String(id ?? "").trim();
  if (!t) return null;
  const salt = gtSalt();
  const memo = `${salt}|${t}`;
  if (gtHashCache.has(memo)) return gtHashCache.get(memo);
  const h1 = gtFnv1a(`${salt}:${t}`);
  const h2 = gtFnv1a(`${t}:${salt}:${h1}`);
  const out = `id-${h1}${h2}`;
  gtHashCache.set(memo, out);
  return out;
}

/** The signed-in learner id, read straight from auth.js's one key (no import, no cycle). */
function gtSignedInId() {
  try {
    const raw = JSON.parse(gtLocal()?.getItem(GT_AUTH_KEY) || "null");
    return typeof raw?.id === "string" && raw.id ? raw.id : null;
  } catch (_) { return null; }
}

export function gtIsDemo() {
  try { return gtSession()?.getItem(GT_DEMO_KEY) === "1"; } catch (_) { return false; }
}

/** Who the stores belong to right now: { kind: "demo" | "account" | "device", ns, label }. */
export function gtProfile() {
  if (gtIsDemo()) return { kind: "demo", ns: "demo", label: "Demo" };
  const id = gtSignedInId();
  if (id) return { kind: "account", ns: gtHashId(id), label: "Signed in" };
  return { kind: "device", ns: null, label: "This device" };
}

/** The physical key a store's key lands on for a profile. */
export function gtKeyFor(key, profile = gtProfile()) {
  if (profile.kind === "demo") return `${key}::demo`;
  if (!profile.ns || !GT_PROFILE_KEYS.includes(key)) return key;
  return `${key}::${profile.ns}`;
}

/**
 * The one-time, non-destructive migration: the un-namespaced progress already
 * on this device becomes the "This device" profile, in place. It is recorded
 * once and nothing is copied over, moved or removed — signing out shows it
 * again exactly as it was. Returns the registry.
 */
export function gtMigrateOnce(ls = gtLocal()) {
  if (!ls) return null;
  try {
    const have = JSON.parse(ls.getItem(GT_REGISTRY_KEY) || "null");
    if (have?.v === 1) return have;
  } catch (_) { /* rewrite below */ }
  const keys = GT_PROFILE_KEYS.filter((k) => { try { return ls.getItem(k) != null; } catch (_) { return false; } });
  const reg = { v: 1, device: { label: "This device", adoptedAt: new Date().toISOString(), keys } };
  try { ls.setItem(GT_REGISTRY_KEY, JSON.stringify(reg)); } catch (_) { /* private mode */ }
  return reg;
}

/**
 * A Storage-shaped object for the current profile. Stores call this on every
 * read and write, so signing in, out or into the demo takes effect at once.
 */
export function gtStorage() {
  const p = gtProfile();
  const back = p.kind === "demo" ? gtSession() : gtLocal();
  if (p.kind === "account") gtMigrateOnce();
  if (!back) return null;
  return {
    getItem: (k) => back.getItem(gtKeyFor(k, p)),
    setItem: (k, v) => back.setItem(gtKeyFor(k, p), v),
    removeItem: (k) => back.removeItem(gtKeyFor(k, p)),
  };
}

// ---------------------------------------------------------------- the demo

function gtEmit() {
  try { globalThis.dispatchEvent?.(new Event("gt:profile")); } catch (_) { /* headless */ }
}

/** One tap: every world opens, and nothing outlives this tab. */
export function gtEnterDemo() {
  try { gtSession()?.setItem(GT_DEMO_KEY, "1"); } catch (_) { return false; }
  gtEmit();
  return true;
}

/** How many runs the demo holds (records written this tab). */
export function gtDemoRuns() {
  try {
    const raw = JSON.parse(gtSession()?.getItem("vr-training-records-v1::demo") || "[]");
    return Array.isArray(raw) ? raw.length : 0;
  } catch (_) { return 0; }
}

function gtDropDemo() {
  const ss = gtSession();
  for (const k of GT_PROFILE_KEYS) { try { ss?.removeItem(`${k}::demo`); } catch (_) { /* ignore */ } }
}

/** Leave the demo. Its runs stay in the tab until carried over or discarded. */
export function gtLeaveDemo({ discard = false } = {}) {
  try { gtSession()?.removeItem(GT_DEMO_KEY); } catch (_) { /* ignore */ }
  if (discard) gtDropDemo();
  gtEmit();
}

function gtMerge(into, from) {
  if (Array.isArray(into) && Array.isArray(from)) {
    const seen = new Set(into.map((x) => JSON.stringify(x)));
    return into.concat(from.filter((x) => !seen.has(JSON.stringify(x))));
  }
  if (into && from && typeof into === "object" && typeof from === "object") {
    const out = { ...into };
    for (const [k, v] of Object.entries(from)) out[k] = k in out ? gtMerge(out[k], v) : v;
    return out;
  }
  return into ?? from;
}

/**
 * Carry the demo's runs into the signed-in account — only when the learner
 * pressed the button for it (the default is off). Lists are appended, objects
 * merged with the account's own values winning. Returns the stores carried.
 */
export function gtCarryDemo() {
  const id = gtSignedInId();
  const ls = gtLocal(), ss = gtSession();
  if (!id || !ls || !ss) return 0;
  const p = { kind: "account", ns: gtHashId(id) };
  gtMigrateOnce(ls);
  let carried = 0;
  for (const k of GT_PROFILE_KEYS) {
    let from = null, into = null;
    try { from = JSON.parse(ss.getItem(`${k}::demo`) || "null"); } catch (_) { from = null; }
    if (from == null) continue;
    try { into = JSON.parse(ls.getItem(gtKeyFor(k, p)) || "null"); } catch (_) { into = null; }
    try { ls.setItem(gtKeyFor(k, p), JSON.stringify(into == null ? from : gtMerge(into, from))); carried += 1; } catch (_) { /* quota */ }
  }
  gtDropDemo();
  gtEmit();
  return carried;
}

/**
 * The line every results screen shows during the demo. records.js calls this
 * after each run; it shows a small notice with a Sign in button beside it.
 */
export function gtNoteDemoRun() {
  if (!gtIsDemo() || typeof document === "undefined" || !document.body) return false;
  let el = document.getElementById("gt-demo-note");
  if (!el) {
    el = document.createElement("div");
    el.id = "gt-demo-note"; el.setAttribute("role", "status");
    el.style.cssText = "position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:10040;background:#0e1822;color:#f2f6fa;border:1px solid #ffd54a;border-radius:10px;padding:10px 12px;font:15px/1.4 system-ui,sans-serif;display:flex;gap:10px;align-items:center;max-width:calc(100vw - 32px)";
    const t = document.createElement("span");
    t.textContent = "Demo run — sign in to keep it";
    const b = document.createElement("button");
    b.type = "button"; b.textContent = "Sign in";
    b.style.cssText = "min-height:36px;border-radius:8px;border:1px solid #6a8296;background:#1b2a38;color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer;padding:0 10px";
    b.addEventListener("click", () => { el.remove(); document.getElementById("gt-account")?.click(); });
    el.append(t, b);
    document.body.appendChild(el);
  }
  clearTimeout(gtNoteDemoRun.timer);
  gtNoteDemoRun.timer = setTimeout(() => el.remove(), 9000);
  return true;
}
