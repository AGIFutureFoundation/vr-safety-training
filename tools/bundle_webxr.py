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
            SHARED / "kit.js",
            SHARED / "game.js",
            SHARED / "voice-assist.js",
            SHARED / "records.js",
            SHARED / "identity.js",
            WEBXR / "trades/js/hub.js",
            WEBXR / "trades/js/rooms/electrical.js",
            WEBXR / "trades/js/rooms/salon.js",
            WEBXR / "trades/js/rooms/kitchen.js",
            WEBXR / "trades/js/rooms/phlebotomy.js",
            WEBXR / "trades/js/rooms/welding.js",
            WEBXR / "trades/js/rooms/devops.js",
            WEBXR / "trades/js/rooms/plumbing.js",
            WEBXR / "trades/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    "smartcity": {
        "out": "smartcity-x.html",
        "modules": [
            SHARED / "kit.js",
            SHARED / "game.js",
            SHARED / "voice-assist.js",
            SHARED / "records.js",
            SHARED / "identity.js",
            WEBXR / "smartcity/js/citykit.js",
            WEBXR / "smartcity/js/gamify.js",
            WEBXR / "smartcity/js/stage.js",
            WEBXR / "smartcity/js/sims-meta.js",
            WEBXR / "smartcity/js/scenarios.js",
            WEBXR / "smartcity/js/hub.js",
            WEBXR / "smartcity/js/store.js",
            WEBXR / "smartcity/js/react-ui.js",
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
            **{p: f"sims/{p.name}" for p in sorted((WEBXR / "smartcity/js/sims").glob("*.js"))},
        },
    },
    "holodeck": {
        "out": "holodeck.html",
        "modules": [
            SHARED / "kit.js",
            SHARED / "game.js",
            SHARED / "voice-assist.js",
            SHARED / "records.js",
            SHARED / "identity.js",
            WEBXR / "holodeck/js/themes.js",
            WEBXR / "holodeck/js/training.js",
            WEBXR / "holodeck/js/prompt-parser.js",
            WEBXR / "holodeck/js/minigolf.js",
            WEBXR / "holodeck/js/store.js",
            WEBXR / "holodeck/js/react-ui.js",
            WEBXR / "holodeck/js/app.js",
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
SIBLING_APP_DIRS = [*APPS, "portal"]


def dist_fixup(html: str) -> str:
    for name in SIBLING_APP_DIRS:
        html = html.replace(f'"../{name}/', f'"../../{name}/')
    return html


IMPORT_RE = re.compile(r"^import\s+[\s\S]*?from\s+[\"'][^\"']+[\"'];\s*$", re.MULTILINE)
EXPORT_BLOCK_RE = re.compile(r"^export\s*\{[^}]*\}\s*;\s*$", re.MULTILINE)
EXPORT_KEYWORD_RE = re.compile(r"^export\s+(?=(const|let|var|function|class|async))", re.MULTILINE)
TOP_DECL_RE = re.compile(r"^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)", re.MULTILINE)
# Whole statement up to its closing `;`, not just up to the first `=` — a
# multi-declarator line like `const A = 1, B = 2, C = 3;` used to only ever
# yield "A", silently missing "B" and "C" as declared names (a real bundler
# bug: two room files both declaring `const ... COPPER = ...` past the first
# comma went undetected until Node itself threw on the concatenated output).
TOP_MULTI_CONST_RE = re.compile(r"^const\s+(.+?);\s*$", re.MULTILINE)


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

    for path in cfg["modules"]:
        if not path.exists():
            print(f"[{app}] missing module: {path}", file=sys.stderr)
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

    bundle = THREE_IMPORT + "\n\n" + "\n\n".join(chunks)
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
        dest.write_text(source_path.read_text())

    extra = f", {len(copy_files)} lazy-loaded files alongside it" if copy_files else ""
    print(f"[{app}] wrote {out.relative_to(ROOT)}  "
          f"({len(html) / 1024:.0f} KB, {len(cfg['modules'])} modules{extra})")
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
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
