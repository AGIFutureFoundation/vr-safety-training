# INTERFACE — the parishes app's in-world menu (`ux`, port 8961)

The parishes menu had grown one stacked section per console (STORYLINE, the play-layer path board, KREWE, DRILLS,
PACKS, COGNITION, the DEAN line, Motor Pool, Crew Credits). INTERFACE rebuilds it as a tabbed in-world menu using
the design system's `.at-tabs` / `.at-tab[aria-selected]` component and its `--at-*` tokens:

- **Learn** — paths (`#menu-storyline`, `#menu-paths`), the class module line (`#menu-dean`), lessons and sessions
  (`#menu-cognition`), drills (`#menu-drills`), simulations (`#menu-sims`, reserved for PROJECTSIM), packs (`#menu-packs`).
- **Play** — side quests and games (`#menu-krewe`, the side-games button), treasures, Crew Credits (`#menu-ledger`),
  Motor Pool (`#menu-motorpool`), quests reserved for BAYQUEST (`#menu-bayquest`).
- **Map** — the map, ways out, and the region/map selector (`#menu-parishes`).
- **Me** — passport summary (`#menu-passport`), the K-12 scoreboard link, settings: sound (`#at-sound`, moved in),
  reduced motion (`#ux-reduced`), controls, the first-visit cards again, Home.

Every mount id that existed at 793d16d still exists (moved into a tab panel, never deleted) — other consoles' code
writes into them. The menu reopens in-world (Esc with no dialog open, the Menu touch button, gamepad Start) and
`#menu-start` becomes "Resume". Tabs: ←/→/Home/End with roving tabindex (WAI-ARIA tabs), gamepad LB/RB. The HUD is
one line of state plus the contextual prompt; the long key list moved to Me → Controls. A first-visit onboarding
(three cards, skippable, remembered in localStorage `ux-onboarded-v1`; skipped for automated runs unless
`?onboard=1`).

## Seams

- `uxMenu` (window.__parishTest.ux): `{ tabs: ["learn","play","map","me"], select(tab), open(), close(), onboarding }`.
- Reserved mounts for incoming consoles: `#menu-sims` (PROJECTSIM, Learn tab), `#menu-bayquest` (BAYQUEST, Play tab).
- `WebXR/shared/ux-menu.js`: `uxMountTabs(root, { storageKey, onSelect }) -> { select(id), current() }` and
  `uxOnboarding({ el, cards, key, force }) -> { shown, show(), skip() }`.

## Checker

`node tools/check_interface.mjs` (port 8961): every mount id reachable from a tab, tab order and arrow keys, touch
targets >= 44 px at 390x844, no horizontal scroll, onboarding skip remembered across reload, the HUD one line.

## Cycles
1. Tabs: move every menu mount into Learn/Play/Map/Me panels (`.at-tabs`), add reserved `#menu-sims`/`#menu-bayquest`. Check: check_interface "every mount id reachable from its tab". Observed: 14/14, ids 37/37 present (none lost vs 793d16d by a `comm` of the id lists).
2. Keyboard and gamepad: roving tabindex, ←/→/Home/End, Tab lands on the selected tab; gamepad LB/RB, d-pad focus, A, Start. Check: "arrow keys" line. Observed: `play:play map:map me:me learn:learn me:me`, roving 1.
3. HUD: one line of state, key list moved to Me → Controls, sound toggle moved into Me, Esc/Menu reopens the menu ("Resume"). Check: "the HUD's state is one line", "Esc opens the in-world menu". Observed: 16 px on a 20 px line; Resume; Esc resumes.
4. Onboarding: three cards, skip, remembered (`ux-onboarded-v1`). Check: onboarding lines. Observed: 1 of 3 → 3 of 3 → skipped → not shown after reload.
5. Touch 44 px at 390x844 and no horizontal scroll. Check: "touch targets". Observed first 77/81 (the Home chip 98x29) → fixed with a coarse-pointer chip height → 81/81; no horizontal scroll in any tab or in the world.
