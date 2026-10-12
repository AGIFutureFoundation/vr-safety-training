# Crescent review — ASSAYER's eval pass over the new worlds

Console ASSAYER, the Bayou run (`tools/briefs/bayou-brief.md`). Scored by `node tools/eval_worlds.mjs` on a643c66 at
23:10 UTC, 2026-09-28, browser included (SwiftShader Chromium, source pages served on port 8990, three.js from the vendor
copy). Every console of the Bayou run reads this page and fixes the findings it owns; ASSAYER re-scores at hand-back (the
"Re-score" section at the foot).

## The rubric
Each subject scores 0–100: a criterion earns its weight × (checks passed ÷ checks run), over the criteria that apply.

| Criterion | Weight | What is checked |
|---|---:|---|
| loads | 20 | the subject's page at 1280×720 and 360×640 with no page error (parishes: `parishes.html?parish=<id>`; Motor Pool: Bay World; characters: Summit; play layer: Orleans; billing: the instructor console; deploy: `deploy_agent.mjs` imports) |
| legible | 15 | the first screen names where you are and shows what you can do, no sideways scroll; the parish has a menu blurb; the mounts that put the subject in front of a learner exist |
| resolves | 20 | every board station, union chip, programme, gate, hand-off, play-layer site and connector id resolves; parish engine geometry (roads dry, landmarks on land or a shore, the scale inside the rule or declared, the parish held in `NP_ENGINE_STRICT`) |
| completable | 15 | a field lesson passes on the ledger; each drivable's 20 s run is clean; each character's dialogue runs greet → teach → hand off; a quote and an agent step complete; the deploy dry run prints end to end |
| budget | 15 | the parish build at every site inside 260 meshes / 400,000 triangles (low tier, headless); every `DV_BUDGET` row ≤ 45 meshes; characters ≤ 12 meshes each; module sizes |
| facts | 15 | no figure in a site, landmark, district, drivable or character name, blurb, greeting or lesson text (an ordinal street name and "K-12" excepted); no history or statistics words in a parish module; no price, merchant id or credential in code |

Frame rate itself is not measured: SwiftShader's frame time says nothing about a phone, so the budget criterion holds the
mesh and triangle counts the phone budget is written in.

## Scores (before, a643c66)

| Subject | Score | loads (20) | legible (15) | resolves (20) | completable (15) | budget (15) | facts (15) | Owner |
|---|---:|---|---|---|---|---|---|---|
| Orleans Parish | **100** | 2/2 | 9/9 | 113/113 | 4/4 | 4/4 | 57/57 | PARISH → ASSAYER |
| Jefferson Parish | **97** | 2/2 | 8/9 | 65/71 | 4/4 | 4/4 | 34/34 | DELTA → ASSAYER |
| St. Bernard Parish | **96** | 2/2 | 8/9 | 55/61 | 4/4 | 4/4 | 32/32 | DELTA → ASSAYER |
| Plaquemines Parish | **96** | 2/2 | 8/9 | 59/66 | 4/4 | 4/4 | 35/35 | DELTA → ASSAYER |
| St. Tammany Parish | **96** | 2/2 | 8/9 | 59/67 | 4/4 | 4/4 | 38/38 | DELTA → ASSAYER |
| Motor Pool | **98** | 2/2 | 8/9 | 140/140 | 70/70 | 2/2 | 70/71 | MOTORPOOL → ASSAYER |
| Characters (GRIOT) | **98** | 2/2 | 8/9 | 191/191 | 35/36 | 4/4 | 34/34 | GRIOT → ASSAYER |
| Play layer (SECONDLINE) | **100** | 2/2 | 8/8 | 196/196 | 78/78 | 1/1 | 42/42 | SECONDLINE → KREWE |
| Billing & membership (TILL) | **90** | 2/2 | 8/8 | 1/2 | 3/3 | 1/1 | 2/2 | TILL → owner / ASSAYER |
| Deploy plan (EDGE) | **100** | 1/1 | 2/2 | 7/7 | 2/2 | 2/2 | 2/2 | EDGE → ASSAYER |

Mean 97. Every page loads at both sizes with no page error.

## The ten worst findings and who owns each
Owners read "built by → fixes in this run". The cost is the points each finding takes off its subject.

1. **billing · resolves** (−10.0) — `auth-config.json` lacks the null `levels` / `applePay` / `googlePay` / `wallet` keys (TILL was blocked writing them by its permission layer) — owner **TILL → the repository owner**
2. **parish:jefferson · legible** (−1.7) — no menu `blurb`: the parish menu opens with an empty lead line — owner **DELTA → ASSAYER**
3. **parish:st-bernard · legible** (−1.7) — no menu `blurb` — owner **DELTA → ASSAYER**
4. **parish:plaquemines · legible** (−1.7) — no menu `blurb` — owner **DELTA → ASSAYER**
5. **parish:st-tammany · legible** (−1.7) — no menu `blurb` — owner **DELTA → ASSAYER**
6. **motorpool · legible** (−1.7) — the parishes app does not mount the Motor Pool board (MOTORPOOL-2 item 2) — owner **MOTORPOOL → ASSAYER**
7. **characters · legible** (−1.7) — the parishes app does not mount the parish characters (GRIOT-next item 2) — owner **GRIOT → ASSAYER**
8. **parish:st-tammany · resolves** (−1.2, 4 alike) — `highway-one-ninety`, `highway-twenty-two`, `lakeshore-drive`, `tammany-trace` sample the Bogue Falaya, Tchefuncte or the lake without a bridge — owner **DELTA → ASSAYER**
9. **parish:plaquemines · resolves** (−0.9, 3 alike) — `the-last-road`, `east-bank-river-road`, `woodland-highway` run in the river — owner **DELTA → ASSAYER**
10. **parish:st-bernard · resolves** (−0.7, 2 alike) — `st-bernard-highway`, `st-claude-avenue` run in the river — owner **DELTA → ASSAYER**

### Below the ten (still owned)
- **Engine geometry, four parishes (DELTA → ASSAYER):** `check_parishes` defers 28 findings — besides the roads above:
  landmarks on open water (`jefferson/huey-p-long`, `st-bernard/caernarvon-bend`, `plaquemines/belle-chasse-tunnel`,
  `st-tammany/twin-spans`), water beds above the line (Plaquemines's river and waterway, St. Tammany's Tchefuncte and
  Bayou Lacombe), St. Tammany's eleven anchors, gated items carrying `world: "<parish>"` instead of `world: "parishes"` +
  `parish`, Jefferson's Westbank Expressway and Williams Boulevard in water, and the stylised scale (8, 8, 20 and 10 real
  metres per metre) outside the half-to-six rule. ASSAYER brings each onto the engine this run.
- **Motor Pool (MOTORPOOL → next run):** the three fishing hulls carry fictional boat names (`GULF STAR`, `BAYOU PEARL`,
  `MISS DELTA`) — decide named or generic and hold it in `check_drivables` (MOTORPOOL-2 item 7).
- **Characters (GRIOT → next run):** no Bay World character hands off a quest (GRIOT-next item 1); the teacher greetings
  read "k-12 teacher" in lower case — capitalise the role's own name.
- **Billing (TILL → next run):** the Upgrade view from the account chip is not built — `pm-membership.js` exposes levels,
  a quote and an adapter, no view to mount — so ASSAYER leaves it (not a small mount).

### For the other consoles of this run
- **KREWE:** the play layer scores 100 — every one of SECONDLINE's 42 sites resolves on the maps, every gate and hand-off
  resolves. Hold it: each new kiosk and quest goes through `slResolveSite` and a gate whose stations are in the catalog;
  `eval_worlds` re-reads them at hand-back. Stand characters at kiosks through the parish hook ASSAYER mounts.
- **BAYOU:** lesson text is held to the facts criterion (no figures); flows and apply-steps are re-read at hand-back.
- **GOLDEN-A / GOLDEN-B:** a new map is scored like a parish; the scale rule reads a per-map `scale` once ASSAYER lands it.

## Re-score (hand-back, 23:25 UTC)
The rubric grew during the run, so the after column holds more checks than the before: in each parish the browser pass
now walks to a character and presses G (the talk panel opens with a line), opens the Motor Pool board (all 70 rows),
completes a field lesson at its sign with E, and reads `renderer.info` at the start on the phone viewport; the Upgrade
check now asks for the page and the account link, not a word in a comment (it passed falsely before).

| Subject | Before | After | What changed |
|---|---:|---:|---|
| Orleans Parish | 100 | **100** | characters (10) and the Motor Pool mounted; frame at the start 59 draw calls / 31,472 triangles |
| Jefferson Parish | 97 | **100** | strict on the engine, `scale: 8` declared, blurb; 4 characters |
| St. Bernard Parish | 96 | **100** | strict, `scale: 8`, blurb, river road re-derived inland; 4 characters |
| Plaquemines Parish | 96 | **100** | strict, `scale: 20`, blurb, levees and river roads re-derived from the river, marsh districts; 3 characters |
| St. Tammany Parish | 96 | **100** | strict, `scale: 10`, blurb, ten anchors, roads off the rivers and lake; 4 characters |
| Motor Pool | 98 | **100** | the board mounted in the parishes (menu, Parishes modal, B) |
| Characters (GRIOT) | 98 | **100** | the parish hook mounted (25 characters over five parishes); "K-12 teacher" keeps its capitals |
| Play layer (SECONDLINE) | 100 | **100** | — |
| Billing & membership (TILL) | 90 | **88** | the stricter Upgrade check; the `auth-config.json` keys still need the owner |
| Deploy plan (EDGE) | 100 | **100** | — |

Mean 97 → 99. Open findings (4): TILL's null `levels`/`applePay`/`googlePay`/`wallet` keys (the owner's write); the
Upgrade view page (TILL, next run); a Bay World quest hand-off (GRIOT, next run); the named fishing hulls (MOTORPOOL,
next run). The ten worst above are otherwise fixed. The rubric's next depth is in `tools/briefs/next/assayer-next.md`.
