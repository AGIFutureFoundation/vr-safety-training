// The budget agent of enterprise seat billing (console TILL, docs/payments.md
// §4). An organisation's coordinator writes a policy — a spend ceiling per
// period, a seat floor and cap per cohort, auto-renew on or off, an approval
// threshold above which a human confirms — and the agent plans within it:
// it quotes and buys seats when a cohort fills, renews before a licence
// ends, releases seats nobody uses, provisions the cohort once a receipt
// lands, refuses anything over the ceiling and queues it for a human, and
// writes every decision with its reason to the audit log.
//
// The step is pure and deterministic:
//
//     pmAgentStep(state, policy, events, { config, now }) → { actions, state }
//
// It touches no store and no network, skips events it has already applied
// (idempotent across replays), and every action carries a reason. A price is
// only ever the config block's amount for the policy's plan — an unpriced
// plan means the agent buys nothing and asks a human. `pmAgentRun` is the
// impure runner on this device: it executes the actions against a
// payments.js adapter (the mock, on-device), provisions through org.js and
// audits each decision. A deployment can run the same step in a Worker.
//
// Every top-level name here starts with `pm`/`PM_` (the bundler shares one scope).

import { pmCreateAdapter, pmLoad, pmSave, pmSeats, pmSeatsAll, pmExpiring, pmReleaseSeats, pmPlan, pmSeatCount, pmMoney, PM_MOCK } from "./payments.js";
import { enAudit, enCohort, enSetCohortSeats } from "./org.js";

export const PM_AGENT_VERSION = 1;
export const PM_AGENT_EVENT_TYPES = ["period.tick", "cohort.filled", "cohort.unused", "licence.expiring", "receipt.paid", "approval.granted", "approval.denied"];
export const PM_AGENT_ACTIONS = ["checkout", "release", "provision", "queue", "refuse", "dequeue"];
export const PM_MAX_DECISIONS = 50;
const PM_MAX_SEEN = 2000;
const PM_RENEW_WINDOW_DAYS = 14;

// ------------------------------------------------------------------ policy

/** A policy as the agent reads it: every number an integer or null ("not set"), never a default amount. */
export function pmPolicyClean(raw = {}) {
  const p = raw && typeof raw === "object" ? raw : {};
  const int = (v, min, max) => { const n = Number(v); return Number.isInteger(n) && n >= min && n <= max ? n : null; };
  return {
    planId: /^[a-z0-9-]{1,40}$/.test(String(p.planId ?? "")) ? String(p.planId) : null,
    ceilingMinor: int(p.ceilingMinor, 0, 1e12),
    periodDays: int(p.periodDays, 1, 3660) ?? 30,
    seatFloor: int(p.seatFloor, 0, 1000) ?? 0,
    seatCap: int(p.seatCap, 1, 1000) ?? 1000,
    autoRenew: p.autoRenew === true,
    releaseUnused: p.releaseUnused !== false,
    approvalThresholdMinor: int(p.approvalThresholdMinor, 0, 1e12),
  };
}

/** A fresh agent state. */
export function pmAgentEmpty() { return { v: PM_AGENT_VERSION, period: null, spentMinor: 0, seen: [], queue: [], decisions: [] }; }

// -------------------------------------------------------------- pure step

function pmDecide(st, ev, kind, reason, action = null) {
  st.decisions.push({ at: ev.at, eventId: ev.id, kind, reason: String(reason).slice(0, 160), action: action ? { ...action } : null });
  if (st.decisions.length > PM_MAX_DECISIONS) st.decisions.splice(0, st.decisions.length - PM_MAX_DECISIONS);
}

function pmEnqueue(st, ev, why, proposed, reason, actions) {
  const id = `aq-${ev.id.replace(/^evt-|^ev-/, "")}`;
  if (!st.queue.some((q) => q.id === id)) st.queue.push({ id, why, proposed: { ...proposed }, reason: String(reason).slice(0, 160), at: ev.at });
  const action = { kind: "queue", queueId: id, why, proposed: { ...proposed }, reason, eventId: ev.id };
  actions.push(action);
  pmDecide(st, ev, "queue", reason, action);
}

/**
 * Consider buying `proposed.seats` on the policy's plan. The one place money
 * is committed: unpriced → queue; no ceiling → queue; over the ceiling →
 * refuse and queue; over the threshold (unless a human already approved) →
 * queue; else a checkout action, and the spend is counted at once.
 */
function pmConsider(st, policy, ev, proposed, actions, config, approved = false) {
  const plan = pmPlan(config, policy.planId);
  const seats = pmSeatCount(proposed.seats);
  const cohort = proposed.cohortName ?? proposed.cohortId ?? "the cohort";
  if (!plan || !seats) { pmDecide(st, ev, "refuse", `${cohort}: no plan or no whole seat count to buy`); actions.push({ kind: "refuse", proposed, reason: "no plan or seats", eventId: ev.id }); return; }
  if (!Number.isInteger(plan.amountMinor)) { pmEnqueue(st, ev, "unpriced", { ...proposed, seats, planId: plan.id }, `${cohort}: ${seats} seat(s) wanted, but ${plan.name} has no configured amount — a human must set it`, actions); return; }
  const amount = plan.amountMinor * seats;
  const money = pmMoney(amount, config);
  if (policy.ceilingMinor == null) { pmEnqueue(st, ev, "no-ceiling", { ...proposed, seats, planId: plan.id, amountMinor: amount }, `${cohort}: ${seats} seat(s) at ${money} — no spend ceiling is set, so a human decides`, actions); return; }
  const remaining = policy.ceilingMinor - st.spentMinor;
  if (amount > remaining) {
    const reason = `${cohort}: ${seats} seat(s) at ${money} exceeds the remaining ceiling (${pmMoney(Math.max(0, remaining), config)}) — refused, queued for a human`;
    actions.push({ kind: "refuse", proposed: { ...proposed, seats, planId: plan.id, amountMinor: amount }, reason, eventId: ev.id });
    pmDecide(st, ev, "refuse", reason);
    pmEnqueue(st, ev, "over-ceiling", { ...proposed, seats, planId: plan.id, amountMinor: amount }, reason, actions);
    return;
  }
  if (!approved && policy.approvalThresholdMinor != null && amount > policy.approvalThresholdMinor) {
    pmEnqueue(st, ev, "approval", { ...proposed, seats, planId: plan.id, amountMinor: amount }, `${cohort}: ${seats} seat(s) at ${money} is over the approval threshold (${pmMoney(policy.approvalThresholdMinor, config)}) — waiting for a human`, actions);
    return;
  }
  st.spentMinor += amount;
  const reason = `${cohort}: ${proposed.renewal ? "renew" : "buy"} ${seats} seat(s) on ${plan.name} for ${money}${approved ? " (approved by a human)" : ""}; ${pmMoney(policy.ceilingMinor - st.spentMinor, config)} of the ceiling left`;
  const action = { kind: "checkout", cohortId: proposed.cohortId ?? null, orgId: proposed.orgId ?? null, seats, planId: plan.id, amountMinor: amount, renewal: !!proposed.renewal, approved, reason, eventId: ev.id };
  actions.push(action);
  pmDecide(st, ev, "checkout", reason, action);
}

/**
 * One deterministic step: the events in the order given, each applied once.
 * Returns the actions to execute and the next state; the input state is not
 * changed.
 */
export function pmAgentStep(state, policy, events, { config = {}, now = null } = {}) {
  const st = JSON.parse(JSON.stringify(state && state.v === PM_AGENT_VERSION ? state : pmAgentEmpty()));
  const pol = pmPolicyClean(policy);
  const actions = [];
  for (const ev of Array.isArray(events) ? events : []) {
    if (!ev || typeof ev.id !== "string" || !PM_AGENT_EVENT_TYPES.includes(ev.type) || typeof ev.at !== "string") continue;
    if (st.seen.includes(ev.id)) continue;
    st.seen.push(ev.id);
    if (st.seen.length > PM_MAX_SEEN) st.seen.splice(0, st.seen.length - PM_MAX_SEEN);
    // The spend period: opened by the first event, rolled over when an event lands past its end.
    if (!st.period || ev.at >= st.period.end) {
      const start = ev.at;
      const end = new Date(new Date(start).getTime() + pol.periodDays * 86400000).toISOString();
      if (st.period) pmDecide(st, ev, "period", `new ${pol.periodDays}-day period from ${start.slice(0, 10)}; ${pmMoney(st.spentMinor, config)} spent in the last one`);
      st.period = { start, end }; st.spentMinor = 0;
    }
    const cohortName = ev.cohortName ?? ev.cohortId ?? "the cohort";
    switch (ev.type) {
      case "period.tick": break;
      case "cohort.filled": {
        const planned = pmSeatCount(ev.planned) ?? 0, licensed = Math.max(0, ev.licensed | 0), used = Math.max(0, ev.used | 0);
        const target = Math.min(pol.seatCap, Math.max(pol.seatFloor, planned, used));
        const need = target - licensed;
        if (need <= 0) { pmDecide(st, ev, "hold", `${cohortName}: ${used} used of ${licensed} licensed; target ${target} within floor ${pol.seatFloor} / cap ${pol.seatCap} — nothing to buy`); break; }
        pmConsider(st, pol, ev, { cohortId: ev.cohortId, orgId: ev.orgId ?? null, cohortName, seats: need }, actions, config);
        break;
      }
      case "cohort.unused": {
        const licensed = Math.max(0, ev.licensed | 0), used = Math.max(0, ev.used | 0);
        const keep = Math.max(used, pol.seatFloor);
        const release = licensed - keep;
        if (!pol.releaseUnused) { pmDecide(st, ev, "hold", `${cohortName}: ${licensed - used} unused seat(s) kept — releasing is off in the policy`); break; }
        if (release <= 0) { pmDecide(st, ev, "hold", `${cohortName}: ${licensed} licensed, ${used} used, floor ${pol.seatFloor} — nothing to release`); break; }
        const reason = `${cohortName}: release ${release} unused seat(s) at period end (keeping ${keep}: ${used} used, floor ${pol.seatFloor})`;
        const action = { kind: "release", cohortId: ev.cohortId, seats: release, keep, reason, eventId: ev.id };
        actions.push(action); pmDecide(st, ev, "release", reason, action);
        break;
      }
      case "licence.expiring": {
        const seats = pmSeatCount(ev.seats);
        if (!seats) { pmDecide(st, ev, "hold", `${cohortName}: licence ${ev.licenceId ?? ""} ends but names no seats`); break; }
        // With releasing on, a renewal keeps what is used (never under the floor); otherwise the licence renews as it was.
        const renew = Math.min(pol.seatCap, pol.releaseUnused && Number.isInteger(ev.used) ? Math.max(ev.used, pol.seatFloor, 1) : seats);
        if (!pol.autoRenew) { pmEnqueue(st, ev, "renewal-off", { cohortId: ev.cohortId, orgId: ev.orgId ?? null, cohortName, seats: renew, renewal: true }, `${cohortName}: ${seats} seat(s) end ${String(ev.periodEnd ?? "").slice(0, 10)} — auto-renew is off, a human decides`, actions); break; }
        pmConsider(st, pol, ev, { cohortId: ev.cohortId, orgId: ev.orgId ?? null, cohortName, seats: renew, renewal: true }, actions, config);
        break;
      }
      case "receipt.paid": {
        const seats = pmSeatCount(ev.seats) ?? 0;
        const reason = `${cohortName}: receipt ${ev.receiptId ?? ""} landed for ${seats} seat(s) — provision the cohort`;
        const action = { kind: "provision", cohortId: ev.cohortId, seats, receiptId: ev.receiptId ?? null, reason, eventId: ev.id };
        actions.push(action); pmDecide(st, ev, "provision", reason, action);
        break;
      }
      case "approval.granted": {
        const i = st.queue.findIndex((q) => q.id === ev.queueId);
        if (i < 0) { pmDecide(st, ev, "hold", `approval ${ev.queueId ?? ""} names nothing in the queue`); break; }
        const [item] = st.queue.splice(i, 1);
        actions.push({ kind: "dequeue", queueId: item.id, reason: `a human approved: ${item.reason}`, eventId: ev.id });
        pmConsider(st, pol, ev, { ...item.proposed, cohortName: item.proposed.cohortName ?? cohortName }, actions, config, true);
        break;
      }
      case "approval.denied": {
        const i = st.queue.findIndex((q) => q.id === ev.queueId);
        if (i < 0) { pmDecide(st, ev, "hold", `denial ${ev.queueId ?? ""} names nothing in the queue`); break; }
        const [item] = st.queue.splice(i, 1);
        const reason = `a human declined: ${item.reason}`;
        actions.push({ kind: "dequeue", queueId: item.id, reason, eventId: ev.id }); pmDecide(st, ev, "deny", reason);
        break;
      }
      default: break;
    }
  }
  return { actions, state: st };
}

// ------------------------------------------------------------ on-device run

/** The stored agent (policy + state) for this profile. */
export function pmAgentLoad() {
  const a = pmLoad().agent;
  return { policy: pmPolicyClean(a?.policy), state: a?.state && a.state.v === PM_AGENT_VERSION ? a.state : pmAgentEmpty() };
}

export function pmAgentSave(policy, state) {
  const s = pmLoad();
  s.agent = { policy: pmPolicyClean(policy), state };
  return pmSave(s);
}

/** A coordinator writes the policy (audited). */
export function pmAgentSetPolicy(policy) {
  const { state } = pmAgentLoad();
  const pol = pmPolicyClean(policy);
  pmAgentSave(pol, state);
  enAudit("agent-policy", `ceiling ${pol.ceilingMinor ?? "not set"} minor/${pol.periodDays}d · seats ${pol.seatFloor}–${pol.seatCap} · auto-renew ${pol.autoRenew ? "on" : "off"} · approval over ${pol.approvalThresholdMinor ?? "never"} · plan ${pol.planId ?? "none"}`);
  return pol;
}

/**
 * The events this device can see right now, with deterministic ids so a
 * second run of the same picture is a replay and changes nothing: a period
 * tick per day, a filled cohort (used ≥ licensed) or one with unused seats,
 * a licence ending within the renewal window.
 */
export function pmAgentEvents({ now = new Date().toISOString(), policy = null } = {}) {
  const pol = pmPolicyClean(policy ?? pmAgentLoad().policy);
  const day = String(now).slice(0, 10);
  const events = [{ id: `ev-tick-${day}`, type: "period.tick", at: now }];
  const expiring = pmExpiring(PM_RENEW_WINDOW_DAYS, now);
  const ending = new Set(expiring.map((l) => l.cohortId));
  for (const v of pmSeatsAll(now)) {
    const c = enCohort(v.cohortId);
    const base = { at: now, cohortId: v.cohortId, orgId: c?.orgId ?? null, cohortName: c?.name ?? v.cohortId, used: v.used, licensed: v.licensed, planned: v.planned };
    if (v.used >= v.licensed && Math.min(pol.seatCap, Math.max(pol.seatFloor, v.planned, v.used)) > v.licensed) events.push({ id: `ev-filled-${v.cohortId}-${v.used}-${v.licensed}-${day}`, type: "cohort.filled", ...base });
    // Unused seats are released at period end only (a seat is paid for its period), so a release and a fill never chase each other.
    else if (ending.has(v.cohortId) && v.licensed - Math.max(v.used, pol.seatFloor) > 0) events.push({ id: `ev-unused-${v.cohortId}-${v.used}-${v.licensed}-${day}`, type: "cohort.unused", ...base });
  }
  for (const l of expiring) {
    const c = enCohort(l.cohortId);
    const v = pmSeats(l.cohortId, now);
    events.push({ id: `ev-expiring-${l.id}`, type: "licence.expiring", at: now, cohortId: l.cohortId, orgId: c?.orgId ?? null, cohortName: c?.name ?? l.cohortId, licenceId: l.id, seats: l.seats, used: v?.used ?? null, periodEnd: l.periodEnd });
  }
  return events;
}

/**
 * Run one step on this device and execute its actions against the adapter:
 * a checkout is quoted, opened and (mock) completed so the receipt lands;
 * a release narrows the licences; a provision re-asserts the cohort's seats;
 * every decision is audited. Returns `{ actions, results, state }`.
 */
export async function pmAgentRun(adapter, events, { config = {}, now = new Date().toISOString(), policy = null } = {}) {
  const loaded = pmAgentLoad();
  const pol = pmPolicyClean(policy ?? loaded.policy);
  const { actions, state } = pmAgentStep(loaded.state, pol, events, { config, now });
  const results = [];
  for (const a of actions) {
    if (a.kind === "checkout") {
      const q = adapter.quote(a.planId, a.seats, { orgId: a.orgId, cohortId: a.cohortId });
      const r = q ? await adapter.checkout(q) : null;
      let receipt = null;
      if (r?.ok && adapter.id === PM_MOCK) receipt = adapter.mockComplete(r.session.id)?.receipt ?? null;
      results.push({ action: a, ok: !!r?.ok, session: r?.session ?? null, receipt });
      if (receipt) { const st = pmAgentStep(state, pol, [{ id: `ev-paid-${receipt.id}`, type: "receipt.paid", at: now, cohortId: receipt.cohortId, cohortName: enCohort(receipt.cohortId)?.name, receiptId: receipt.number, seats: receipt.seats }], { config, now }); Object.assign(state, st.state); for (const p of st.actions) results.push({ action: p, ok: true }); }
    } else if (a.kind === "release") {
      const r = pmReleaseSeats(a.cohortId, a.seats, "budget agent, period end");
      // The cohort's planned seats follow what is kept, so the next fill check agrees with the release.
      if (r.released && pmSeatCount(a.keep)) enSetCohortSeats(a.cohortId, a.keep, "budget agent: unused seats released at period end");
      results.push({ action: a, ...r });
    }
    else if (a.kind === "provision") { const v = pmSeats(a.cohortId, now); results.push({ action: a, ok: !!v, provisioned: v && v.licensed > v.planned ? enSetCohortSeats(a.cohortId, v.licensed, "budget agent: licence landed") : false }); }
    else results.push({ action: a, ok: true });
  }
  // Every decision this run added is one audit line, so the trail re-reads the agent's reasoning.
  const had = new Set(loaded.state.decisions.map((d) => `${d.eventId}|${d.kind}|${d.reason}`));
  for (const d of state.decisions) if (!had.has(`${d.eventId}|${d.kind}|${d.reason}`)) enAudit("agent-decision", `${d.kind}: ${d.reason}`);
  pmAgentSave(pol, state);
  return { actions, results, state, policy: pol };
}

/** A human confirms or declines a queued item (audited through the step's own decision). */
export async function pmAgentResolve(adapter, queueId, granted, { config = {}, now = new Date().toISOString() } = {}) {
  const ev = { id: `ev-${granted ? "approve" : "deny"}-${queueId}-${now}`, type: granted ? "approval.granted" : "approval.denied", at: now, queueId };
  return pmAgentRun(adapter, [ev], { config, now });
}

/** The default adapter for the agent on this device: the block as configured, or the mock when no provider is named. */
export function pmAgentAdapter(config = {}) {
  return pmCreateAdapter({ ...config, provider: config?.provider ?? PM_MOCK });
}
