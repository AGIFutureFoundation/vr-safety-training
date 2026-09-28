# ASSAYER — next phase brief

Read first: `docs/consoles/memory/ASSAYER.md`, `docs/consoles/ASSAYER.md`, `docs/evals/crescent-review.md`, the ASSAYER
section of `tools/briefs/bayou-brief.md`, and `tools/briefs/frontier-brief.md` (shared rules).

## Where it stands (measured on this tree)
- `tools/eval_worlds.mjs`: ten subjects (five parishes, Motor Pool, characters, play layer, billing, deploy plan) on six
  weighted criteria (loads 20, legible 15, resolves 20, completable 15, budget 15, facts 15). Browser pass on port 8990
  over source pages: every page at 1280×720 and 360×640; in each parish it walks to a character and presses G, opens the
  Motor Pool board (all 70 rows), and reads `renderer.info` at the start on the phone viewport (worst Orleans 59 draw
  calls / 31,472 triangles; headless worst 118 meshes / 44,505 triangles). Before 97, after 99 (see the review's Re-score).
- All five parishes in `NP_ENGINE_STRICT`; `check_parishes` 6,496 / 0. DELTA's four declare `scale` (8, 8, 20, 10 real
  metres per map metre), recorded in `docs/parishes.md`; the checker holds the fit to the declared figure within 15 %.
- Mounted in `WebXR/parishes/js/app.js`: `grMount(\`parish:${id}\`)` (25 characters over the five parishes through
  `GR_PARISH_KIND_ALIAS`) and `dvMountMotorPool({ world: "parishes" })` (menu, Parishes modal, B). `check_npc` covers
  the real parishes (15,595 checks).

## Do next, in order
1. **Open findings from the review.** TILL's `auth-config.json` null keys (the owner's write; `check_payments` 12 then
   covers them); the Upgrade view (`WebXR/membership.html`, till-next item 8 — a page, a bundler list, an account link);
   GRIOT's Bay World quest hand-offs (griot-next item 1); MOTORPOOL's named hulls decision (motorpool-next item 7).
2. **Rubric depth.** The scores sit near 100 because most checks are id-resolution. Add: a first-minute probe that
   walks from the start to the nearest board and opens it in under sixty seconds of scripted input; a lesson completed
   in the page (open the sign, answer, see the ledger count rise); the play layer's side game started and finished in the
   page through `qmMountSideGames`; the billing tab's quote rendered in the instructor console; a frame-time sample on
   the high tier. Weight the geometry findings so one wet road is not lost in a seventy-check pool.
3. **Score the Bayou run's own work** (BAYOU's lessons and flows, KREWE's kiosks and quests, GOLDEN-A/B's districts):
   add subjects as they land — a San Francisco district is scored exactly like a parish (it must declare `scale` if it
   leaves the half-to-six rule), a flow like a lesson (every step answerable, the hand-off resolves).
4. **Parish characters, more of them.** DELTA's parishes place three or four characters each because the roster has ten
   parish kinds; add roster entries for the kinds DELTA uses (`ferry`, `harbour`, `shipyard`, `substation`, `fire-station`,
   `floodgate`, `airport`) in `tools/gen_npc.mjs`, with lesson and treasure hand-offs from SECONDLINE's data.
5. **Motor Pool in the parish.** Filter the parish board by site (rail rows at a streetcar barn, watercraft at a port or
   harbour) and give the parish a vehicle mode so `onDrive` drives on the parish roads (`npRoadSurfaceAt`), not only
   Bay World (motorpool-next items 1–2).
6. **Rebuild the flat dist.** Only `WebXR/parishes/dist/parishes.html` was rebuilt this run; the gate's full bundle
   refreshes `WebXR/dist/` and the bayworld/summit/redwood bundles (npc.js changed by one helper, `grRoleText`).

## Numbers to hold
Five parishes strict in `check_parishes`; `check_parish_data`, `check_parish_play`, `check_gates`, `check_npc`,
`check_drivables`, `check_payments` green; every page loads at both viewports with no page error; the parish frame at the
start inside 260 meshes / 400,000 triangles on the low tier.
