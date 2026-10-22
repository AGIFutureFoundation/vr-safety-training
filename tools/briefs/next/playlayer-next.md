# PLAYLAYER — next phase brief

Read first: `docs/consoles/memory/PLAYLAYER.md`, `docs/consoles/PLAYLAYER.md`, `WebXR/shared/pl-bay-play.js`.

## Where it stands (measured on this tree)
- `pl-bay-play.js`: 17 Bay Area maps (SF 9, Oakland 4, North East Bay, South Bay, Bay Program 2); 49 lessons re-read from
  the fifteen non-GOLDEN-B maps + GOLDEN-B's 10 = 59 play-layer lessons (3–5 per map), 59 side quests, 17 path boards.
- The parishes app mounts `plMountPathBoard` (#menu-paths) and `plMountQuestBoard` (#menu-krewe) as fallbacks;
  `sv_survey --only sf-downtown,oak-west-oakland,bp-san-leandro-bay` shows both mounts filled, 0 page errors.
- Treasures regenerated: a crew kit off every site of the fifteen maps and a quiet find per lesson (618 treasures, 39 sets).
- `node tools/check_playlayer.mjs` — all checks pass.

## Do next, in order
1. **Kiosk mini-games for the Bay Area** (KREWE's `KW_KIOSKS` shape) so a quest's last step can be a game as in New Orleans
   (a pier line-handling kiosk at sf-downtown's piers, a container sort at West Oakland's terminal); gate each on its
   stations and add them to `npPlayItems()`.
2. **Hand-written quest titles and givers** — the quests are derived one per lesson with a generic giver ("the site crew
   lead"); a KREWE writer could chain two sites per quest.
3. **GRIOT hand-offs** for the Bay Area sites (SL_HANDOFFS' shape) reading `PL_QUESTS`.
4. **treasures-data.js doubled (333 → 628 KB)** with the new kits; a leaner record (drop repeated `world`/`surface`) or a
   per-surface split would keep the parishes page light on phones.
5. TQ-BRIDGE: export `PL_QUESTS` / `plPathBoard` in the shared v2 paths section.
