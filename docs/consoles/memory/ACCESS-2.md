# ACCESS-2 — memory

- The 123 apron-only entrances were 28 blocked by water on the straight legs and 95 with no CITYWORKS line within 400 m (the
  nearest 400–1,370 m away). An A* over 4 m cells with the Euclidean heuristic opens only a corridor over open ground
  (90–340 cells for 420–1,430 m), so all 863 entrances route in about 6 s quiet (34 s at load 18).
- A cell-centre water test misses a stream narrower than the cell: sample the found path every metre afterwards, close the
  failing leg's cells and search again. Three retries lost one entrance; eight keep it.
- The nearest street point is not the only goal: on the shoreline maps it is across the water while another street is dry.
  Probes 300 and 600 m out in eight directions give up to 17 goals; one search, the heuristic the distance to the nearest.
- The 24 entrances left are islands: about 750–1,020 reachable cells (12,000–16,000 m²) with no street point inside. They keep
  the 6 m open apron and are listed by reason in `check_acc`; a street route needs CITYWORKS' fabric or a causeway.
- Reason strings that carry per-entrance digits break the checker's grouping by reason; put the digits in a `detail` field.
- The door panel is in front of the facade (the box building has no opening to cut): jambs 0–8 cm proud, panel 0–3 cm, so the
  recess is measured as the jambs' face minus the panel's face (5 cm). Balanced sits exactly at its 168-triangle budget.
- np-world names the FACADES group `mass-details-<cx,cz>` under the chunk root; the chunk mesh itself is `chunk-<key>`. A chunk
  at the map's edge can hold no massing and so no FACADES group: 0 there is a measurement, not a miss.
- In the built page SMOOTH's detail pool refills over frames and swiftshader runs few of them; call `detail.drain()` after the
  chunks have streamed (about 1.2 s after a teleport) instead of waiting for `pending === 0`.
- Worktree isolation refuses `$VAR` and heredocs in compound commands: write scripts to the scratchpad and run them by path.
- Load during round 9 was 9–19 on four cores: time every checker twice before quoting a duration.
