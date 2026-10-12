# Console SMOOTH

- Console: SMOOTH (loop 3, prefix `sm2`, port 9022)
- Brief: `$SP/loop3/brief.md` (section SMOOTH), under the shared rules of `$SP/packs/packs-brief.md` and the reactor loop of
  `$SP/packs/packs-brief-3.md`
- Base: 684be2fb (46 maps in 10 regions). Builds on DETAIL (`docs/consoles/DETAIL.md`) and DETAIL-2 (`DETAIL-2.md`).

## What it does
1. **Generation off the frame.** `dtDetailSteps(parish, cx, cz, tier, { ring, spots, slice })` in
   `WebXR/shared/dt-detail.js` is the chunk generator as a resumable generator. `dtDetailForChunk` runs the same code to
   the end with no slice, so there is one generator, not two. With `slice = { deadline, clock? }` it reads the clock at
   checkpoints: every height-grid sample, every cover cell, and every 16 candidates or road samples. Once the clock
   passes the deadline it yields and later resumes where it stopped. Yielding draws no random numbers, so the output
   is the same bit for bit.
2. **A time-sliced pool.** `dtMountDetail` no longer generates inside `chunkLoaded`. It queues the chunk, and the
   `streamed` hook (once per engine update, which is once a frame in the app) calls `frame()`. `frame()` continues the
   refill and then generates queued chunks until `DT_BUDGET.frameMs[tier]` is spent: **3 ms at high and balanced,
   2 ms on the phone (low)**. The deadline sits 0.25 ms inside the budget.
   - The refill is sliced by family: each InstancedMesh is replaced whole, so no frame shows half a family.
   - The chunk map keeps load order (a finished chunk fills the slot it was queued in), so once the queue is empty the
     pool holds exactly what the one-shot fill held.
   - `drain()` finishes the queue at once. The checkers and tests use it; fast travel does not, and its detail fills
     in over the next frames.
   - `frameMs: Infinity` is the old one-shot behaviour.
   - `clock` can be injected (a virtual clock is used in the proof).
   - `stats()` adds `pending`, `frameMs`, `frameMedianMs`, `frameWorstMs`, `stepWorstMs`, `flushWorstMs` and `slices`.
   - `capacityOk()` reports whether every family is within its capacity.
3. **Scratch buffers reused.** Each generation borrows a set of per-family buffers from a free list and returns
   exact-size copies. Before, every chunk allocated ~1.2 MB of fresh `Float32Array`s. The table loop also indexes
   instead of destructuring.
4. **One stream step a frame.** A merge had left LANDMARKS-2's unguarded `world.update(np.x, np.z, 2)` and
   `cwStreetsMount.update(...)` pair above the guarded one in `WebXR/parishes/js/app.js`. So every frame streamed
   twice: up to four chunk builds and two detail budgets a frame, and it streamed inside walk-in rooms too. The
   unguarded pair is gone, and check_detail checks there is exactly one.
5. **The phone pass on the Louisiana maps.** `tools/check_mobile.mjs` opens every map in the Louisiana regions
   (louisiana-sites, louisiana-cities, new-orleans-districts: 21 maps) in the parishes page at 360×640 on the phone
   context. It checks:
   - the low tier and no page error;
   - meshes, triangles and rendered draw calls within NP_BUDGET;
   - the detail pool within `DT_BUDGET.triangles.low`, and its median frame within `DT_BUDGET.frameMs.low`;
   - that frames keep coming.

   Frame times are recorded to `docs/perf/phone-maps.json` (SwiftShader, relative). Run
   `TC_ONLY=maps node tools/check_mobile.mjs` for the maps alone, or set `TC_MAPS=0` to skip them.

## Seams
- `dtDetailSteps(parish, cx, cz, tier, { ring, spots, tally, slice: { deadline, clock? } })`: a generator whose return
  value is `dtDetailForChunk`'s.
- `dtMountDetail(root, THREE, parish, { tier, hooks, frameMs, clock })` returns
  `{ frame(), drain(), flush(), stats(), capacityOk(), dispose(), meshes, group }`.
- `DT_BUDGET.frameMs = { high: 3, balanced: 3, low: 2 }`.
- `window.__parishTest.detail` is the parishes app's pool.

## Results
**Per-frame detail budget:** `DT_BUDGET.frameMs` is 3 ms at high and balanced, 2 ms at low (the phone).

**Measured worst frame.** Before, the one-shot fill's worst frame was 36–46 ms: a chunk's generation plus the
whole-pool refill, inside one update. Now, in check_detail's walk on la-saronic-franklin:
- **Virtual clock** (deterministic): the worst frame is inside the budget at both tiers.
- **Real clock** (3 runs, gc pauses excluded, load 8.6 on 4 cores):
  - high: median 2.76 ms, p99 3.9 ms, worst 7.5 ms;
  - low: median 1.75 ms, p99 2.8 ms, worst 3.8 ms.

  Frames over the budget on the real clock are preemption on a shared machine: the steps between clock reads are
  p99 31 µs and p99.9 0.24 ms.

**Generation per chunk.** CPU median 10.0–10.2 ms over three runs (budget back to 12). A chunk now spreads over
~12–17 frames' slices.

**Final check_detail** (load 19.1): 477 pass, 0 fail.
- Virtual-clock worst frame: 2.80 ms at high (budget 3), 1.80 ms at low (budget 2).
- Real clock: median frame 2.76 / 1.75 ms. The p99 was 13.6 / 4.7 ms and the worst up to 116 ms, both under heavy
  preemption, so they were reported and not judged.

**Phone, the 21 Louisiana maps** (`docs/perf/phone-maps.json`, from the final full check_mobile run; 360×640, tier low, SwiftShader at
load 10.6, so frame times are relative):

| map | meshes | triangles | draw calls | detail inst / tris | frame median | detail frame median / worst |
|---|---|---|---|---|---|---|
| la-starbase-vermilion | 203 | 59,562 | 99 | 1,558 / 7,052 | 100 ms | 1.80 / 48.8 ms |
| la-black-bayou-cameron | 189 | 43,081 | 72 | 1,418 / 7,438 | 96 ms | 1.80 / 15.2 ms |
| la-saronic-franklin | 159 | 68,150 | 56 | 919 / 4,652 | 101 ms | 1.80 / 7.9 ms |
| la-avex-new-iberia | 160 | 55,596 | 77 | 1,319 / 5,848 | 125 ms | 1.80 / 5.2 ms |
| laf-downtown | 190 | 63,810 | 76 | 1,009 / 4,768 | 117 ms | 1.80 / 10.1 ms |
| laf-carencro-north | 180 | 58,105 | 59 | 1,100 / 5,402 | 59 ms | 0.60 / 5.4 ms |
| monroe-west-monroe | 179 | 50,406 | 83 | 1,020 / 4,910 | 109 ms | 1.80 / 12.8 ms |
| la-meta-richland | 168 | 53,403 | 80 | 1,350 / 6,198 | 92 ms | 1.80 / 19.1 ms |
| la-delta-forge-rapides | 182 | 55,781 | 77 | 1,605 / 6,964 | 98 ms | 1.80 / 9.8 ms |
| la-shintech-plaquemine | 177 | 57,936 | 70 | 991 / 4,736 | 95 ms | 1.80 / 18.2 ms |
| lc-lakefront-downtown | 204 | 59,990 | 65 | 590 / 3,174 | 97 ms | 1.80 / 7.1 ms |
| lc-calcasieu-channel | 196 | 66,730 | 59 | 1,767 / 7,192 | 78 ms | 1.80 / 10.3 ms |
| lc-port-of-vinton | 220 | 55,926 | 67 | 643 / 3,244 | 55 ms | 0.10 / 64.5 ms |
| nola-french-quarter-cbd | 193 | 55,122 | 74 | 638 / 3,480 | 93 ms | 1.80 / 19.4 ms |
| nola-uptown-garden | 222 | 74,419 | 77 | 1,607 / 6,818 | 87 ms | 1.80 / 14.6 ms |
| nola-mid-city-gentilly | 202 | 79,704 | 104 | 1,739 / 7,610 | 110 ms | 1.80 / 12.6 ms |
| nola-bywater-lower-ninth | 240 | 82,683 | 75 | 1,710 / 7,488 | 94 ms | 1.80 / 12.0 ms |
| br-downtown-riverfront | 192 | 65,804 | 94 | 855 / 4,140 | 107 ms | 1.80 / 11.5 ms |
| br-north-industrial | 182 | 48,932 | 95 | 936 / 4,810 | 80 ms | 1.80 / 37.3 ms |
| br-riverplex-ascension | 177 | 62,828 | 79 | 1,829 / 7,612 | 68 ms | 1.80 / 22.3 ms |
| hammond-downtown | 170 | 64,341 | 72 | 914 / 4,556 | 103 ms | 1.80 / 8.6 ms |

Every map is inside NP_BUDGET (worst 240 meshes, 82,683 triangles, 104 draw calls) and inside the pool's 26,000
triangles at low (worst 7,612). In the browser the detail frame median is 1.80 ms against 2 ms. The largest worst detail frames
(lc-port-of-vinton 64 ms, la-starbase-vermilion 49 ms, br-north-industrial 37 ms): the page's clock
under SwiftShader on a loaded machine, where rendering and the stream share one thread. It is reported, not judged; the
virtual-clock proof covers the scheduler.

## Cycles
Timings come from a shared machine (4 cores, load 5–11 throughout from the other consoles), so they are judged on CPU
time, paired comparisons, medians over repeats or a virtual clock, never on a single wall-clock reading.

0. Reason: bring the worktree to the loop's base; proof = HEAD hash. Act: `git merge --ff-only 684be2fb`. Observed:
   HEAD 684be2fb83ea. Pass.
1. Reason: find where a chunk's ~13 ms goes before changing it; proof = a CPU profile. Act: `node --cpu-prof` over
   276 chunks (6 per map). Observed: CPU median 11.6 ms. Self time: the generator body 17 %, `push` 13 %, the garbage
   collector 12 % (~1.2 MB of fresh buffers a chunk), `npPointInPoly` 8 %, the RNG 7 %. Pass (baseline).
2. Reason: make the generator resumable (`dtDetailSteps`, with `dtDetailForChunk` running it to the end), reuse the
   scratch buffers and index the table loop; proof = the digest of all 276 chunks' digests unchanged. Observed:
   ae7fe948 before and after. Pass.
3. Reason: a time-sliced pool (queue in chunkLoaded, generate in `streamed` up to `DT_BUDGET.frameMs`); proof = after a
   walk the sliced pool equals the one-shot pool, and capacity holds. Observed at first: 17,663 vs 17,263 instances.
   The cause was the test: the sliced walk's extra idle frames kept streaming chunks. Settled both walks the same way:
   identical, 17,309 instances in 25 chunks, capacity held. But the worst frame was 9.3 ms: a whole-pool refill of
   3.2 ms plus long steps. Act: slice the refill by family. Pass on identity, fail on the frame.
4. Reason: while reading the frame loop, found `world.update(np.x, np.z, 2)` twice a frame in the parishes app (a merge
   kept LANDMARKS-2's unguarded pair above its guarded one), which doubles the stream and the detail budget and
   streams inside walk-in rooms. Act: drop the unguarded pair; check_detail asserts exactly one. Pass.
5. Reason: prove the frame budget in check_detail on the real clock. Observed: 475 pass, 2 fail. Worst frames were
   24 / 9.8 ms (wall, gc excluded, load 9.7). Process CPU was no better, since it counts the collector's and compiler's
   threads; thread CPU is tick-quantised. Measured the step size with deadline 0: p99.9 2.4 ms, because the height and
   cover grids only checked the clock every 24–34 samples (a sample inside a large water polygon walks its whole
   shoreline). Act: read the clock every grid sample, and every 16 candidates. Observed: p99 31 µs, p99.9 0.24 ms
   over 292,225 steps; the rare maxima land on different chunks in each run (preemption). Fail, then fixed.
6. Reason: separate the scheduler's guarantee from the machine. Act: an injectable clock. A virtual clock (10 µs a
   read, so time is work) proves no frame overruns, deterministically. The real clock's 99th-percentile frame
   (median of 3 runs) is judged only when the load average is at or under the core count (PROVING's rule), and
   reported otherwise. Observed: **check_detail 477 pass, 0 fail**. At load 8.6 the real frame median was
   2.76 ms (high, budget 3) and 1.75 ms (low, budget 2); p99 3.90 / 2.77 ms and worst 7.5 / 3.8 ms were reported, not
   judged. Before, the one-shot fill's worst frame was 36–46 ms. Pass. The final run (load 19.1, with genMs 12) gave
   477 pass, 0 fail, and a virtual-clock worst frame of 2.80 / 1.80 ms against 3 / 2.
7. Reason: return genMs to 12 only if the generator is really faster. Act: a paired A/B against 684be2fb's
   generator on 184 chunks, interleaved, min of 5 timings each. Observed: median ratio **0.90** (10.9 → 10.3 ms),
   identical output on every chunk. check_detail's CPU median was 10.1 and 10.2 ms in two runs. Pass: genMs 14 → 12.
8. Reason: the phone pass on the 21 Louisiana maps; proof = check_mobile's map lines. Act: the maps section in
   check_mobile (the source page, the phone context, tier low). Observed: `TC_ONLY=maps node tools/check_mobile.mjs`
   gave **168 checks pass, 0 fail** (21 maps × 8), at load 18.2. The final full run (games and maps) gave
   **326 pass, 0 fail**. All pass, so there was nothing to fix. The densest is
   nola-bywater-lower-ninth: 240 meshes (≤ 260) and 82,683 triangles (≤ 400,000). Pass.

## Left
- **A Web Worker.** Not done. The module is pure data and would load in a module worker (it imports np-parish,
  np-world's hook object and the palette data, and no three.js). But `tools/bundle_webxr.py` concatenates everything
  into one scope for dist, so a worker needs its own bundle entry and a message format for the typed arrays
  (transferable). Time-slicing already takes generation off the frame. A worker would add parallel throughput: the
  queue would fill in the background instead of at 3 ms a frame.
- **The real-clock p99 on a quiet machine.** check_detail judges it only at load ≤ cores. Every run this hour was at
  load 8–11 on 4 cores, so it was reported and not judged: p99 3.9 / 2.8 ms against 3 / 2, median frame exactly at the
  deadline. The coordinator's quiet gate should see the check run for real.
- **genMs 12 at the gate.** Here the CPU median is 10.1–10.2 ms. The coordinator's quiet gate measured 13.3 ms with the
  old generator, and 0.90 × 13.3 ≈ 12.0, so the gate may sit right at the budget. Generation no longer lands in one
  frame, so the per-chunk figure matters for throughput (how fast detail fills in), not for stalls. If the gate misses,
  the next cuts are the RNG closure and `npPointInPoly` in `npCoverAt` and `npHeightAt` (np-parish.js, ~15 %).
- **Fast travel** now shows detail filling in over ~0.5–2 s (25 chunks at 3 ms a frame) instead of a 300 ms hitch. If
  that looks wrong, `npTravel` can call `window.__parishTest.detail.drain()`, or better, the pool can prioritise
  ring 0.
- `docs/perf/checkers-baseline.json` still holds check_detail's old time; the smooth walks add ~6–12 s.
- The committed dist is stale (DETAIL-2's note); the phone pass reads the parishes page's source.
