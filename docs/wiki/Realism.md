# Realistic surfaces and light

Materials that read as their kind on the desktop tier, and one exposure table by time of day and weather, inside the stated budgets.

## Surfaces that read as their material

### Round 8: `REALISM`, facades that read as their material

Round 8: `REALISM`, tip 112a4d68 (read at the merged head 112a4d68), 3 commits of its own since a10f1ff8, merged into the head of round 8, 112a4d68; its console note is committed, and the table below is that note’s own. Each figure is a token of the commit message or note row it is quoted from, checked when this page is built.

- facade surfaces read as their material; calibrated exposure table ()

- console note, memory and next brief ()

- eval table from the built-page drive (three tiers, page errors 0) ()

| eval | before | after | source |
|---|---|---|---|
| facade materials with roughness and detail (3 maps, high) | 0 | 13 of 13 (Standard, per-class roughness/metalness, detail map); balanced 0 → 13 of 13 with grime/contact; phone 0 → 0 | node tools/check_rz.mjs (§5 notes) |
| surface classes with roughness, metalness and detail | 0 | 8 (brick, concrete, asphalt, metal, wood, stucco, tile, glass) | check_rz §1 |
| meshes and triangles per map, REALISM on vs off (3 maps × 3 tiers) | — | unchanged on all 9 | check_rz §5 |
| REALISM texture bytes (high / balanced / phone) | 0 / 0 / 0 | 262,144 (one 256 px RGBA detail map, budget 256 KiB) / 0 / 0 | check_rz §2, §5; built page rzDetailBytes |
| built page, orleans port-terminal wide day, high | 144 calls, 153,327 tris, 6 textures | 144 calls, 153,327 tris, 7 textures (+ the detail map) | $SP/loop10/rz/drive-after.txt; before from the interrupted before drive's first lines |
| facade shader programs per tier | 1 | 1 (pa-rz-high-1, pa-rz-bal-1, pa-tint-1 phone unchanged) | check_rz §5 |
| exposure table, bands in range (full light and dim 0.8) | none | 8 of 8; ordered day 1.509 > dawn 0.512, dusk 0.461 > night 0.263 | check_rz §6 |
| phone tier | — | unchanged (no REALISM material, no texture, the same fixed lights) | check_rz §4–§5, §7 |
| built page, orleans, the other three shots (high) | street day 241 / 194,738; wide night 147 / 189,449; street night 243 / 199,462 | 240 / 190,888; 147 / 187,897; 243 / 198,274 (calls / tris). REALISM adds no geometry (check_rz §5); the small differences come from what moves and streams between runs (a walking worker is in the after frame) | drive-after.txt |
| built page, orleans, balanced / phone (4 shots each) | — (the before drive's measure lines were lost) | balanced: 135–263 calls, 109,150–130,309 tris, 0 REALISM bytes; phone: 100–187 calls, 59,551–70,191 tris, 0 textures, no REALISM material | drive-after.txt |
| worst chunk mass in the built page (orleans, high / balanced / phone) | — | 2 meshes / 2,412 · 2 / 2,412 · 2 / 1,968 tris (unchanged by REALISM, which adds no mesh) | drive-after.txt |
| page errors / external requests in the built page (12 loads × shots, three tiers) | — | 0 / 0 (shader-compile console errors watched too) | drive-after.txt, last line (737 s at load 31.8) |
| check_textures / check_palette / check_facades / check_interiors | pass | pass (palette 684, facades 2,977, interiors 957) | the checkers |
| check_rz | — | 127 pass | node tools/check_rz.mjs |

Source: `docs/consoles/REALISM.md` at the merged head 112a4d68, the evaluation table as the console wrote it (before → after, with its sources).


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `709cd68e`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
