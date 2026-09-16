# Trade Skills Simulator

Seven vocational training rooms in one WebXR demo. Each room is a working
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

## Gamification

Score is 100 points per step, multiplied by a combo that climbs to ×2.0 on
consecutive correct actions and resets on any mistake. Gauge accuracy adds up to
+50, completed sequences add +20 per extra item, holds add +25, and finishing
under par adds a time bonus. Stars: three for a clean run inside par, two for at
most one correction, one otherwise. Three stars earns the room's badge
(Zero Energy Verified, Clean Chair, Clean Line, Order of Draw, Fire Watch Held,
Clean Promote, Zero Leaks). XP and stars persist per browser and show on the
hub pillar and on each doorway.

## One profile, two apps

Level, XP, badges and player name are a single shared record with
[SmartCiti.X](../smartcity/) — both apps import the same `Progress` object
from `shared/game.js`, so a learner who plays both is one apprentice, not
two. Each room's own record (stars, best score, per-room rank) stays
separate because every room/sim id in either app's catalog is unique; only
the totals are pooled. Every "X/N" readout in this app's own UI (the hub
count, the HUD fill bar, the spoken status line) is scoped to this app's
own seven rooms, never inflated by rooms cleared on the SmartCiti.X side —
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

Content and engine behaviour are covered by `tools/check_trades.mjs` (all seven
rooms pass). The rendered output was reviewed on desktop Chromium at 1280×800.
Not yet verified: Quest hardware — frame rate, controller ergonomics, comfort of
the stick locomotion, and in-headset HUD legibility all need a headset pass
before this is treated as more than a demo. Subject-matter review by a qualified
practitioner in each trade is required before any of it is used for assessment.
