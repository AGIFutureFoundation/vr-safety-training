# TREASURE — next phase brief

Read first: `docs/consoles/memory/TREASURE.md`, `docs/treasures.md`, `docs/consoles/TREASURE.md`, and the frontier brief's
shared rules and gate contract (they still bind). Prefix `tz…`.

## Where it stands (measured)
- 125 treasures on 11 surfaces (home 6, Guide 12, Trade Skills 9, runner 14, Atlas 5, arcade 6, race 11, Bay World 24,
  the Deep 16, the Regatta 13, Fairway 9), 12 themed sets with badges, 7 gated. `node tools/check_treasures.mjs`:
  8/8 checks pass. Every lesson is re-read verbatim from unions.json / standards.json / curricula.js / toolkit.js /
  arcade TEACHES / one sim line.
- Mesh cost: one octahedron per marker (≤ 24 in the largest world, Bay World), one per station plant. No textures.
- Not yet measured: a live browser pass of each finder (only headless checks ran this phase), and `check_mobile`
  frame cost with 24 spinning markers on the low tier.

## Do next
1. **Live pass, then a checker for it.** Serve `WebXR/` on your own 89xx port. In the browser: the constellation, the
   upside-down code, the seven knocks, the Guide lore, one station plant, one Bay World bell, and one gated treasure's
   lock toast. Add a Playwright-style check next to `check_links.mjs` that loads the homepage and one world and asserts
   `window.__treasuresTest`.
2. **Swap the gate engine.** Once QUESTMASTER's `WebXR/shared/skill-gates.js` has merged, make `tzGateOpen` and
   `tzGateMissing` call its `isOpen` and `missing`. Register the gated treasures with `tools/check_gates.mjs`, which
   needs each world's gated items exported. Add programme gates (`programmes: [{ id, minStars }]`) to the harbour bells'
   capstone.
3. **Bridge the older eggs into the map.** Show Bay World's 24 egg field notes (`bayworld-quests-v1`, `tier: 0`
   quests done), the Deep's lanterns (`underwater-dives-v1`), the 14 hard hats and the six field notes on the Treasure
   Map as a separate "Earlier eggs" section, read-only from their own stores. Do not copy them into `vr-treasures-v1`.
4. **More surfaces.** SUMMIT (mountain) and REDWOOD (forest) worlds: call `tzWatchWorld("<world>", …)` and add sites
   to the generator (a set of trail cairns and a set of fire-lookout logbooks), 12+ each. Add K-12 field-lesson
   landmarks from SCHOLAR-2's exported schema as quiet treasures: "found" when a field lesson's check question
   is answered.
5. **Themed rather than pooled lessons.** Race-course and Trade Skills lessons fall back to a keyword pool. Map each
   race course and each room to a named station's `why` in the generator. The eval should flag any treasure whose
   lesson station is in a different programme from its place.
6. **Accessibility.** Make every marker reachable without a pointer: a "look around" key that lists nearby markers
   as buttons, and screen-reader text for the constellation.
