// Membership levels (console TILL, docs/payments.md §7): the one purchase a
// person may make on this platform is an upgrade of their own membership.
// In-game items, rewards, treasures and badges are never for sale.
//
// Levels are configuration — the `levels` list of the `payments` block —
// each with entitlements (worlds, programmes, certificates, cohortSeats,
// guideVoice) and an amount that is null in the public build: no amount is
// ever written here or shown when the block has none. The first level is the
// one every profile has. A person's current level lives in their private
// profile store (`vr-membership-v1` through gtStorage(), like every other
// per-person key). Other modules ask `pmHas(entitlement, …)`.
//
// Checkout goes through the payments.js adapter (the mock on-device, or the
// W3C Payment Request API with Apple Pay / Google Pay when a deployment has
// configured a merchant — see pmPaymentMethods); the webhook completes the
// membership on a paid receipt through the hook registered below.
//
// Every top-level name starts with `pm`/`PM_` (the bundler shares one scope).

import { gtStorage } from "./profiles.js";
import { pmCreateAdapter, pmMoney, pmOnMembership, PM_MOCK } from "./payments.js";

export const PM_MEMBER_KEY = "vr-membership-v1";
export const PM_MEMBER_VERSION = 1;
export const PM_ENTITLEMENTS = ["worlds", "programmes", "certificates", "cohortSeats", "guideVoice"];

function pmMemberStore() { try { return gtStorage(); } catch (_) { return null; } }

/** The levels as configured (already cleaned by auth.js), the first being the base level. */
export function pmLevels(config) { return Array.isArray(config?.levels) ? config.levels : []; }

export function pmLevel(config, id) { return pmLevels(config).find((l) => l.id === id) ?? null; }

/** What the profile on this device holds: `{ levelId, since, receiptId }` or null. */
export function pmMemberLoad() {
  try {
    const raw = JSON.parse(pmMemberStore()?.getItem(PM_MEMBER_KEY) || "null");
    return raw && raw.v === PM_MEMBER_VERSION && typeof raw.levelId === "string" ? raw : null;
  } catch (_) { return null; }
}

/** Set the profile's level (a paid receipt, or the base level). */
export function pmSetLevel(levelId, { receiptId = null, at = new Date().toISOString() } = {}) {
  if (!/^[a-z0-9-]{1,40}$/.test(String(levelId ?? ""))) return false;
  try { pmMemberStore()?.setItem(PM_MEMBER_KEY, JSON.stringify({ v: PM_MEMBER_VERSION, levelId, since: at, receiptId })); } catch (_) { return false; }
  try { globalThis.dispatchEvent?.(new CustomEvent("pm:membership", { detail: { levelId } })); } catch (_) { /* headless */ }
  return true;
}

export function pmClearLevel() { try { pmMemberStore()?.removeItem(PM_MEMBER_KEY); } catch (_) { /* ignore */ } }

/** The current level: the stored one when the config still has it, else the base level (or null with no levels). */
export function pmMyLevel(config) {
  const levels = pmLevels(config);
  const have = pmMemberLoad();
  return (have && levels.find((l) => l.id === have.levelId)) ?? levels[0] ?? null;
}

/**
 * Does the current level grant an entitlement? `worlds` / `programmes`: null
 * means all, else the list must name `value`; `certificates` / `guideVoice`:
 * booleans; `cohortSeats`: the number (0 when unset), compared with `value`
 * when one is given. With no levels configured everything is granted — the
 * public platform gates nothing behind a membership.
 */
export function pmHas(entitlement, config, value = null, level = pmMyLevel(config)) {
  if (!pmLevels(config).length) return true;
  const e = level?.entitlements ?? {};
  switch (entitlement) {
    case "worlds": case "programmes": { const list = e[entitlement]; return list == null ? true : value == null ? list.length > 0 : list.includes(value); }
    case "certificates": case "guideVoice": return e[entitlement] === true;
    case "cohortSeats": { const n = e.cohortSeats | 0; return value == null ? n > 0 : n >= value; }
    default: return false;
  }
}

/** A quote for a level: one membership for its period, at the configured amount (or "not configured"). */
export function pmMembershipQuote(adapter, levelId) {
  const q = adapter?.quote(levelId, 1, { kind: "membership" });
  return q ? { ...q, kind: "membership", levelId } : null;
}

/** The adapter the Upgrade view uses: the block as configured, or the mock standing in when no provider is named. */
export function pmMembershipAdapter(config) { return pmCreateAdapter({ ...config, provider: config?.provider ?? PM_MOCK }); }

/** A level's entitlements as short text lines for a view. */
export function pmEntitlementLines(level) {
  const e = level?.entitlements ?? {};
  return [
    `Worlds: ${e.worlds == null ? "all" : e.worlds.length ? e.worlds.join(", ") : "none"}`,
    `Programmes: ${e.programmes == null ? "all" : e.programmes.length ? e.programmes.join(", ") : "none"}`,
    `Certificates: ${e.certificates ? "yes" : "no"}`,
    `Cohort seats: ${e.cohortSeats | 0}`,
    `Guide voice: ${e.guideVoice ? "yes" : "no"}`,
  ];
}

/** The level and amount as one line, never inventing a number. */
export function pmLevelLine(level, config) { return `${level.name} — ${pmMoney(level.amountMinor, config)}${level.period && level.period !== "once" ? ` per ${level.period}` : ""}`; }

// The webhook completes a membership: a paid receipt whose quote carried `kind: "membership"` sets the level here.
pmOnMembership((receipt) => { if (receipt?.levelId) pmSetLevel(receipt.levelId, { receiptId: receipt.id, at: receipt.at }); });
