# Environment models

Real-world environments a station can stand in: a scanned street, a modelled
container terminal, a surveyed shoreline. A station declares one with

    environment: { url: "assets/env/<file>.glb", scale: 1, position: [0, 0, 0], rotationY: 0 }

and the stage loads it around the station in place of the generated district
and skyline (`skyline: true` / `district: true` keep them). Any file can be
previewed against any station without editing it:

    smartcity-x.html?sim=air-monitor&env=assets/env/sample-street.glb&envScale=1&envY=0&envRy=0

## What may go in this directory

Only models with a licence that allows redistribution in this product —
CC0, CC-BY (with the attribution line below), or a marketplace licence that
covers redistribution in a compiled application. Each model gets a line in
`ATTRIBUTION.md`: file, title, author, source URL, licence.

Ripped game assets are not licensed for this and are not accepted, whatever
the file is called. A model whose provenance is unknown is not accepted
until it is known.

Keep files under 15 MB; the whole app is meant to load on a headset over a
hall's wifi. Draco-compressed files need the Draco decoder wired into the
loader before they will open; ask before committing one.

`sample-street.glb` is a hand-built placeholder written by
`tools/gen_sample_env.py` — six blocks and a kerb — so the loader can be
exercised without any external asset.
