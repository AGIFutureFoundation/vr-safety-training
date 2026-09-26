# Crew figures

`standingFigure()` (`WebXR/smartcity/js/citykit.js`, built on the shared person
parts in `WebXR/shared/kit.js`) is the one human figure every SmartCiti.X
station and every Trade Skills bay uses — casualties, bystanders, coworkers,
the learner's own third-person body. One function, so a fix or an improvement
here reaches every crew in the platform at once.

This pass made the figure read as a person rather than a mannequin, without
touching a single station file: better proportions, a face that is drawn
rather than implied, trade-correct gear that a station gets by default from
its own category, and small continuous idle motion — all inside the existing
mesh budget every station is already held to.

## Mesh budget

| Configuration | Before | After | Budget (+2) |
|---|---:|---:|---:|
| Bare figure | 13 | 14 | 15 |
| Helmet + vest + gloves + tool belt | 15 | 16 | 17 |

The one added mesh is the ears (see below); everything else — proportions,
face detail, outfit gear, idle motion — is paint, geometry reshaping, or
runtime animation on meshes the figure already had. `tools/check_budget.mjs`
holds every station to its existing ceiling with this figure in it, and
`tools/check_crew.mjs` now holds the figure itself to a 17-mesh ceiling
(today's richest gear combination, plus the two meshes this brief allowed)
across every one of the eight outfits below.

## Proportions and the face

- **Shoulders, hips, a neck.** The torso and pelvis lathes already carried a
  distinct waist-to-shoulder taper; the head profile carries its own short
  neck section below the jawline into the collar, so nothing needed to
  change there to read as a body rather than a stack of blocks.
- **Ears.** New: one mesh, both ears, swept around the whole head like the
  cap and the glasses already do and gated to the two sides (`earGate` in
  `shared/kit.js`). Set low, at jaw height, deliberately — a short hairstyle
  has no hair mesh at all below its own hairline (see `HAIR_STYLES`), so the
  ear sits against bare skin there the way it would in life, while a bob or
  the long style, whose hair genuinely reaches that low, still covers it.
  Placing it at temple height instead put a skin-toned bump in the middle of
  every short hairstyle's mass, which read as a stray dark blotch against
  lighter hair — see "what this caught," below.
- **A face, drawn.** `faceFace()` was already a canvas decal — eyes with a
  clipped iris and pupil, lids, lashes, brows in the figure's own hair
  colour, shaded cheeks and jaw, filled lips — chosen from six drawn
  variants by the figure's seed, over eight skin tones, eight hair colours
  and six hair styles. This pass did not need to add features here; it
  reused what was already carried.
- **Never six copies.** `figureSeed(x, z)` hashes a figure's own position
  into the choice of skin, hair colour, hair style and face variant, so a
  crew of six standing in six different places is six different people.
  `tools/check_crew.mjs` now asserts this directly: six positions, six
  distinct looks.

## Outfits

`OUTFITS` (`shared/kit.js`) is eight named gear presets — `construction`,
`clinical`, `marine`, `kitchen`, `office`, `sport`, `firefighter`, `diver` —
each one only the options a caller left unnamed:

| Outfit | Gear |
|---|---|
| `construction` | hard hat, hi-vis vest, gloves, safety glasses |
| `clinical` | scrub cap, glasses, pale gloves |
| `marine` | hi-vis vest, gloves |
| `kitchen` | white cap, pale gloves |
| `office` | (plain clothes) |
| `sport` | (plain clothes) |
| `firefighter` | red helmet, hi-vis vest and bands, dark gloves |
| `diver` | neoprene hood, dive mask, dark gloves |

A station names an outfit explicitly (`standingFigure(g, x, z, { outfit:
"marine" })`), or names nothing and gets one anyway: `setActiveContext()`
(called from `smartcity/js/app.js` right before a station's stage and its
`build()` run) hands `standingFigure` the station's own category, and
`outfitFromContext()` resolves it — an exact match against the ten-category
taxonomy first, then a keyword guess, and `office` (plain clothes, no PPE)
rather than a guessed hard hat when nothing is recognised. Whatever the
outfit supplies, an option the station *did* name always wins — an existing
`standingFigure(g, x, z, { cloth: 0x2f5f70 })` call improves with no edit to
the station that makes it, because the dentist keeps their own teal scrubs
and gains a scrub cap and gloves from the `clinical` outfit underneath.

New gear pieces, each one mesh and mutually exclusive with the others in its
slot so none of them add to the mesh count on top of what a helmet or a pair
of glasses already cost:

- **`scrubCap`** — the ball cap's own crown with no peak carried out: round
  and brimless.
- **`diveHood`** — the same brimless crown, sized up over the ears; it used
  to reuse the hard hat's shell and inherited its flared brim, which read as
  a sun hat rather than a neoprene hood (also caught in the screenshot pass).
- **`mask`** — the safety glasses' own wrap-lens mesh, sized up over the
  nose and glazed a cool blue-grey rather than tinted, so a diver never pays
  for both a mask and a pair of glasses.

### One SmartCiti.X quirk this surfaced

SmartCiti.X's dist build inlines `shared/kit.js` once for `app.js`,
`apron.js` and `stage.js`, and copies the same source again, unmodified, for
the 400+ station modules that are lazy-loaded via a real `import()` at
runtime (`tools/bundle_webxr.py`) — two separate module instances of one
file. A plain module-level variable for "the station category right now"
was only ever visible to whichever copy set it, so a station's own crew
never saw the context `app.js` had just set. `setActiveContext` /
`getActiveContext` hold the value on `globalThis` instead, which both
copies share.

## Idle life

A crew figure standingFigure marks `userData.crew = true` — one that is just
standing somewhere, not one a station has posed itself (an `atStation`
casualty, a coworker riding the forks) — gets a small continuous idle pass,
`animateCrew()` in `citykit.js`, called once a frame from `app.js`'s render
loop alongside the station's own `animate()`:

- **Breathing** — a tiny scale pulse on the torso mesh only, so it never
  moves the head that is parented beside it.
- **A slow weight shift** — the whole figure leans a few millimetres side to
  side on a slow sine, independent per figure.
- **A glance at the learner** — every few seconds, the head turns toward the
  learner's own position for a second or two, then back to rest.
- **A scratch or a watch-check** — now and then, one arm lifts to the neck
  or the wrist and comes back down; the other arm is left alone.

All of it is a direct `rotation`/`scale` set each frame, no bones or clips,
and `reducedMotion()` (`shared/a11y.js`) — the same helper the platform
already checks elsewhere — skips the whole pass, leaving every figure
exactly as built.

## What the screenshot pass caught

Looking at real stations, not just the lineup, found two things the mesh
budget and the headless checkers cannot see:

1. **The ear, at its first height (temple level), broke through a short
   hairstyle** as a stray dark blotch — confirmed by disabling the ear
   entirely and watching the blotch stay put; it turned out to be a second,
   pre-existing gap at the *long* hairstyle's own hairline, independent of
   the ear. Fixed by widening that style's hair mass (`sx`/`sz` in
   `HAIR_STYLES[4]`) and, separately, by moving the ear down to jaw height
   (see above), which happens to be exactly the height a short hairstyle's
   mesh does not reach.
2. **The dive hood, built on the hard hat's shell, inherited its flared
   brim** and read as a sun hat rather than a hood; rebuilt on the ball
   cap's brimless crown instead. The mask, at its old default colour,
   matched the hood exactly and the two merged into one dark shape; it now
   glazes a distinct blue-grey.

## Screenshots

`docs/screenshots/avatars/`:

- `outfits-lineup.png` — all eight outfits, front-facing, same lighting rig.
- `station-steel-erector.png` — Construction & Structural Trades; the site
  apron's own generic worker (`smartcity/js/apron.js`) in the `construction`
  outfit resolved from that category (the station itself models no crew of
  its own).
- `station-four-handed-dentistry.png` — Dental & Oral Health; the dentist in
  their own teal scrubs plus a `clinical` scrub cap, glasses and gloves, with
  the assisting student dressed the same way further into the room.
- `station-bb-passing-and-catching.png` — Youth Sports & Coaching; passers,
  receivers, the coach and the athletic trainer, all `sport` (plain
  clothes) — the outfit system's job here is to add nothing.

## Checks

- `node tools/check_budget.mjs` — every station's mesh count, this figure
  included, against its existing per-app ceiling.
- `node tools/check_crew.mjs` — the crew-role split (unchanged by this
  work) plus, new: every named outfit builds without throwing and stays
  inside the 17-mesh figure ceiling, and six seeded positions produce six
  distinct looks.
