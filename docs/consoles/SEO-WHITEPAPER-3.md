# SEO-WHITEPAPER-3 (loop 10, round 9)

Prefix `swp3`, port 9178. Base `61d85871` (fast-forwarded, hash confirmed). The whitepaper page now cites a committed primary
file before any wiki page on every claim, its figure check reads a cited file line by line with a table figure's measure on
the same line, it paints in the design system's light scheme as well as the dark one, and the poster path is accepted and
stated. The wiki already carried round 8 at the base, so no row changed; the page is byte-identical on re-run.

## What was built

| File | What |
|---|---|
| `tools/gen_whitepaper_page.mjs` | `SWP_PRIMARY`: the committed console note or doc behind each wiki bullet that names no file (nine entries, by the bullet's first words); `swpNoteFirst` cites non-wiki files first and stops the build when a claim would cite only `docs/wiki/`. The eight hand-read claims that cited only a wiki page cite their primary file first (`docs/robotics-programme.md`, `ROBOTRAIN-5`, `COLEARN`, `VBRIDGE`, `GOVERNOR-2`, `OMEGA-HIVE`, `docs/robot-training.md`, `docs/robot-datasets.md`, `docs/instructor-console.md`, `docs/bench-protocol.md`), and one claim's order was swapped (`docs/perf/agent-baselines.json` before the wiki). The hero diagram's fills and strokes are classes (`swp-d-*`) styled from the page's token variables, so `:root[data-theme="light"]` from `shared/design.css` recolours it; no hard-coded colour remains in the body. A comment states the `./media/` path's two layouts. |
| `tools/check_whitepaper_page.mjs` | 59 checks (was 55). New: every claim cites a file outside `docs/wiki/` and cites it first; every `./media/` path resolves in the published layout and has its source under `WebXR/home/` (the repository layout is accepted, stated in the check's name); the page's 13 role pairs meet WCAG AA in both schemes, read from `WebXR/shared/theme.js`'s role tables (26 pairs); no hard-coded fill or stroke in the body. Changed: a small number is read line by line in the cited file (two of the claim's nearest words beside it on that line), and a table figure (the generator's "measure: figure" `.swp-row` pairs) counts only on a line that carries the last four content words of its label; a figure is a standalone number token (a digit inside a name such as `depth-1`, `retest8` or `ROBOTS-HD-2` is not one), so the figure count is 873, not 974. The planted-digit case tries every digit 0–9 and asks that all but the one the row itself holds be rejected. |
| `WebXR/whitepaper.html`, `WebXR/dist/whitepaper.html` | Regenerated: 127 claims, 12 sections; the only text change is the cites. |

## Eval, before → after

| Measure | Before (61d85871) | After | Source |
|---|---|---|---|
| Claims citing only a wiki page | 17 of 127 | 0 of 127 | `$SP/loop10/swp3/wikionly.mjs` on the page; `check_whitepaper_page` "cites a file outside docs/wiki/" |
| Claims whose first cite is a wiki page | 18 | 0 | same check |
| Planted wrong small digits rejected on the round-seven drive row against `docs/wiki/Roadmap-and-Changelog.md` (digits 0–4, 6–9) | 1 of 9 (only 9) | 8 of 9 (the row's own 0 passes) | `$SP/loop10/swp3/before-rule.mjs` (the round-eight rule, copied); `check_whitepaper_page` negative case |
| Figures present in their cited committed files | 974 of 974 | 873 of 873 (a digit inside a name is no longer a figure: 101 fewer) | `check_whitepaper_page` |
| Rule variants tried on the page's figures | — | line-bound alone: 974 of 974, planted 1 of 9; three shared words: 962 of 974; measure on the line: 873 of 873, planted 8 of 9 | `$SP/loop10/swp3/rule-sweep.mjs`, cycles 2–3 |
| Poster resolves | published layout only, unstated | published layout (canonical), source under `WebXR/home/media/`, stated and checked (2 paths) | `check_whitepaper_page` media check |
| Contrast pairs at WCAG AA, dark and light | not checked for this page | 26 of 26 (13 pairs × 2 schemes) | `check_whitepaper_page` 4b; `check_design` for the system's own pairs |
| Hard-coded colours in the page body | 17 fills and strokes in the diagram | 0 | `check_whitepaper_page` |
| Stills: page errors; failed responses; horizontal scroll (dark and light, 390 and 1920) | — | 0; 0; 0 px in all four | `$SP/loop10/swp3/shots.mjs`, `still-*.png` |
| Page byte-identical on re-run; `--check` current | yes | yes ("Unchanged") | `node tools/gen_whitepaper_page.mjs` |
| Checker checks | 55 | 59 | `check_whitepaper_page` |

## Checkers

`check_whitepaper_page` 59 pass (873 of 873 figures, 127 claims). `check_newton`, `check_imports`, `check_parse`, `check_seo`,
`check_design`, `check_links`: see the hand-back and the memory note; run after the last code commit, results recorded there.

## Cycles

1. **Reason:** a reader of a wiki-only claim has no primary file. **Act:** `SWP_PRIMARY` and `swpNoteFirst`; the hand-read
   claims edited. **Observe:** 17 → 0 wiki-only; one claim cited the wiki first, swapped. **Check:** 56 checks pass; 974 of 974.
2. **Reason:** against the long wiki page a planted digit passed 8 times in 9 because the window crossed lines and the words
   "page", "checks" sit near digits on many rows. **Act:** the file read line by line. **Observe:** no change, 1 of 9: other
   drive rows carry the same generic words on one line. A first sweep said 9 of 9 and was wrong (the plant had not landed, so
   the claim's window was empty and everything "failed"); the sweep now asserts the plant.
3. **Reason:** the brief's suggestion, the measure phrase on the same line. **Act:** first from the claim's words left of the
   number (88 figures failed: a figure that leads its measure, "0 dispatches", took the previous measure's words); then from
   the generator's own "measure: figure" pairs in the `.swp-row` spans, one label sufficing per digit (a union across the row's
   labels failed 51). **Observe:** 8 of 9 rejected; 45 figures failed because the tokenizer kept splitting `depth-1`
   and `retest8` for `swpNumbers` but not for the windows. **Act:** a figure is a standalone token. **Check:** 873 of 873; 8 of
   9; the synthetic case passes.
4. **Reason:** the design system has a light scheme (`:root[data-theme="light"]`) and the page's diagram was hard-coded.
   **Act:** classes from the page's variables; a contrast check on the page's own pairs in both schemes; stills with the
   attribute set after load. **Observe:** light body `rgb(243,247,250)` on `rgb(11,24,34)`; 0 errors. **Check:** 26 of 26
   pairs; 0 hard-coded colours.
5. **Reason:** the poster path. **Act:** accepted, stated in the checker, both files checked. **Check:** 2 paths resolve.

## Honest points

- The figure rule narrows; it does not prove. The one planted digit that still passes on the drive row is the 0 the row
  holds for "failed" and "page errors": a lexical rule reading a line cannot tell which cell a digit belongs to.
- Prose claims (no "measure: figure" pair) keep the line-bound rule alone; a planted digit beside two of their words on
  any line of the cited file would pass.
- The figure count fell 974 → 873 because a digit inside a name (`depth-1`, `retest8`, `ROBOTS-HD-2`, `HIVE-4`) is no
  longer counted as a figure. That is the consistent reading, but it is a change in what the number means.
- The light scheme is honoured, not offered: nothing on this page or in the shared modules sets `data-theme="light"` yet,
  and `design.css` carries no `prefers-color-scheme` rule. The stills set the attribute after load.
- `SWP_PRIMARY` names the note the wiki bullet was written from by reading the notes for its subject; the wiki itself was
  built from scratch fragments that are not committed, so this is a judgement recorded in the generator, not a derivation.
- The loop-ten still was taken mid smooth-scroll (the page's `scroll-behavior: smooth`); the top-of-page stills are the ones
  looked at in both schemes.

## Left

See `tools/briefs/next/swp3-next.md`.
