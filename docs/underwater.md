# The Deep — the shared dive map under the bay

The Deep is a large stylised seabed — a shallow shelf off the shore, an eelgrass meadow, a kelp forest on rock, a shipping channel, a wreck hollow, pier pilings, an outfall apron, a tidal-marsh channel mouth, a deep trench and a seamount — built to the same contract as Bay World so the same tools read both worlds. Two teams build against it in parallel: the shared data and builder here (team DEEP1, console `docs/consoles/TRENCH.md`) and the dive game with its quests and field-note eggs in `WebXR/underwater/` (team DEEP2, console REEF). This page documents the shared contract.

Implementation: `WebXR/shared/underwater-data.js` (pure data and lookups, no three.js), `WebXR/shared/underwater.js` (the builder and `deepLighting`), the `the-deep` entry in `WebXR/smartcity/js/districts.js`. Checker: `tools/check_underwater.mjs`, run by `node tools/check_all.mjs`.

## The facts rule, under water

Everything in the Deep is original and generic, under the same rule as Bay World (`tools/briefs/bayarea-brief.md`): every place carries a plain public-facing name (a kelp cathedral, a wreck's bow, a pier's piling forest), never a real organisation, brand, vessel or address, and no fact about a real place — a date, a depth, a count, an owner, an event or a species — is asserted anywhere. Under water one more rule applies and the checker enforces it: **depth, gas, decompression and current limits are never stated.** Every note that touches them says "per the dive plan and the tables the supervisor holds". `deepDepthAt()` is a scenery and gameplay field; a game may use it to place a diver on the bottom or to fade the light, and must never show its number to a learner as a limit.

## The data (`underwater-data.js`)

| Export | Shape | What it is |
|---|---|---|
| `DEEP_BOUNDS` | `{ minX:-1000, maxX:1000, minZ:-700, maxZ:700 }` | 2000 m × 1400 m of seabed in scene metres. The shore lies along `z = -700`; the bottom slopes away to the south. |
| `DEEP_DEPTH_RANGE` | `[min, max]` | The bounded range `deepDepthAt()` returns, positive metres below the surface. |
| `DEEP_ZONES` | 14 × `{ id, name, centre:[x,z], radius, palette:{water, seabed, accent}, blurb }` | The pier pilings, the shallow shelf, the eelgrass meadow, the marsh channel mouth, the kelp forest, the tide gauge flats, the outfall apron, the channel approach, the shipping channel, the reef ball field, the mud plain, the wreck hollow, the deep trench, the seamount. They tile the field by nearest centre; `radius` is cosmetic. |
| `DEEP_LANDMARKS` | 25 × `{ id, name, zone, position:[x,z], kind, blurb }` | The kelp cathedral, the wreck's bow and stern, the pier piling forest and ladder, the reef ball rows and settlement tile rack, the eelgrass meadow edge and nursery plots, the channel marker and approach buoy chains, the tide gauge post and sonde mooring, the seamount pinnacle and saddle, the marsh mouth sandbar and drift line, the outfall diffuser and pipe run, the trench lip and floor cairn, the shelf boulder garden and old anchor, the holdfast ledge, the mud plain mooring block. Each sits nearer its own zone's centre than any other's. |
| `DEEP_SITES` | 32 × `{ id, name, zone, position:[x,z], programmes:[…], stations:[…] }` | Dive and survey sites. `programmes` are real ids from `smartcity/js/curricula.js` (the marine, restoration, port, utility, hazmat and first-responder programmes a dive site plausibly anchors); `stations` are real `smartcity/js/sims/<id>.js` ids — the `br-`, `mw-`, `uw-`, restoration and port stations that exist. The `cd-` and `me-` packs named in `tools/briefs/dive-brief.md` are anchored as comments on the sites they will join at integration. |
| `DEEP_LINES` | 17 × `{ id, name, kind, points:[[x,z]…] }` | Dive lines in place of roads: the shore and main guidelines, transects across the kelp, the eelgrass, the reef balls, the outfall, the marsh mouth, the wreck, the trench lip and the seamount, anchor lines at the sites a boat works from, and the channel's own centreline. `kind` is `"transect" | "anchor-line" | "guideline" | "channel"`. One connected network by construction. |
| `DEEP_MESH_BUDGET` | `{ low, high }` | The authored mesh count each detail level may spend, before `mergeStatic()`. |

And the pure functions, none of which touch three.js:

- `deepDepthAt(x, z)` — deterministic, bounded, continuous seabed depth: a shelf sloping away from the shore, a dredged trough along the channel centreline, the wreck's scour hollow, the trench's bowl, and three rises (the kelp forest's rock, the seamount, the marsh-mouth sandbar). The checker samples it for range and continuity and confirms the shape: shelf, pilings, meadow and marsh mouth shallow, the channel deeper than the floor beside it, the trench deepest of all, the pinnacle rising above the floor around it.
- `deepZoneAt(x, z)` — the nearest zone; never null.
- `deepLineAt(x, z)` — `{ onLine, id, kind, heading }` within a few metres of a line, or `null`.
- `deepBandAt(x, z)` — `"shallow" | "mid" | "deep"`, the band `deepLighting()` takes, from the world's own scenery thresholds (not dive limits).
- `deepSeededRng(seed)` — the same small LCG Bay World's builder uses, so scatter is reproducible.

## The builder (`underwater.js`)

`buildUnderwater(parent, { detail, zone, band, time, weather })` returns `{ detail, band, lighting, meshCount, merged, animate(t, dt, focus) }`.

- **`detail: "high"`** (the default) builds the whole seabed: the silt slab displaced to `-deepDepthAt()` (so `y = 0` is the water surface and a game places a diver between the two), a translucent surface sheet, a ribbon on the bottom for every guideline and transect segment, a weighted riser with a float at every anchor line, and per zone its landmarks (the pier and its pile forest, boulders, the old anchor, eelgrass patches and staked plots, the sandbar and buoyed drift line, kelp stands, the holdfast ledge, the gauge post and moorings, the outfall's pipe run and diffuser, buoy and marker chains, reef ball rows and the tile rack, the wreck's hull, the trench ledges and cairn, the pinnacle), a pad and flagged stake at every site, a caption over every landmark, fish schools, sunk debris on the mud plain and in the channel, and a caustic sheet over every shallow or mid zone. `zone: "<id>"` restricts the build to one zone and the lines that touch it. Measured: about a thousand authored meshes for the whole world, inside `DEEP_MESH_BUDGET.high`.
- **`detail: "low"`** builds a self-contained vignette with the silt at `y = 0` — a kelp stand, an eelgrass patch, a short row of reef balls, pier piles rising out of sight, a guideline, an ascent line, the wreck's bow and a circling school — sized for the shared stage's `SCENIC_BUDGET`, with the station's work area at the middle and the walk in from the spawn kept clear. This is what the `the-deep` district builds.
- **`animate(t, dt, focus)`** sways the kelp and the eelgrass, circles the fish schools and drifts the marine snow around `focus` (`{x, y, z}`, default the origin).

`deepLighting(band)` is pure data for `"shallow" | "mid" | "deep"`: `{ water, fog, fogDensity, hemi:[sky, ground], hemiI, key:[colour, intensity], caustic:{colour, intensity, speed}, particulate:{colour, count, size, opacity} }`. The water gets murkier and darker with each band and the caustic fades to nothing in the deep band. A caller turns it into its own `FogExp2` (or linear fog with `far ≈ 1 / fogDensity`), lights and particle material; the builder itself uses only the hemisphere and key lights, so it runs under the headless stub.

Every top-level name in both modules is prefixed `deep`/`DEEP_`, because `tools/bundle_webxr.py` concatenates every module into one scope and erases import aliases — nothing here may share a name with `bayworld.js`, `fairway.js` or `districts.js`.

## The district

`the-deep` in `WebXR/smartcity/js/districts.js` is a scenic district (`plaza: false`, like `bay-underwater`): the learner stands on the silt, the stage leaves the plaza, masts, marquee and apron out, the water colour is its own at every hour, and conditions are forced to `underwater` with a note that defers every limit to the dive plan. Any station can stand in it by naming `district: "the-deep"`. `docs/districts.md` lists it with the other scenic districts.

## What is proved

`tools/check_underwater.mjs`, run by `node tools/check_all.mjs`, fails on any of: bounds not the contract's 2000 × 1400 m; fewer than twelve zones, a zone with no centre inside the field, no positive radius, no palette, or that covers no sampled point; fewer than twenty landmarks or thirty sites, or any of them nearer another zone's centre than its own; a blurb stating a date, a dimension or any digit; a site naming a programme not in `curricula.js` or a station with no `sims/<id>.js`, or anchoring nothing; a curriculum programme anchored in neither `DEEP_SITES` nor `BAY_SITES`; a line of an unknown kind, or a network that is not one connected piece, or `deepLineAt()` misreading a line's own centreline or a far corner; a depth outside `DEEP_DEPTH_RANGE`, a jump over a tenth-of-a-metre step, or a shape that is not shelf-shallow, channel-deeper, trench-deepest, pinnacle-rising; a lighting band that gets clearer with depth or whose caustic does not fade; a build that throws at either detail, any zone or any band, exceeds its budget, misreports its mesh count, lights itself with more than four lights, or is not deterministic; and any limit figure — a depth, gas, decompression or current word next to a number with a unit — in either module. `tools/check_districts.mjs` separately holds the `the-deep` vignette to the stage's own rules (budget, lights, floor, spawn, walk, fog, forced conditions).

## For the dive game (DEEP2)

Import from `../shared/underwater.js` (which re-exports the data) or from `../shared/underwater-data.js` alone where no three.js is wanted. Place a diver or an ROV at `y = -deepDepthAt(x, z) + clearance` on a high build; read `deepBandAt()` for the light and the reserve gauge's qualitative mood; read `deepLineAt()` for the buddy line and transect HUD; open a site's stations as `../smartcity/dist/smartcity-x.html?sim=<id>`. Nothing in the data is a limit, and the game must not present it as one.
