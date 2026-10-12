# Cognition.X loop brief: a VR-station link on the blocks (prefix `cx-vr`, about 75 minutes)

**Repository.** `agifuturefoundation/cognition.x`, base **47c1820** (fast-forward and confirm). Every rule in `ecosystem-loop-rules.md`, next to this file, holds.

**Why.** vr-safety-training's blocks bridge (`WebXR/shared/eco-blocks.js`) matched its union and trade stations and its robotics-programme skills to your blocks. It used declared rules and adult bands only:

- 214 of 670 stations and 24 of 24 skills were matched;
- the matches use 91 distinct blocks, from Trade School and from Robotics OS "11–12 · adult".

The match table is `docs/ecosystem/blocks-match.json` in that repository:

- `stations.matched[]` holds `{ station, name, rule, blocks[] }`;
- `skills.matched[]` holds `{ skill, rule, blocks[] }`;
- the unmatched stations and skills are listed with a reason.

Your blocks have no way to say "practise this in a VR station". This brief adds that on your side, as data in your schema.

**Read first.**
- `data/schema.md`
- `tools/validate_blocks.py` and `tools/normalize_blocks.py`
- `data/standards/` (the `cx-standards/1` mapping shape is the model to follow)
- `tests/test_platform.py` and `.github/workflows/validate.yml`
- vr-safety-training's `docs/ecosystem.md`, sections 6–8

## Items, in order

1. **A `cx-practice/1` mapping file, not a new CSV column.**
   - Create `data/practice/holodeck.json`, shaped like `data/standards/*.json`: `{ schema: "cx-practice/1", publisher, as_of, source: { repo: "agifuturefoundation/vr-safety-training", commit }, scope: "block", links: [{ block_id, station_id, station_name, rule, strength: "practises" | "touches" }] }`, with a verifying caveat.
   - Build it from the match table that repository publishes.
   - A mapping file changes no rows. A column would change all 17,450 rows of `blocks.csv`.
   - **Check:** a validator, either a new `tools/validate_practice.py` or an extension of `tools/validate_standards.py`.
2. **Adults only, by rule.**
   - The validator refuses a link from a block outside an adult band ("11–12 · adult", "9–12 · adult") unless the entry names the band and gives a reason.
   - It refuses a link from any K-12 pack outright: K–12, the `K–2` … `11–12` school bands of tracked packs, and the school editions of Louisiana OS and States OS.
   - **Check:** fixtures that plant each case and see the refusal.
3. **Show it in one app.**
   - In `apps/flow-hub/`, a block that has a link shows "Practise in a VR station: <station name>" as text, with no outbound link.
   - Rebuild with `python3 tools/build_flow_hub.py` and commit the rebuilt app; CI fails on drift.
   - **Check:** `python3 tests/test_platform.py` passes, and a second rebuild is byte-identical.
4. **Attribution both ways.**
   - The mapping cites the other repository's file and commit.
   - Your blocks extract in vr-safety-training already carries the line "Blocks from Cognition.X (agifuturefoundation/cognition.x, commit 47c1820), licensed CC BY 4.0".
   - **Check:** the validator requires `source.commit`.
5. **Docs.** Add a section on the practice links to `docs/`, and mark Router.X absent ("not yet built").
   - **Check:** `python3 tools/validate_blocks.py` and `python3 tests/test_platform.py` both pass.

## Evals (before → after, with sources)

- Blocks with a VR-station link: 0 → 91 (`data/practice/holodeck.json`).
- Station links: 0 → 214, plus 24 skill links.
- Non-adult links: 0, enforced; planted fixtures refused N of N.
- Flow Hub rebuild drift: 0.
- `tests/test_platform.py` passes.
- Network calls added: 0.
