# PROVING — next phase brief

Read first: `docs/consoles/memory/PROVING.md`, the last twenty lines of `docs/consoles/PROVING.md`, `docs/perf/README.md`. Prefix `pv`, port 8996, one browser at a time, the load average beside every number, no assertion removed or weakened.

## Where PROVING-1 left the platform (measured)

Numbers are SwiftShader on the shared four-core box, 20-second walk at 1280×720, load average 4–18 while they were taken (other consoles were building), so treat them as an ordering, not a speed. Exact rows: `docs/perf/frames.json`.

| Page | tier | avg ms | meshes + instanced×(inst) | triangles | draw calls |
|---|---|---:|---|---:|---:|
| Redwood Reach | high | 1769 | 303 + 199×(38 194) | 479k | 150 |
| Bay World | high | 912 | 1345 + 0 | 253k | 515 |
| Bay World | low | 624 | 948 + 0 | 253k | 342 |
| Sierra Summit | high | 417 | 141 + 30×(2 971) | 111k | 121 |
| Redwood Reach | low | 323 | 279 + 101×(8 062) | 116k | 81 |
| The Deep | low | 248 | 241 + 0 | 27k | 69 |
| Sierra Summit | low | 169 | 130 + 14×(721) | 59k | 104 |

(the remaining rows — the Deep high, the Regatta, Fairway Park, Trade Skills, SmartCiti.X — are in `frames.json`; fill this table from it when you re-measure at a quiet load.)

## The two worst offenders — fix without changing their look
1. **Redwood Reach, high tier: 479k triangles, 38 194 instances, 1.8 s a frame here.** Its low tier draws 116k with 8 062 instances — the high tier streams more rings of instanced trees and undergrowth (`WebXR/redwood/js/world.js`, the per-tier stream radius and per-chunk counts). Give the outer rings a lower LOD (fewer sides per trunk, a billboard or a two-quad canopy past the second ring — Summit's memory notes a three-part conifer at 4/6/5 sides brought a view from 350k to 190k) and keep the inner rings as they are; the near look is unchanged, the horizon keeps its silhouette. Target: high tier ≤ 250k triangles in the same view, re-measured at load ≤ 4.
2. **Bay World: 948–1 345 meshes, 0 instanced, 342–515 draw calls.** Every building, lamp, tree and crowd figure is its own mesh. Instance the repeated kinds first (street trees, lamps, bollards, parked cars, crowd figures) in `WebXR/shared/bayworld.js` — same geometry and material, `InstancedMesh` per kind per zone — and merge static facades per block where PALETTE's shared-canvas materials allow. Target: ≤ 200 draw calls on the low tier with the same silhouette from the promenade, the mesh budgets in `check_bayworld` kept (raise the instanced budget, do not drop a check).

## Then
3. **Phone pass findings.** `docs/perf/phone.md` lists every tap target under 44 px per page; `check_proving` holds the total to the baseline. Take the total down by half, page by page, with the owning teams' HUD code (not the shared touch layer, which is already ≥ 48 px).
4. **Headset entry for the worlds.** The six open worlds never enable `renderer.xr` (`docs/perf/headset.md`). Add one shared VR entry (`WebXR/shared/xr-entry.js`, prefix `xr…` is free) that Trade Skills' pattern already shows — Enter VR control, `renderer.xr.setSession`, a VR HUD panel mesh for the controls overlay — and wire it into each world's app.js; re-run `headset_pass` and expect "asks for VR: yes" on every row.
5. **Soak at full length.** PROVING-1 ran the soak short to prove the tool inside its time box (`docs/perf/soak.md` says how long). Run `SOAK_MINUTES=10 node tools/soak.mjs` once at a quiet moment and commit the result; if either world grows past 25 %, bisect the loop (walk / board / help / away-and-back) to the step that leaks.
6. **Checker speed, second third.** The pool took `check_all` from the sum of its checker times to the wall time recorded in `docs/perf/checkers-baseline.json`. The next cut is inside the slow checkers: `check_links` and `check_ui` each open every page at two sizes in their own browser — give them a shared page cache (open each dist page once per size, run both checkers' assertions on it) and hash-skip the regenerations (`check_guide` rebuilds the knowledge base in memory, `check_unity_export` and `check_investor` re-run their exporters every time — skip when the inputs' hashes match the recorded ones, with the hash list committed beside the output).
7. **Re-baseline honestly.** After each fix, re-measure at load ≤ 4, then `node tools/check_proving.mjs --rebaseline`, and say in the console log what moved and why.
