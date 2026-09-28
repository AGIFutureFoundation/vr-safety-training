# Deploying the platform on Cloudflare

**The plain statement first: nothing in this repository deploys anything by itself.** The files described here
are configuration and a planned sequence; they act only when a person or a CI job gives them a Cloudflare API
token and an account id through the environment, and they never write either back into the tree
(`tools/check_deploy.mjs` fails the build if anything shaped like one appears).

What deploys is the flat folder `WebXR/dist/` exactly as `python3 tools/bundle_webxr.py` writes it — the
homepage, every app bundle as one HTML file, the track pages, the shared modules, the lazily loaded sims,
`auth-config.json`, sitemap, robots, manifest, 404 — plus three files the same script emits for the edge:
`_headers`, `_redirects` and `_routes.json`.

| File | What it is |
|---|---|
| `wrangler.toml` | The Pages project: `name`, `pages_build_output_dir = "WebXR/dist"`, a compatibility date, the vars the router reads, and the KV binding `CF_ENTERPRISE` (with a placeholder id — the real namespace is bound by the deploy agent). |
| `functions/api/[[path]].js`, `functions/auth-config.json.js` | Pages Functions that re-export the router. `WebXR/dist/_routes.json` sends only `/api/*` and `/auth-config.json` to them; every other request is a plain static asset. |
| `workers/edge/router.mjs` | The router: `GET /api/health`, `GET /api/auth-config` and `/auth-config.json` (the file with an organisation's `enterprise` block merged in from KV), then every route TILL's two handler modules declare in their `ROUTES` — `workers/payments/handler.mjs` (`POST /api/payments/webhook`, HMAC from `PAYMENTS_WEBHOOK_SECRET`) and `workers/passes/handler.mjs` (the Wallet pass routes under `/api/passes/*`). Each is on one contract: default `handle(request, env)` → Response, named `ROUTES`. The checker asserts the router's routes equal the union of both. |
| `workers/edge/wrangler.toml` | The same router as a standalone Worker, for a deployment that wants `/api/*` on its own Worker and zone route. Optional. |
| `WebXR/dist/_headers` | Security headers on every path and the cache policy (below). Generated. |
| `WebXR/dist/_redirects` | The repository layout's paths (`/smartcity/index.html`, `/bayworld/`, `/home.html`, `/portal/*` …) folded onto the flat names. Generated. |
| `tools/deploy_agent.mjs` | The agent that takes the build to production as a planned, verified sequence (below). Dry run by default. |
| `tools/deploy_cloudflare.sh` | The shell front of the agent: prints the credentials' presence by name and the command, then runs the agent. |
| `.github/workflows/deploy-cloudflare.yml` | On a push to the default branch: the checker suite, then the agent with `--apply`. Gated on the secrets being present. |
| `tools/check_deploy.mjs` | In `check_all`: everything on this page is checked (last section). |
| `docs/deploy/last-run.md` | The log of the last agent run. The committed one is a dry run. |

## Setup

1. **A Cloudflare account** and an **API token** with these permissions: Cloudflare Pages (edit), Workers KV
   Storage (edit), Workers Scripts (edit — only if you publish the standalone Worker), and DNS (edit) on the
   zone that will carry the custom domain. Copy the **account id** from the dashboard's account home.
2. **Put both in the environment, nowhere else.** Locally: `export CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=…`
   in the shell you deploy from. In GitHub: repository **Secrets** `CLOUDFLARE_API_TOKEN` and
   `CLOUDFLARE_ACCOUNT_ID`. Optional secrets: `CLOUDFLARE_ZONE_ID` (for the DNS record), `PAYMENTS_WEBHOOK_SECRET`
   (set on the project by name for TILL's handler). Optional **variables**: `CF_CUSTOM_DOMAIN`, `CF_WORKER_ZONE`.
3. **Install wrangler** where the agent runs (`npm install --no-save wrangler` or `npm i -g wrangler`). It is not
   vendored and not needed for the checker suite; `check_deploy.mjs` runs its dry run when it finds it and
   says so when it does not.
4. **Look at the plan first**: `tools/deploy_cloudflare.sh` (no arguments) prints every command and every check
   the apply would run, with the credentials named as `$CLOUDFLARE_API_TOKEN` / `«CLOUDFLARE_ACCOUNT_ID»`, and
   exits 0 without touching anything — with or without credentials in the environment.
5. **Deploy**: `tools/deploy_cloudflare.sh --apply` (add `--domain train.example.org` for the custom domain).

## The deploy agent's sequence

`node tools/deploy_agent.mjs [--apply] [--domain host] [--branch name] [--skip-build] [--skip-gate] [--log file]`

| Step | What happens | What is checked |
|---|---|---|
| 1 build | `python3 tools/bundle_webxr.py` | `WebXR/dist/index.html`, `_headers`, `_redirects`, `_routes.json` exist |
| 2 gate | `node tools/check_all.mjs` | the last line is `All N checkers pass.` — otherwise the run stops |
| 3 provision | the Pages project (created if absent, production branch = `--branch`), the KV namespace titled `smartciti-x-enterprise` (by title, created if absent) bound as `CF_ENTERPRISE` on production and preview, the custom domain and its `CNAME <domain> → <project>.pages.dev` (only with `--domain`, and the record only with `CLOUDFLARE_ZONE_ID`) | each exists afterwards |
| 4 deploy | `wrangler pages deploy WebXR/dist --project-name … --branch …` (assets and the `functions/` router); `wrangler deploy --config workers/edge/wrangler.toml --route <zone>/api/*` only when `CF_WORKER_ZONE` is set. For the duration of each command the `wrangler.toml` carries the resolved KV namespace id in place of its placeholder and is restored byte for byte afterwards, so no id is ever committed | wrangler exits 0; the new deployment is first in the list; the previous id is kept |
| 5 configure | each secret name in `CF_SECRET_NAMES` that is present in the environment is piped to `wrangler pages secret put <NAME>` (a missing one is skipped with a note); the KV key `org:default` is seeded with the `enterprise` block of `$CF_ENTERPRISE_FILE`, else of `WebXR/auth-config.json` | set by name; the key holds the block |
| 6 verify | fetches against the custom domain or `<project>.pages.dev` | `/` is 200 `text/html` with a `<title>`; `/smartcity-x.html` is 200 and over 1 MB; `/api/health` is 200 JSON `ok: true`; the homepage carries `content-security-policy`, `x-content-type-options`, `referrer-policy`; `/sitemap.xml` lists exactly as many pages as the built `WebXR/dist/sitemap.xml` |
| 7 rollback | only on a failed verify: `POST …/deployments/<previous>/rollback` | the run exits 1 naming the failed assertion |

Every step appends one line to the log (`docs/deploy/last-run.md` by default; the workflow uploads its log as
an artifact). The log is redacted twice: any value of a credential variable is replaced by `«NAME»`, and any
line still shaped like a token or a 32-hex id is replaced whole. The dry run writes the whole plan and the
line `not executed · dry run`.

## Custom domain

Pass `--domain <host>` (or set `CF_CUSTOM_DOMAIN`). The provision step attaches the domain to the Pages project
and, when `CLOUDFLARE_ZONE_ID` is set, creates the proxied `CNAME` to `<project>.pages.dev`. Without the zone
id, add that record in the zone's DNS by hand; Cloudflare then issues the certificate. Set
`tools/seo-config.json`'s `baseUrl` to `https://<host>/` and rebuild so canonical, Open Graph and the sitemap
carry absolute URLs (console WAYFINDER). If a Mapbox token is configured, restrict it to this origin
(`docs/mapbox.md`).

## Preview branches

Every `wrangler pages deploy … --branch <name>` with a branch other than the production branch is a **preview
deployment** at `https://<branch>.<project>.pages.dev` with the same Functions and the same KV binding (the
agent binds `CF_ENTERPRISE` on the preview environment too). `tools/deploy_cloudflare.sh --branch feature-x
--apply` publishes one; the workflow deploys production only from the default branch. A preview reads the
same `org:*` keys, so a test organisation block can be seeded under a host key that only the preview uses.

## The edge injection of an organisation's enterprise block

Every page reads `auth-config.json` beside itself (`WebXR/shared/auth.js`; `docs/enterprise.md` § 3). On
Cloudflare that read is answered by the router: the static file, with the KV entry for
`org:<request host>`, else `org:<?org=slug>`, else `org:default`, merged over the file's `enterprise` block.
Only the block's own keys (`organisation`, `signInMethods`, `defaultLanguage`, `worlds`, `programmes`,
`dataRetention`, `sso`) are taken from KV — a token or key stored there by mistake never reaches a browser —
and the answer is `no-store`. Without the binding, or with no entry, the file is served unchanged and the
`x-cf-enterprise` header says `file`. To give one organisation its own copy: attach a second custom domain to
the project and `wrangler kv key put --namespace-id <id> org:<that host> --path block.json`.

## Cache and security headers

Nothing in the flat build is hash-named, so `immutable` would strand a returning visitor on an old bundle
after a rebuild. The generated `_headers` therefore gives:

- `no-store` to the navigational pages (`index.html`, `tracks/*`, `404`, `privacy`, `treasures`, the design
  gallery), `auth-config.json`, the sitemap, robots and manifest, and `/api/*`;
- `public, max-age=0, must-revalidate` to the app bundles — Pages answers a `304` on the ETag when nothing
  changed and the new bundle the moment one is deployed;
- `public, max-age=3600, must-revalidate` to `shared/*` and `sims/*`;
- `public, max-age=31536000, immutable` to `vendor/*`, `media/*`, `models/*`, `og/*`, `icons/*`, `tracks/img/*`,
  whose contents change only with a pinned version or a re-encode.

Security on every path: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy: geolocation=(), payment=(), usb=()`, `Cross-Origin-Opener-Policy: same-origin-allow-popups`
(the sign-in popups), and a `Content-Security-Policy` that allows exactly the hosts the code names:
`cdnjs.cloudflare.com` (three.js, react, mapbox-gl), `cdn.jsdelivr.net` (msal-browser), `accounts.google.com`,
`login.microsoftonline.com`, `api.mapbox.com` and `events.mapbox.com`. `connect-src` also allows `https:`
because the endpoints a deployment configures in `auth-config.json` (the Guide's endpoint, the e-mail
endpoint, an LRS, an LTI platform) are whatever the operator names there. `'unsafe-inline'` is required: each
bundle is one HTML file with its modules inline. There is no `frame-ancestors` and no `X-Frame-Options`
because the LTI launch embeds these pages. The hosts are listed once, in `tools/bundle_webxr.py`
(`EDGE_*_HOSTS`), and the checker compares them to the code.

## What the free tier holds

Cloudflare Pages, Functions and KV each have limits on the free plan (requests, builds, bandwidth, storage,
Functions invocations, file size and file count per deployment). These change; this page states none of them
— **see Cloudflare's current limits** for Pages, Workers and KV before pointing a class at a deployment. Two
facts about this build that bear on them and that the checker measures: the largest bundle is one file under
6 MB, and the flat folder holds a little over 1,100 files, both within the per-file and per-deployment file
limits at the time of writing (verify against the current page). Mapbox loads are metered against the Mapbox
token, not against Cloudflare (`docs/mapbox.md`).

## What is proved

`tools/check_deploy.mjs`, run by `node tools/check_all.mjs`:

- both `wrangler.toml` files parse; the Pages project serves `WebXR/dist`; the KV binding is `CF_ENTERPRISE`
  with a placeholder id; no account id or route in either; the Functions re-export the router;
- `_headers`, `_redirects` and `_routes.json` are what the bundler emits now; every header path and every
  redirect target exists in the flat folder, no redirect shadows a real file or the API; the CSP names every
  host the code names and no other; the cache policy above holds line by line;
- nothing shaped like a secret, a token, an account id or a 32-hex id in any deploy file, the agent, the shell
  front, the workflow, this page, the edge files or the committed log; no `.dev.vars` or `.env` is tracked;
- the router's routes cover the payments handler's `ROUTES` and its own three; `/api/health` answers;
  the auth-config route injects a KV block by host, by `?org=`, then the default, drops keys outside the
  enterprise block, serves the file unchanged without KV, makes no outbound request with the ASSETS binding,
  answers 404 and 405 correctly, and reaches the payments handler;
- the agent's plan has the seven steps in order, every step has commands and checks, provision covers the
  project, the namespace, the binding, the domain and the DNS record, configure covers each secret by name and
  the KV seed; the verify function runs exactly the five listed assertions; a failed verify rolls back; the dry
  run — without credentials, with fake credentials, and `--apply` without credentials — exits 0, spawns no
  process, makes no request, and writes a log that holds the whole plan and no credential value;
- the shell front is strict, executable and assigns no credential; the workflow takes the credentials from
  GitHub secrets, is gated on their presence, runs the suite before the agent and deploys from the default
  branch; this page covers setup, the custom domain, previews, the KV injection, rollback and states no
  free-tier number;
- `wrangler deploy --dry-run` of the Worker when wrangler is installed, else a note that it was skipped.
