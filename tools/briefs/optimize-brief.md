# Optimisation brief — raise an existing station to 90+

Read `tools/briefs/station-brief.md` first; it applies in full. Then, for each station your task names, read its eval row (`node tools/eval_content.mjs --station <id>`) and fix only the dimensions that are low, keeping the procedure's order and intent:

- **decisions** low → add two interruptions if it has none (hold/track host, different control, visible scene change, the station's own second-crew or environment doing something real), and a `find` step if there is none.
- **explanation** low → rewrite thin `why` texts to ≥200 characters each that state the consequence or mechanism a journeyman would give; never pad.
- **grounding** low → name the bodies that genuinely govern the work in `certification` and the `why`s (OSHA/CFR sections you are sure of, NFPA/ANSI/NSF/CDC/CalCode/ABC as applicable, the union); never invent a clause.
- **variety** low → convert steps that are really a gauge, turn, drag or track into that kind.
- **scene** low → add the dressing the real site has until the count is 150+; keep crew clear.

Do not change ids, indices or the programme entries. Verify everything in the station brief (checkers, bundle, drive, screenshot, eval) and hand back the before/after eval rows.
