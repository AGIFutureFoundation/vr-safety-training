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
            SHARED / "a11y.js",
            SHARED / "devices.js",
            SHARED / "ei-guide.js",
            SHARED / "input.js",
            SHARED / "hands.js",
            SHARED / "kit.js",
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
            WEBXR / "trades/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    "smartcity": {
        "out": "smartcity-x.html",
        "modules": [
            SHARED / "a11y.js",
            SHARED / "devices.js",
            SHARED / "ei-guide.js",
            SHARED / "input.js",
            SHARED / "hands.js",
            SHARED / "kit.js",
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
            SHARED / "ladder.js",
            SHARED / "variants.js",
            # Random events (docs/events.md): the seeded ambient scheduler and
            # the interrupt-timing jitter every station gets for free.
            SHARED / "events.js",
            # Crew roles (splitByRole): read here only for a radio-call event's
            # line — never invented, only lifted from a station that models one.
            SHARED / "crew.js",
            SHARED / "robot.js",
            SHARED / "robot-embodiment.js",
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
            SHARED / "devices.js",
            SHARED / "observer.js",
            SHARED / "flowhub.js",
            WEBXR / "instructor/js/roster.js",
            # Toolbox Talk Bingo (docs/easter-egg.md).
            SHARED / "eggs-app.js",
            WEBXR / "instructor/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    "holodeck": {
        "out": "holodeck.html",
        "modules": [
            SHARED / "a11y.js",
            SHARED / "devices.js",
            SHARED / "ei-guide.js",
            SHARED / "input.js",
            SHARED / "hands.js",
            SHARED / "kit.js",
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
            WEBXR / "holodeck/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    # The other Easter egg (WebXR/arcade): three original 2D canvas games on
    # retro cabinets in the crew break room. Each game's engine is a pure
    # module under arcade/js/games/; a new cabinet is a new file there, an
    # entry in arcade/js/cabinets.js and a slot in tools/check_arcade.mjs.
    "arcade": {
        "out": "arcade.html",
        "modules": [
            SHARED / "input.js",
            WEBXR / "arcade/js/scores.js",
            WEBXR / "arcade/js/audio.js",
            WEBXR / "arcade/js/games/spoolyard.js",
            WEBXR / "arcade/js/games/crewrun.js",
            WEBXR / "arcade/js/games/palletstacker.js",
            WEBXR / "arcade/js/cabinets.js",
            WEBXR / "arcade/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    # The Easter egg (WebXR/race): an arcade racer on the platform's own fleet.
    # Tracks are data modules under race/tracks/, one per course; a new course
    # is a new file here, in race/js/tracks.js and in tools/check_race.mjs.
    "race": {
        "out": "race.html",
        "modules": [
            SHARED / "input.js",
            SHARED / "kit.js",
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
            WEBXR / "race/js/app.js",
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
SIBLING_APP_DIRS = [*APPS, "portal", "verify", "instructor", "flows"]
AUTH_CONFIG = "auth-config.json"
# The apps whose bundle reads the sign-in configuration, and therefore need a
# copy of it beside the bundle. A deployment edits the copy it serves.
AUTH_CONFIG_APPS = ["smartcity"]


# Both quoting styles, because a cross-app link is written as a plain HTML
# attribute in one place and as a template literal in another — trades' app.js
# builds its SmartCiti.X deep link with `../smartcity/index.html?sim=${id}`,
# which the double-quote-only rewrite used to miss, shipping a dist bundle whose
# "open that station" link resolved one directory too shallow.
LINK_QUOTES = ('"', "`")


def dist_fixup(html: str) -> str:
    for name in SIBLING_APP_DIRS:
        for q in LINK_QUOTES:
            html = html.replace(f'{q}../{name}/', f'{q}../../{name}/')
    # The homepage link in every app's header chip: WebXR/index.html is one
    # level up from the source page and two from WebXR/<app>/dist/.
    for q in LINK_QUOTES:
        html = html.replace(f'{q}../index.html{q}', f'{q}../../index.html{q}')
    # The sign-in configuration is read relative to the page. Beside the modular
    # source that is one directory up (WebXR/auth-config.json from
    # WebXR/<app>/); in a dist folder it is the copy written next to the bundle.
    for q in LINK_QUOTES:
        html = html.replace(f'{q}../{AUTH_CONFIG}{q}', f'{q}./{AUTH_CONFIG}{q}')
    return html


IMPORT_RE = re.compile(r"^import\s+[\s\S]*?from\s+[\"'][^\"']+[\"'];\s*$", re.MULTILINE)
# The `from "..."` target of every import, so the build can check that each
# local one is actually in this app's module list. Getting that wrong ships a
# bundle whose first line throws a ReferenceError and whose page never paints
# — it has happened twice, so it is a build error now, not a smoke test.
IMPORT_FROM_RE = re.compile(r"""^import\s+[\s\S]*?from\s+["']([^"']+)["'];\s*$""", re.MULTILINE)
EXPORT_BLOCK_RE = re.compile(r"^export\s*\{[^}]*\}\s*;\s*$", re.MULTILINE)
EXPORT_KEYWORD_RE = re.compile(r"^export\s+(?=(const|let|var|function|class|async))", re.MULTILINE)
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
    src = WEBXR / app
    index = (src / "index.html").read_text()
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
        print(f"[{app}] index.html no longer carries the expected module script tag", file=sys.stderr)
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
}
DIST_SHARED = ["auth.js", "identity.js", "records.js", "radio-quiz.js", "radio-quiz-data.js"]


def combined_fixup(html: str) -> str:
    """Rewrite a bundle's cross-app links for the flat combined folder.

    dist_fixup() has already turned "../<sibling>/" into "../../<sibling>/" for
    a file at WebXR/<app>/dist/. In WebXR/dist/ one level up is WebXR itself,
    and a sibling app is no longer a folder but one HTML file in this folder, so
    an app entry becomes its flat file name and everything else loses a level.
    """
    for app, page in DIST_PAGES.items():
        for q in LINK_QUOTES:
            html = html.replace(f'{q}../../{app}/index.html', f'{q}./{page}')
            html = html.replace(f'{q}../../{app}/dist/{page}', f'{q}./{page}')
    for q in LINK_QUOTES:
        # The homepage sits beside the bundles in this folder.
        html = html.replace(f'{q}../../index.html{q}', f'{q}./index.html{q}')
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
    for app, page in DIST_PAGES.items():
        src = WEBXR / app / "dist" / page
        if not src.exists():
            print(f"[dist] {src.relative_to(ROOT)} has not been built yet", file=sys.stderr)
            return 1
        (DIST / page).write_text(combined_fixup(src.read_text()))
        copied += 1
    (DIST / AUTH_CONFIG).write_bytes((WEBXR / AUTH_CONFIG).read_bytes())
    copied += 1
    for name in DIST_SHARED:
        (DIST / "shared").mkdir(parents=True, exist_ok=True)
        (DIST / "shared" / name).write_bytes((SHARED / name).read_bytes())
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
    if len(wanted) == len(APPS):
        return build_combined()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
