# WALKABLE — one continuous, walkable world (`wk`, port 9003)

The 22 parish-engine maps and the standalone worlds feel like one world: walk into a crossing and you are on the next map.

## What it does

- **Walk-through connectors.** Every connector to another built map is paired with the far map's connector back
  (`wkPair`: of the far map's connectors to this one, the one whose own end lies nearest this connector's projected far
  end — all 82 pairings are mutual). Walking within `WK_TRIGGER` (7 m) of one carries you across: a short fade
  (`WK_FADE_MS`, none under reduced motion), no menu, a same-page `?parish=` navigation (the app builds one map per page
  load, so there is no in-page `npParish` swap to reuse; the carry URL is the app's own parish switch). You land
  `WK_ONWARD` (18 m) onward of the paired connector, facing on, on dry ground off the carriageway (`wkLanding`: dry and
  1.15 half widths clear, else the road shoulder at 0.6, else a bridge or causeway kerb lane, else the nearest shore).
  The trigger re-arms only once you are `WK_REARM` clear of every connector, so arriving never bounces you back.
- **State carries.** Path, Crew Credits and the passport are in the learner's storage (`npSave` runs before the
  crossing); time of day, weather and a vehicle being driven ride in `wktime`, `wkwx`, `wkdrive`. The far side takes the
  vehicle when NEWTON can place it (`nwPhys.drive`), else it waits and the Motor Pool has it. The URL is tidied back to
  `?parish=<id>` on arrival.
- **Soft edges.** `wkEdge`: inside a 60 m band along the rim the walk (and the drive's hint) is eased inward with a
  push that grows toward the rim, and a toast names the nearest way on with its distance and compass direction. The
  hard clamp is only the last 2 m. Nothing is a wall mid-street.
- **Region atlas** (`#wk-atlas`, inside the Map tab, listed in `tools/check_interface.mjs`): six regions, 22 maps (each
  button's title lists the maps it is joined to), 41 crossings, and the standalone worlds — Bay World, the Deep,
  Redwood Reach, Sierra Summit, Regatta — with their ways in (`WK_WORLDS`, plain data TradeQuest can read). Picking a
  map uses the parish switch; a world opens its page with the way home.
- **Solid things.** MOTORWORKS' `mv-world.js` is imported guarded (`import(...).catch(() => null)`); its placements
  become NEWTON boxes (`wkSolidBoxes`) added to the collider seam (`wkColliderSeam` over CITYWORKS' `cwColliders`, else
  the parish's own boxes). Site buildings were already solid (`nwParishColliders`' `site-building`).
- **Ways out unchanged.** E at a way out, world ways (the Bay Bridge to Bay World) and within-map crossings work as
  before.

## Seams

`WebXR/shared/wk-walkable.js`: `wkPair`, `wkPairs`, `wkLanding`, `wkCarry`, `wkArrival`, `wkEdge`, `wkClamp`,
`wkNearestWay`, `wkAtlas`, `wkSolidBoxes`, `wkColliderSeam`, `WK_WORLDS`. `window.__parishTest.walkable` exposes
`armed()`, `arrive`, `parked()`, `driveId()`.

## Checker

`node tools/check_walkable.mjs` (`--no-browser` to skip the page; `WK_PORT`, default 9003): mutual pairing, the headless
A→B→A round trip for all 82 crossings, carried state, dry and off-centreline landings, rim probes on every map, the atlas,
the solids, the app wiring — and a real browser round trip (open Orleans by Jefferson's carry URL, walk back into the
crossing, land in Jefferson 18 m from the start with time and weather intact), with and without reduced motion.

## Cycles

1. Reason: pairing by "nearest back connector" and landing on its projected far end might not round-trip. Act: probe all
   92 connectors headlessly. Observe: 82 cross-map, 77 round-trip within 40 m; the Orleans ones landed on the back
   connector but its own authored far end was 256–490 m off, the Bay Bridge 2.4 km.
2. Reason: land on the *paired connector's own position*, so the round trip closes by construction. Act: `wkPair` +
   `wkLanding` (onward 18 m, dry, off-road). Observe: 82/82 mutual; 7 landings failed dry/road (causeways over the lake,
   I-10 by the canal).
3. Reason: over water the right place is the deck's kerb lane, and "never the centreline" allows a shoulder. Act: deck
   and shoulder tiers, wider rings. Observe: 11 → 3 failures; the Twin Spans' Orleans end is authored at the map's
   corner in open water with no road.
4. Reason: the start is anywhere in the 7 m trigger; a connector in open water must land on shore. Act: pad + trigger
   tolerance, shore ring to 1.2 km, reported as a "shore landing". Observe: headless 1575 passed, 0 failed.
5. Reason: headless is not the page. Act: wire the app (arrival, trigger, fade, edge, atlas, guarded mv import) and run
   check_parishes, check_interface, check_newton. Observe: 30924/0, 21/0, 60/0.
6. Reason: prove it in a browser. Act: a Playwright stage in check_walkable. Observe: first run timed out (three.js not
   routed); after routing it like check_interface: both motion modes round-trip 18.0 m, state 3/2, no page errors;
   1587 passed, 0 failed.

## Left

- The Twin Spans' Orleans connector sits in open water at the map corner: the crossing lands 1 km away on the nearest
  shore. The data wants a Twin Spans road in Orleans (or the connector moved to the shore).
- The Deep, Redwood Reach, Sierra Summit and Regatta have no parish connector yet; the atlas links their pages directly
  ("ride" text) rather than a way you walk to.
- A crossing is a same-page navigation (a reload), not an in-page re-stream; the fade covers it.
- MOTORWORKS' parked vehicles are solid only once `mv-world.js` merges (guarded until then); `dist/` not rebuilt.
