#!/usr/bin/env python3
"""Inline a WebXR app's ES modules into a distributable HTML file.

The modular source under WebXR/<app>/js is what you edit; this produces
WebXR/<app>/dist/<name>.html. For trades and holodeck that HTML is genuinely
self-contained — drop it on any static host, or open it directly via
file://, no build step or module server needed. SmartCiti.X is the
exception: its 20 sims are lazy-loaded via dynamic import() (see
app.js's loadSim() and this file's "copy_files"), so its dist/ is a real
folder — the HTML plus sims/, citykit.js and gamify.js copied alongside it —
and needs a real HTTP(S) server; opening it via file:// will fail (browsers
block dynamic import() from a file: origin). All three share the engine and
asset kit in WebXR/shared.

    python3 tools/bundle_webxr.py             # all apps
    python3 tools/bundle_webxr.py smartcity   # one app
    python3 tools/bundle_webxr.py --pack ID   # one Holodeck Pack alone (tools/export_pack.mjs)
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEBXR = ROOT / "WebXR"
SHARED = WEBXR / "shared"

THREE_IMPORT = (
    'import * as THREE from '
    '"https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";'
)

# Concatenation order per app: definitions before use, app.js last because it
# runs on load.
APPS = {
    "trades": {
        "out": "trade-skills-simulator.html",
        "modules": [
            # Per-identity storage namespaces and the demo (docs/sign-in.md): no
            # imports of its own, read by every progress store below.
            SHARED / "profiles.js",
            SHARED / "a11y.js",
            SHARED / "devices.js",
            SHARED / "ei-guide.js",
            SHARED / "input.js",
            SHARED / "hands.js",
            SHARED / "kit.js",
            SHARED / "textures.js",
            SHARED / "fleet.js",
            SHARED / "equipment.js",
            SHARED / "toolkit.js",
            SHARED / "props.js",
            SHARED / "game.js",
            SHARED / "voice-assist.js",
            SHARED / "records.js",
            SHARED / "competency.js",
            SHARED / "identity.js",
            SHARED / "auth.js",
            SHARED / "lrs.js",
            SHARED / "platform.js",
            SHARED / "flowhub.js",
            SHARED / "ladder-milestones-data.js",
            SHARED / "ladder.js",
            SHARED / "observer.js",
            SHARED / "perf.js",
            # Hard Hat Hunt (docs/easter-egg.md): welding.js and plumbing.js
            # each plant one hard hat.
            SHARED / "eggs.js",
            WEBXR / "trades/js/shopfit.js",
            WEBXR / "trades/js/hub.js",
            WEBXR / "trades/js/rooms/electrical.js",
            WEBXR / "trades/js/rooms/salon.js",
            WEBXR / "trades/js/rooms/kitchen.js",
            WEBXR / "trades/js/rooms/phlebotomy.js",
            WEBXR / "trades/js/rooms/welding.js",
            WEBXR / "trades/js/rooms/devops.js",
            WEBXR / "trades/js/rooms/plumbing.js",
            WEBXR / "trades/js/rooms/pressure-washer.js",
            WEBXR / "trades/js/rooms/paint-sprayer.js",
            # The learner passport (docs/interop.md): one read/write API over
            # the records, identity and every world's ledger, after its deps.
            SHARED / "passport-programmes.js",
            SHARED / "passport.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            WEBXR / "trades/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    "smartcity": {
        "out": "smartcity-x.html",
        "modules": [
            # Per-identity storage namespaces and the demo (docs/sign-in.md): no
            # imports of its own, read by every progress store below.
            SHARED / "profiles.js",
            SHARED / "a11y.js",
            SHARED / "devices.js",
            SHARED / "ei-guide.js",
            SHARED / "input.js",
            SHARED / "hands.js",
            SHARED / "kit.js",
            SHARED / "textures.js",
            SHARED / "fleet.js",
            SHARED / "equipment.js",
            SHARED / "toolkit.js",
            SHARED / "props.js",
            # Fairway Park (docs/districts.md): the shared nine-hole course
            # and outdoor sports facility layout, before smartcity/js/
            # citykit.js and districts.js, which build its "fairway-park"
            # scenic-district preview.
            SHARED / "fairway-data.js",
            SHARED / "fairway.js",
            SHARED / "game.js",
            SHARED / "voice-assist.js",
            SHARED / "records.js",
            SHARED / "competency.js",
            SHARED / "identity.js",
            SHARED / "auth.js",
            SHARED / "lrs.js",
            # Wallet connection and opt-in agent/robot training-data sharing
            # (docs/wallets-and-sharing.md, docs/agent-protocols.md): wallet.js
            # first (auth.js's cleanAddress/shortAddress), then the
            # provider-agnostic adapters, then share-engagement.js, which uses
            # both plus records.js above.
            SHARED / "wallet.js",
            SHARED / "agent-protocols.js",
            SHARED / "share-engagement.js",
            SHARED / "platform.js",
            SHARED / "flowhub.js",
            SHARED / "ladder-milestones-data.js",
            SHARED / "ladder.js",
            # My Training, refreshers due, sign-offs and the transcript
            # (docs/course-tracking.md); needs a11y.js, records.js and
            # ladder.js, all already listed above.
            SHARED / "tracking.js",
            SHARED / "variants.js",
            # The ?fault= simulation option (docs/districts.md).
            SHARED / "faults.js",
            # Random events (docs/events.md): the seeded ambient scheduler and
            # the interrupt-timing jitter every station gets for free.
            SHARED / "events.js",
            # Crew roles (splitByRole): read here only for a radio-call event's
            # line — never invented, only lifted from a station that models one.
            SHARED / "crew.js",
            SHARED / "robot.js",
            SHARED / "robot-embodiment.js",
            # Episode recording (docs/robot-datasets.md): mines a live session
            # for the same shape of decision shared/robot.js's headless
            # rollouts produce, so a human run and a synthetic one merge into
            # one dataset. Depends on the two modules just above it.
            SHARED / "episodes.js",
            # DATAWORKS: the consent gate the recorder checks before it attaches.
            SHARED / "dx-data.js",
            SHARED / "perf.js",
            SHARED / "weather.js",
            SHARED / "environment.js",
            SHARED / "observer.js",
            # Union and safety signage at every station pad (shared/signage.js
            # reads the generated shared/unions.js; regenerate that with
            # tools/gen_unions.mjs after editing tools/unions.json).
            SHARED / "unions.js",
            SHARED / "signage.js",
            # Hard Hat Hunt (docs/easter-egg.md): ten of the twelve stations
            # planting a hard hat live here.
            SHARED / "eggs.js",
            WEBXR / "smartcity/js/citykit.js",
            # Bay World (docs/districts.md): the shared open-world layout and
            # builder, after smartcity/js/citykit.js (bayworld.js borrows its
            # standingFigure/holoTag) and before districts.js, which builds
            # its "bay-world" scenic-district preview.
            SHARED / "bayworld-data.js",
            SHARED / "bayworld.js",
            # The Deep (docs/underwater.md): the shared seabed layout and
            # builder, after citykit.js for the same reason (underwater.js
            # borrows holoTag) and before districts.js, which builds its
            # "the-deep" scenic-district vignette.
            SHARED / "underwater-data.js",
            SHARED / "underwater.js",
            WEBXR / "smartcity/js/gamify.js",
            WEBXR / "smartcity/js/districts.js",
            WEBXR / "smartcity/js/interiors.js", WEBXR / "smartcity/js/ambient.js", WEBXR / "smartcity/js/apron.js",
            WEBXR / "smartcity/js/stage.js",
            WEBXR / "smartcity/js/sims-meta.js",
            WEBXR / "smartcity/js/curricula.js",
            WEBXR / "smartcity/js/ladders.js",
            WEBXR / "smartcity/js/scenarios.js",
            WEBXR / "smartcity/js/hub.js",
            WEBXR / "smartcity/js/gallery.js",
            WEBXR / "smartcity/js/store.js",
            WEBXR / "smartcity/js/react-ui.js",
            # The Easter eggs (docs/easter-egg.md): Photo Mode, the Golden
            # Wrench, the Crane Claw and Night Shift. Takes no imports of its
            # own — see the module's own header — so it only needs to be
            # listed once, before app.js mounts it.
            SHARED / "eggs-app.js",
            # The learner passport (docs/interop.md): one read/write API over
            # the records, identity and every world's ledger, after its deps.
            SHARED / "passport-programmes.js",
            SHARED / "passport.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            WEBXR / "smartcity/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
        # The 20 sims are lazy-loaded at runtime (app.js's loadSim(), one
        # dynamic import() per station on demand) rather than inlined above,
        # so dist/smartcity-x.html is no longer a single self-contained file —
        # it needs these shipped alongside it as real files, at the same
        # relative depth under dist/ that their originals have under js/, so
        # each file's own existing relative imports resolve unchanged (a
        # sims/*.js file's "../../../shared/..." and "../citykit.js" reach
        # the same shared/ and citykit.js either way). Regenerate sims-meta.js
        # with tools/gen_sims_meta.mjs whenever a sim's header fields change.
        "copy_files": {
            WEBXR / "smartcity/js/citykit.js": "citykit.js",
            WEBXR / "smartcity/js/gamify.js": "gamify.js",
            # The hub's guide figure, fetched by hub.js only when the device
            # profile and ?nomodels say so. Same relative path under dist/ as
            # under smartcity/, because hub.js resolves it against the page.
            WEBXR / "smartcity/models/guide-worker.glb": "models/guide-worker.glb",
            **{p: f"sims/{p.name}" for p in sorted((WEBXR / "smartcity/js/sims").glob("*.js"))},
        },
    },
    "instructor": {
        "out": "instructor-console.html",
        "modules": [
            # Per-identity storage namespaces and the demo (docs/sign-in.md): no
            # imports of its own, read by every progress store below.
            SHARED / "profiles.js",
            SHARED / "devices.js",
            SHARED / "observer.js",
            SHARED / "flowhub.js",
            WEBXR / "instructor/js/roster.js",
            # Toolbox Talk Bingo (docs/easter-egg.md): the real per-station
            # hazard-label pool (tools/gen_bingo_hazards.mjs), before the egg
            # module and app.js that both read it.
            SHARED / "bingo-hazards-data.js",
            SHARED / "eggs-app.js",
            # shared/tracking.js (docs/course-tracking.md) for the sign-off
            # panel, in dependency order: game.js has none, competency.js
            # needs game.js, ladder.js needs competency.js, tracking.js needs
            # ladder.js, a11y.js and records.js.
            SHARED / "game.js",
            SHARED / "competency.js",
            SHARED / "ladder-milestones-data.js",
            SHARED / "ladder.js",
            SHARED / "a11y.js",
            SHARED / "records.js",
            SHARED / "tracking.js",
            # The learner passport (docs/interop.md): one read/write API over
            # the records, identity and every world's ledger, after its deps.
            SHARED / "identity.js",
            SHARED / "passport-programmes.js",
            SHARED / "passport.js",
            # The organisation layer (docs/enterprise.md): cohorts, members, audit,
            # certificates — after profiles, records and the programme catalogue.
            SHARED / "org.js",
            WEBXR / "instructor/js/cohort.js",
            # Enterprise seat billing (console TILL, docs/payments.md): the
            # adapter and the budget agent read org.js; the Billing tab reads
            # both and cohort.js's programme filter.
            SHARED / "payments.js",
            SHARED / "pm-agent.js",
            WEBXR / "instructor/js/billing.js",
            # DEAN (docs/modules.md): the lesson index across worlds (the parish maps, field and parish lessons)
            # and the Versions & modules tab, after org.js.
            SHARED / "np-geo.js",
            *[SHARED / f"np-data-{n}.js" for n in ["orleans", "jefferson", "st-bernard", "plaquemines", "st-tammany", "sf-downtown", "sf-mission", "sf-golden-gate-park", "sf-marina", "sf-bayview", "sf-north-beach", "sf-haight-castro", "sf-sunset-south"]],
            SHARED / "sg-ways.js",
            # BAYMAP's Oakland districts and their ways: np-parishes.js registers them, so every app that bundles it carries them.
            SHARED / "np-data-oak-west-oakland.js",
            SHARED / "np-data-oak-downtown-lake.js",
            SHARED / "np-data-oak-fruitvale-estuary.js",
            SHARED / "np-data-oak-emeryville-berkeley.js",
            SHARED / "np-data-bay-san-jose.js",
            SHARED / "np-data-bay-san-pablo.js",
            SHARED / "np-data-sf-outer-mission.js",
            SHARED / "np-data-bp-strip-marsh-east.js",
            SHARED / "np-data-bp-san-leandro-bay.js",
            SHARED / "np-data-bp-san-mateo-shoreline.js",
            SHARED / "np-data-bp-nutrient-pilot.js",
            SHARED / "bm-ways.js",
            SHARED / "np-parishes.js",
            SHARED / "links.js",
            SHARED / "side-game-mechanics.js",
            SHARED / "field-lessons.js",
            SHARED / "by-parish-lessons.js",
            SHARED / "dn-modules.js",
            SHARED / "dn-index.js",
            WEBXR / "instructor/js/dean.js",
            # The account chip controls.js mounts (shared/account.js) and what it reads.
            SHARED / "auth.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            WEBXR / "instructor/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    "holodeck": {
        "out": "holodeck.html",
        "modules": [
            # Per-identity storage namespaces and the demo (docs/sign-in.md): no
            # imports of its own, read by every progress store below.
            SHARED / "profiles.js",
            SHARED / "a11y.js",
            SHARED / "devices.js",
            SHARED / "ei-guide.js",
            SHARED / "input.js",
            SHARED / "hands.js",
            SHARED / "kit.js",
            SHARED / "textures.js",
            SHARED / "perf.js",
            SHARED / "fleet.js",
            SHARED / "equipment.js",
            SHARED / "toolkit.js",
            SHARED / "props.js",
            SHARED / "game.js",
            SHARED / "voice-assist.js",
            SHARED / "records.js",
            SHARED / "competency.js",
            SHARED / "identity.js",
            SHARED / "auth.js",
            SHARED / "lrs.js",
            SHARED / "lessons.js",
            SHARED / "variants.js",
            SHARED / "incidents.js",
            SHARED / "incident-stage.js",
            SHARED / "crew.js",
            SHARED / "observer.js",
            SHARED / "platform.js",
            SHARED / "flowhub.js",
            WEBXR / "holodeck/js/themes.js",
            WEBXR / "holodeck/js/training.js",
            WEBXR / "smartcity/js/sims-meta.js",
            WEBXR / "holodeck/js/prompt-parser.js",
            WEBXR / "holodeck/js/minigolf.js",
            WEBXR / "holodeck/js/store.js",
            WEBXR / "holodeck/js/react-ui.js",
            # The Scaffold Climber arcade cabinet (docs/easter-egg.md).
            SHARED / "eggs-app.js",
            # The learner passport (docs/interop.md): one read/write API over
            # the records, identity and every world's ledger, after its deps.
            SHARED / "passport-programmes.js",
            SHARED / "passport.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            WEBXR / "holodeck/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    # The other Easter egg (WebXR/arcade): four original 2D canvas games on
    # retro cabinets in the crew break room. Each game's engine is a pure
    # module under arcade/js/games/; a new cabinet is a new file there, an
    # entry in arcade/js/cabinets.js and a slot in tools/check_arcade.mjs.
    "arcade": {
        "out": "arcade.html",
        "modules": [
            # Per-identity storage namespaces and the demo (docs/sign-in.md): no
            # imports of its own, read by every progress store below.
            SHARED / "profiles.js",
            SHARED / "input.js",
            WEBXR / "arcade/js/scores.js",
            WEBXR / "arcade/js/audio.js",
            WEBXR / "arcade/js/games/spoolyard.js",
            WEBXR / "arcade/js/games/crewrun.js",
            WEBXR / "arcade/js/games/palletstacker.js",
            WEBXR / "arcade/js/games/forkliftaisle.js",
            WEBXR / "arcade/js/cabinets.js",
            # The account chip controls.js mounts (shared/account.js) and what it reads.
            SHARED / "identity.js",
            SHARED / "records.js",
            SHARED / "auth.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            WEBXR / "arcade/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    # Fairway Park (WebXR/fairway): an original nine-hole golf course and an
    # outdoor sports facility. course-stub.js stands in for the real course
    # (WebXR/shared/fairway.js, team OW1) until that lands — see
    # WebXR/fairway/js/course.js's own header for the one-line swap, which
    # moves course-stub.js out of this list and SHARED / "fairway.js" in, in
    # its place.
    "fairway": {
        "out": "fairway.html",
        "modules": [
            # Per-identity storage namespaces and the demo (docs/sign-in.md): no
            # imports of its own, read by every progress store below.
            SHARED / "profiles.js",
            SHARED / "input.js",
            SHARED / "weather.js",
            # The shared sky and wildlife (docs/consoles/SKY.md): sky.js reads
            # weather.js's table, so it follows it; wildlife.js is standalone.
            SHARED / "sky.js",
            SHARED / "wildlife.js",
            SHARED / "records.js",
            SHARED / "kit.js",
            SHARED / "textures.js",
            SHARED / "perf.js",
            SHARED / "touch.js",
            SHARED / "fairway-data.js",
            SHARED / "fairway.js",
            WEBXR / "fairway/js/course.js",
            WEBXR / "fairway/js/golf.js",
            WEBXR / "fairway/js/minigames.js",
            WEBXR / "fairway/js/scores.js",
            WEBXR / "fairway/js/world.js",
            # The learner passport (docs/interop.md): one read/write API over
            # the records, identity and every world's ledger, after its deps.
            SHARED / "game.js",
            SHARED / "competency.js",
            SHARED / "identity.js",
            SHARED / "passport-programmes.js",
            SHARED / "passport.js",
            # The account chip controls.js mounts (shared/account.js) and what it reads.
            SHARED / "auth.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            SHARED / "links.js",
            # Skill gates (docs/skill-gates.md): the engine, the side games, the lock UI.
            SHARED / "gate-names-data.js",
            SHARED / "skill-gates.js",
            SHARED / "side-games-data.js",
            SHARED / "side-game-mechanics.js",
            SHARED / "skill-gates-ui.js",
            SHARED / "field-lessons.js",  # the K-12 field-lesson list
            SHARED / "side-game-stage.js",
            WEBXR / "fairway/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    # The Easter egg (WebXR/race): an arcade racer on the platform's own fleet.
    # Tracks are data modules under race/tracks/, one per course; a new course
    # is a new file here, in race/js/tracks.js and in tools/check_race.mjs.
    "race": {
        "out": "race.html",
        "modules": [
            # Per-identity storage namespaces and the demo (docs/sign-in.md): no
            # imports of its own, read by every progress store below.
            SHARED / "profiles.js",
            SHARED / "input.js",
            SHARED / "kit.js",
            SHARED / "textures.js",
            SHARED / "perf.js",
            SHARED / "fleet.js",
            SHARED / "equipment.js",
            SHARED / "unions.js",
            WEBXR / "smartcity/js/curricula.js",
            SHARED / "signage.js",
            # Hard Hat Hunt and the capstone liveries (docs/easter-egg.md):
            # the unlock flags the garage screen reads.
            SHARED / "eggs.js",
            SHARED / "records.js",
            WEBXR / "race/js/liveries.js",
            WEBXR / "race/js/capstone-liveries.js",
            WEBXR / "race/tracks/night-highway.js",
            WEBXR / "race/tracks/port-terminal.js",
            WEBXR / "race/tracks/bay-fog-span.js",
            WEBXR / "race/tracks/quarry-haul.js",
            WEBXR / "race/tracks/downtown-site.js",
            WEBXR / "race/tracks/beach-boardwalk.js",
            WEBXR / "race/tracks/cold-storage.js",
            WEBXR / "race/tracks/aurora-skyway.js",
            WEBXR / "race/tracks/marsh-levee.js",
            WEBXR / "race/tracks/quarry-night-shift.js",
            WEBXR / "race/js/tracks.js",
            WEBXR / "race/js/track.js",
            WEBXR / "race/js/sim.js",
            WEBXR / "race/js/world.js",
            WEBXR / "race/js/battle.js",
            WEBXR / "race/js/audio.js",
            WEBXR / "race/js/net.js",
            # The account chip controls.js mounts (shared/account.js) and what it reads.
            SHARED / "identity.js",
            SHARED / "auth.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            WEBXR / "race/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    # Bay World (WebXR/bayworld): a free-roam open-world city app whose
    # missions are the platform's own real training stations, launched by
    # deep link. The shared map (WebXR/shared/bayworld-data.js + bayworld.js,
    # team BAY1) and the quest layer (WebXR/bayworld/js/quests-data.js +
    # quests.js, team BAY3) have both landed; city.js and quests-select.js
    # adapt their shapes for this app's own engine (see each file's own
    # header). js/world-stub.js and js/quests-sample.js are the pre-
    # integration snapshots this app shipped against before that — kept in
    # the tree but no longer bundled, the same way fairway/js/course-stub.js
    # stays after fairway/js/course.js switched to the real course.
    "bayworld": {
        "out": "bayworld.html",
        "modules": [
            # Per-identity storage namespaces and the demo (docs/sign-in.md): no
            # imports of its own, read by every progress store below.
            SHARED / "profiles.js",
            SHARED / "input.js",
            SHARED / "weather.js",
            # The shared sky and wildlife (docs/consoles/SKY.md), after
            # weather.js (sky.js reads its table) and before world.js.
            SHARED / "sky.js",
            SHARED / "wildlife.js",
            SHARED / "kit.js",
            SHARED / "textures.js",
            SHARED / "perf.js",
            SHARED / "touch.js",
            SHARED / "fleet.js",
            # Crew figures and the avatar style space (console CARTOGRAPHER), before world.js.
            SHARED / "crew.js",
            SHARED / "props.js",
            WEBXR / "smartcity/js/citykit.js",
            SHARED / "records.js",
            SHARED / "a11y.js",
            SHARED / "game.js",
            SHARED / "competency.js",
            SHARED / "ladder-milestones-data.js",
            SHARED / "ladder.js",
            SHARED / "tracking.js",
            SHARED / "radio-quiz-data.js",
            SHARED / "radio-quiz.js",
            SHARED / "bayworld-data.js",
            SHARED / "bayworld.js",
            WEBXR / "bayworld/js/city.js",
            WEBXR / "bayworld/js/quests-data.js",
            WEBXR / "bayworld/js/quests.js",
            WEBXR / "bayworld/js/quests-select.js",
            WEBXR / "bayworld/js/quest-engine.js",
            WEBXR / "bayworld/js/career.js",
            SHARED / "links.js",
            # NPC characters (console GRIOT): the generated roster, then the engine, after crew.js and links.js.
            SHARED / "npc-data.js",
            SHARED / "npc.js",
            WEBXR / "bayworld/js/sim.js",
            SHARED / "field-lessons.js",
            WEBXR / "bayworld/js/map.js",
            # Real ground under the city (docs/mapbox.md): bay-geo's fit and
            # shared/mapbox.js's bayGroundTexture(), which world.js applies
            # only when a viewer has supplied a Mapbox token.
            SHARED / "bay-geo.js",
            SHARED / "mapbox.js",
            WEBXR / "bayworld/js/world.js",
            # The learner passport (docs/interop.md): one read/write API over
            # the records, identity and every world's ledger, after its deps.
            SHARED / "identity.js",
            SHARED / "passport-programmes.js",
            SHARED / "passport.js",
            SHARED / "field-kiosk.js",  # K-12 field lessons in play (kiosks, the lesson screen)
            # The account chip controls.js mounts (shared/account.js) and what it reads.
            SHARED / "auth.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            # Skill gates (docs/skill-gates.md): the engine, the side games, the lock UI.
            SHARED / "gate-names-data.js",
            SHARED / "skill-gates.js",
            SHARED / "side-games-data.js",
            SHARED / "side-game-mechanics.js",
            SHARED / "skill-gates-ui.js",
            # The Motor Pool (console MOTORPOOL): the registry, the kit (which
            # dispatches to fleet.js and equipment.js) and the board.
            SHARED / "equipment.js",
            SHARED / "drivables-data.js",
            SHARED / "drivables.js",
            SHARED / "drivables-board.js",
            SHARED / "side-game-stage.js",
            SHARED / "side-game-cosmetics.js",
            SHARED / "k12-gates-data.js",
            # MENAGERIE: street life (docs/consoles/MENAGERIE.md) over the parish engine's pure answers.
            SHARED / "np-parish.js",
            SHARED / "mg-life.js",
            WEBXR / "bayworld/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    # The Deep (WebXR/underwater): the dive game under the bay, whose job
    # boards launch the platform's real dive and restoration stations by deep
    # link. The shared seabed (WebXR/shared/underwater-data.js + underwater.js,
    # team DEEP1) has landed; js/seabed.js and js/world.js adapt it (see each
    # file's header). js/seabed-stub.js and js/seabed-stub-scene.js are the
    # pre-integration snapshots this app shipped against before that — kept in
    # the tree but no longer bundled, the same way bayworld/js/world-stub.js
    # stays after city.js switched to the real map.
    "underwater": {
        "index": "underwater.html",
        "out": "underwater.html",
        "modules": [
            # Per-identity storage namespaces and the demo (docs/sign-in.md): no
            # imports of its own, read by every progress store below.
            SHARED / "profiles.js",
            SHARED / "input.js",
            SHARED / "records.js",
            SHARED / "a11y.js",
            SHARED / "game.js",
            SHARED / "competency.js",
            SHARED / "ladder-milestones-data.js",
            SHARED / "ladder.js",
            SHARED / "tracking.js",
            SHARED / "kit.js",
            SHARED / "textures.js",
            SHARED / "perf.js",
            SHARED / "touch.js",
            SHARED / "fleet.js",
            # Crew figures and the avatar style space (console CARTOGRAPHER), before world.js.
            SHARED / "crew.js",
            SHARED / "props.js",
            WEBXR / "smartcity/js/citykit.js",
            SHARED / "underwater-data.js",
            SHARED / "underwater.js",
            WEBXR / "underwater/js/seabed.js",
            WEBXR / "underwater/js/dives-data.js",
            WEBXR / "underwater/js/dives.js",
            WEBXR / "underwater/js/dives-select.js",
            WEBXR / "underwater/js/dive-engine.js",
            WEBXR / "underwater/js/dive-career.js",
            SHARED / "links.js",
            WEBXR / "underwater/js/dive-sim.js",
            SHARED / "field-lessons.js",
            WEBXR / "underwater/js/dive-map.js",
            WEBXR / "underwater/js/activities.js",
            WEBXR / "underwater/js/world.js",
            # The learner passport (docs/interop.md): one read/write API over
            # the records, identity and every world's ledger, after its deps.
            SHARED / "identity.js",
            SHARED / "passport-programmes.js",
            SHARED / "passport.js",
            SHARED / "field-kiosk.js",  # K-12 field lessons in play (kiosks, the lesson screen)
            # The account chip controls.js mounts (shared/account.js) and what it reads.
            SHARED / "auth.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            # Skill gates (docs/skill-gates.md): the engine, the side games, the lock UI.
            SHARED / "gate-names-data.js",
            SHARED / "skill-gates.js",
            SHARED / "side-games-data.js",
            SHARED / "side-game-mechanics.js",
            SHARED / "skill-gates-ui.js",
            SHARED / "side-game-stage.js",
            SHARED / "side-game-cosmetics.js",
            SHARED / "k12-gates-data.js",
            WEBXR / "underwater/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    # Redwood Reach (WebXR/redwood, page redwood.html): a 4096 m forest world
    # with streamed terrain chunks, instanced trees, the shared sky and
    # wildlife, eleven work sites whose job boards launch real stations, a
    # skill-gated quest layer, field tins and K-12 field lessons (console
    # REDWOOD, docs/consoles/REDWOOD.md). Every name in redwood/js is rw….
    "redwood": {
        "index": "redwood.html",
        "out": "redwood.html",
        "modules": [
            SHARED / "profiles.js",
            SHARED / "input.js",
            SHARED / "weather.js",
            SHARED / "sky.js",
            SHARED / "wildlife.js",
            SHARED / "records.js",
            SHARED / "kit.js",
            SHARED / "textures.js",
            SHARED / "perf.js",
            SHARED / "touch.js",
            SHARED / "passport-programmes.js",
            SHARED / "gate-names-data.js",
            SHARED / "skill-gates.js",
            WEBXR / "redwood/js/rw-data.js",
            WEBXR / "redwood/js/rw-lore-data.js",
            WEBXR / "redwood/js/rw-career.js",
            WEBXR / "redwood/js/rw-world.js",
            SHARED / "tf-water.js",  # TERRAFORM: the shared wind and the river's ripple
            SHARED / "at-atmos.js",  # ATMOS: the seeded weather and the sound mix
            SHARED / "at-sound.js",  # ATMOS: the synthesised soundscape (muted by default)
            SHARED / "game.js",
            SHARED / "competency.js",
            SHARED / "identity.js",
            SHARED / "passport.js",
            SHARED / "field-lessons.js",  # the K-12 list call
            SHARED / "field-kiosk.js",  # the shared field-lesson passport award (after passport.js)
            SHARED / "sc-scholar.js",  # SCHOLAR: the K-12 lesson session and its scoring
            SHARED / "sc-session-ui.js",
            SHARED / "auth.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            SHARED / "links.js",
            # NPC characters (console GRIOT): the avatar space, the generated roster, then the engine.
            SHARED / "crew.js",
            SHARED / "npc-data.js",
            SHARED / "npc.js",
            SHARED / "side-games-data.js",
            SHARED / "side-game-mechanics.js",
            SHARED / "skill-gates-ui.js",
            # COGNITION: the Cognition.X learning-module runner and what it imports (flowhub, BAYOU's flow agent, the units).
            SHARED / "flowhub.js",
            SHARED / "by-parish-lessons.js",
            SHARED / "by-flow-agent.js",
            SHARED / "cg-units.js",
            SHARED / "cg-runner.js",
            WEBXR / "redwood/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    # Sierra Summit (WebXR/summit, console SUMMIT): a 4096 m mountain world
    # streamed in 256 m chunks. shared/summit-data.js is the pure ground truth
    # (terrain field, sites, eggs, lessons, quests, activities), shared/
    # summit.js the three.js builder, summit/js/state.js the headless ledger.
    "summit": {
        "out": "summit.html",
        "modules": [
            SHARED / "profiles.js",
            SHARED / "input.js",
            SHARED / "weather.js",
            SHARED / "sky.js",
            SHARED / "wildlife.js",
            SHARED / "kit.js",
            SHARED / "textures.js",
            SHARED / "fleet.js",
            SHARED / "records.js",
            SHARED / "perf.js",
            SHARED / "touch.js",
            SHARED / "summit-data.js",
            SHARED / "summit.js",
            SHARED / "game.js",
            SHARED / "competency.js",
            SHARED / "identity.js",
            SHARED / "passport-programmes.js",
            SHARED / "passport.js",
            SHARED / "field-lessons.js",  # the K-12 list call
            SHARED / "field-kiosk.js",  # the shared field-lesson passport award (after passport.js)
            SHARED / "links.js",
            # NPC characters (console GRIOT): the avatar space, the generated roster, then the engine.
            SHARED / "crew.js",
            SHARED / "npc-data.js",
            SHARED / "npc.js",
            SHARED / "gate-names-data.js",
            SHARED / "skill-gates.js",
            SHARED / "side-games-data.js",
            SHARED / "side-game-mechanics.js",
            SHARED / "skill-gates-ui.js",
            WEBXR / "summit/js/state.js",
            SHARED / "auth.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            WEBXR / "summit/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    # The New Orleans parishes (WebXR/parishes, page parishes.html?parish=<id>,
    # console PARISH): one streamed 4096 m delta world per parish on the shared
    # parish schema. shared/np-geo.js and np-parish.js are the pure engine,
    # np-data-<parish>.js the maps, np-parishes.js the registry, np-world.js
    # the three.js builder. mapbox.js (with bay-geo.js and bayworld-data.js it
    # imports) supplies only the viewer's token for the satellite ground.
    "parishes": {
        "index": "parishes.html",
        "out": "parishes.html",
        "modules": [
            SHARED / "profiles.js",
            SHARED / "input.js",
            SHARED / "weather.js",
            SHARED / "sky.js",
            SHARED / "wildlife.js",
            SHARED / "kit.js",
            SHARED / "textures.js",
            SHARED / "records.js",
            SHARED / "perf.js",
            SHARED / "touch.js",
            SHARED / "bayworld-data.js",
            SHARED / "bay-geo.js",
            SHARED / "mapbox.js",
            SHARED / "np-geo.js",
            SHARED / "np-parish.js",
            SHARED / "np-data-orleans.js",
            SHARED / "np-data-jefferson.js",
            SHARED / "np-data-st-bernard.js",
            SHARED / "np-data-plaquemines.js",
            SHARED / "np-data-st-tammany.js",
            SHARED / "np-data-sf-downtown.js",
            SHARED / "np-data-sf-mission.js",
            SHARED / "np-data-sf-golden-gate-park.js",
            # San Francisco (GOLDEN-B): two districts and the world ways (the Bay Bridge to Bay World).
            SHARED / "np-data-sf-marina.js",
            SHARED / "np-data-sf-bayview.js",
            # NEIGHBORHOODS: the walkable San Francisco districts.
            SHARED / "np-data-sf-north-beach.js",
            SHARED / "np-data-sf-haight-castro.js",
            SHARED / "np-data-sf-sunset-south.js",
            SHARED / "np-data-sf-outer-mission.js",
            SHARED / "np-data-bp-strip-marsh-east.js",
            SHARED / "np-data-bp-san-leandro-bay.js",
            SHARED / "np-data-bp-san-mateo-shoreline.js",
            SHARED / "np-data-bp-nutrient-pilot.js",
            SHARED / "sg-ways.js",
            SHARED / "np-data-oak-west-oakland.js",
            SHARED / "np-data-oak-downtown-lake.js",
            SHARED / "np-data-oak-fruitvale-estuary.js",
            SHARED / "np-data-oak-emeryville-berkeley.js",
            SHARED / "np-data-bay-san-jose.js",
            SHARED / "np-data-bay-san-pablo.js",
            SHARED / "bm-ways.js",
            SHARED / "np-parishes.js",
            # LANDMARKS: the landmark kit np-world.js draws a registry kind with (before np-world.js).
            SHARED / "lm-landmarks.js",
            SHARED / "np-world.js",
            # FACADES: exterior detail and generic storefront signs (sets NP_MASSING_HOOKS.details; after np-world.js).
            SHARED / "fc-facades.js",
            # PALETTE: colour categories (plain data) and the massing material hook (after np-world.js and textures.js).
            SHARED / "pa-palette-data.js",
            SHARED / "pa-palette.js",
            # RELIEF: Mapbox Terrain-RGB relief and the tier-capped drape for any map's box, token-gated (docs/mapbox.md).
            SHARED / "rl-relief.js",
            # TERRAFORM: water, wind and ground cover (the pure half registers the engine's terrain hooks).
            SHARED / "tf-water.js",
            SHARED / "tf-terraform.js",
            SHARED / "tf-world.js",
            # CITYWORKS (the Packs run): the generated street fabric per New Orleans parish, the pure streets/solids module
            # and its three.js builder (after np-parish.js and np-parishes.js).
            SHARED / "cw-streets-orleans.js",
            SHARED / "cw-streets-jefferson.js",
            SHARED / "cw-streets-st-bernard.js",
            SHARED / "cw-streets-plaquemines.js",
            SHARED / "cw-streets-st-tammany.js",
            SHARED / "cw-cityworks.js",
            SHARED / "cw-streets-world.js",
            SHARED / "at-atmos.js",  # ATMOS: weather, lamps, fog, sound mix (docs/consoles/ATMOS.md)
            SHARED / "at-world.js",
            SHARED / "at-sound.js",
            SHARED / "game.js",
            # ROBOTICS: the robot policy and body (after game.js), for rb-env.js below.
            SHARED / "robot.js",
            SHARED / "robot-embodiment.js",
            SHARED / "competency.js",
            SHARED / "identity.js",
            SHARED / "passport-programmes.js",
            SHARED / "passport.js",
            SHARED / "links.js",
            SHARED / "gate-names-data.js",
            SHARED / "skill-gates.js",
            SHARED / "side-games-data.js",
            SHARED / "side-game-mechanics.js",
            SHARED / "skill-gates-ui.js",
            SHARED / "sl-parish-play.js",
            # SCHOLAR (the Packs run, second wave): BAYOU's parish lessons and the K-12 lesson session panel.
            SHARED / "by-parish-lessons.js",
            SHARED / "sc-scholar.js",
            SHARED / "sc-session-ui.js",
            SHARED / "es-bay-lessons.js",  # ESTUARY: the Bay ecology lessons the SCHOLAR panel mounts
            SHARED / "dw-regions.js",  # DEEPWATER: the shoreline dive entries and their in-world markers
            # ASSAYER (the Bayou run): GRIOT's characters on the parish sites (after crew.js and links.js) and
            # MOTORPOOL's board (pure registry and the DOM-only board; no builder, so no kit weight).
            SHARED / "crew.js",
            SHARED / "npc-data.js",
            SHARED / "npc.js",
            # TYCOON (the Packs run): the Crew Credits play economy (after npc-data.js, np-parishes.js and passport.js).
            SHARED / "ty-economy.js",
            SHARED / "drivables-data.js",
            SHARED / "drivables-board.js",
            # NEWTON (the Packs run): the pure physics (after np-parish.js and drivables-data.js) and its parish mount.
            SHARED / "nw-physics.js",
            SHARED / "nw-drive.js",
            # MOTORWORKS: vehicle classes and handling (pure data) and the parked vehicles in the maps (after nw-drive.js).
            SHARED / "mv-motorworks.js",
            SHARED / "mv-world.js",
            # INTERIORS: walk-in generic rooms for the site buildings (after nw-physics.js).
            SHARED / "ix-interiors.js",
            # KREWE: the parish kiosks and quests, the kits' placement and the kits (after kit.js and np-parish.js).
            SHARED / "kw-play-data.js",
            # CLEANPORTS: the zero-emission port stations keyed to BAYMAP's West Oakland sites (pure data, guarded).
            SHARED / "cp-cleanports.js",
            SHARED / "kw-place.js",
            SHARED / "kw-kits.js",
            # MENAGERIE: pets, animals and passers-by, one InstancedMesh per kind (after np-parish.js).
            SHARED / "mg-life.js",
            # STORYLINE: the path registry, the generated side stories and their world mount (after npc.js, kw-play-data.js).
            SHARED / "st-paths.js",
            SHARED / "st-stories-data.js",
            SHARED / "st-stories.js",
            # DRILLS: the scenario drills (data, then the registry and mount; after st-paths.js and npc-data.js).
            SHARED / "dr-drills-data.js",
            SHARED / "dr-drills.js",
            # ROBOTICS: scenarios (plain data), the gym env, then the sites and games mount (after side-game-mechanics.js, np-parish.js).
            SHARED / "rb-robotics-data.js",
            SHARED / "rb-env.js",
            SHARED / "rb-world.js",
            # BAYQUEST: the Bay Program play layer (after ty-economy.js, st-stories.js, nw-physics.js, tf-terraform.js).
            SHARED / "bq-facts.js",
            SHARED / "bq-games-data.js",
            SHARED / "bq-trail-data.js",
            SHARED / "bq-bayquest.js",
            # PROJECTSIM: the Bay Program project simulations (data, then the mount; after np-parishes, tf-terraform, nw-physics, ty-economy).
            SHARED / "ps-projectsim-data.js",
            SHARED / "ps-projectsim.js", SHARED / "us-unionsims-data.js", SHARED / "us-unionsims.js",
            # PACKS: the Holodeck Packs registry (generated data, then the pure registry) for the menu's pack chips.
            SHARED / "pk-packs-data.js",
            SHARED / "pk-packs.js",
            # INTERFACE: the tabbed in-world menu (Learn / Play / Map / Me) and the first-visit cards.
            SHARED / "ux-menu.js",
            WEBXR / "parishes/js/state.js",
            SHARED / "auth.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            # DEAN (docs/modules.md): versions and assigned modules applied at load (after org.js, which account.js brings).
            SHARED / "dn-modules.js",
            # COGNITION: the Cognition.X learning-module runner and what it imports (flowhub, BAYOU's flow agent, the units).
            SHARED / "flowhub.js",
            SHARED / "by-flow-agent.js",
            SHARED / "cg-units.js",
            SHARED / "cg-runner.js",
            # PLAYLAYER: the Bay Area play layer (reads GOLDEN-B's San Francisco lessons alongside the other maps').
            SHARED / "sg-sf-play.js",
            SHARED / "pl-bay-play.js",
            # DATAWORKS: consent, capture and the Me-tab panel (nothing recorded without opt-in).
            SHARED / "dx-data.js",
            SHARED / "dx-consent-ui.js",
            SHARED / "dx-world.js",
            WEBXR / "parishes/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    # The Bay Atlas (docs/mapbox.md): a second page in the Bay World folder
    # ("dir"/"index" below), DOM-only — no three.js — over the shared Bay
    # World data, bay-geo's fit and shared/mapbox.js. Mapbox GL itself is
    # never bundled: mapbox.js inserts the cdnjs <script> at runtime, and only
    # once a viewer has supplied a token.
    "atlas": {
        "dir": "bayworld",
        "index": "atlas.html",
        "out": "atlas.html",
        "modules": [
            # Per-identity storage namespaces and the demo (docs/sign-in.md): no
            # imports of its own, read by every progress store below.
            SHARED / "profiles.js",
            SHARED / "bayworld-data.js",
            SHARED / "bay-geo.js",
            SHARED / "mapbox.js",
            # Sierra Summit's pure data (no three.js) for the Atlas's Summit section.
            SHARED / "summit-data.js",
            # The account chip controls.js mounts (shared/account.js) and what it reads.
            SHARED / "identity.js",
            SHARED / "records.js",
            SHARED / "auth.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            SHARED / "links.js",
            WEBXR / "bayworld/js/atlas.js",
        ],
        "entry": '<script type="module" src="./js/atlas.js"></script>',
    },
    # The Deep's Bay Program regions (console DEEPWATER, shared/dw-regions.js): a second page in the underwater folder,
    # reached from the Deep's "Bay Program regions" button and the parish shoreline dive entries (underwater.html?region=).
    "region": {
        "dir": "underwater",
        "index": "region.html",
        "out": "region.html",
        "modules": [
            SHARED / "profiles.js",
            SHARED / "records.js",
            SHARED / "identity.js",
            SHARED / "game.js",
            SHARED / "competency.js",
            SHARED / "passport-programmes.js",
            SHARED / "passport.js",
            SHARED / "links.js",
            SHARED / "auth.js",
            SHARED / "i18n-strings.js",
            SHARED / "i18n.js",
            SHARED / "cinema.js",
            SHARED / "gate-names-data.js",
            SHARED / "skill-gates.js",
            SHARED / "treasures-data.js",
            SHARED / "treasures.js",
            SHARED / "crew.js",
            SHARED / "org.js",
            SHARED / "account.js",
            SHARED / "theme.js",
            SHARED / "controls.js",
            SHARED / "voice-assist.js",
            SHARED / "guide.js",
            SHARED / "dw-regions.js",
            WEBXR / "underwater/js/dw-region-app.js",
        ],
        "entry": '<script type="module" src="./js/dw-region-app.js"></script>',
    },
    # Bay Regatta (WebXR/regatta, page regatta.html): the twelve-yacht fleet
    # (shared/yacht-fleet.js, motorYacht variants), three race courses on Bay
    # World's water, the race engine and the hosted-events calendar, which
    # pays into Bay World's own career ledger (bayworld/js/career.js and its
    # tracking.js chain, listed here in the same order the bayworld bundle
    # uses). The city and its water come from shared/bayworld.js, so its
    # props.js/citykit.js dependencies ride along.
    "regatta": {
        "index": "regatta.html",
        "out": "regatta.html",
        "modules": [
            # Per-identity storage namespaces and the demo (docs/sign-in.md): no
            # imports of its own, read by every progress store below.
            SHARED / "profiles.js",
            SHARED / "input.js",
            SHARED / "weather.js",
            SHARED / "kit.js",
            SHARED / "textures.js",
            SHARED / "perf.js",
            SHARED / "touch.js",
            SHARED / "fleet.js",
            SHARED / "props.js",
            WEBXR / "smartcity/js/citykit.js",
            SHARED / "records.js",
            SHARED / "a11y.js",
            SHARED / "game.js",
            SHARED / "competency.js",
            SHARED / "ladder-milestones-data.js",
            SHARED / "ladder.js",
            SHARED / "tracking.js",
            SHARED / "bayworld-data.js",
            SHARED / "bayworld.js",
            SHARED / "yacht-fleet.js",
            WEBXR / "bayworld/js/career.js",
            WEBXR / "regatta/js/courses.js",
            WEBXR / "regatta/js/race.js",
            SHARED / "links.js",
            WEBXR / "regatta/js/events.js",
            WEBXR / "regatta/js/world.js",
            # The learner passport (docs/interop.md): one read/write API over
            # the records, identity and every world's ledger, after its deps.
            SHARED / "identity.js",
            SHARED / "passport-programmes.js",
            SHARED / "passport.js",
            # The account chip controls.js mounts (shared/account.js) and what it reads.
            SHARED / "auth.js",
            SHARED / "account.js",
            SHARED / "controls.js",
            # Skill gates (docs/skill-gates.md): the engine, the side games, the lock UI.
            SHARED / "gate-names-data.js",
            SHARED / "skill-gates.js",
            SHARED / "side-games-data.js",
            SHARED / "side-game-mechanics.js",
            SHARED / "skill-gates-ui.js",
            SHARED / "field-lessons.js",  # the K-12 field-lesson list
            WEBXR / "regatta/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
}

# Cross-app links (e.g. trades' intro pointing at "../smartcity/index.html")
# are written relative to the SOURCE index.html's own directory (WebXR/<app>/).
# The dist file this bundles into lives one directory deeper, at
# WebXR/<app>/dist/<name>.html, so the same "../<sibling>/" text would resolve
# one level too shallow there — dist_fixup() rewrites it to "../../<sibling>/"
# in the bundled output only, leaving the edited source files untouched. This
# covers both a plain HTML href="../smartcity/..." and a JS object property
# like href: "../smartcity/..." (Holodeck's react-ui.js uses the latter),
# since both contain the same quoted "../smartcity/ substring.
# "flows" is not an app but is reached the same way: the instructor console
# fetches "../flows/index.json", which needs the same one-level fixup in dist.
SIBLING_APP_DIRS = [*APPS, "portal", "verify", "instructor", "flows", "packs"]
SIBLING_APP_DIRS = [*APPS, "portal", "verify", "instructor", "flows", "packs", "scholar", "data"]  # scholar: the K-12 scoreboard (SCHOLAR); data: the DATAWORKS analysis page
AUTH_CONFIG = "auth-config.json"
# The apps whose bundle reads the sign-in configuration, and therefore need a
# copy of it beside the bundle. A deployment edits the copy it serves.
AUTH_CONFIG_APPS = ["smartcity", "bayworld", "atlas"]


# Both quoting styles, because a cross-app link is written as a plain HTML
# attribute in one place and as a template literal in another — trades' app.js
# builds its SmartCiti.X deep link with `../smartcity/index.html?sim=${id}`,
# which the double-quote-only rewrite used to miss, shipping a dist bundle whose
# "open that station" link resolved one directory too shallow.
LINK_QUOTES = ('"', "`")


# The Guide (console COMPASS, docs/consoles/COMPASS.md) rides with the control
# grammar: every app that lists controls.js gets shared/guide.js just before
# it, and shared/voice-assist.js (its speech out) where the app has none.
# Its knowledge base, shared/guide-kb.js, is not bundled: guide.js imports it
# lazily from the dist folder the first time the panel opens.
# The design tokens (console POLISH, shared/theme.js) ride with the control
# grammar the same way: controls.js imports them, so every app that lists
# controls.js gets theme.js just before it.
for _th_cfg in APPS.values():
    _th_mods = _th_cfg["modules"]
    if SHARED / "controls.js" in _th_mods and SHARED / "theme.js" not in _th_mods:
        _th_mods.insert(_th_mods.index(SHARED / "controls.js"), SHARED / "theme.js")

for _gd_cfg in APPS.values():
    _gd_mods = _gd_cfg["modules"]
    if SHARED / "controls.js" in _gd_mods and SHARED / "guide.js" not in _gd_mods:
        _gd_at = _gd_mods.index(SHARED / "controls.js")
        _gd_add = ([] if SHARED / "voice-assist.js" in _gd_mods else [SHARED / "voice-assist.js"]) + [SHARED / "guide.js"]
        _gd_mods[_gd_at:_gd_at] = _gd_add

# The language layer (console BABEL, docs/i18n.md) rides with the chrome: every
# app that carries controls.js, account.js or guide.js gets shared/i18n-strings.js
# and shared/i18n.js first, since neither imports anything else.
for _tr_cfg in APPS.values():
    _tr_mods = _tr_cfg["modules"]
    if any(SHARED / n in _tr_mods for n in ("controls.js", "account.js", "guide.js")) and SHARED / "i18n.js" not in _tr_mods:
        _tr_mods[0:0] = [SHARED / "i18n-strings.js", SHARED / "i18n.js"]

# The treasure ledger (console TREASURE, docs/treasures.md) rides with the
# chrome too: account.js and guide.js import shared/treasures.js, which reads
# profiles.js and its generated data, so every app carrying either gets the
# data and the module right after profiles.js (or first, with profiles.js
# put in front of them when an app did not list it).
for _tz_cfg in APPS.values():
    _tz_mods = _tz_cfg["modules"]
    if any(SHARED / n in _tz_mods for n in ("account.js", "guide.js")) and SHARED / "treasures.js" not in _tz_mods:
        if SHARED / "profiles.js" not in _tz_mods:
            _tz_first = min(_tz_mods.index(SHARED / n) for n in ("account.js", "guide.js") if SHARED / n in _tz_mods)
            _tz_mods.insert(_tz_first, SHARED / "profiles.js")
        _tz_at = _tz_mods.index(SHARED / "profiles.js") + 1
        _tz_mods[_tz_at:_tz_at] = [SHARED / "treasures-data.js", SHARED / "treasures.js"]
    # treasures.js answers its gates through the shared gate engine
    # (shared/skill-gates.js, which reads passport-programmes.js): an app that
    # carries the treasure layer but not the engine gets both, right before it.
    if SHARED / "treasures.js" in _tz_mods and SHARED / "skill-gates.js" not in _tz_mods:
        _tz_at = _tz_mods.index(SHARED / "treasures-data.js")
        _tz_mods[_tz_at:_tz_at] = ([] if SHARED / "passport-programmes.js" in _tz_mods else [SHARED / "passport-programmes.js"]) + ([] if SHARED / "gate-names-data.js" in _tz_mods else [SHARED / "gate-names-data.js"]) + [SHARED / "skill-gates.js"]
# The video-background layer (console CINEMA, shared/cinema.js) imports
# nothing, so every app with a module that imports it gets it first.
for _cn_cfg in APPS.values():
    _cn_mods = _cn_cfg["modules"]
    if SHARED / "cinema.js" not in _cn_mods and any(
            p.exists() and re.search(r'from\s+"[./]*(?:shared/)?cinema\.js"', p.read_text()) for p in _cn_mods):
        _cn_mods.insert(0, SHARED / "cinema.js")
# The avatar picker on the account chip (console CARTOGRAPHER,
# tools/briefs/worlds-detail-brief.md) reads shared/crew.js's style space, so
# every app that bundles shared/account.js gets crew.js just before it (or has
# it moved there when it was listed later).
_CT_ACCOUNT, _CT_CREW = SHARED.joinpath("account.js"), SHARED.joinpath("crew.js")
for _ct_cfg in APPS.values():
    _ct_mods = _ct_cfg["modules"]
    if _CT_ACCOUNT not in _ct_mods:
        continue
    if _CT_CREW in _ct_mods and _ct_mods.index(_CT_CREW) < _ct_mods.index(_CT_ACCOUNT):
        continue
    if _CT_CREW in _ct_mods:
        _ct_mods.remove(_CT_CREW)
    _ct_mods.insert(_ct_mods.index(_CT_ACCOUNT), _CT_CREW)

# The organisation layer (console ENTERPRISE, docs/enterprise.md): account.js
# imports shared/org.js so a learner can join a cohort from the sign-in
# dialog. org.js evaluates names from records.js and passport-programmes.js at
# load, so it goes right after the last of its three dependencies, with any
# missing one put in front of it there.
# (check_home counts the module-list lines that spell the chip's path, so the
# chip module is named here through its own variable.)
_en_chip = SHARED.joinpath("account.js")
for _en_cfg in APPS.values():
    _en_mods = _en_cfg["modules"]
    if _en_chip in _en_mods and SHARED / "org.js" not in _en_mods:
        _en_deps = [SHARED / "profiles.js", SHARED / "records.js", SHARED / "passport-programmes.js"]
        _en_have = [_en_mods.index(d) for d in _en_deps if d in _en_mods]
        _en_at = (max(_en_have) + 1) if _en_have else _en_mods.index(_en_chip)
        _en_mods[_en_at:_en_at] = [d for d in _en_deps if d not in _en_mods] + [SHARED / "org.js"]

def dist_fixup(html: str) -> str:
    # The repository's docs/ folder is not published beside any bundle: a
    # source page's link into it keeps its text reference and loses the dead
    # link in every dist (tools/briefs/links-brief.md).
    html = re.sub(r'<a href="(?:\.\./)+docs/([\w./-]+\.md)">([^<]*)</a>', r'<code>\2</code>', html)
    for name in SIBLING_APP_DIRS:
        for q in LINK_QUOTES:
            html = html.replace(f'{q}../{name}/', f'{q}../../{name}/')
    # The programme track pages (the Atlas's chips) live in WebXR/dist/tracks/.
    for q in LINK_QUOTES:
        html = html.replace(f'{q}../dist/tracks/', f'{q}../../dist/tracks/')
    # The homepage link in every app's header chip: WebXR/index.html is one
    # level up from the source page and two from WebXR/<app>/dist/.
    for q in LINK_QUOTES:
        html = html.replace(f'{q}../index.html{q}', f'{q}../../index.html{q}')
    # The sign-in configuration is read relative to the page. Beside the modular
    # source that is one directory up (WebXR/auth-config.json from
    # WebXR/<app>/); in a dist folder it is the copy written next to the bundle.
    for q in LINK_QUOTES:
        html = html.replace(f'{q}../{AUTH_CONFIG}{q}', f'{q}./{AUTH_CONFIG}{q}')
    # The shared design stylesheet (console ATELIER, docs/design-system/): one
    # directory up from the source page, two from WebXR/<app>/dist/.
    html = html.replace(f'"../{DESIGN_CSS}"', f'"../../{DESIGN_CSS}"')
    return html


# The one stylesheet every app page links (tools/gen_design.mjs), and the
# vendored fonts and icons it points at; the flat folder carries copies.
DESIGN_CSS = "shared/design.css"
DESIGN_VENDOR = ["fonts", "icons"]


IMPORT_RE = re.compile(r"^import\s+[\s\S]*?from\s+[\"'][^\"']+[\"'];\s*$", re.MULTILINE)
# The `from "..."` target of every import, so the build can check that each
# local one is actually in this app's module list. Getting that wrong ships a
# bundle whose first line throws a ReferenceError and whose page never paints
# — it has happened twice, so it is a build error now, not a smoke test.
IMPORT_FROM_RE = re.compile(r"""^import\s+[\s\S]*?from\s+["']([^"']+)["'];\s*$""", re.MULTILINE)
EXPORT_BLOCK_RE = re.compile(r"^export\s*\{[^}]*\}\s*;\s*$", re.MULTILINE)
EXPORT_KEYWORD_RE = re.compile(r"^export\s+(?=(const|let|var|function|class|async))", re.MULTILINE)
# A re-export (`export * from "../shared/textures.js";`, citykit.js's) names a
# module the bundle already inlines; left in, it is a real network import the
# flat folder cannot answer, and the page's whole module fails to link.
EXPORT_STAR_RE = re.compile(r"""^export\s+\*\s+from\s+["'][^"']+["'];\s*$""", re.MULTILINE)
TOP_DECL_RE = re.compile(r"^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)", re.MULTILINE)
# Whole statement up to its closing `;`, not just up to the first `=` — a
# multi-declarator line like `const A = 1, B = 2, C = 3;` used to only ever
# yield "A", silently missing "B" and "C" as declared names (a real bundler
# bug: two room files both declaring `const ... COPPER = ...` past the first
# comma went undetected until Node itself threw on the concatenated output).
TOP_MULTI_CONST_RE = re.compile(r"^const\s+(.+?);\s*$", re.MULTILINE)


def local_imports(path: Path) -> list[Path]:
    """Every relative import in a module, resolved to a real file."""
    out = []
    for m in IMPORT_FROM_RE.finditer(path.read_text()):
        spec = m.group(1)
        if not spec.startswith("."):
            continue  # a CDN URL: the bundle keeps its own <script> for those
        out.append((path.parent / spec).resolve())
    return out


def strip_module_syntax(source: str) -> str:
    source = IMPORT_RE.sub("", source)
    source = EXPORT_BLOCK_RE.sub("", source)
    source = EXPORT_STAR_RE.sub("", source)
    source = EXPORT_KEYWORD_RE.sub("", source)
    return source.strip() + "\n"


def top_level_names(source: str) -> set[str]:
    """Names declared at column zero — the ones that would collide when merged."""
    names = {m.group(1) for m in TOP_DECL_RE.finditer(source)}
    for match in TOP_MULTI_CONST_RE.finditer(source):
        for part in match.group(1).split(","):
            part = part.strip()
            # A comma-separated segment only introduces a new name if it has
            # its own "=" — otherwise it's an element reference inside a
            # single-declarator statement (e.g. `const ROOMS = [A, B, C];`),
            # not a second declarator, and must not be treated as one.
            if "=" not in part:
                continue
            ident = part.split("=")[0].strip()
            if re.fullmatch(r"[A-Za-z_$][\w$]*", ident):
                names.add(ident)
    return names


def build(app: str) -> int:
    cfg = APPS[app]
    # A second page in another app's folder (the Bay Atlas in bayworld/) names
    # its folder and its page; everything else is WebXR/<app>/index.html.
    src = WEBXR / cfg.get("dir", app)
    index = (src / cfg.get("index", "index.html")).read_text()
    chunks: list[str] = []
    seen: dict[str, Path] = {}
    clashes: list[str] = []

    listed = {p.resolve() for p in cfg["modules"]}
    for path in cfg["modules"]:
        if not path.exists():
            print(f"[{app}] missing module: {path}", file=sys.stderr)
            return 1
        for dep in local_imports(path):
            if dep not in listed:
                print(f"[{app}] {path.name} imports {dep.name}, which is not in this app's module list — "
                      f"the bundle would throw on load. Add it to APPS[\"{app}\"][\"modules\"] before {path.name}.", file=sys.stderr)
                return 1
        body = strip_module_syntax(path.read_text())
        for name in sorted(top_level_names(body)):
            if name in seen:
                clashes.append(f"{name}: {seen[name].name} and {path.name}")
            else:
                seen[name] = path
        chunks.append(f"/* ===== {path.relative_to(WEBXR)} ===== */\n{body}")

    if clashes:
        print(f"[{app}] duplicate top-level names would break the bundle:", file=sys.stderr)
        for clash in clashes:
            print(f"  {clash}", file=sys.stderr)
        return 1

    if cfg["entry"] not in index:
        print(f"[{app}] {cfg.get('index', 'index.html')} no longer carries the expected module script tag", file=sys.stderr)
        return 1

    # Only an app that actually draws needs the three.js import at the head of
    # the bundle; the instructor console is plain DOM, and making it fetch a
    # 600 KB renderer it never touches would be a dead request on every open.
    needs_three = any("THREE." in c or "THREE " in c for c in chunks)
    bundle = ((THREE_IMPORT + "\n\n") if needs_three else "") + "\n\n".join(chunks)
    banner = (f"<!-- Generated by tools/bundle_webxr.py from WebXR/{app}/js — "
              "edit the modules, not this file. -->\n")
    html = index.replace(cfg["entry"], '<script type="module">\n' + bundle + "\n</script>")
    html = html.replace("<body>", "<body>\n" + banner, 1)
    html = dist_fixup(html)

    out = src / "dist" / cfg["out"]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html)

    copy_files = cfg.get("copy_files", {})
    for source_path, rel_dest in copy_files.items():
        if not source_path.exists():
            print(f"[{app}] missing copy_files source: {source_path}", file=sys.stderr)
            return 1
        dest = out.parent / rel_dest
        dest.parent.mkdir(parents=True, exist_ok=True)
        # Bytes, not text: this list carries a .glb as well as .js files, and
        # read_text() on a binary asset either mangles it or throws.
        dest.write_bytes(source_path.read_bytes())

    if app in AUTH_CONFIG_APPS:
        (out.parent / AUTH_CONFIG).write_bytes((WEBXR / AUTH_CONFIG).read_bytes())

    extra = f", {len(copy_files)} lazy-loaded files alongside it" if copy_files else ""
    print(f"[{app}] wrote {out.relative_to(ROOT)}  "
          f"({len(html) / 1024:.0f} KB, {len(cfg['modules'])} modules{extra})")
    return 0


# The combined dist folder: WebXR/dist/ holds the homepage and every bundle
# side by side, which is the layout a single-file drop actually ships in. The
# generated WebXR/home.html is the homepage written for exactly this layout —
# its links are the flat file names below — so it is copied in as index.html.
# The sims SmartCiti.X lazy-loads, its citykit/gamify and the hub's guide model
# come along at the same relative depth, and shared/auth.js (with the two
# modules it imports) so the homepage's sign-in dialog works here too.
# shared/radio-quiz.js and its radio-quiz-data.js come along for the Foreman's
# Radio Easter egg the homepage's own script lazy-loads (docs/easter-egg.md).
DIST = WEBXR / "dist"
DIST_PAGES = {
    "smartcity": "smartcity-x.html",
    "trades": "trade-skills-simulator.html",
    "holodeck": "holodeck.html",
    "instructor": "instructor-console.html",
    "race": "race.html",
    "arcade": "arcade.html",
    "fairway": "fairway.html",
    "bayworld": "bayworld.html",
    "atlas": "atlas.html",
    "regatta": "regatta.html",
    "underwater": "underwater.html",
    "redwood": "redwood.html",
    "summit": "summit.html",
    "parishes": "parishes.html",
    "region": "region.html",
}
DIST_SHARED = [
    # The shared control grammar and help overlay (docs/ui-review.md), imported
    # by the homepage and the training-track pages.
    "controls.js", "theme.js",
    # The Guide, its speech out and its lazily loaded knowledge base
    # (docs/consoles/COMPASS.md), for the homepage, the track pages and every
    # bundle's panel.
    "guide.js", "voice-assist.js", "guide-kb.js",
    "controls.js", "account.js", "profiles.js",
    # STORYLINE: the homepage world cards' path chip. st-paths.js honours a teacher's locked version (DEAN's dn-modules.js,
    # which reads profiles.js, passport-programmes.js and org.js), so the chip needs DEAN's module beside it.
    "st-paths.js",
    # SCHOLAR's scoreboard page (WebXR/scholar/, copied beside the homepage) and what its lessons index imports:
    # the parish registry and every district map (np-data-*.js, added below by glob so a new map cannot be missed).
    "dn-modules.js",
    "sc-scholar.js",
    "field-lessons.js",
    "summit-data.js",
    "sg-ways.js",
    "bm-ways.js",
    "np-geo.js",
    "np-parishes.js",
    "links.js",
    "side-game-mechanics.js",
    "by-parish-lessons.js",
    "sc-lessons.js",
    # DATAWORKS' analysis page (WebXR/data/index.html, copied beside the homepage): the data system core and consent panel.
    "dx-data.js",
    "dx-consent-ui.js",
    # ESTUARY's Bay ecology lessons, which the scoreboard's lesson index reads.
    "es-bay-lessons.js",
    # The treasure ledger account.js and guide.js import, and the Treasure Map
    # page (WebXR/treasures.html, copied beside the homepage) that reads it;
    # the gate engine treasures.js answers its locks through.
    "treasures.js", "treasures-data.js", "skill-gates.js", "gate-names-data.js",
    # The language layer controls.js, account.js and guide.js import (docs/i18n.md).
    "i18n.js", "i18n-strings.js",
    # The avatar style space account.js imports for its picker (console CARTOGRAPHER).
    "crew.js",
    "auth.js", "identity.js", "records.js", "radio-quiz.js", "radio-quiz-data.js",
    # Wallet connection and opt-in agent/robot sharing (docs/wallets-and-sharing.md,
    # docs/agent-protocols.md), lazily imported by the homepage's own script
    # exactly like radio-quiz.js above.
    "wallet.js", "share-engagement.js", "agent-protocols.js",
    # The programme chips on the homepage rails (docs/interop.md) import the
    # passport lazily, with the modules it reads.
    "passport.js", "passport-programmes.js", "competency.js", "game.js",
    # The organisation layer (docs/enterprise.md): account.js imports it, and the
    # homepage's continue strip reads the learner's own cohorts through it.
    "org.js",
    # The lazy-loaded SmartCiti.X sims and citykit.js import these by their
    # "../../../shared/" path, which from sims/ and the folder root lands on
    # this folder's shared/ — without them no station loads in the flat build
    # (tools/check_links.mjs loads one per world). Their own imports included.
    "kit.js", "textures.js", "eggs.js", "ei-guide.js", "equipment.js", "fleet.js", "props.js", "toolkit.js", "perf.js",
    # The video-background layer (console CINEMA, docs/home-backgrounds.md):
    # the homepage and the track pages import it; account.js imports it for
    # the sign-in backdrop.
    "cinema.js",
]
# Every parish-engine map module ships beside np-parishes.js (the scoreboard and any page that reads the registry import them all).
DIST_SHARED += sorted(p.name for p in (Path(__file__).resolve().parent.parent / "WebXR" / "shared").glob("np-data-*.js") if p.name not in DIST_SHARED)


def combined_fixup(html: str) -> str:
    """Rewrite a bundle's cross-app links for the flat combined folder.

    dist_fixup() has already turned "../<sibling>/" into "../../<sibling>/" for
    a file at WebXR/<app>/dist/. In WebXR/dist/ one level up is WebXR itself,
    and a sibling app is no longer a folder but one HTML file in this folder, so
    an app entry becomes its flat file name and everything else loses a level.
    """
    for app, page in DIST_PAGES.items():
        # An app whose page is not index.html (the regatta's regatta.html) is
        # linked by that name from its siblings, so both spellings collapse
        # to the flat file here.
        index = APPS[app].get("index", "index.html")
        for q in LINK_QUOTES:
            html = html.replace(f'{q}../../{app}/index.html', f'{q}./{page}')
        # An app whose source page is not index.html (The Deep's
        # underwater.html) is linked by that name from its siblings.
            html = html.replace(f'{q}../../{app}/{index}', f'{q}./{page}')
            html = html.replace(f'{q}../../{app}/dist/{page}', f'{q}./{page}')
    # The design stylesheet is this folder's own shared/design.css.
    html = html.replace(f'"../../{DESIGN_CSS}"', f'"./{DESIGN_CSS}"')
    for q in LINK_QUOTES:
        # The track pages are this folder's own tracks/.
        html = html.replace(f'{q}../../dist/tracks/', f'{q}./tracks/')
        # The Holodeck Packs page is this folder's own packs/ (console PACKS).
        html = html.replace(f'{q}../../packs/', f'{q}./packs/')
        # The homepage sits beside the bundles in this folder.
        html = html.replace(f'{q}../../index.html{q}', f'{q}./index.html{q}')
        # The network portal page is not published in the flat folder; its
        # link (SmartCiti.X's intro, the instructor console) goes to the
        # homepage, which is the network map here. The repo layout keeps it.
        html = html.replace(f'{q}../../portal/index.html', f'{q}./index.html')
        html = html.replace(f'{q}../../', f'{q}../')
    return html


def build_combined() -> int:
    home = WEBXR / "home.html"
    if not home.exists():
        print("[dist] WebXR/home.html is missing — run tools/gen_home.mjs "
              "(tools/gen_catalog.mjs runs it) before bundling.", file=sys.stderr)
        return 1
    DIST.mkdir(parents=True, exist_ok=True)
    (DIST / "index.html").write_text(home.read_text())
    copied = 1
    # The training-track pages (tools/gen_tracks.mjs) are written for this
    # folder already — one level below the bundles, linking ../smartcity-x.html
    # and img/<station>.jpg — so they and their thumbnails are copied as-is.
    tracks = WEBXR / "home" / "tracks"
    if not tracks.is_dir():
        print("[dist] WebXR/home/tracks is missing — run tools/gen_tracks.mjs "
              "(tools/gen_catalog.mjs runs it) before bundling.", file=sys.stderr)
        return 1
    for page in sorted(tracks.rglob("*")):
        if page.is_file() and page.suffix in (".html", ".jpg"):
            dest = DIST / "tracks" / page.relative_to(tracks)
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(page.read_bytes())
            copied += 1
    # The recorded background loops, their posters and backgrounds.json
    # (console CINEMA, docs/home-backgrounds.md) — media/ beside the homepage,
    # where shared/cinema.js looks first.
    media = WEBXR / "home" / "media"
    if media.is_dir():
        for f in sorted(media.iterdir()):
            if f.is_file() and f.suffix in (".mp4", ".webm", ".jpg", ".json"):
                (DIST / "media").mkdir(parents=True, exist_ok=True)
                (DIST / "media" / f.name).write_bytes(f.read_bytes())
                copied += 1
    for app, page in DIST_PAGES.items():
        src = WEBXR / APPS[app].get("dir", app) / "dist" / page
        if not src.exists():
            print(f"[dist] {src.relative_to(ROOT)} has not been built yet", file=sys.stderr)
            return 1
        (DIST / page).write_text(combined_fixup(src.read_text()))
        copied += 1
    (DIST / AUTH_CONFIG).write_bytes((WEBXR / AUTH_CONFIG).read_bytes())
    copied += 1
    # The Treasure Map sits beside the homepage in both layouts, reading ./shared/.
    (DIST / "treasures.html").write_text((WEBXR / "treasures.html").read_text())
    copied += 1
    # The privacy page (docs/enterprise.md), linked from the sign-in dialog and the footer.
    (DIST / "privacy.html").write_text((WEBXR / "privacy.html").read_text())
    copied += 1
    for name in DIST_SHARED:
        (DIST / "shared").mkdir(parents=True, exist_ok=True)
        (DIST / "shared" / name).write_bytes((SHARED / name).read_bytes())
        copied += 1
    # The design system: its stylesheet, the fonts and icons it names, and the
    # template gallery (WebXR/design/index.html links ../shared/design.css).
    (DIST / DESIGN_CSS).write_bytes((WEBXR / DESIGN_CSS).read_bytes())
    copied += 1
    for sub in DESIGN_VENDOR:
        for f in sorted((WEBXR / "vendor" / sub).iterdir()):
            if f.is_file():
                (DIST / "vendor" / sub).mkdir(parents=True, exist_ok=True)
                (DIST / "vendor" / sub / f.name).write_bytes(f.read_bytes())
                copied += 1
    # The Holodeck Packs (console PACKS, tools/gen_packs.mjs): the page written for this folder
    # (WebXR/packs/flat/index.html) and every pack manifest beside it.
    packs = WEBXR / "packs"
    if not (packs / "flat" / "index.html").exists():
        print("[dist] WebXR/packs/flat/index.html is missing — run tools/gen_packs.mjs before bundling.", file=sys.stderr)
        return 1
    # SCHOLAR's scoreboard (WebXR/scholar/index.html): its ../shared/ imports resolve against DIST/shared.
    (DIST / "scholar").mkdir(parents=True, exist_ok=True)
    (DIST / "scholar" / "index.html").write_bytes((WEBXR / "scholar" / "index.html").read_bytes())
    # DATAWORKS' analysis page (WebXR/data/index.html): its ../shared/ imports resolve against DIST/shared.
    (DIST / "data").mkdir(parents=True, exist_ok=True)
    (DIST / "data" / "index.html").write_bytes((WEBXR / "data" / "index.html").read_bytes())
    # sc-lessons.js reads Redwood Reach's site and field-lesson data from ../redwood/js/ (pure data, no imports of their own).
    (DIST / "redwood" / "js").mkdir(parents=True, exist_ok=True)
    for _rw in ("rw-data.js", "rw-lore-data.js"):
        (DIST / "redwood" / "js" / _rw).write_bytes((WEBXR / "redwood" / "js" / _rw).read_bytes())
    (DIST / "packs").mkdir(parents=True, exist_ok=True)
    (DIST / "packs" / "index.html").write_bytes((packs / "flat" / "index.html").read_bytes())
    copied += 1
    for f in sorted(packs.glob("*.json")):
        (DIST / "packs" / f.name).write_bytes(f.read_bytes())
        copied += 1
    (DIST / "design").mkdir(parents=True, exist_ok=True)
    (DIST / "design" / "index.html").write_bytes((WEBXR / "design" / "index.html").read_bytes())
    copied += 1
    for source_path, rel_dest in APPS["smartcity"]["copy_files"].items():
        dest = DIST / rel_dest
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(source_path.read_bytes())
        copied += 1
    print(f"[dist] wrote {(DIST / 'index.html').relative_to(ROOT)} and {copied - 1} files beside it "
          f"({len(DIST_PAGES)} bundles, {len(DIST_SHARED)} shared modules, "
          f"{len(APPS['smartcity']['copy_files'])} lazy-loaded files)")
    return 0


def main(argv: list[str]) -> int:
    # One Holodeck Pack alone (console PACKS): `--pack <id>` emits that pack's content —
    # its manifest, its Unity slice, a catalog cut to its stations and its card page —
    # through tools/export_pack.mjs, and bundles nothing else.
    if len(argv) > 2 and argv[1] == "--pack":
        import subprocess
        return subprocess.call(["node", str(ROOT / "tools" / "export_pack.mjs"), *argv[2:]])
    wanted = argv[1:] or list(APPS)
    for app in wanted:
        if app not in APPS:
            print(f"unknown app: {app} (have: {', '.join(APPS)})", file=sys.stderr)
            return 1
        code = build(app)
        if code:
            return code
    # The combined folder is assembled from the per-app bundles, so it is only
    # rebuilt when all of them were just built.
    full = len(wanted) == len(APPS)
    if full:
        code = build_combined()
        if code:
            return code
    code = stamp_seo()
    if code or not full:
        return code
    return write_edge_files()


# ---------------------------------------------------------------------------
# The edge files (console EDGE, docs/deploy-cloudflare.md): what Cloudflare
# Pages reads beside the flat build. Generated here so they always describe
# the folder just written; tools/check_deploy.mjs checks every path below
# exists and every host below is one the code names.
#
# Hosts the shipped code loads from or talks to, by the module that names them:
#   cdnjs.cloudflare.com     three.js (every bundle's import map), react
#                            (instructor console), mapbox-gl (shared/mapbox.js)
#   cdn.jsdelivr.net         msal-browser (shared/auth.js, Microsoft sign-in)
#   accounts.google.com      Google Identity Services (shared/auth.js)
#   login.microsoftonline.com  the Microsoft authority (shared/auth.js)
#   api.mapbox.com           styles, tiles, static images (shared/mapbox.js)
#   events.mapbox.com        the telemetry mapbox-gl posts when a token exists
# connect-src also allows any https: origin because the endpoints a deployment
# configures in auth-config.json (guideConfig.endpoint, emailEndpoint), an LRS
# and an LTI platform are whatever the operator names there; the page itself
# never contacts one that is null. No frame-ancestors: the LTI launch embeds
# these pages in the platform's frame (docs/course-tracking.md, check_lti.mjs).
EDGE_SCRIPT_HOSTS = ["https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://accounts.google.com"]
EDGE_CONNECT_HOSTS = ["https://api.mapbox.com", "https://events.mapbox.com", "https://login.microsoftonline.com",
                      "https://accounts.google.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"]
EDGE_IMG_HOSTS = ["https://api.mapbox.com"]
EDGE_FRAME_HOSTS = ["https://accounts.google.com", "https://login.microsoftonline.com"]

# Cache policy. Nothing in the flat build is hash-named, so `immutable` would
# strand a returning visitor on an old bundle after a rebuild; it goes only to
# the folders whose contents change with a pinned version or a re-encode.
# Navigational HTML is no-store; the app bundles revalidate on their ETag
# (a 304 when nothing changed, the new bundle the moment one is deployed).
EDGE_IMMUTABLE_DIRS = ["vendor", "media", "models", "og", "icons", "tracks/img"]
EDGE_REVALIDATE_DIRS = ["shared", "sims"]
EDGE_NO_STORE_PAGES = ["index.html", "404.html", "privacy.html", "treasures.html", "design/index.html", "auth-config.json",
                       "sitemap.xml", "robots.txt", "manifest.webmanifest"]
EDGE_ROUTES_JSON = {"version": 1, "include": ["/api/*", "/auth-config.json"], "exclude": []}


def edge_csp() -> str:
    return "; ".join([
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' " + " ".join(EDGE_SCRIPT_HOSTS),
        "style-src 'self' 'unsafe-inline' https://accounts.google.com",
        "img-src 'self' data: blob: " + " ".join(EDGE_IMG_HOSTS),
        "font-src 'self' data:",
        "media-src 'self' blob: data:",
        "worker-src 'self' blob:",
        "child-src 'self' blob:",
        "connect-src 'self' https: " + " ".join(EDGE_CONNECT_HOSTS),
        "frame-src 'self' " + " ".join(EDGE_FRAME_HOSTS),
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self' https://accounts.google.com https://login.microsoftonline.com",
    ])


def edge_headers() -> str:
    security = [
        "X-Content-Type-Options: nosniff",
        "Referrer-Policy: strict-origin-when-cross-origin",
        "Permissions-Policy: geolocation=(), payment=(), usb=()",
        "Cross-Origin-Opener-Policy: same-origin-allow-popups",
        "Content-Security-Policy: " + edge_csp(),
    ]
    lines = ["# Generated by tools/bundle_webxr.py (console EDGE, docs/deploy-cloudflare.md) — edit the generator.",
             "# Cloudflare Pages reads this file beside the build; every path below exists in WebXR/dist.", "",
             "/*"] + [f"  {h}" for h in security] + [""]
    for page in EDGE_NO_STORE_PAGES:
        lines += [f"/{page}", "  Cache-Control: no-store", ""]
    lines += ["/tracks/*", "  Cache-Control: no-store", ""]
    for page in sorted(DIST_PAGES.values()):
        lines += [f"/{page}", "  Cache-Control: public, max-age=0, must-revalidate", ""]
    for d in EDGE_REVALIDATE_DIRS:
        lines += [f"/{d}/*", "  Cache-Control: public, max-age=3600, must-revalidate", ""]
    for d in EDGE_IMMUTABLE_DIRS:
        lines += [f"/{d}/*", "  Cache-Control: public, max-age=31536000, immutable", ""]
    lines += ["/api/*", "  Cache-Control: no-store", "  X-Robots-Tag: noindex", ""]
    return "\n".join(lines)


def edge_redirects() -> str:
    lines = ["# Generated by tools/bundle_webxr.py (console EDGE): the repository layout's paths, folded onto the flat build.",
             "/home.html /index.html 301",
             "/home /index.html 301",
             "/portal/* /index.html 302",
             "/campus/* /index.html 302"]
    folders = [APPS[app].get("dir", app) for app in DIST_PAGES]
    for app, page in DIST_PAGES.items():
        folder = APPS[app].get("dir", app)
        index = APPS[app].get("index", "index.html")
        # A folder shared by two pages (bayworld/ holds the Atlas too) folds
        # only onto the page that is its index.html.
        if folders.count(folder) == 1 or index == "index.html":
            lines.append(f"/{folder}/ /{page} 301")
        lines.append(f"/{folder}/{index} /{page} 301")
        lines.append(f"/{folder}/dist/{page} /{page} 301")
    return lines[0] + "\n" + "\n".join(sorted(set(lines[1:]))) + "\n"


def write_edge_files() -> int:
    """_headers, _redirects and _routes.json beside the flat build."""
    import json
    for page in EDGE_NO_STORE_PAGES:
        if not (DIST / page).exists():
            print(f"[edge] {page} is missing from WebXR/dist", file=sys.stderr)
            return 1
    for d in EDGE_IMMUTABLE_DIRS + EDGE_REVALIDATE_DIRS:
        if not (DIST / d).is_dir():
            print(f"[edge] WebXR/dist/{d}/ is missing", file=sys.stderr)
            return 1
    (DIST / "_headers").write_text(edge_headers())
    (DIST / "_redirects").write_text(edge_redirects())
    (DIST / "_routes.json").write_text(json.dumps(EDGE_ROUTES_JSON, indent=2) + "\n")
    print(f"[edge] wrote WebXR/dist/_headers ({len(EDGE_NO_STORE_PAGES) + len(DIST_PAGES) + len(EDGE_IMMUTABLE_DIRS) + len(EDGE_REVALIDATE_DIRS) + 3} rules), "
          f"_redirects ({len((DIST / '_redirects').read_text().splitlines()) - 1} rules) and _routes.json")
    return 0


def stamp_seo() -> int:
    """Search and share metadata into every page just written (tools/gen_seo.mjs,
    console WAYFINDER): titles, descriptions, canonical, Open Graph, JSON-LD,
    and the published folder's sitemap.xml, robots.txt, manifest and 404 page."""
    import subprocess
    r = subprocess.run(["node", str(ROOT / "tools" / "gen_seo.mjs")], capture_output=True, text=True)
    sys.stdout.write(r.stdout)
    if r.returncode:
        sys.stderr.write(r.stderr)
    return r.returncode


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
