# STORYLINE — pick your own adventure (`st`, port 8984)

SmartCiti.X Powered by AGI Corp console. Plan first, code second.

## Path ids (published for PACKS — use exactly these)

| id | label |
|---|---|
| `union-trades` | Union Trades |
| `k12` | K-12 |
| `first-responders` | First Responders |
| `un-training` | UN Training |
| `disaster-relief` | Disaster Relief |
| `teachers` | Teachers |
| `roam` | Just Roam |

A pack's `path` field is one of these seven strings. `roam` carries no programmes (it turns prompts off).

## Plan (written before code)

1. **Registry from what exists** (`WebXR/shared/st-paths.js`): seven paths, each naming catalog curricula (Union Trades: the
   eighteen union programmes; K-12: the four classroom programmes; First Responders: first-responders, situational-awareness,
   hazmat; UN Training: outbreak-response-who, the WHO/UN practice programme; Disaster Relief: first-responders' shelter and damage
   assessment, hazmat, water and gas crews, situational awareness; Teachers: education support staff, the four classroom
   programmes and civic leadership), WebXR/flows ids (the classroom and BAYOU flows, the apprentice and refresher flows), GRIOT
   parish characters who greet first, site kinds whose boards glow, and KREWE kiosks that count. No new stations.
2. **Side stories generated, not hand-typed** (`tools/gen_st_stories.mjs` → `st-stories-data.js`): for each path × map (ten maps),
   the two or three sites that best fit the path; the teller is the GRIOT character standing there (or the nearest one on the map,
   who hands you on); the one line is copied verbatim from that character's sourced pack; two branches, each ending at a catalog
   station (practice line = the catalog tagline) or a lesson (the map's field lessons, BAYOU's parish lessons; practice line = its
   first step). Classroom paths lead with the lesson's own K-12 station. A KREWE kiosk at the site joins the chain.
3. **Stored in the passport's storage** (`vr-passport-storyline-v1` through profiles.js `gtStorage`, identity-scoped like
   `vr-passport-v1`, whose loader drops foreign fields): the path and every branch chosen.
4. **World mount** (`stMountPaths` in `st-stories.js`): the picker and the path's stories on the parishes menu (the world's start),
   a glow ring over each board on the path (one InstancedMesh per world, none on the low tier, still under reduced motion), the
   greeter's toast at start, the path's kiosks listed. Just Roam: no stories, no glow, no greeting, no lock toasts.
5. **Homepage chip** on both parishes world cards (via `tools/gen_home.mjs`).
6. **Checker** `tools/check_storyline.mjs`.

## Seams

- `stPaths()`, `stPath(id)`, `stChosenPath()`, `stChoosePath(id)`, `stPromptsOn()`, `stMountPicker(el, { onPick })`,
  `stMountChip(el)` — `WebXR/shared/st-paths.js` (shapes at the top of the module). PACKS: a pack's `path` is one of the seven ids.
- `stQuestsFor(pathId, parishId)`, `stBranchChosen(storyId)`, `stChooseBranch(storyId, branchId)`, `stGlowSites(pathId, parish)`,
  `stGreeter(pathId, parish)`, `stPathKiosks(pathId, parishId)`, `stMountPaths({...})` — `WebXR/shared/st-stories.js`.
- Mounted: the parishes app (`#menu-storyline`, `window.__parishTest.storyline`), the homepage world cards (`[data-st-chip]`).
- For the coordinator: TYCOON can pay `tyEarn` on a branch's station as usual (no STORYLINE change needed); PACKS can filter by
  `path`; MENAGERIE/NEWTON unaffected. The glow ring is one mesh per world, not per chunk.

## Counts (check_storyline.mjs)

7 paths · 162 side stories over 60 path × map pairs (two or three each) · 324 branches, every one ending at a catalog station
or a lesson.

## Left

- A browser pass of the picker and glow (the checker is pure Node; the mount is wired and bundled).
- Redwood/Bay World path hooks (not in this brief's scope: the parishes app and the homepage).
- The passport export (`ppExport`) could carry the chosen path.
