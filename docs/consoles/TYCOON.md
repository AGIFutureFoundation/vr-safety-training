# TYCOON — businesses and properties, like a life sim

Console TYCOON, the Holodeck Packs run ("SmartCiti.X Powered by AGI Corp", brief `tools/briefs/packs-brief.md`,
prefix `ty`, port 8985). A small play economy in the learner's own browser, in its own play currency, **Crew
Credits**. It is never real money: no purchase flow, no loot box, no random reward, no price, and nothing in TYCOON
imports or names TILL's payments modules, `workers/payments` or billing. `tools/check_tycoon.mjs` proves each line.

## Plan (written before code)

- **Module** `WebXR/shared/ty-economy.js` — pure data and arithmetic plus one DOM mount; no three.js, no CDN, every
  top-level name `ty`/`TY_`. Imports only `npc-data.js` (GRIOT's roster, pure data), `np-parishes.js`/`np-parish.js`
  (sites and water) and `profiles.js` (the per-profile storage the passport uses).
- **Store** `ty-ledger-v1` through `gtStorage()` (per profile, like the passport's own key). Beside the passport, not
  inside it: the passport's rule is "not a new silo — each world keeps its own ledger and the passport reads it".
  The passport records TYCOON's milestones (a rental, an opening, a hire, an inspection) as zero-credit awards from
  source `tycoon` through `ppAward`, idempotent by id, so its log and export show them without mixing currencies.
- **Arithmetic invariant**: the balance is always the sum of the entries' signed amounts (old entries fold into one
  "carried forward" entry), and it never goes below zero — a charge that cannot be met is not taken: the rental
  lapses and the business closes instead. No debt, no interest.
- **Earning** — `tyEarn(stationId, { recordId, level })`: a passed station record pays once (idempotent by record id)
  by the learner level the record carries (the sim's own rank index, `records.js`'s `level`), clamped one to five:
  20 + 10 × (level − 1) Crew Credits. `tySettle(records)` pays every unpaid pass (the parishes app runs it on load, so a
  shift finished from a job board pays on the way back).
- **Listings** — `tyListings(parishId)`: for every site of a parish one room and one shop, generic procedural
  buildings named by the site's kind ("Upstairs room by the port"), never a real address, no digits in any name;
  rent is a play figure in Crew Credits per play week. `waterside` when the site's kind is a waterfront kind or open
  water lies within reach (sampled with `npWaterAt`).
- **Businesses** — five, each tied to a real catalog station whose tagline supplies its inspection checklist verbatim:
  food truck (`receiving-dock-food`), tool rental (`ad-depot-tool-control-and-fod-walk`), bike repair stand
  (`pm-storage-and-bike-room`), corner shop (`ml-retail-counter-deescalation`), boat charter
  (`mw-ferry-deckhand-and-passenger-safety`, waterside shops only). Opening needs a rented shop, the opening cost and
  the station passed; a business stays open while its inspection is current (two play weeks) and its upkeep is met.
- **Play time** — `tyTick(dt)` advances a play clock only while the learner walks a world (one play day = three
  minutes, a week = seven days). A visit every play hour-ish (sixty seconds) pays the business's per-visit rate plus
  one per hired crew member; each week boundary charges rent, upkeep and crew wages, in that order.
- **Crew** — GRIOT's parish characters (`GR_ROSTER`, `world: "parish"`), each unlocked when its first hand-off station
  is passed; a hire costs a weekly wage and adds to every visit. The characters still talk as GRIOT wrote them.
- **UI** — a "Crew Credits" ledger in the parishes menu and a key (L), a Crew Credits line on the HUD, listings on each
  site's job board ("Rent here"), a sign on the rented building (one plane per rental, a canvas texture; no budget
  weight), all in the design system's existing `.btn`/`.note`/`.quest` classes.
- **Checker** `tools/check_tycoon.mjs`: arithmetic balances across a scripted life (earn, rent, open, inspect, weeks,
  lapse), no listing names a real address or figure, every business ties to a real station and its checklist is
  verbatim from that station's tagline, every crew unlock station resolves, the ledger survives a reload (a fresh
  module read of the same store), and no TYCOON file touches `workers/payments`, `payments.js`, `pm-*` or billing
  words; the mount is in the parishes app and the bundle.

## Seams

- `tyLedger() -> { currency, balance, entries, rentals, business, crew, week, day, playSeconds }` — read-only view.
- `tyListings(parishId) -> [{ id, parish, site, siteName, type: "room"|"shop", name, rent, waterside, procedural: true }]`.
- `tyEarn(stationId, { recordId, level, passed = true }) -> { paid, amount, duplicate }` — PACKS or STORYLINE may call
  it when a pack's station passes; idempotent by record id.
- `tySettle(records) -> { paid, amount }`, `tyTick(dtSeconds) -> events[]`, `tyMountLedger(el, opts)`,
  `tySignsFor(parishId) -> [{ site, text }]`.
- Mounted in `WebXR/parishes/js/app.js` (menu button, L key, HUD line, board rows, signs) and bundled in the parishes
  entry of `tools/bundle_webxr.py`.

## What shipped

- `WebXR/shared/ty-economy.js`: 218 procedural listings across the ten maps (a room and a shop per site, a waterside
  shop on every map), five businesses on five real stations with 29 verbatim checklist items, ten crew from GRIOT's
  parish characters, weekly rent/upkeep/wages in play time, the passport's zero-credit `tycoon` milestones.
- Parishes app: "Crew Credits" in the menu and L, a HUD line, "To rent here" rows on every job board, the ledger with
  the inspection checklist and crew, signs on rented buildings, a settle on load that pays each passed shift once.
- `tools/check_tycoon.mjs` (1,570 checks, ~0.44 s) in `check_all` and `docs/perf/checkers-baseline.json`.
- Not done here: the flat bundle (`WebXR/dist`, `WebXR/parishes/dist`) is rebuilt at the gate — `bundle_webxr.py`
  already lists `ty-economy.js` in the parishes entry.
