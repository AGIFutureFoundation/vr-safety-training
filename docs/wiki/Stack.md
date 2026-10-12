# The stack

What the platform is built from, layer by layer, each with the repository file that holds it.

## What the platform is built from

What the platform is built from, read from the repository on its integration head: the layers below are the ones the files show, each with the file that shows it. Nothing here is a claim about hosting, traffic or any customer; both deploy targets are described as configuration.

| Layer | What it is | The file that shows it |
|---|---|---|
| **Scene and headset** | A browser scene drawn with three.js 0.160.0, pinned by version, with WebXR immersive sessions on a headset browser and a flat fallback with keyboard, pointer or touch on desktops and phones. The headset is optional; the same page runs without one. | `tools/bundle_webxr.py` (the pinned import), `WebXR/README.md` (the device matrix) |
| **The apps** | Plain ES modules, one folder per app and a shared engine, with no framework and no package manifest in the repository root. There are 287 JavaScript files in the shared engine and 733 in the SmartCiti.X station modules. | `WebXR/shared/`, `WebXR/smartcity/js/sims/` |
| **The flat bundler** | One Python file inlines each app’s modules into a single HTML file for 15 apps, copies the lazily loaded station modules beside the main page, and writes the edge files (_headers, _redirects and _routes.json). The built files are committed, and the CI checks that they match what the source would generate. | `tools/bundle_webxr.py`, `.github/workflows/webxr-checks.yml` |
| **Speech** | The agents’ voices use the browser’s own speech synthesis, and only a voice flagged as local to the device is ever used: a network voice is never chosen. Voices are off until the learner turns them on, and captions always show. | `WebXR/shared/oh-voice.js` |
| **Checkers and the gate** | One Node script runs the gate: 153 checker files, with the parse and import checkers first so that every other checker reads code that runs. Browser checkers drive a headless Chromium through Playwright. Each console adds the checkers for what it builds and records its run in a note. | `tools/check_all.mjs`, `tools/lib/pw.mjs`, `docs/consoles/` (184 console notes) |
| **Continuous integration** | On a push or a pull request that touches the apps or the tools, a workflow sets up Node 22 and Python 3.12, installs Playwright 1.56.1 with its Chromium, runs the whole gate and then rebuilds the generated files and fails if any differs. The repository holds 3 workflows: this one and the deploy workflows, one for each target below. | `.github/workflows/webxr-checks.yml` |
| **Deploy configuration** | A Cloudflare Pages project named smartciti-x publishes the flat build folder, with 2 Pages Function files that hand the API routes to one edge router (`workers/edge/router.mjs`). The deploy workflow runs only when the repository holds its deploy secrets, and the config file states that no account id, zone id, token or namespace id is committed; a checker fails the build if anything shaped like one appears. This describes the configuration, not a live deployment. | `wrangler.toml`, `.github/workflows/deploy-cloudflare.yml`, `functions/`, `tools/check_deploy.mjs` |
| **Second deploy target** | An Akamai Cloud target serves the same flat folder from object storage behind a content-delivery hostname. It is documented and gated, and never run live: the page says nothing has run against a live account, the workflow starts by hand only and does nothing without its secrets, the last recorded run is a dry run, and a checker fails the build if anything shaped like a credential appears in the repository. A planned training job on a rented GPU is described the same way, as a dry run by default. | `docs/deploy-akamai.md`, `.github/workflows/deploy-akamai.yml`, `tools/ak_deploy.mjs`, `docs/deploy/akamai-last-run.md`, `tools/check_deploy_akamai.mjs` |
| **The whitepaper as a page of the site** | This document also exists as a page of the site itself, beside the homepage: 9 sections, each with sources, and a checker that looks up each of its 220 figures in the committed file it cites. The bundler copies it into the flat build and the sitemap lists it. | `WebXR/whitepaper.html`, `tools/check_whitepaper_page.mjs`, `docs/consoles/SEO-WHITEPAPER.md` |
| **Learner data** | Recording is local to the device: the data modules make no network call (their checker looks for fetch, XHR, beacon and WebSocket use), consent is opt-in for adults, and a revoke deletes what was stored. The older campus page keeps its progress in the browser and says nothing is transmitted. | `docs/consoles/DATAWORKS.md`, `WebXR/README.md` |
| **Data formats out** | Learner records leave as CSV (RFC 4180), xAPI statements to a configured record store, Open Badges 2.0 assertions and an LTI 1.3 launch. Robot and model training data leave as LeRobot -style and RLDS -style layouts. Environments are procedural, with a handful of glTF binary files (4.glb files under WebXR). A Unity project sits beside the web build. | `docs/WHITEPAPER.md`, `docs/robot-datasets.md`, `exports/` |

### Read honestly

- The flat build is self-contained except for one thing: three.js 0.160.0 is imported from a content-delivery host at run time, pinned by version, and the repository’s own README says the import can be swapped for a self-hosted copy. A page opened offline without that copy would not draw.

- The gate counts 153 checker files, which is the figure used across these pages. The platform summary file reports 163, because it counts every quoted checker name in the gate script, including the 10 that its serial-first and heavy lists repeat; the larger figure is a counting artefact, not more checkers.

- The deploy workflow and the config are written so that nothing deploys without the secrets, and this document has not seen the secrets or a deployment. It states what the files say.

- Speech is whatever voices the learner’s device already has; the headless runs that test it use a stubbed engine, so how a real voice sounds is not shown.

Sources: the files named in the table, each read from the integration head `a8379051` with git show or git ls-tree. Counts are file counts at that head, before the current round’s commits.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `b111d4d3`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
