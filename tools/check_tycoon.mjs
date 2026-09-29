#!/usr/bin/env node
/**
 * TYCOON — the Crew Credits play economy (console TYCOON, docs/consoles/TYCOON.md):
 *
 *     node tools/check_tycoon.mjs
 *
 * WebXR/shared/ty-economy.js keeps a small play economy beside the passport. This checker proves:
 *   - arithmetic: across a scripted life (earn by level, a duplicate pay refused, rent, open, inspect, hire, weeks of
 *     visits, rent, upkeep and wages, a lapse when the credits run out, a long ledger folding into "carried forward")
 *     the balance always equals the sum of the entries, never goes below zero, and each week charges exactly
 *     rent + upkeep + wages;
 *   - listings: a room and a shop at every site of every map, unique ids, procedural, no digit, no address word, no
 *     site or landmark name in a listing name, a positive whole rent;
 *   - businesses: the five, each tied to a real catalog station (sims-meta and a curriculum), every checklist item
 *     verbatim from that station's tagline, the boat charter waterside-only and a waterside shop on every map with
 *     open water beside a site;
 *   - crew: every hire is a GRIOT parish character whose unlock station resolves;
 *   - reload: a fresh module instance over the same store reads the same ledger;
 *   - money: nothing in TYCOON imports or names TILL's payments modules, workers/payments or billing, no price, no
 *     purchase, no random reward, and workers/ never names TYCOON;
 *   - mounts and hygiene: the parishes app and page carry the ledger, the board rows, the HUD line and the signs; the
 *     bundle lists the module; every export is prefixed ty/TY_; the checker is in check_all; the doc lists its seams.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const rd = (p) => readFileSync(join(ROOT, p), "utf8");
let passed = 0, failed = 0;
const check = (cond, area, msg) => { if (cond) passed += 1; else { failed += 1; console.log(`  FAIL [${area}] ${msg}`); } };

class MemStore { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } clear() { this.m.clear(); } }
globalThis.localStorage = new MemStore();
globalThis.sessionStorage = new MemStore();

const modUrl = pathToFileURL(join(WEBXR, "shared/ty-economy.js")).href;
const T = await import(modUrl);
const { SIMS_META } = await import(pathToFileURL(join(WEBXR, "smartcity/js/sims-meta.js")).href);
const { CURRICULA } = await import(pathToFileURL(join(WEBXR, "smartcity/js/curricula.js")).href);
const { GR_ROSTER } = await import(pathToFileURL(join(WEBXR, "shared/npc-data.js")).href);
const { NP_PARISHES } = await import(pathToFileURL(join(WEBXR, "shared/np-parishes.js")).href);
const { LK_TRADES_ROOMS } = await import(pathToFileURL(join(WEBXR, "shared/links.js")).href);
const META = new Map(SIMS_META.map((s) => [s.id, s]));
const CATALOG = new Set(CURRICULA.flatMap((c) => (c.stations ?? []).map((s) => s.id)));
const stationExists = (id) => META.has(id) || LK_TRADES_ROOMS.includes(id);

const store = new MemStore();
T.tyUseStore(store);
const sum = (entries) => entries.reduce((a, e) => a + e.amount, 0);
function invariant(tag) {
  const L = T.tyLedger();
  check(L.balance === sum(L.entries), "arithmetic", `${tag}: balance ${L.balance} ≠ sum of entries ${sum(L.entries)}`);
  check(L.balance >= 0, "arithmetic", `${tag}: balance below zero (${L.balance})`);
  return L;
}

// ------------------------------------------------------------- arithmetic
{
  for (let lv = 1; lv <= 5; lv++) check(T.tyPayFor(lv) === T.TY_PAY_BASE + T.TY_PAY_STEP * (lv - 1), "arithmetic", `level ${lv} pays ${T.tyPayFor(lv)}`);
  check(T.tyPayFor(0) === T.tyPayFor(1) && T.tyPayFor(9) === T.tyPayFor(5), "arithmetic", "level clamps to one..five");
  invariant("fresh");
  const s1 = T.tySettle([
    { id: "a1", simId: "receiving-dock-food", passed: true, level: 3 },
    { id: "a2", simId: "container-lashing", passed: true, level: 1 },
    { id: "a3", simId: "kitchen", passed: false, level: 5 },
    { id: "a1", simId: "receiving-dock-food", passed: true, level: 3 },
  ]);
  check(s1.paid === 2 && s1.amount === T.tyPayFor(3) + T.tyPayFor(1), "arithmetic", `settle paid ${s1.paid} for ${s1.amount}`);
  check(T.tyEarn("receiving-dock-food", { recordId: "a1", level: 3 }).duplicate === true, "arithmetic", "a record pays once");
  invariant("after settle");
  for (let i = 0; i < 12; i++) T.tyEarn("kitchen", { recordId: `k${i}`, level: 5 });
  let L = invariant("after earning");
  const expectEarn = T.tyPayFor(3) + T.tyPayFor(1) + 12 * T.tyPayFor(5);
  check(L.balance === expectEarn, "arithmetic", `earned ${L.balance}, expected ${expectEarn}`);

  const shop = T.tyListings("orleans").find((l) => l.type === "shop" && l.waterside);
  const room = T.tyListings("orleans").find((l) => l.type === "room");
  check(!!shop, "arithmetic", "a waterside shop in Orleans");
  const b0 = L.balance;
  check(T.tyRent(shop.id).ok, "arithmetic", "rent a shop");
  check(!T.tyRent(shop.id).ok, "arithmetic", "the same listing cannot be rented twice");
  check(T.tyRent(room.id).ok, "arithmetic", "rent a room");
  L = invariant("after rent");
  check(L.balance === b0 - shop.rent - room.rent, "arithmetic", `rent took ${b0 - L.balance}, expected ${shop.rent + room.rent}`);
  check(!T.tyOpen("food-truck", shop.id, { completed: () => false }).ok, "arithmetic", "a business needs its station passed");
  check(!T.tyOpen("boat-charter", room.id, { completed: () => true }).ok, "arithmetic", "a business needs a shop, not a room");
  const b1 = L.balance;
  check(T.tyOpen("boat-charter", shop.id, { completed: () => true }).ok, "arithmetic", "open the boat charter");
  L = invariant("after open");
  check(L.balance === b1 - T.tyBusiness("boat-charter").open, "arithmetic", "opening cost taken exactly");
  check(!T.tyInspect([true]).ok, "arithmetic", "a half-ticked inspection fails");
  check(T.tyInspect(T.tyBusiness("boat-charter").checklist.map(() => true)).ok, "arithmetic", "a full inspection passes");
  check(!T.tyHire(T.TY_CREW[0].id, { completed: () => false }).ok, "arithmetic", "a crew member needs its station passed");
  check(T.tyHire(T.TY_CREW[0].id, { completed: () => true }).ok, "arithmetic", "hire a crew member");
  L = invariant("after hire");

  // One play week in uneven steps: every visit and every weekly charge accounted for exactly.
  let before = L.balance, evs = [];
  let t = 0; while (t < T.TY_WEEK_SECONDS) { const d = Math.min(1.37, T.TY_WEEK_SECONDS - t); evs.push(...T.tyTick(d)); t += d; }
  L = invariant("after a week");
  const moved = evs.reduce((a, e) => a + (e.amount ?? 0), 0);
  check(L.balance === before + moved, "arithmetic", `week: ${before} + events ${moved} ≠ ${L.balance}`);
  const visits = evs.filter((e) => e.kind === "visit");
  check(visits.length === Math.floor(T.TY_WEEK_SECONDS / T.TY_VISIT_SECONDS), "arithmetic", `visits in a week ${visits.length}`);
  check(visits.every((e) => e.amount === T.tyBusiness("boat-charter").perVisit + 1), "arithmetic", "a visit pays the rate plus one per crew member");
  const weekly = -evs.filter((e) => ["rent", "upkeep", "wage"].includes(e.kind)).reduce((a, e) => a + e.amount, 0);
  check(weekly === shop.rent + room.rent + T.tyBusiness("boat-charter").upkeep + T.TY_CREW_WAGE, "arithmetic", `weekly charges ${weekly}`);
  check(L.week === 2, "arithmetic", `the week advanced (${L.week})`);

  // Inspection lapses after two weeks: visits stop, then a long drought lapses rentals without debt.
  evs = []; for (let i = 0; i < 400; i++) evs.push(...T.tyTick(T.TY_WEEK_SECONDS / 40));
  L = invariant("after ten weeks");
  check(evs.some((e) => e.kind === "closed"), "arithmetic", "the business closes when its inspection lapses");
  check(evs.some((e) => e.kind === "lapsed") || L.rentals.length === 2, "arithmetic", "rent keeps being charged or lapses");
  for (let i = 0; i < 40; i++) evs.push(...T.tyTick(T.TY_WEEK_SECONDS));
  L = invariant("after the credits ran out");
  check(L.rentals.length === 0 && L.crew.length === 0, "arithmetic", `with no income every rental lapses and the crew moves on (${L.rentals.length} rentals, ${L.crew.length} crew)`);

  // A long ledger folds into "carried forward" and still balances.
  for (let i = 0; i < 420; i++) T.tyEarn("kitchen", { recordId: `fold${i}`, level: 1 });
  L = invariant("after folding");
  check(L.entries.length <= T.TY_MAX_ENTRIES && L.entries.some((e) => e.kind === "carried"), "arithmetic", `ledger folded (${L.entries.length} entries)`);
}

// ----------------------------------------------------------------- reload
{
  const shop = T.tyListings("jefferson").find((l) => l.type === "shop");
  T.tyRent(shop.id);
  const a = T.tyLedger();
  const R = await import(`${modUrl}?reload=1`);
  R.tyUseStore(store);
  const b = R.tyLedger();
  check(a.balance === b.balance && a.entries.length === b.entries.length, "reload", "balance and entries survive a reload");
  check(JSON.stringify(a.rentals) === JSON.stringify(b.rentals) && a.week === b.week && a.playSeconds === b.playSeconds, "reload", "rentals and the play clock survive a reload");
  check(R.tyEarn("kitchen", { recordId: "fold0" }).duplicate, "reload", "paid records survive a reload");
  const other = new MemStore(); other.setItem(T.TY_KEY, "{not json"); R.tyUseStore(other);
  check(R.tyLedger().balance === 0, "reload", "a broken store reads as a fresh ledger");
  R.tyUseStore(store);
}

// --------------------------------------------------------------- listings
{
  const ADDRESS = /\b(street|st\.|avenue|ave\.?|boulevard|blvd|road|rd\.|drive|lane|suite|unit\s*#|apt|zip|block)\b|#|\$|£|€/i;
  let n = 0;
  for (const p of NP_PARISHES) {
    const L = T.tyListings(p.id);
    const names = new Set([...p.sites, ...(p.landmarks ?? []), ...(p.districts ?? [])].map((x) => String(x.name ?? "").toLowerCase()).filter((x) => x.length > 3));
    check(L.length === p.sites.length * 2, "listings", `${p.id}: ${L.length} listings for ${p.sites.length} sites`);
    check(new Set(L.map((l) => l.id)).size === L.length, "listings", `${p.id}: unique ids`);
    for (const l of L) {
      n += 1;
      check(l.procedural === true, "listings", `${l.id} procedural`);
      check(!/\d/.test(l.name), "listings", `${l.id}: a digit in "${l.name}"`);
      check(!ADDRESS.test(l.name), "listings", `${l.id}: an address word in "${l.name}"`);
      check(![...names].some((nm) => l.name.toLowerCase().includes(nm)), "listings", `${l.id}: a real place name in "${l.name}"`);
      check(Number.isInteger(l.rent) && l.rent > 0, "listings", `${l.id}: rent ${l.rent}`);
      check(!/by the site$/.test(l.name), "listings", `${l.id}: site kind ${p.sites.find((s) => s.id === l.site)?.kind} has no word in TY_KIND_WORDS`);
    }
  }
  console.log(`  listings: ${n} across ${NP_PARISHES.length} maps`);
}

// ------------------------------------------------------------- businesses
{
  const want = ["food-truck", "tool-rental", "bike-repair", "corner-shop", "boat-charter"];
  check(JSON.stringify(T.TY_BUSINESSES.map((b) => b.id)) === JSON.stringify(want), "businesses", "the five businesses");
  for (const b of T.TY_BUSINESSES) {
    const m = META.get(b.station);
    check(!!m, "businesses", `${b.id}: station ${b.station} in sims-meta`);
    check(CATALOG.has(b.station), "businesses", `${b.id}: station ${b.station} in a curriculum`);
    check(b.checklist.length >= 4, "businesses", `${b.id}: a checklist of four or more`);
    for (const item of b.checklist) check(!!m && m.tagline.includes(item), "businesses", `${b.id}: "${item}" verbatim from ${b.station}'s tagline`);
    check(!/\d/.test(`${b.name} ${b.blurb}`), "businesses", `${b.id}: no digit in name or blurb`);
    check([b.open, b.upkeep, b.perVisit].every((v) => Number.isInteger(v) && v > 0), "businesses", `${b.id}: whole positive play figures`);
  }
  check(T.tyBusiness("boat-charter").water === true && T.TY_BUSINESSES.filter((b) => b.water).length === 1, "businesses", "only the boat charter needs water");
  for (const p of NP_PARISHES) check(T.tyListings(p.id).some((l) => l.type === "shop" && l.waterside), "businesses", `${p.id}: a waterside shop for the boat charter`);
}

// ------------------------------------------------------------------- crew
{
  check(T.TY_CREW.length >= 8, "crew", `${T.TY_CREW.length} crew`);
  for (const c of T.TY_CREW) {
    const g = GR_ROSTER.find((x) => x.id === c.id);
    check(!!g && g.world === "parish", "crew", `${c.id}: a GRIOT parish character`);
    check(stationExists(c.station), "crew", `${c.id}: unlock station ${c.station} resolves`);
    check(!!g?.handoffs?.some((h) => h.kind === "station" && h.id === c.station), "crew", `${c.id}: unlock is the character's own hand-off`);
  }
}

// ------------------------------------------------------------------ money
{
  const src = rd("WebXR/shared/ty-economy.js");
  const app = rd("WebXR/parishes/js/app.js");
  const block = app.slice(app.indexOf("// TYCOON (docs/consoles/TYCOON.md)"), app.indexOf("// Live-test handle"));
  check(block.length > 200, "money", "the app's TYCOON block found");
  const imports = [...src.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
  check(JSON.stringify(imports) === JSON.stringify(["./npc-data.js", "./np-parishes.js", "./np-parish.js", "./profiles.js"]), "money", `imports only data and storage (${imports.join(", ")})`);
  // Comments out, and the checklists (verbatim station text such as "invoice against the order" at a kitchen dock) aside.
  const code = src.replace(/^\s*(\/\/|\*|\/\*).*$/gm, "").replace(/checklist: \[[^\]]*\]/g, "checklist: []");
  for (const [re, what] of [[/payments|pm-agent|pm-membership|workers\//i, "TILL's payments or workers"], [/billing|checkout|invoice|stripe|paypal|apple\s?pay|google\s?pay/i, "billing words"], [/\bprice|\bpurchase|\bbuy\b|\bUSD\b|\$\s?\d|dollar/i, "a price or purchase"], [/Math\.random|loot|gacha|lottery|spin the/i, "a random reward"], [/fetch\(|XMLHttpRequest|sendBeacon/i, "a network call"]]) {
    check(!re.test(code), "money", `ty-economy.js has no ${what}`);
    check(!re.test(block.replace(/^\s*\/\/.*$/gm, "")), "money", `the app's TYCOON block has no ${what}`);
  }
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
  const workerFiles = existsSync(join(ROOT, "workers")) ? walk(join(ROOT, "workers")) : [];
  check(workerFiles.every((f) => !/ty-economy|tyLedger|Crew Credits/.test(readFileSync(f, "utf8"))), "money", `no worker names TYCOON (${workerFiles.length} files)`);
  check(!/ty-economy/.test(rd("WebXR/shared/payments.js")) && !/ty-economy/.test(rd("WebXR/shared/passport.js")), "money", "payments.js and passport.js do not import TYCOON");
  check(/never money/i.test(src) && /never money/i.test(rd("WebXR/parishes/parishes.html")), "money", "the module and the page say Crew Credits are never money");
}

// -------------------------------------------------------- mounts & hygiene
{
  const app = rd("WebXR/parishes/js/app.js"), html = rd("WebXR/parishes/parishes.html"), src = rd("WebXR/shared/ty-economy.js");
  for (const fn of ["tyMountLedger", "tyBoardRows", "tySettle", "tyTick", "tySignsFor", "tySetRecorder"]) check(new RegExp(`\\b${fn}\\(`).test(app), "mounts", `the parishes app calls ${fn}`);
  for (const id of ["menu-ledger", "ty-ledger", "board-ty", "hud-credits", "tycoon"]) check(html.includes(`id="${id}"`), "mounts", `parishes.html has #${id}`);
  check(/KeyL/.test(app), "mounts", "L opens the ledger");
  check(/SHARED \/ "ty-economy\.js"/.test(rd("tools/bundle_webxr.py")), "mounts", "the parishes bundle lists ty-economy.js");
  const exported = [...src.matchAll(/^export\s+(?:const|function|let|class)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
  const top = [...src.matchAll(/^(?:const|function|let|class)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
  check(exported.length >= 20, "hygiene", `${exported.length} exports`);
  for (const n of [...exported, ...top]) check(/^(ty|TY_)/.test(n), "hygiene", `top-level name ${n} is prefixed ty/TY_`);
  check(!/from\s+["'][^"']*three|THREE\.|cdnjs|https?:\/\//.test(src.replace(/^\s*(\/\/|\*|\/\*).*$/gm, "")), "hygiene", "no three.js, CDN or URL in the module");
  for (const seam of ["tyLedger", "tyListings", "tyEarn"]) check(exported.includes(seam), "hygiene", `seam ${seam} exported`);
  check(/"check_tycoon\.mjs"/.test(rd("tools/check_all.mjs")), "hygiene", "check_tycoon.mjs in check_all");
  const doc = rd("docs/consoles/TYCOON.md");
  check(/## Seams/.test(doc) && ["tyLedger", "tyListings", "tyEarn"].every((s) => doc.includes(s)), "hygiene", "docs/consoles/TYCOON.md lists the seams");
}

console.log(`check_tycoon: ${passed} passed, ${failed} failed — ${T.TY_BUSINESSES.length} businesses, ${T.TY_CREW.length} crew, ${NP_PARISHES.length} maps`);
process.exit(failed ? 1 : 0);
