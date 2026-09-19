# Trade Skills Simulator

Nine vocational training rooms in one WebXR demo. Each room is a working
environment with a real order of operations behind it: the simulator scores what
you touch and in what order, explains the consequence of every wrong move, and
awards stars for a clean run against par time.

| Room | Trade | Procedure | Steps |
|---|---|---|---:|
| Isolation Bay | Electrical worker | Lockout/tagout and live-dead-live absence-of-voltage verification on a 480 V panel | 9 |
| Colour Studio | Hair stylist / colourist | Consultation and patch test → sanitation → drape → developer ratio → sectioning → application → timed development → rinse → station reset | 10 |
| Hot Line | Commercial cook | 20-second handwash → colour-coded board → sanitise → knife → portioning → cook → probe to 165 °F → grease flare-up response → hot holding | 10 |
| Draw Station | Phlebotomy technician | Two-identifier check → tourniquet → prep → insertion angle → **order of draw** → release → sharps → pressure → bedside labelling | 10 |
| Weld Bay | Welder / fabricator | Hot work permit → clear combustibles → blanket → fume extraction → PPE → lens shade → work clamp → amperage → bead → fire watch | 10 |
| Deploy Bay | Platform engineer / SRE | Read the deploy ticket → confirm environment → verify scoped secrets → issue a scoped agent token → review the agent's diff → open the canary → watch its error rate → promote to full traffic → test the rollback → log the audit trail | 10 |
| Rough-In Bay | Plumber / pipefitter | Read the work order → close the main → bleed the line → dry-fit the DWV run → fit the backflow preventer → solvent-weld the PVC joint → dial a neutral torch flame → sweat the copper joint → hold test pressure → find the weeping joint | 10 |
| Wash-Down Yard | Laborer — surface prep (LIUNA) | Read the job sheet → seal the storm drain → set the berms → face shield and boots → walk around the machine → fit the 25° tip → set the unloader → set standoff → **coverage pass** (tracked overlap) → recover the wash water → find the berm breach | 11 |
| Coatings Bay | Painter / coatings applicator (IUPAT), hazmat & environmental crews | Read the spec → lead-test the old paint → contain the room → respirator and coveralls → strain the material → fit the 517 tip → set fluid pressure → shoot a test pattern → **coverage pass** (tracked overlap) → check wet film → find the overspray drift | 11 |

The electrical room is an upgrade of the Unity project's existing Electrical
Maintenance site (open panel, lockout staging, protected cable crossing), rebuilt
as a full ordered procedure with proving-unit verification.

## What makes it a simulation rather than a quiz

- **Order is assessed, not suggested.** Reaching for a control that belongs to a
  later step is its own scored mistake with a trade-specific reason
  ("Gloves first — oxidative dye is a skin sensitiser"), separate from picking
  something irrelevant.
- **Hazard objects carry consequences.** Every room seeds real traps: a metal
  mixing bowl in the salon, another worker's padlock in the isolation bay, a
  water jug beside a grease fire, an overfull sharps container, an unsecured gas
  cylinder, a production credential sitting next to the staging ones. Selecting
  one costs double and explains what would have happened.
- **Skill steps are graded, not binary.** Gauge steps (developer volume, probe
  temperature, insertion angle, welding current, travel speed, lens shade) score
  accuracy inside the acceptable band, so "just barely right" and "dead centre"
  are different results.
- **Timed steps must actually be held.** The 20-second handwash, the venipuncture
  site pressure, the post-weld fire watch, and the deploy room's rollback test
  all require a continuous hold; letting go early restarts them.
- **The room reacts.** Disconnects rotate, locks appear on hasps, hair takes the
  colour and lifts through development, tubes fill in draw order, the pan
  flares and is smothered, the bead glows and cools, extraction fans spin up,
  the canary dial and promote lever turn under a live error-rate readout.

## Somebody else in the bay

The rooms got bigger, got furniture, and were still empty of people. A trade is not a solo
activity — there is always somebody at the next bench — and a learner being assessed on working
safely around other people was being shown a world with no other people in it.

`bayCrew()` in `js/shopfit.js` puts one or two in each bay, doing what that trade's second pair
of hands does: another welder screened off in the next bay, a mate up at the copper racking, a
second cook on the line and a porter carrying stock through, a masker working the far wall, the
supervisor holding the switching order whose lock is the other one on the hasp. They shift their
weight and glance about rather than standing like mannequins. None is interactive and none is a
hazard.

Each is posed, then baked in **local** space — three meshes that still move as a unit, the same
trick the SmartCiti.X site crew uses. Two things went wrong the first time and are now checked:
the hard hat was a sphere the same size as the head, so the figure read as a person with an
orange ball for a face; and half the crew were standing **inside** benches and racks, because
they were placed by hand against rooms that were already full. `tools/check_layout.mjs` now
fails if a tagged crew figure is within 1.05m of anything floor-standing, and
`tools/crew_spots.mjs` computes the spots that are clear enough to stand in but close enough to
something to be working at it.

That rule then sat dormant on the other app for fifty stations: it looked for figures in
`root.children`, which is where a bay puts its crew, but a SmartCiti.X station builds everything
inside one group — so it found no figures there and passed every one of them without testing
anything. It walks the tree now. See the SmartCiti.X README for what that turned up.

## The bays are big enough to walk across

Every room was laid out inside about eight metres, and the learner was clamped to a
**3.6-metre circle** in the middle of it — a circle in a rectangle, at that. You could see the
permit board on the far wall and never walk to it. The rooms are 1.62x bigger now, 13 to 16
metres, and the clamp is the room's own rectangle held 0.85m off the walls.

Making the shell bigger on its own would only have added an empty ring of floor, so
`spreadLayout()` scales the **position** of everything standing on it and nothing else: a bench
four metres out goes to six and a half, and the bench itself is untouched because its parts are
local to it. Par times went up about 10%, because a bay you walk across takes longer and the old
par never had to cover that.

Two things the bigger rooms exposed and fixed:

- **Light.** A room's only light was three or four hand-placed fittings and no ambient at all.
  At 2.6x the floor area that left black corners and an unreadable far wall. `ceilingGrid()`
  lays fittings out on a grid sized to the floor, lights a checker of them with a wider throw
  rather than every one, and adds the bounce these rooms never had.
- **Floor markings.** `floorPaint` drew in fractions of the canvas, so on a fourteen-metre floor
  the hazard border came out as sparse white ticks that read as litter. It is set out in metres
  now and reads as a painted chevron band at any room size.

## What is in a bay besides the job

Every object in a room used to be load-bearing for the procedure, which is not what a working
bay looks like. `js/shopfit.js` adds the rest of it: a **shadow board** with the tools outlined
where they belong, **racking** with stock on it, the **notice board** by the door with paper
actually pinned to it, a **bottle rack** chained upright, a **spill station**, a **side bench**
with clutter on it, a **pedestal fan**, colour-coded **wheelie bins**, and **wall reels** for
air, water or welding lead.

Each bay gets the ones its trade actually keeps: gas bottles and a scrap-steel bin in the weld
bay, copper and PVC on racking with a torch-bottle rack in the rough-in bay, hazardous-waste
bins and thinners in the coatings bay, clinical waste and a blood-spill kit in the draw station,
a locked media bin in the deploy hall.

**None of it is interactive.** A bay full of clickable scenery would turn every `find` step into
a lottery, so none of it is registered and no room's assessment changed. `tools/check_layout.mjs`
enforces the other half of that bargain: nothing floor-standing may sit within 1.4m of where the
learner arrives, because scenery added to fill a room is exactly the kind of thing that ends up
in the doorway. It caught two bays where it had.

## The rooms are rooms, not boxes with props in them

Every bay was a shell — a floor, four walls, a flat ceiling and the equipment the
procedure needs. That is enough to assess a procedure and not enough to believe you are
standing anywhere. The shell now carries the four things a real working space has, and
each room chooses its own:

- **Paint on the floor.** A walkway down the middle in the trade's colour with hazard
  hatching along both outer margins, so there is a marked place to stand and a marked
  place not to. It is one canvas decal, so the marking costs a single mesh however
  detailed it is. Seven bays get it; the colour studio and the draw station do not,
  because a salon and a clinic have plain sheet flooring and hatching there read as
  litter.
- **A trim line on the wall.** A painted band at shoulder height in the room's accent —
  the thing that tells you at a glance whose bay you walked into.
- **Structure in the ceiling.** Pipe runs on hangers over the isolation bay, the line
  kitchen, the rough-in bay and the deploy room; roof trusses over the weld bay, the
  wash-down yard and the coatings bay. The draw station and the colour studio get
  neither, because a clinic and a salon really do have a flat tile ceiling.
- **A way out.** A roller shutter, a personnel door with a lit exit sign, or a dock
  opening with daylight in it. This is not decoration: a room with no visible exit is the
  first thing a trainee notices as wrong, and in the weld bay the exit is part of the
  procedure being taught. The wash-down yard's dock is frame-only, because that room is
  deliberately built without its back wall.

The dressing lives in `shared/kit.js` (`floorPaint`, `wallTrim`, `ceilingStructure`,
`wayOut`), so a room asks for it in the same `shell()` call that builds its walls, and
SmartCiti.X's indoor stations can draw on the same vocabulary.

It is not free, so it is now policed. `tools/check_budget.mjs` builds all 59 stations
headlessly and fails on anything past 320 meshes or 12 lights — the Quest-class ceiling
`catalog.json` has always reported and nothing previously enforced. The dressing costs
between 9 and 24 meshes a room; the heaviest room in either app is the colour studio at
313.

## Headset instrument and draw calls

`?perf=1` keeps the last three seconds of real frame time and samples the renderer's draw calls
and triangle count, with a corner overlay and a per-run JSON log. SmartCiti.X has had this since
the perf pass; Trade Skills did not, which meant the app whose rooms just got 1.62x bigger was
the one that could not be measured on a Quest. It has it now, on the same `shared/perf.js`.

The first thing it said was that a bay was drawing around 300 calls. The shell, the ceiling
fittings and the shop furniture never move and are never clicked, so they are built into one
group and baked into a handful of meshes at the end of `build()` (`mergeStatic()` in
`shared/kit.js`). The weld bay now draws **167 calls** from 288 meshes, and renders
pixel-identically.

## Interruptions

Three bays carry interruptions — things that happen *to* the learner mid-procedure and have to be
noticed and answered on their own clock while they are busy with something else. In the Weld Bay
the fume extraction trips out while you are setting the machine, and the fire blanket slips off
the conduit run while you are laying the bead. In the Isolation Bay your lock comes off the hasp
while your eyes are on the meter. In the Draw Bay the patient goes vasovagal while your eyes are
on the tube rack, and somebody offers you a pre-labelled tube set to save time.

They are not steps and they do not change the procedure. Catching one is worth more than a step,
because noticing is the harder thing; missing one counts as an **unsafe action**, because in
every case the thing that went unanswered was a safety condition. A run can be procedurally
perfect and still fail on the alarm it slept through.

The engine layer, the scoring and the checker are shared — see the interruptions section of
[SmartCiti.X's README](../smartcity/README.md).

## Pre-brief (flipped classroom)

The first time a room is entered on screen it opens as a pre-brief: the room's procedure as
study material — every step and its reason, the union and certification where the room
names them, and how many hazards are seeded. "I've read it" stamps the shared profile and
the run starts prepared (the engine-wide Prepared award and a 10% score bonus); "Skip the
brief" runs it cold. Same mechanic and same profile as SmartCiti.X — see `shared/game.js`.

## Gamification

Score is 100 points per step, multiplied by a combo that climbs to ×2.0 on
consecutive correct actions and resets on any mistake. Gauge accuracy adds up to
+50, completed sequences add +20 per extra item, holds add +25, and finishing
under par adds a time bonus. Stars: three for a clean run inside par, two for at
most one correction, one otherwise. Three stars earns the room's badge
(Zero Energy Verified, Clean Chair, Clean Line, Order of Draw, Fire Watch Held,
Clean Promote, Zero Leaks, Clean Recovery, Even Build). XP and stars persist per browser and show on the
hub pillar and on each doorway.

## One profile, two apps

Level, XP, badges and player name are a single shared record with
[SmartCiti.X](../smartcity/) — both apps import the same `Progress` object
from `shared/game.js`, so a learner who plays both is one apprentice, not
two. Each room's own record (stars, best score, per-room rank) stays
separate because every room/sim id in either app's catalog is unique; only
the totals are pooled. Every "X/N" readout in this app's own UI (the hub
count, the HUD fill bar, the spoken status line) is scoped to this app's
own nine rooms, never inflated by rooms cleared on the SmartCiti.X side —
see `Progress.roomsClearedIn()`/`starsIn()` in `shared/game.js` if adding a
new one. The intro screen links to SmartCiti.X and back, since the two
catalogs cover different, complementary trades (this app is closer to
skilled-trade/service work; SmartCiti.X leans municipal/heavy-industrial)
rather than duplicating each other. It also links to Holodeck, which shares
the same profile and can load real SmartCiti.X stations from a prompt, and
to [`../portal/`](../portal/index.html), a static map of all four WebXR apps
in this repository.

## Voice assist

The 🎙 Voice button (Web Speech API) is navigation and narration only, never a
way to perform a step — saying "open the valve" instead of actually turning it
would defeat the point of a hands-on trainer. It understands a room name,
`"hub"`, `"reset"`, and three read-back commands that speak an answer aloud
without changing anything: `"hint"` (the current step's title and cue, or how
to start one), `"brief"` (the room's trade and tagline, or how many trades
there are), and `"status"` (rooms cleared, stars, level). `"help"` lists all of
it. Responses come back through speech synthesis, so a learner mid-procedure —
hands full, eyes on the room — can ask without breaking stride. The 🔊 button
next to it reads the same hint aloud with a click, for anyone without (or not
using) a microphone. Both respect the M mute key.

## Running it

- **Modular source** (what you edit): open `index.html` from any static server —
  `python3 -m http.server` in this directory works. ES modules need HTTP, not
  `file://`.
- **Single file** (what you deploy): `dist/trade-skills-simulator.html`, generated
  by `python3 tools/bundle_webxr.py trades` from the repository root. Copy it anywhere
  and serve it over HTTPS.
- **Deep link a single trade**: `?room=electrical` (or `salon`, `kitchen`,
  `phlebotomy`, `welding`, `devops`) opens straight into that bay, so one room
  can be embedded on its own page.

Controls — desktop: `W A S D` move, drag to look, click to act, hold on timed
steps, `M` mute, `Esc` back to hub. Headset: point and pull the trigger, left
stick glides, right stick snap-turns 30°.

## Checking it

`node tools/check_trades.mjs` builds every room against a stubbed three.js and
plays a scripted perfect run through the real engine. It fails the build if a
step targets an interactable that does not exist, a hazard or ordering note has
no object, a room's `animate()` throws, or a perfect run does not complete
cleanly. `tools/bundle_webxr.py` additionally refuses to emit a bundle when two
modules declare the same top-level name.

## Structure

```
index.html          shell, HUD and styles (DESIGN.md tokens)
js/kit.js           procedural asset kit — geometry, materials, canvas decals,
                    room shells, composite props, particles
js/game.js          procedure engine (select / sequence / gauge / hold),
                    scoring, hazards, stars, badges, XP persistence, WebAudio
js/hub.js           the atrium: one doorway per trade, per-room record plaques
js/rooms/*.js       one file per trade: assets, hazards, steps, motion
js/app.js           renderer, XR, interaction, objective markers, results
dist/               generated single-file build
```

Rooms never score themselves — they declare steps and hazards, and `game.js`
decides outcomes. That keeps assessment deterministic and auditable, the same
contract the Unity build uses.

## Device support

Same matrix as the campus companion in `../README.md`: immersive VR in the Meta
Quest Browser and on PC-VR headsets through a WebXR desktop browser, flat
fallback everywhere else. Ray-Ban Meta display glasses cannot run immersive
WebXR or third-party immersive apps, so on those this is at most a flat phone
view.

## Verification status

Content and engine behaviour are covered by `tools/check_trades.mjs` (all nine
rooms pass). The rendered output was reviewed on desktop Chromium at 1280×800.
Not yet verified: Quest hardware — frame rate, controller ergonomics, comfort of
the stick locomotion, and in-headset HUD legibility all need a headset pass
before this is treated as more than a demo. Subject-matter review by a qualified
practitioner in each trade is required before any of it is used for assessment.
