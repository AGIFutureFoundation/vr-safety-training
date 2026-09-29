// TYCOON — a small play economy, like a life sim (console TYCOON, docs/consoles/TYCOON.md).
//
// The learner earns Crew Credits — a PLAY currency, never money — for passed
// training shifts, rents a room or a shop from generic procedural buildings on
// the parish sites, opens one small business tied to a trade, hires crew from
// GRIOT's parish characters, and keeps the business open with weekly upkeep and
// a safety inspection read verbatim from a real catalog station. Nothing here
// buys anything: no purchase flow, no loot box, no random reward, no price.
//
// Seams (the Packs brief's shapes):
//   tyLedger()                -> { currency, balance, entries, rentals, business, crew, week, day, playSeconds }
//   tyListings(parishId)      -> [{ id, parish, site, siteName, type: "room"|"shop", name, rent, waterside, procedural: true }]
//   tyEarn(stationId, { recordId, level, passed = true }) -> { paid, amount, duplicate }
// plus tySettle(records), tyRent(id), tyVacate(id), tyOpen(businessId, listingId, { completed }),
// tyInspect(ticks), tyHire(crewId, { completed }), tyTick(dtSeconds), tySignsFor(parishId), tyMountLedger(el, opts).
//
// Every top-level name is prefixed `ty`/`TY_`: the bundler concatenates modules into one scope.

import { GR_ROSTER } from "./npc-data.js";
import { NP_PARISHES, npParish } from "./np-parishes.js";
import { npWaterAt } from "./np-parish.js";
import { gtStorage } from "./profiles.js";

export const TY_KEY = "ty-ledger-v1";
export const TY_CURRENCY = "Crew Credits";
export const TY_SHORT = "CC";
/** Play time: a day is three minutes of walking a world, a week seven days. */
export const TY_DAY_SECONDS = 180;
export const TY_WEEK_SECONDS = TY_DAY_SECONDS * 7;
/** A customer visit every minute of play while the business is open. */
export const TY_VISIT_SECONDS = 60;
/** An inspection holds for two play weeks. */
export const TY_INSPECTION_WEEKS = 2;
/** A station pass pays by the learner level on its record (one to five). */
export const TY_PAY_BASE = 20;
export const TY_PAY_STEP = 10;
export const TY_LEVELS = 5;
/** Base weekly rent in Crew Credits by listing type (a play figure; each listing varies by a few credits). */
export const TY_RENT = { room: 30, shop: 60 };
/** Entries kept before older ones fold into one carried-forward entry. */
export const TY_MAX_ENTRIES = 300;

/**
 * The businesses: each tied to a real catalog station whose tagline supplies its safety checklist verbatim
 * (tools/check_tycoon.mjs re-reads every item against WebXR/smartcity/js/sims-meta.js).
 */
export const TY_BUSINESSES = [
  {
    id: "food-truck", name: "Food truck", trade: "Culinary", station: "receiving-dock-food", water: false,
    open: 120, upkeep: 20, perVisit: 6,
    blurb: "A kitchen on wheels parked by the site gate; the cold chain comes first.",
    checklist: ["invoice against the order", "the truck's reefer read before the door opens", "every cold and frozen item probed and refused outside the limit", "packaging and dates checked", "refusals logged", "goods moved to cold storage in the window", "the log signed"],
  },
  {
    id: "tool-rental", name: "Tool rental", trade: "Maintenance", station: "ad-depot-tool-control-and-fod-walk", water: false,
    open: 150, upkeep: 25, perVisit: 7,
    blurb: "A counter of hand and power tools lent to the crews; every kit counts out and back.",
    checklist: ["the crib kit signed out and counted", "every loose item tethered or pocketed at the aircraft", "a shoulder-to-shoulder FOD walk of the bay", "the aircraft released only when the kit counts back complete"],
  },
  {
    id: "bike-repair", name: "Bike repair stand", trade: "Property maintenance", station: "pm-storage-and-bike-room", water: false,
    open: 80, upkeep: 12, perVisit: 4,
    blurb: "A stand for the commuters' bikes and e-bikes; the chargers are audited before the shop opens.",
    checklist: ["fuel out of the cages", "boxes below the sprinklers", "the inspector's test run with the monitoring company told", "the e-bike chargers audited", "the old lagging left for the licensed crew"],
  },
  {
    id: "corner-shop", name: "Corner shop", trade: "Retail", station: "ml-retail-counter-deescalation", water: false,
    open: 140, upkeep: 22, perVisit: 6,
    blurb: "A small shop for the shift's snacks and gloves; the counter plan is known before the doors open.",
    checklist: ["The clerk's own way off the counter known before the doors open", "loose items cleared", "the cues noticed early", "distance kept", "a calm script tried first", "the supervisor and the facility's plan brought in the moment it stops working", "a debrief requested afterward"],
  },
  {
    id: "boat-charter", name: "Boat charter", trade: "Maritime", station: "mw-ferry-deckhand-and-passenger-safety", water: true,
    open: 200, upkeep: 35, perVisit: 10,
    blurb: "A small passenger boat from a waterside shop; the station bill and the count come before the lines.",
    checklist: ["the station bill read", "vest and radio on", "the deck walked before boarding", "the gangway landed", "the life-saving gear walked", "the passengers landed in order and the run logged"],
  },
];

/** Crew: GRIOT's parish characters, each unlocked by passing the station of its first hand-off. */
export const TY_CREW_WAGE = 8;
export const TY_CREW = GR_ROSTER.filter((c) => c.world === "parish").map((c) => ({
  id: c.id, name: c.name, role: c.role, station: (c.handoffs ?? []).find((h) => h.kind === "station")?.id ?? null, wage: TY_CREW_WAGE,
})).filter((c) => c.station);

/** Kinds of site that stand on the water's edge (a boat charter can open from their shops). */
export const TY_WATER_KINDS = ["port", "ferry", "harbour", "marina", "landing", "shipyard", "lock", "lifeguard", "rescue-station", "shoreline", "seawall", "wetland"];

// ---------------------------------------------------------------- listings

const TY_KIND_WORDS = {
  port: "the wharves", levee: "the levee", pump: "the pump station", "pumping-station": "the pump station", streetcar: "the streetcar barn",
  rail: "the rail yard", hospital: "the hospital", campus: "the campus", school: "the school", stadium: "the arena", hospitality: "the hotel row",
  wetland: "the marsh edge", lock: "the lock", ferry: "the ferry landing", bridge: "the bridge approach", "bridge-yard": "the bridge yard",
  airport: "the airfield", warehouse: "the warehouses", shipyard: "the shipyard", landing: "the landing", park: "the park", transit: "the bus depot",
  refinery: "the plant gate", floodgate: "the floodgate", harbour: "the harbour", "fire-station": "the firehouse", floodwall: "the floodwall",
  substation: "the substation", marina: "the boat slips", staging: "the staging yard", "timber-yard": "the timber yard", trail: "the trailhead",
  "union-hall": "the union hall", construction: "the building site", workshop: "the workshop", nursery: "the plant nursery", lifeguard: "the lifeguard post",
  fire: "the firehouse", "rescue-station": "the rescue station", forestry: "the forestry yard", events: "the events ground", seawall: "the seawall",
  "transit-barn": "the transit barn", remediation: "the cleanup site", shoreline: "the shoreline", recreation: "the recreation ground",
};
const TY_ROOM_WORDS = ["Upstairs room", "Back room", "Corner room", "Loft room", "Garden room"];
const TY_SHOP_WORDS = ["Shopfront", "Ground-floor shop", "Corner unit", "Workshop bay", "Kiosk unit"];

/** A small stable hash (FNV-1a) so a listing's name and rent never change between visits. */
export function tyHash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

function tyWaterside(parish, site) {
  if (TY_WATER_KINDS.includes(site.kind)) return true;
  const [x, z] = site.position ?? [0, 0];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, w = npWaterAt(parish, x + Math.cos(a) * 120, z + Math.sin(a) * 120);
    if (w && w.kind !== "wetland") return true;
  }
  return false;
}

const tyListingCache = new Map();
/** Every listing of one parish: a room and a shop per site, procedural, never a real address. */
export function tyListings(parishId) {
  if (tyListingCache.has(parishId)) return tyListingCache.get(parishId);
  const parish = npParish(parishId);
  if (!parish || parish.id !== parishId) return [];
  const out = [];
  for (const site of parish.sites) {
    const near = TY_KIND_WORDS[site.kind] ?? "the site";
    const waterside = tyWaterside(parish, site);
    for (const type of ["room", "shop"]) {
      const id = `${parish.id}/${site.id}/${type}`;
      const h = tyHash(id);
      const words = type === "room" ? TY_ROOM_WORDS : TY_SHOP_WORDS;
      out.push({
        id, parish: parish.id, site: site.id, siteName: site.name, type,
        name: `${words[h % words.length]} by ${near}`,
        rent: TY_RENT[type] + 5 * ((h >>> 8) % 3) - 5,
        waterside, procedural: true,
      });
    }
  }
  tyListingCache.set(parishId, out);
  return out;
}

/** A listing by id (`<parish>/<site>/<room|shop>`), from any map. */
export function tyListing(id) {
  const parishId = String(id ?? "").split("/")[0];
  return tyListings(parishId).find((l) => l.id === id) ?? null;
}

export function tyBusiness(id) { return TY_BUSINESSES.find((b) => b.id === id) ?? TY_EXTRA_BUSINESSES.find((b) => b.id === id) ?? null; }
/** Seam for other consoles' businesses (BAYQUEST): same shape as TY_BUSINESSES, tied to a real station; the five stay the five. */
export const TY_EXTRA_BUSINESSES = [];
export function tyAddBusinesses(list = []) { for (const b of list) if (b?.id && !tyBusiness(b.id)) TY_EXTRA_BUSINESSES.push(b); return TY_EXTRA_BUSINESSES.length; }
export function tyCrewMember(id) { return TY_CREW.find((c) => c.id === id) ?? null; }
/** What one pass pays at a learner level (clamped one to five). */
export function tyPayFor(level) { const n = Math.max(1, Math.min(TY_LEVELS, Math.round(Number(level) || 1))); return TY_PAY_BASE + TY_PAY_STEP * (n - 1); }

// ------------------------------------------------------------------- store

let tyStoreOverride = null;
/** Tests hand in a store (getItem/setItem); the app uses the profile's storage. */
export function tyUseStore(store) { tyStoreOverride = store; }
function tyStore() { if (tyStoreOverride) return tyStoreOverride; try { return gtStorage(); } catch (_) { return null; } }

function tyFresh() { return { v: 1, balance: 0, entries: [], paid: {}, rentals: [], business: null, crew: [], playSeconds: 0, visitClock: 0, week: 0 }; }

function tyLoad() {
  try {
    const raw = JSON.parse(tyStore()?.getItem(TY_KEY) ?? "null");
    if (!raw || typeof raw !== "object" || raw.v !== 1) return tyFresh();
    const s = { ...tyFresh(), ...raw };
    s.entries = Array.isArray(s.entries) ? s.entries.filter((e) => e && Number.isFinite(e.amount)) : [];
    s.balance = s.entries.reduce((a, e) => a + e.amount, 0);
    s.rentals = Array.isArray(s.rentals) ? s.rentals.filter((r) => tyListing(r.listing)) : [];
    s.crew = Array.isArray(s.crew) ? s.crew.filter((id) => tyCrewMember(id)) : [];
    if (s.business && !tyBusiness(s.business.id)) s.business = null;
    return s;
  } catch (_) { return tyFresh(); }
}

function tySave(s) {
  if (s.entries.length > TY_MAX_ENTRIES) {
    const old = s.entries.splice(0, s.entries.length - TY_MAX_ENTRIES + 1);
    s.entries.unshift({ id: `carried-${s.week}-${old.length}`, kind: "carried", amount: old.reduce((a, e) => a + e.amount, 0), note: "Carried forward", at: old[old.length - 1].at });
  }
  try { tyStore()?.setItem(TY_KEY, JSON.stringify(s)); } catch (_) { /* private mode — the run stays unsaved */ }
}

function tyPost(s, kind, amount, note, id = null) {
  const e = { id: id ?? `${kind}-${s.entries.length}-${Math.round(s.playSeconds)}`, kind, amount: Math.round(amount), note: String(note).slice(0, 120), at: Math.round(s.playSeconds) };
  s.entries.push(e); s.balance += e.amount;
  return e;
}

// The passport records a milestone as a zero-credit award from source `tycoon` (never mixing the currencies).
let tyRecorder = null;
/** The app hands in the passport's award function; tests leave it out. */
export function tySetRecorder(fn) { tyRecorder = typeof fn === "function" ? fn : null; }
function tyRecord(id, reason) { try { tyRecorder?.("tycoon", { reputation: 0, credits: 0, reason, attemptId: id }); } catch (_) { /* the ledger never fails on the passport */ } }

// ------------------------------------------------------------------- views

function tyWeekOf(s) { return Math.floor(s.playSeconds / TY_WEEK_SECONDS + 1e-9); }
function tyInspected(s) { return !!(s.business?.inspectedWeek != null && tyWeekOf(s) - s.business.inspectedWeek < TY_INSPECTION_WEEKS); }

/** The ledger as the UI and other consoles read it (a copy; writing to it changes nothing). */
export function tyLedger() {
  const s = tyLoad();
  const b = s.business ? { ...s.business, name: tyBusiness(s.business.id)?.name, inspected: tyInspected(s), trading: !!s.business.open && tyInspected(s) } : null;
  return {
    currency: TY_CURRENCY, balance: s.balance, entries: s.entries.slice(), rentals: s.rentals.map((r) => ({ ...r, ...tyListing(r.listing) })),
    business: b, crew: s.crew.map((id) => tyCrewMember(id)), week: tyWeekOf(s) + 1, day: Math.floor((s.playSeconds % TY_WEEK_SECONDS) / TY_DAY_SECONDS) + 1,
    playSeconds: s.playSeconds, paidRecords: Object.keys(s.paid).length,
    weekly: tyWeekly(s),
  };
}

/** What a week boundary will charge: rent, upkeep and wages. */
function tyWeekly(s) {
  const rent = s.rentals.reduce((a, r) => a + (tyListing(r.listing)?.rent ?? 0), 0);
  const upkeep = s.business?.open ? tyBusiness(s.business.id)?.upkeep ?? 0 : 0;
  const wages = s.crew.length * TY_CREW_WAGE;
  return { rent, upkeep, wages, total: rent + upkeep + wages };
}

// ----------------------------------------------------------------- actions

/** Pay a passed station once, by the learner level on its record. */
export function tyEarn(stationId, { recordId = null, level = 1, passed = true } = {}) {
  if (!stationId || !passed) return { paid: false, amount: 0, duplicate: false };
  const s = tyLoad();
  const key = recordId ? String(recordId) : `station:${stationId}`;
  if (s.paid[key]) return { paid: false, amount: 0, duplicate: true };
  const amount = tyPayFor(level);
  s.paid[key] = 1;
  tyPost(s, "earn", amount, `Training shift passed: ${String(stationId).replace(/-/g, " ")}`, `earn-${key}`);
  tySave(s);
  return { paid: true, amount, duplicate: false };
}

/** Pay every passed record not yet paid (records.js rows: { id, simId, passed, level }). */
export function tySettle(records = []) {
  let paid = 0, amount = 0;
  for (const r of records ?? []) {
    if (!r?.passed || !r.simId) continue;
    const res = tyEarn(r.simId, { recordId: r.id ?? `${r.simId}@${r.at ?? ""}`, level: r.level ?? 1 });
    if (res.paid) { paid += 1; amount += res.amount; }
  }
  return { paid, amount };
}

/** Rent a listing: this week's rent is paid now. One room and one shop at most. */
export function tyRent(listingId) {
  const l = tyListing(listingId);
  if (!l) return { ok: false, why: "No such listing." };
  const s = tyLoad();
  if (s.rentals.some((r) => r.listing === l.id)) return { ok: false, why: "You already rent it." };
  if (s.rentals.some((r) => tyListing(r.listing)?.type === l.type)) return { ok: false, why: `You already rent a ${l.type}; give it up first.` };
  if (s.balance < l.rent) return { ok: false, why: `It needs ${l.rent} ${TY_CURRENCY} for this week's rent; pass a training shift to earn more.` };
  tyPost(s, "rent", -l.rent, `This week's rent: ${l.name}`);
  s.rentals.push({ listing: l.id, since: tyWeekOf(s) });
  tySave(s); tyRecord(`rent-${l.id}-${s.entries.length}`, `Crew Credits: rented ${l.name} (${l.siteName})`);
  return { ok: true, listing: l };
}

/** Give up a rental (a business in that shop closes with it). */
export function tyVacate(listingId) {
  const s = tyLoad();
  const before = s.rentals.length;
  s.rentals = s.rentals.filter((r) => r.listing !== listingId);
  if (s.business?.listing === listingId) s.business = null;
  tySave(s);
  return { ok: s.rentals.length < before };
}

/** Open a business in a rented shop; needs its station passed (completed(id) -> bool) and the opening cost. */
export function tyOpen(businessId, listingId, { completed = () => false } = {}) {
  const b = tyBusiness(businessId), l = tyListing(listingId);
  if (!b || !l) return { ok: false, why: "No such business or listing." };
  const s = tyLoad();
  if (l.type !== "shop" || !s.rentals.some((r) => r.listing === l.id)) return { ok: false, why: "Rent a shop first." };
  if (s.business) return { ok: false, why: "You run one business at a time." };
  if (b.water && !l.waterside) return { ok: false, why: `${b.name} needs a waterside shop.` };
  if (!completed(b.station)) return { ok: false, why: `Pass its training station first: ${b.station.replace(/-/g, " ")}.` };
  if (s.balance < b.open) return { ok: false, why: `Opening needs ${b.open} ${TY_CURRENCY}.` };
  tyPost(s, "open", -b.open, `Opened: ${b.name} in ${l.name}`);
  s.business = { id: b.id, listing: l.id, open: true, openedWeek: tyWeekOf(s), inspectedWeek: null, visits: 0 };
  tySave(s); tyRecord(`open-${b.id}-${s.entries.length}`, `Crew Credits: opened a ${b.name.toLowerCase()} (${l.siteName})`);
  return { ok: true, business: b };
}

/** The safety inspection: every item of the business's checklist ticked (an array of booleans). */
export function tyInspect(ticks = []) {
  const s = tyLoad();
  const b = s.business && tyBusiness(s.business.id);
  if (!b) return { ok: false, why: "No business to inspect." };
  const missing = b.checklist.filter((_, i) => !ticks[i]);
  if (missing.length) return { ok: false, why: `Not yet: ${missing[0]}.`, missing };
  s.business.inspectedWeek = tyWeekOf(s);
  s.business.open = true;
  tyPost(s, "inspect", 0, `Safety inspection passed: ${b.name}`);
  tySave(s); tyRecord(`inspect-${b.id}-${s.business.inspectedWeek}`, `Crew Credits: ${b.name.toLowerCase()} passed its safety inspection`);
  return { ok: true, untilWeek: s.business.inspectedWeek + TY_INSPECTION_WEEKS + 1 };
}

/** Hire a crew member whose unlock station is passed; the wage is charged weekly. */
export function tyHire(crewId, { completed = () => false } = {}) {
  const c = tyCrewMember(crewId);
  if (!c) return { ok: false, why: "No such crew member." };
  const s = tyLoad();
  if (!s.business) return { ok: false, why: "Open a business first." };
  if (s.crew.includes(c.id)) return { ok: false, why: `${c.name} is already on your crew.` };
  if (!completed(c.station)) return { ok: false, why: `${c.name} joins once you pass ${c.station.replace(/-/g, " ")}.` };
  s.crew.push(c.id);
  tyPost(s, "hire", 0, `Hired: ${c.name}, ${c.role.toLowerCase()}`);
  tySave(s); tyRecord(`hire-${c.id}`, `Crew Credits: hired ${c.name}`);
  return { ok: true, crew: c };
}

export function tyLetGo(crewId) { const s = tyLoad(); s.crew = s.crew.filter((id) => id !== crewId); tySave(s); return { ok: true }; }

/**
 * Advance play time by `dt` seconds (the app calls it while the learner walks). Visits pay while the business is
 * trading; each week boundary charges rent, then upkeep, then wages — a charge that cannot be met is not taken:
 * the rental lapses (closing a business in it), the business closes, the crew member leaves. Returns the events.
 */
export function tyTick(dt) {
  const step = Math.max(0, Math.min(Number(dt) || 0, TY_WEEK_SECONDS * 4));
  if (!step) return [];
  const s = tyLoad();
  const events = [];
  let left = step, guard = 0;
  while (left > 0 && guard++ < 100000) {
    const toWeek = Math.max(0, (s.week + 1) * TY_WEEK_SECONDS - s.playSeconds);
    const toVisit = Math.max(0, TY_VISIT_SECONDS - s.visitClock);
    const d = Math.min(left, toWeek, toVisit);
    s.playSeconds += d; s.visitClock += d; left -= d;
    if (left < 1e-9) left = 0;
    if (s.visitClock >= TY_VISIT_SECONDS - 1e-9) {
      s.visitClock = 0;
      if (s.business?.open && tyInspected(s)) {
        const b = tyBusiness(s.business.id);
        const pay = b.perVisit + s.crew.length;
        s.business.visits += 1;
        tyPost(s, "visit", pay, `A customer at the ${b.name.toLowerCase()}`);
        events.push({ kind: "visit", amount: pay });
      } else if (s.business?.open && !tyInspected(s) && s.business.inspectedWeek != null) {
        s.business.open = false;
        events.push({ kind: "closed", why: "inspection due" });
      }
    }
    if (tyWeekOf(s) > s.week) {
      s.week = tyWeekOf(s);
      for (const r of s.rentals.slice()) {
        const l = tyListing(r.listing);
        if (s.balance >= l.rent) { tyPost(s, "rent", -l.rent, `Weekly rent: ${l.name}`); events.push({ kind: "rent", amount: -l.rent }); }
        else {
          s.rentals = s.rentals.filter((x) => x !== r);
          if (s.business?.listing === l.id) s.business = null;
          events.push({ kind: "lapsed", listing: l.id });
        }
      }
      if (s.business?.open) {
        const b = tyBusiness(s.business.id);
        if (s.balance >= b.upkeep) { tyPost(s, "upkeep", -b.upkeep, `Weekly upkeep: ${b.name}`); events.push({ kind: "upkeep", amount: -b.upkeep }); }
        else { s.business.open = false; events.push({ kind: "closed", why: "upkeep" }); }
      }
      for (const id of s.crew.slice()) {
        const c = tyCrewMember(id);
        if (s.balance >= c.wage) { tyPost(s, "wage", -c.wage, `Weekly wage: ${c.name}`); events.push({ kind: "wage", amount: -c.wage }); }
        else { s.crew = s.crew.filter((x) => x !== id); events.push({ kind: "left", crew: id }); }
      }
    }
  }
  tySave(s);
  return events;
}

/** The signs on the learner's rented buildings in one parish: `{ site, text }` (the app hangs a plane on the site). */
export function tySignsFor(parishId) {
  const s = tyLoad();
  return s.rentals.map((r) => tyListing(r.listing)).filter((l) => l?.parish === parishId).map((l) => ({
    site: l.site, type: l.type,
    text: s.business?.listing === l.id ? `${tyBusiness(s.business.id).name} — ${TY_CURRENCY} play business` : `${l.type === "room" ? "Your room" : "Your shop"} — rented in ${TY_CURRENCY}`,
  }));
}

/** Every parish id with listings (for the checker and the ledger's map list). */
export function tyParishIds() { return NP_PARISHES.map((p) => p.id); }

// ---------------------------------------------------------------------- UI

function tyEl(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

/**
 * The ledger panel: balance, week, rentals, the business and its inspection checklist, crew, the latest entries.
 * opts: { parishId, completed(id) -> bool, toast(text), onChange() }.
 */
export function tyMountLedger(el, { parishId = null, completed = () => false, toast = () => {}, onChange = () => {} } = {}) {
  if (!el) return null;
  const act = (res, okText) => { toast(res.ok ? okText : res.why); render(); onChange(); };
  function render() {
    const L = tyLedger();
    el.textContent = "";
    el.appendChild(tyEl("p", "lead", `${L.balance} ${TY_CURRENCY} · week ${L.week}, day ${L.day}`));
    el.appendChild(tyEl("p", "note", `${TY_CURRENCY} are a play currency for this world only — never money, never bought, never sold. A passed training shift pays by your level; rent, upkeep and wages come due each play week (${L.weekly.total} ${TY_SHORT} next week).`));
    el.appendChild(tyEl("h3", null, "Rented"));
    if (!L.rentals.length) el.appendChild(tyEl("p", "note", "Nothing yet. Every job board lists a room and a shop to rent."));
    for (const r of L.rentals) {
      const row = tyEl("div", "quest"); row.appendChild(tyEl("b", null, r.name)); row.appendChild(tyEl("small", null, `${r.siteName} · ${r.rent} ${TY_SHORT} a week · a generic procedural building`));
      const give = tyEl("button", "btn", "Give up"); give.type = "button"; give.addEventListener("click", () => act(tyVacate(r.listing), `Gave up ${r.name}.`));
      row.appendChild(give); el.appendChild(row);
    }
    el.appendChild(tyEl("h3", null, "Business"));
    const shop = L.rentals.find((r) => r.type === "shop");
    if (L.business) {
      const b = tyBusiness(L.business.id);
      const row = tyEl("div", "quest"); row.appendChild(tyEl("b", null, `${b.name} — ${L.business.trading ? "trading" : L.business.inspected ? "closed" : "inspection due"}`));
      row.appendChild(tyEl("small", null, `${b.perVisit + L.crew.length} ${TY_SHORT} a visit · upkeep ${b.upkeep} a week · ${L.business.visits} visits so far`));
      el.appendChild(row);
      el.appendChild(tyEl("p", "note", `Safety inspection, read from the station "${b.station.replace(/-/g, " ")}": tick each item as you check it.`));
      const boxes = b.checklist.map((item) => { const lab = tyEl("label", "ty-check"); const cb = document.createElement("input"); cb.type = "checkbox"; lab.append(cb, ` ${item}`); el.appendChild(lab); el.appendChild(document.createElement("br")); return cb; });
      const go = tyEl("button", "btn primary", "Pass the inspection"); go.type = "button";
      go.addEventListener("click", () => act(tyInspect(boxes.map((c) => c.checked)), `${b.name}: inspection passed — open for two play weeks.`));
      el.appendChild(go);
    } else if (shop) {
      for (const b of [...TY_BUSINESSES, ...TY_EXTRA_BUSINESSES]) {
        const row = tyEl("div", "quest"); row.appendChild(tyEl("b", null, b.name)); row.appendChild(tyEl("small", null, `${b.trade} · opens for ${b.open} ${TY_SHORT} · station: ${b.station.replace(/-/g, " ")}${completed(b.station) ? " (passed)" : ""}${b.water ? " · waterside shops only" : ""}`));
        const open = tyEl("button", "btn", "Open here"); open.type = "button";
        open.addEventListener("click", () => act(tyOpen(b.id, shop.listing, { completed }), `${b.name} opened. Pass its safety inspection to start trading.`));
        row.appendChild(open); el.appendChild(row);
      }
    } else el.appendChild(tyEl("p", "note", "Rent a shop to open a food truck, a tool rental, a bike repair stand, a corner shop or, by the water, a boat charter."));
    el.appendChild(tyEl("h3", null, "Crew"));
    for (const c of TY_CREW) {
      const on = L.crew.some((x) => x.id === c.id), can = completed(c.station);
      const row = tyEl("div", "quest"); row.appendChild(tyEl("b", null, `${c.name} · ${c.role}`)); row.appendChild(tyEl("small", null, on ? `On your crew · ${c.wage} ${TY_SHORT} a week` : can ? `Ready to join · ${c.wage} ${TY_SHORT} a week` : `Joins after: ${c.station.replace(/-/g, " ")}`));
      const b = tyEl("button", "btn", on ? "Let go" : "Hire"); b.type = "button"; b.disabled = !on && (!can || !L.business);
      b.addEventListener("click", () => act(on ? tyLetGo(c.id) : tyHire(c.id, { completed }), on ? `${c.name} left the crew.` : `${c.name} joined your crew.`));
      row.appendChild(b); el.appendChild(row);
    }
    el.appendChild(tyEl("h3", null, "Latest"));
    const ul = tyEl("ul", "stations");
    for (const e of L.entries.slice(-8).reverse()) ul.appendChild(tyEl("li", null, `${e.amount > 0 ? "+" : ""}${e.amount} ${TY_SHORT} · ${e.note}`));
    el.appendChild(ul);
  }
  render();
  return { render };
}

/** The job board's rows: this site's two listings with a Rent button each. */
export function tyBoardRows(el, parishId, siteId, { toast = () => {}, onChange = () => {} } = {}) {
  if (!el) return;
  el.textContent = "";
  const rows = tyListings(parishId).filter((l) => l.site === siteId);
  if (!rows.length) return;
  el.appendChild(tyEl("p", "eyebrow", `To rent here · ${TY_CURRENCY} (play currency)`));
  const L = tyLedger();
  for (const l of rows) {
    const mine = L.rentals.some((r) => r.listing === l.id);
    const row = tyEl("div", "quest"); row.appendChild(tyEl("b", null, l.name)); row.appendChild(tyEl("small", null, `${l.type} · ${l.rent} ${TY_SHORT} a week${l.waterside ? " · waterside" : ""} · a generic procedural building`));
    const b = tyEl("button", "btn", mine ? "Rented" : "Rent"); b.type = "button"; b.disabled = mine;
    b.addEventListener("click", () => { const r = tyRent(l.id); toast(r.ok ? `Rented: ${l.name}. This week's rent is paid.` : r.why); tyBoardRows(el, parishId, siteId, { toast, onChange }); onChange(); });
    row.appendChild(b); el.appendChild(row);
  }
}
