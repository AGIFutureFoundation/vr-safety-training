#!/usr/bin/env python3
"""Inline a WebXR app's ES modules into one distributable HTML file.

The modular source under WebXR/<app>/js is what you edit; this produces
WebXR/<app>/dist/<name>.html, a single file that can be dropped on any static
HTTPS host with no build step and no module server. Both apps share the engine
and asset kit in WebXR/shared.

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
            WEBXR / "trades/js/hub.js",
            WEBXR / "trades/js/rooms/electrical.js",
            WEBXR / "trades/js/rooms/salon.js",
            WEBXR / "trades/js/rooms/kitchen.js",
            WEBXR / "trades/js/rooms/phlebotomy.js",
            WEBXR / "trades/js/rooms/welding.js",
            WEBXR / "trades/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
    "smartcity": {
        "out": "smartcity-x.html",
        "modules": [
            SHARED / "kit.js",
            SHARED / "game.js",
            WEBXR / "smartcity/js/citykit.js",
            WEBXR / "smartcity/js/gamify.js",
            WEBXR / "smartcity/js/stage.js",
            WEBXR / "smartcity/js/sims/charge-point.js",
            WEBXR / "smartcity/js/sims/signal-cabinet.js",
            WEBXR / "smartcity/js/sims/valve-vault.js",
            WEBXR / "smartcity/js/sims/solar-deck.js",
            WEBXR / "smartcity/js/sims/splice-node.js",
            WEBXR / "smartcity/js/sims/flight-deck.js",
            WEBXR / "smartcity/js/sims/track-access.js",
            WEBXR / "smartcity/js/sims/triage-point.js",
            WEBXR / "smartcity/js/sims/robot-cell.js",
            WEBXR / "smartcity/js/sims/chiller-plant.js",
            WEBXR / "smartcity/js/sims/tower-climb.js",
            WEBXR / "smartcity/js/sims/steel-erector.js",
            WEBXR / "smartcity/js/sims/crane-yard.js",
            WEBXR / "smartcity/js/sims/trench-box.js",
            WEBXR / "smartcity/js/sims/boiler-room.js",
            WEBXR / "smartcity/js/sims/elevator-pit.js",
            WEBXR / "smartcity/js/sims/abatement-chamber.js",
            WEBXR / "smartcity/js/sims/rigging-loft.js",
            WEBXR / "smartcity/js/sims/line-truck.js",
            WEBXR / "smartcity/js/sims/dock-crane.js",
            WEBXR / "smartcity/js/scenarios.js",
            WEBXR / "smartcity/js/hub.js",
            WEBXR / "smartcity/js/store.js",
            WEBXR / "smartcity/js/react-ui.js",
            WEBXR / "smartcity/js/app.js",
        ],
        "entry": '<script type="module" src="./js/app.js"></script>',
    },
}

IMPORT_RE = re.compile(r"^import\s+[\s\S]*?from\s+[\"'][^\"']+[\"'];\s*$", re.MULTILINE)
EXPORT_BLOCK_RE = re.compile(r"^export\s*\{[^}]*\}\s*;\s*$", re.MULTILINE)
EXPORT_KEYWORD_RE = re.compile(r"^export\s+(?=(const|let|var|function|class|async))", re.MULTILINE)
TOP_DECL_RE = re.compile(r"^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)", re.MULTILINE)
TOP_MULTI_CONST_RE = re.compile(r"^const\s+([^=;\n]+?)\s*=", re.MULTILINE)


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
            ident = part.strip().split("=")[0].strip()
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

    out = src / "dist" / cfg["out"]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html)
    print(f"[{app}] wrote {out.relative_to(ROOT)}  "
          f"({len(html) / 1024:.0f} KB, {len(cfg['modules'])} modules)")
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
