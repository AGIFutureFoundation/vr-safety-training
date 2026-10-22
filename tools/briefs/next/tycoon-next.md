# TYCOON — next brief

Where the Packs run left the Crew Credits play economy (`WebXR/shared/ty-economy.js`, `docs/consoles/TYCOON.md`,
`tools/check_tycoon.mjs`). Read `docs/consoles/memory/TYCOON.md` first.

1. **Close the seams at the gate.** PACKS may call `tyEarn(stationId, { recordId, level })` from a pack's completion,
   STORYLINE may show the ledger on the "Union Trades" path; both are idempotent by record id, nothing else to wire.
2. **Mount the ledger in a second world.** Bay World and Redwood Reach have no rentable sites yet; `tyListings` reads
   parish maps only. A world adapter (`sites`, `water`) would give them listings without new data.
3. **Signs on the building itself.** Today the sign is a plane beside the site board (±12 m). Once CITYWORKS's
   `cwColliders(parish, chunkKey)` lands, hang it on the nearest collider box face that fronts the road.
4. **The passport's export.** Milestones reach the passport log as zero-credit `tycoon` awards; the CSV/xAPI export
   carries records only. If the instructor console should show a learner's business, read `tyLedger()` there
   (read-only) rather than adding Crew Credits to `ppLedger()` — the currencies must never mix.
5. **More businesses only on real stations.** Each needs a station whose tagline reads as a checklist; the checker
   insists every item is verbatim. Candidates: a mobile welding rig (a welding station), a landscaping crew
   (`gk-string-trimmer-and-blower-ppe-and-bystander-zone`).
6. **Never**: a price, a purchase, a loot box, a random reward, a link to TILL's membership or payments.
