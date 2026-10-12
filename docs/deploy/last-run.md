# Deploy run — 2026-09-28T19:00:19.053Z

# Deploy plan — smartciti-x → https://smartciti-x.pages.dev

Mode: DRY RUN (nothing runs). Credentials by name: CLOUDFLARE_API_TOKEN=absent, CLOUDFLARE_ACCOUNT_ID=absent.

## 1. Build the flat folder (build)
python3 tools/bundle_webxr.py writes WebXR/dist, then _headers, _redirects and _routes.json

    $ python3 tools/bundle_webxr.py  — writes WebXR/dist and the edge files

  - check: WebXR/dist/index.html, _headers, _redirects and _routes.json exist after the build

## 2. Gate on the checker suite (gate)
node tools/check_all.mjs must end in its 'All N checkers pass.' line

    $ node tools/check_all.mjs  — the whole suite; 25–40 minutes on a shared machine

  - check: the last line is 'All N checkers pass.'

## 3. Provision (provision)
the Pages project, the KV namespace (by title), the KV binding, the custom domain and its DNS record

    GET https://api.cloudflare.com/client/v4/accounts/«CLOUDFLARE_ACCOUNT_ID»/pages/projects/smartciti-x    # Authorization from $CLOUDFLARE_API_TOKEN
    POST https://api.cloudflare.com/client/v4/accounts/«CLOUDFLARE_ACCOUNT_ID»/pages/projects    # Authorization from $CLOUDFLARE_API_TOKEN
    GET https://api.cloudflare.com/client/v4/accounts/«CLOUDFLARE_ACCOUNT_ID»/storage/kv/namespaces    # Authorization from $CLOUDFLARE_API_TOKEN
    POST https://api.cloudflare.com/client/v4/accounts/«CLOUDFLARE_ACCOUNT_ID»/storage/kv/namespaces    # Authorization from $CLOUDFLARE_API_TOKEN
    PATCH https://api.cloudflare.com/client/v4/accounts/«CLOUDFLARE_ACCOUNT_ID»/pages/projects/smartciti-x    # Authorization from $CLOUDFLARE_API_TOKEN

  - check: the Pages project 'smartciti-x' exists (created with production_branch 'main' if not)
  - check: a KV namespace titled 'smartciti-x-enterprise' exists (created if not) and its id is bound as CF_ENTERPRISE on the project
  - check: no custom domain requested (--domain or CF_CUSTOM_DOMAIN); the project's pages.dev address is used

## 4. Deploy (deploy)
wrangler pages deploy WebXR/dist (assets and the /api Functions); the standalone Worker only when CF_WORKER_ZONE is set

    $ npx wrangler pages deploy WebXR/dist --project-name smartciti-x --branch main --commit-dirty=true    # needs $CLOUDFLARE_API_TOKEN, $CLOUDFLARE_ACCOUNT_ID  — assets plus functions/ (the /api router)
    $ npx wrangler deploy --config workers/edge/wrangler.toml --route «CF_WORKER_ZONE»/api/*    # needs $CLOUDFLARE_API_TOKEN, $CLOUDFLARE_ACCOUNT_ID, $CF_WORKER_ZONE  — only when CF_WORKER_ZONE is set; publishes 'smartciti-x-api'
    GET https://api.cloudflare.com/client/v4/accounts/«CLOUDFLARE_ACCOUNT_ID»/pages/projects/smartciti-x/deployments    # Authorization from $CLOUDFLARE_API_TOKEN

  - check: wrangler exits 0 and the deployments list shows the new deployment first (its id and the previous one are kept for rollback)

## 5. Configure (configure)
secrets present in the environment, by name; KV seeded with the enterprise block

    $ npx wrangler pages secret put PAYMENTS_WEBHOOK_SECRET --project-name smartciti-x    # needs $CLOUDFLARE_API_TOKEN, $CLOUDFLARE_ACCOUNT_ID, $PAYMENTS_WEBHOOK_SECRET  — value from $PAYMENTS_WEBHOOK_SECRET on stdin; skipped with a note when the name is not in the environment
    $ npx wrangler kv key put --namespace-id ‹kv namespace id› org:default --path ‹enterprise block json›    # needs $CLOUDFLARE_API_TOKEN, $CLOUDFLARE_ACCOUNT_ID  — the enterprise block of $CF_ENTERPRISE_FILE, else of WebXR/auth-config.json

  - check: each of PAYMENTS_WEBHOOK_SECRET present in the environment is set on the project by name
  - check: the KV key for the default organisation holds the enterprise block

## 6. Verify the deployment (verify)
fetch the homepage, one bundle, /api/health and the security headers; compare the sitemap's page count to the build

    GET https://smartciti-x.pages.dev/
    GET https://smartciti-x.pages.dev/smartcity-x.html
    GET https://smartciti-x.pages.dev/api/health
    GET https://smartciti-x.pages.dev/
    GET https://smartciti-x.pages.dev/sitemap.xml

  - check: GET / is 200, text/html and carries the site's <title>
  - check: GET /smartcity-x.html is 200 and larger than 1 MB
  - check: GET /api/health is 200 JSON with ok: true
  - check: the homepage answers with content-security-policy, x-content-type-options and referrer-policy
  - check: GET /sitemap.xml lists exactly as many pages as the built WebXR/dist/sitemap.xml

## 7. Roll back on a failed verify (rollback)
the previous Pages deployment is restored through the API; the run exits non-zero

    POST https://api.cloudflare.com/client/v4/accounts/«CLOUDFLARE_ACCOUNT_ID»/pages/projects/smartciti-x/deployments/‹previous deployment id›/rollback    # Authorization from $CLOUDFLARE_API_TOKEN

  - check: only when a verify assertion failed; the run then exits 1 with the failed assertion named

- 2026-09-28T19:00:19.055Z · all · not executed · dry run
