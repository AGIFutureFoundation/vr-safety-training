# SITEWORKS memory

- Generator: `tools/gen_sw_sites.mjs` (targets in `SW_TARGETS`, templates `SW_TEMPLATES`, character cycles `SW_CYCLES`).
  It only touches the block between `// sw:begin` and `// sw:end` at the end of each map's `sites` array (plus a comma
  after the last hand-written site), so other consoles' edits elsewhere in the same files merge cleanly. Re-run it
  after a merge, then `gen_treasures`, `gen_home`, `gen_guide_kb`.
- Result: 109 hand-written + 171 procedural = 280 sites on the ten maps (BAYMAP adds 37 Oakland sites → 317).
- Plaquemines is capped by room: most of the field is marsh, and a pad's inner ring must be dry of every water
  (KREWE's pump house sits 24 m from a pump site's centre without its own dry test).
- Generated sites keep out of the outermost chunk ring (check_parishes counts the chunks streamed at the last site).
- The Guide KB sits at its 672 KB cap: gen_guide_kb now counts SF procedural sites instead of listing their names.
- Orleans is the mesh-heaviest map (engine + KREWE dressing worst 248 of 260 meshes); do not add more there.
