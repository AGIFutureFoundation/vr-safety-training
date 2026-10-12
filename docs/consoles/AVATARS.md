# AVATARS (`av`, port 9044) — every character gets a sprite and a figure that fits who they are

Loop 5 (robot training, on-chain agents, characters). Base c472f079. SmartCiti.X Holodeck · Powered by AGI Corp.

The 3D crew figure is `standingFigure()` (`WebXR/smartcity/js/citykit.js`, on `WebXR/shared/kit.js`); the learner's own
style is crew.js's `CT_AVATAR_KEY` space, which GRIOT's 34 characters also wear. This console adds a character registry,
procedural sprites drawn from the figure's own parts, the eight outfits the figure lacked, and a checker. Full notes in
`docs/avatars.md`.

## Files

| File | What |
|---|---|
| `WebXR/shared/av-characters.js` | The registry: 57 entries (34 GRIOT characters, the learner, 6 crew-role archetypes, 3 instructor roles, 5 robots, 8 software agents), each with role, trade, union (a `tools/unions.json` id or null), kit.js outfit, crew.js PPE, palette and sprite id. Built at load from `npc-data.js`, `crew.js ROLES`, the cohort guides' roles and the robotics sites' rigs. |
| `WebXR/shared/av-sprites.js` | The painter: `avSpriteSvg(look, { kind: "portrait" \| "token" })`. The generated block holds kit.js's `FIGURE_PARTS` (head, hair, helmet, cap, glasses, respirator, torso profiles; tone tables; the six faces) and `OUTFITS`, so a sprite's silhouette is the revolved profile the mesh is made from. Robots are drawn as their rig, agents as a badge; neither gets a face. No image files. |
| `WebXR/assets/avatars/av-atlas.svg` + `av-atlas.json` | One atlas, 114 frames (portrait + token per entry), shared `<defs>` for the revolved parts; 155.9 KiB of a 160 KiB budget (`AV_ATLAS_BUDGET_BYTES`). |
| `WebXR/avatars/index.html` | The characters page: every entry with both sprites, outfit, union and world. |
| `tools/gen_avatars.mjs` | Writes the generated block and the atlas. |
| `tools/check_avatars.mjs` | The checker (below). |
| `WebXR/shared/kit.js` | Eight outfits added to `OUTFITS`; `outfitFromTrade()`; the resolver now reads trade words before category; `FIGURE_PARTS` exported. |
| `WebXR/smartcity/js/citykit.js`, `app.js` | `standingFigure` takes `cloth`, `trousers`, `harness`, `toolBelt`, `pouch` and `respirator` from the outfit; the app hands the resolver `category \| trade \| union \| domain \| id`. |
| `account.js`, `guide.js`, `npc.js`, `instructor/js/cohort.js`, `rb-world.js` | The sprites in use: the account chip and picker, the Guide panel header, the NPC dialogue header, the cohort roster, the robotics-sites panel. |
| `tools/bundle_webxr.py` | `av-sprites.js` listed beside every account chip (15), `av-characters.js` beside every NPC engine (4); three apps built to prove the lists, the bundles themselves not committed (the integrator regenerates). |

## Seams

- `avCharacters(kind?)`, `avCharacter(id)`, `avLookFor(entry, style?)`, `avSpriteFor(entry, { kind, size, style })` (av-characters.js).
- `avSpriteSvg(look, opts)`, `avLookFromStyle(ctStyle, outfit?)`, `avLookFromOutfit(outfit, seed)`, `avRobotLook(rig)`, `avAgentLook(glyph)`, `AV_GUIDE_LOOK`, `avLookKey(look)` (av-sprites.js).
- `outfitFromTrade(text)` and the wider `outfitFromContext(text)` (kit.js); `FIGURE_PARTS`.
- VBRIDGE's personas (client, provider, evaluator, governor) are registry entries already; `vb-*.js` may read `avCharacter("agent-governor")` for its badge.

## Cycles

1. Reason: eight outfits in `OUTFITS`, each ≤ 17 meshes; check: `check_crew` figures lines. Act: welder, lineworker, silica, robotTech, aiTrainer, longshore, healthcare, chef; outfit `cloth`/`trousers`/`harness`/`toolBelt`/`pouch`/`respirator` wired through `standingFigure`. Observe: all 16 outfits build, worst 16 meshes — pass (46def15e).
2. Reason: a painter that uses the figure's own parts, light enough for the account chip; check: generated block equals kit.js's `FIGURE_PARTS`/`OUTFITS`. Act: `av-sprites.js` + `gen_avatars.mjs`. Observe: 19 part tables and 16 outfits written, in sync — pass.
3. Reason: one atlas under a byte budget; check: bytes ≤ 160 KiB. Act: first pack 197.4 KiB — fail; shared `<defs>` per revolved part and compact frames. Observe: 155.9 KiB — pass.
4. Reason: the registry fits roles; check: the role rubric in `check_avatars`. Act: `AV_ROLE_RULES`. Observe (gallery screenshot): "Nursery lead" dressed as a nurse, "Dam operator" plain, "Signaller / rigger" given IATSE — rules fixed (`\bnurses?\b`, `(dam|water|pump).*operator`, stagehand rule without plain "rigger"; rangers and scientists get no union rather than a guess). 57/57 fit — pass.
5. Reason: every station's crew wears its trade's gear; check: `outfitFromContext` cases + the 736-station tally. Act: trade-first resolver, app passes category, trade, union, id. Observe: "Culinary & Hospitality" resolved to healthcare (`hospital` matched "Hospitality") — `\bhospital\b`; now chef 52, healthcare 24, longshore 26, silica 13, welder 11, robotTech 9, lineworker 3, aiTrainer 1 — pass.
6. Reason: the sprites in the product, on phone and desktop; check: six screenshots, zero page errors from these modules, no horizontal overflow. Act: chip, picker, Guide, NPC, cohort, robotics. Observe: gallery 1280/390, picker 1280/390, Guide 1280/390 in `$SP/loop5/av/`; 114 svg on the gallery, overflowX 0; the cap peak read as a plate — narrowed. The two 404s on index.html are pre-existing resources, not these modules.
7. Reason: nothing else moved; check: `check_crew`, `check_budget`, `check_smartcity`, `check_npc`, `check_imports`. Observe: all green (figures ≤ 17; 736 stations inside budget; 727 simulators pass; NPC 17792 checks; 1090 modules).

## Checker — `node tools/check_avatars.mjs`

Generated block in sync with kit.js; registry complete (every GRIOT character, crew role, robotics rig; unique ids; union
ids in `tools/unions.json`; outfits in kit.js; PPE in crew.js); 114 sprites well-formed procedural SVG with no `<image>`,
no raster, no face on a robot or agent, deterministic, and the learner's follows their style; atlas fresh, every frame
present, under budget; all outfits ≤ 17 meshes; 14 resolver cases; 736 stations resolve with no trade overridden by its
category; the six uses wired; bundler lists; `check_all` lists it. Baseline 9.0 s (loads both station suites).

## Eval (before → after)

Rubric per entry: a sprite renders, and the figure fits the role — a person's outfit is one the role's words call for
(longshore → longshore; lineworker → lineworker; nurse → healthcare/clinical; chef or banquet → chef/kitchen; welder →
welder; wildland → firefighter; the construction trades → construction/lineworker/longshore/silica; teachers, pilots,
rangers, scientists → plain clothes); a robot or agent's sprite is non-human. Before: GRIOT's `ppe` field alone, no sprite
anywhere, no figure of their own for crew roles, robots or agents.

| | Before | After |
|---|---|---|
| Entries with a sprite | 0% | 100% (57/57) |
| Figure fits the role | 40% (23/57) | 100% |
| Both | 0% | 100% |

## What is left

- The instructor console's live roster (`renderRoster`) shows learners by name only; a token per live learner needs the learner's style to travel with the observer event (privacy: opt-in).
- `ctAvatarFigure` (crew.js, the NPCs' 3D body) does not yet draw the new gear (harness, respirator, tool belt); the registry records the nearest PPE (`AV_OUTFIT_PPE`) so a GRIOT figure and its sprite agree on hat, vest, scrubs or whites.
- Bundles: `tools/bundle_webxr.py` lists the two modules; the dist files were not regenerated here.
- A K-12 band could show the characters page as a "who works here" lesson.
