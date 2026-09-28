# Console BAYOU — lessons for New Orleans kids, taught as they play

Team: BAYOU · Brief: `tools/briefs/bayou-brief.md` (BAYOU section, Shared rules, the Kids rule) with
`tools/briefs/k12-brief.md`, `tools/briefs/station-brief.md` and the Crescent Facts rule · Base: `a643c66` · Port 8991 ·
Prefix `by`.

Rules held: a place is named, never described with a figure; no digit in learner-facing text; no fear framing of storms
or floods (readiness, teamwork, who helps); one idea per step; reading level held to the age band's ceiling.

## Plan (fixed before code)

- **Twelve K-12 stations**, generated from `tools/k12-data/by-*.json` by `tools/gen_k12_station.mjs` and registered with
  `add_station.mjs`, in a **fifth classroom programme `k12-bayou-parishes`** (band: upper primary to lower secondary) in
  `curricula.js`. Each is anchored at a real parish site id from `np-data-<parish>.js`.
- **`WebXR/shared/by-parish-lessons.js`** (no three.js): `BY_LESSONS` (station, parish, site, band, flow id, apply step),
  `BY_APPLY_STEPS` (BAYOU's own two-minute mini-games on the twelve shared mechanics, side-game contract, `world:
  "parishes"`), `byApplyFor`, `byRecordLesson` / `byRecordApply` (the passport records both).
- **Flows:** one per station, `WebXR/flows/by-<slug>.json` on the Cognition.X structure (brief → station → check-in with
  the check question → hand-off `external` node to the apply step → close), plus `k12-bayou-parishes.json` for the
  programme (teacher gate). `WebXR/shared/by-flow-agent.js`: a GRIOT character drives a flow (greet, step, check, hand off)
  as a pure state machine plus an optional DOM mount.
- **`check_k12.mjs` section 9**: the parish programme (twelve stations, band ceilings, parish anchors resolve, every flow
  validates, every apply id resolves to a BAYOU mini-game, an SL side game or a `kw-` kiosk).

## Lesson ids and the apply step each needs (for KREWE and the coordinator)

| Station id | Parish / site | Apply step (two minutes) |
| --- | --- | --- |
| `k12-by-how-a-levee-holds-water-back` | orleans / `levee-floodwall` | `kw-sandbag-relay` (fallback `by-apply-levee-walk`, survey-transect) |
| `k12-by-what-a-pump-station-does-in-the-rain` | orleans / `pumping-station` | `kw-pump-startup` (fallback `by-apply-pump-order`, switching-order) |
| `k12-by-wetlands-as-a-storms-speed-bump` | st-bernard / `sb-central-wetlands` | `by-apply-marsh-planting` (survey-transect) |
| `k12-by-the-rivers-current-and-a-pilots-job` | plaquemines / `pq-venice-marina` | `by-apply-river-lookout` (lookout-watch) |
| `k12-by-a-family-readiness-plan` | st-bernard / `sb-school-campus` | `by-apply-go-bag-check` (inspection-grid) |
| `k12-by-the-water-cycle-from-lake-to-tap` | st-tammany / `st-mandeville-harbour` | `by-apply-pipe-trace` (line-follow) |
| `k12-by-a-streetcar-timetable` | orleans / `streetcar-barn` | `by-apply-streetcar-run` (delivery-run) |
| `k12-by-a-ferry-timetable-and-the-tide` | orleans / `ferry-landing` | `kw-ferry-lineup` (fallback `by-apply-ferry-boarding`, traffic-zone) |
| `k12-by-a-shrimp-boats-fair-count` | st-bernard / `sb-shell-beach` | `by-apply-catch-tally` (survey-transect) |
| `k12-by-reading-a-flood-maps-colours` | jefferson / `jf-lakefront-levee` | `by-apply-map-grid` (inspection-grid) |
| `k12-by-sorting-containers-at-the-port` | orleans / `port-terminal` | `kw-container-sort` (fallback `by-apply-yard-stack`, lift-sequencer) |
| `k12-by-measuring-a-floodwall-in-steps` | st-bernard / `sb-surge-barrier` | `kw-floodgate-closeout` (fallback `by-apply-wall-pacing`, survey-transect) |

A `kw-` id is used when KREWE's registry carries it; until then the lesson's `apply.fallback` (a BAYOU mini-game) runs,
so every lesson has a playable apply step on its own. KREWE side quests can chain `k12-by-*` station ids directly.

## Log
- 22:48 UTC · Worktree at 589f0d8; reset to a643c66 as instructed. Read the brief, k12 and station briefs, docs/k12.md,
  two flows, check_k12, check_flowhub, gen_k12_station, sl-parish-play.js, the five np-data site lists, eval_content.
- 23:02 UTC · Plan and ids above written · next: the twelve station JSONs.
