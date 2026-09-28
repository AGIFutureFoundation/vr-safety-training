# Console BABEL-2

- Team: BABEL
- Brief: fill the 17 chrome-only language tables to every key in `tools/i18n/en.json` (docs/i18n.md, docs/consoles/BABEL.md)
- Branch: own worktree, based on `claude/vr-ar-safety-training-wkwmve` at 68b6869

## Log

- 05:03 UTC · the worktree started on an old base (589f0d8, no tools/ folder); reset the worktree's own branch to the branch of record 68b6869 · — · next: read the docs and generators
- 05:06 UTC · read docs/consoles/BABEL.md, docs/i18n.md, tools/gen_i18n.mjs, tools/check_i18n.mjs, tools/i18n/*.json: 321 keys; en/es/fr/de complete; 17 tables carry 26 chrome keys and 295 `@en` markers. docs/i18n.md has no convention for sourced quotations, and no key is a quotation (the wojrc.org keys are programme titles), so proper names such as wojrc.org, Hunters Point, Unspoken Smiles and Bay World stay in English inside translated titles, as es/fr/de do · — · next: zh
- Failed and fixed: the worktree guard refused a compound command with a heredoc; scratch scripts are written with the Write tool and run by absolute path.
- 05:06 UTC · method: each language is written as numbered lines against the 295 `@en` keys in en.json order, then merged by a scratch script that refuses a missing or duplicate line, a changed {placeholder} or HTML entity, or a lost sentence-ending mark; then gen_i18n, gen_home and bundle_webxr, then one commit per language · — · next: zh
- 05:06 UTC · Chinese (Simplified) complete, 321/321 · fa3efc8 · next: hi
- 05:07 UTC · Hindi complete, 321/321 · ab4a3f0 · next: ar
- 05:08 UTC · Arabic complete, 321/321, logical order, no bidi marks added · 5ca93e7 · next: pt
- 05:09 UTC · Portuguese complete, 321/321 · a43d27e · next: bn
- 05:11 UTC · Bengali complete, 321/321 · 9ddbdea · next: ru
- 05:11 UTC · Russian complete, 321/321 · 634f6fb · next: ur
- 05:13 UTC · Urdu complete, 321/321, logical order · d1ec1f1 · next: a first phone check
- 05:13 UTC · probe: homepage at 360x640 in ar, ur, zh, hi and am (am still chrome-only) on 127.0.0.1:8974 from this worktree's WebXR/, server stopped after: scrollWidth 360 in all five. Seen, not in this brief: the hero's "Start playing" and "Find your trade" buttons stay English in every language (no data-tr on the hero actions) · — · next: id
- 05:14 UTC · Indonesian complete, 321/321 · c882e03 · next: sw
- 05:16 UTC · Swahili complete, 321/321 · 72e0c3b · next: tl
- 05:17 UTC · Tagalog complete, 321/321 · d7abb59 · next: vi
- 05:18 UTC · Vietnamese complete, 321/321 · 8b3294c · next: ko
- 05:19 UTC · Korean complete, 321/321 · aadfcff · next: ja
- 05:20 UTC · Japanese complete, 321/321 · fdf870f · next: am
- 05:22 UTC · Amharic complete, 321/321 · 147dd9a · next: ha
- 05:24 UTC · Hausa complete, 321/321 · deeffc3 · next: the remaining codes in tools/i18n/ (tr, yo)
- 05:25 UTC · Turkish complete, 321/321 · b391a44 · next: yo
- 05:27 UTC · Yoruba complete, 321/321; all 21 tables now 321/321 and gen_i18n reports "321–321 translated per language" · dcba06f · next: the checker
- 05:29 UTC · check_i18n prints per-language coverage and fails if any of the 21 falls below 100% (MIN_COVERAGE = 1, set because every table is full); new headless checks load the homepage at 360x640 with ?lang= ar, ur, zh, hi and am and fail on sideways scroll, a wrong lang/dir, a raw key, or an English programme title. check_i18n alone: 237 checks pass. The scratch probe on 127.0.0.1:8974 (server closed after) agrees: scrollWidth 360 in all five. docs/i18n.md: coverage, the quotation note (no key is a quotation) and the proper-names rule · 955ec21 · next: check_all
- Translation notes for a reviewer: "Guide" is translated as the language's word for guide (fr/de kept "Guide" because it is the same word); "The Deep" and "Bay Atlas" are translated, as in fr/de; Bay World, Bay Regatta, Fairway Park, SmartCiti.X and Holodeck stay in English; no numbers or limits were added to any string.
