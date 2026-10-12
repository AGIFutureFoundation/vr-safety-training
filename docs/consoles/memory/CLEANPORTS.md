# CLEANPORTS — memory

- Six `cp-` stations (Maritime & Ports; BESS is Energy & Power), all generated from one spec set by a generator kept in the
  session scratchpad (`$SP/epa/cp/gen.mjs`, `specs1.mjs`, `specs2.mjs`); edit a station module directly now — the
  generator is not in the repo. Scores 97–99 on eval_content.
- IAM's registry standard is out of scope for Maritime & Ports and 29 CFR 1917 is out of scope for Mobility & Transit —
  naming them in `certification` costs the `standards` dimension. Union tags live in each station's `unions` field.
- Five drivables in `drivables-data.js` (`cp-*`), one new builder `dvStraddleCarrier` (budget row 30). check_drivables'
  road count is now 55. Gates resolve only for stations that sit in a programme — the six are on the WOJRC Pathway Edition.
- `WebXR/shared/cp-cleanports.js` holds every Clean Ports figure; `tools/check_cleanports.mjs` compares them with
  `docs/sources/epa-2026-facts.md` (a copy of the run's facts file).
- BAYMAP's `oak-west-oakland` is not merged here: `cpPlaceInParish(npParish)` in the parishes app is a no-op until it is;
  the checker resolves BAYMAP ids against the map if present, else the ids recorded from BAYMAP's branch.
- `tools/briefs/drive_one.mjs` is stale (imports a missing `pro/helpers.mjs`, `#enter-flat` never appears — fails on
  existing stations too), so no browser drive was done; check_smartcity's perfect run and check_interrupts cover the engine.
