# Deploying the platform on Akamai Cloud

**The plain statement first: nothing in this repository deploys anything by itself, and nothing here has run
against a live account.** The files described below are configuration and a planned sequence. They act only when a
person or a CI job gives them the credentials named on this page through the environment, and they never write one
back into the tree (`tools/check_deploy_akamai.mjs` fails if anything shaped like one appears anywhere in the
repository). This page names Akamai Cloud (formerly Linode) only as a deployment target; it states no price, plan,
region list or limit — every account-specific value is the owner's, read from their own Cloud Manager.

This is the second deployment target. The first is Cloudflare Pages ([deploy-cloudflare.md](deploy-cloudflare.md)).
Both serve the same flat folder, `WebXR/dist/`, exactly as `python3 tools/bundle_webxr.py` writes it.

| File | What it is |
|---|---|
| `tools/ak_deploy.mjs` | The deploy agent: build → gate → preflight → snapshot → upload → verify → rollback. Dry run by default. |
| `.github/workflows/deploy-akamai.yml` | Started by hand only (`workflow_dispatch`). Gated on its secrets; runs the checker suite before the upload. |
| `deploy/akamai/robot-train.md`, `deploy/akamai/ak-robot-train.mjs` | The GPU training job: provision, run the arena under the declared protocol, copy back, destroy. Dry run by default. |
| `.mcp.json.example` | The Akamai MCP server entry for Claude Code, read-only token from the environment. Not enabled. |
| `tools/check_deploy_akamai.mjs` | In `check_all`: everything on this page is checked (last section). |

## How it is served

```
learner ──https──▶ CDN hostname ($AK_CDN_HOSTNAME) ──origin──▶ Object Storage bucket ($AK_BUCKET), website mode
                     │ security headers, wildcard redirects        │ objects carry Cache-Control from _headers
```

- **Object Storage static hosting.** The bucket serves the flat folder as a website: `index.html` as the index
  document, `404.html` as the error document. Every object is uploaded `public-read` with the `Cache-Control` the
  generated `WebXR/dist/_headers` gives its path. The concrete repo-layout redirects in `_redirects`
  (`/smartcity/index.html → /smartcity-x.html`, `/home.html → /index.html` …) are uploaded as zero-byte redirect
  objects (`--website-redirect-location`); the two wildcard ones (`/campus/*`, `/portal/*`) cannot be expressed by
  a bucket and go on the CDN property. If a cluster does not honour redirect objects, put all of them on the CDN.
- **The CDN in front.** A CDN property (Akamai Control Center) with the bucket's **website endpoint** as its origin
  and `$AK_CDN_HOSTNAME` as its hostname, set to honour the origin's `Cache-Control`. Object metadata cannot carry
  security headers, so the property adds them; `node tools/ak_deploy.mjs` prints the exact list at the end of its
  plan, copied from the `/*` rule of `_headers`.
- **No `/api` here.** The Cloudflare deployment answers `/api/health`, the KV-injected `auth-config.json` and the
  payments and passes routes with a Worker. Object Storage is static: on this path `auth-config.json` is served as the
  file, there is no `/api/*`, and an organisation's enterprise block is set by editing the file before the build.

## Cache and security headers (matching the Cloudflare rules)

The agent reads `WebXR/dist/_headers` — the same generated file Cloudflare serves — and gives each file the
`Cache-Control` of the most specific rule that matches it, so the two targets cannot drift:

- `no-store`: the navigational pages (`index.html`, `tracks/*`, `404`, `privacy`, `treasures`, the design gallery),
  `auth-config.json`, the sitemap, robots and the manifest; the redirect objects;
- `public, max-age=0, must-revalidate`: the app bundles, and any file no rule names;
- `public, max-age=3600, must-revalidate`: `shared/*` and `sims/*`;
- `public, max-age=31536000, immutable`: `vendor/*`, `media/*`, `models/*`, `og/*`, `icons/*`, `tracks/img/*`.

On the CDN property, on every path: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
`Cross-Origin-Opener-Policy` and the `Content-Security-Policy`, with the values the `/*` rule of `_headers` holds (no
`frame-ancestors` and no `X-Frame-Options`: the LTI launch embeds these pages — see deploy-cloudflare.md).

## Account and token setup

1. **An Akamai Cloud account** (Cloud Manager). Everything below is created there by the owner.
2. **A read-only token for inspection.** Cloud Manager → API Tokens → a personal access token with **read only**
   scopes (Object Storage and Linodes read only is enough). It is what Claude Code's MCP server uses (below) to look
   at the account; it can change nothing. Keep it in the environment as `LINODE_TOKEN_READONLY`.
3. **A separately scoped token for deploys.** A second personal access token for the deploy agent, **Object
   Storage: read only** (the agent only lists buckets to confirm `$AK_BUCKET`), and — only on the machine that runs
   the training job — a third with **Linodes: read/write** (`deploy/akamai/robot-train.md`). Each one is named
   `LINODE_TOKEN` in the environment of the one process that needs it. Give each an expiry.
4. **The bucket.** Create it in the region you choose, note its label (`AK_BUCKET`), its region id (`AK_REGION`) and
   the S3 endpoint hostname Cloud Manager shows for it (`AK_S3_ENDPOINT`). Enable website hosting on it, or let the
   agent's preflight step do it.
5. **An Object Storage access key limited to that bucket** (read/write): `AK_S3_ACCESS_KEY_ID` and
   `AK_S3_SECRET_ACCESS_KEY`. The upload uses this, not a token.
6. **The CDN property** with the bucket's website endpoint as origin, the headers above, the two wildcard redirects
   and your hostname (`AK_CDN_HOSTNAME`), with its certificate. Point the hostname's DNS at the property as Control
   Center instructs. Then set `tools/seo-config.json`'s `baseUrl` to `https://<that host>/` and rebuild.
7. **The `aws` CLI** where the agent runs (it speaks the S3 protocol to `$AK_S3_ENDPOINT`). GitHub's Ubuntu runners
   ship it; the workflow checks with `aws --version`.

### The environment, by name

| Name | Kind | Used by |
|---|---|---|
| `LINODE_TOKEN` | secret | the deploy agent (Object Storage read only); the training job (Linodes read/write, a different token) |
| `AK_S3_ACCESS_KEY_ID`, `AK_S3_SECRET_ACCESS_KEY` | secrets | the deploy agent's uploads (handed to the `aws` CLI as its own variables, in the child process only) |
| `AK_BUCKET`, `AK_REGION`, `AK_S3_ENDPOINT`, `AK_CDN_HOSTNAME` | variables | the deploy agent |
| `LINODE_TOKEN_READONLY` | secret, local only | the MCP server entry in `.mcp.json.example` |
| `AK_TRAIN_TYPE`, `AK_TRAIN_REGION`, `AK_TRAIN_IMAGE`, `AK_TRAIN_SSH_PUBKEY`, `AK_TRAIN_SSH_KEY` | variables | the training job |

In GitHub: repository **Secrets** `LINODE_TOKEN`, `AK_S3_ACCESS_KEY_ID`, `AK_S3_SECRET_ACCESS_KEY`; repository
**Variables** `AK_BUCKET`, `AK_REGION`, `AK_S3_ENDPOINT`, `AK_CDN_HOSTNAME`; an environment named `akamai` (add
required reviewers to it if a person should approve each deploy). Locally: `export` them in the deploying shell from a
password manager. Never in a file in the tree.

## The deploy agent's sequence

`node tools/ak_deploy.mjs [--apply] [--skip-build] [--skip-gate] [--log file]`

| Step | What happens | What is checked |
|---|---|---|
| 1 build | `python3 tools/bundle_webxr.py` | `index.html`, `smartcity-x.html`, `sitemap.xml`, `auth-config.json`, `_headers` exist |
| 2 gate | `node tools/check_all.mjs` | the last line is `All N checkers pass.` — otherwise nothing is uploaded |
| 3 preflight | `GET https://api.linode.com/v4/object-storage/buckets` (read-only, every page); `aws s3api head-bucket`; `aws s3 website` (index and error documents) | the bucket is listed and answers with the access key |
| 4 snapshot | server-side `aws s3 sync` of the live objects to `_rollback/` (private) | skipped on a first deploy (nothing to roll back to) |
| 5 upload | one `aws s3 sync` per `Cache-Control` group with `--acl public-read`; the redirect objects; stale objects (not in the build, not a redirect, not under `_rollback/`) removed with `delete-objects` | each command exits 0 |
| 6 verify | fetches at `https://$AK_CDN_HOSTNAME` | `/` is 200 `text/html` with a `<title>`; `/smartcity-x.html` is 200 and over 1 MB; `/auth-config.json` is 200 JSON; the homepage carries `content-security-policy`, `x-content-type-options`, `referrer-policy`; `/sitemap.xml` lists as many pages as the build's |
| 7 rollback | only when anything after the snapshot fails: `_rollback/` synced back over the site | the run exits 1 naming the failure |

Without `--apply`, or with `--apply` and any of the seven names absent, the agent writes the whole plan (and the CDN
header list) to its log (`docs/deploy/akamai-last-run.md` by default) with `not executed`, and exits 0. Every log line
passes a redaction that replaces credential values with `«NAME»` and drops any line still shaped like a credential.

## The workflow

`.github/workflows/deploy-akamai.yml` runs only when started from the Actions tab (`workflow_dispatch`); no push
triggers it, so the Cloudflare workflow stays the default path until the owner chooses this one. Its first job asks
only whether the three secrets and four variables are set; without all of them the deploy job is skipped and the run
is green. With them: checkout, Node 22, Python 3.12, `aws --version`, the build, **`node tools/check_all.mjs`**, then
the agent with `--apply --skip-build --skip-gate`; the log is uploaded as an artifact whatever happened.

## Verification and rollback by hand

- **Verify:** `curl -sI https://$AK_CDN_HOSTNAME/` shows the security headers and `cache-control: no-store`;
  `curl -sI https://$AK_CDN_HOSTNAME/smartcity-x.html` shows `max-age=0, must-revalidate`; open the homepage, one
  world and `/sitemap.xml`.
- **Roll back:** the agent's own rollback runs on any failure after the snapshot. To roll back a deploy that verified
  but turned out wrong, before the next deploy overwrites the snapshot:
  `aws --endpoint-url https://$AK_S3_ENDPOINT s3 sync s3://$AK_BUCKET/_rollback/ s3://$AK_BUCKET/ --delete --exclude "_rollback/*" --acl public-read`,
  then purge the CDN cache for the changed paths in Control Center (HTML is `no-store` or revalidates, so most paths
  need no purge). Or re-run the workflow from the previous good commit.

## How Claude Code uses it

`akamai-cloud-mcp` is Akamai's MCP server for Akamai Cloud accounts; with it Claude Code can look at the account. It is
**documented here, not enabled**: the repository holds `.mcp.json.example`, not `.mcp.json`, so nothing starts unless
the owner opts in, and it gets a read-only token.

```sh
export LINODE_TOKEN_READONLY=…            # the read-only token from step 2, from a password manager
claude mcp add akamai-cloud --env LINODE_TOKEN="$LINODE_TOKEN_READONLY" -- uvx akamai-cloud-mcp
# or: cp .mcp.json.example .mcp.json   (expands ${LINODE_TOKEN_READONLY} from the environment; keep .mcp.json untracked)
```

With it, Claude Code can answer "does the bucket exist, what is the CDN origin, is the training instance gone" from
the account itself. It never gets the deploy token or the access key; deploys go through the agent and the workflow
above. A Claude Code session needs `api.linode.com` on its network allowlist for the MCP server or the agents to reach
the API, and the bucket's S3 endpoint host for an upload from the session. Without them, everything here stays a dry
run. The package was not installed or run in the session that wrote this page.

## What is proved

`tools/check_deploy_akamai.mjs`, run by `node tools/check_all.mjs`:

- both deploy workflows are gated on their secrets: each probe step, run under bash with the secrets absent, writes
  `have_secrets=false`, and with them present `have_secrets=true`; every other job needs the probe and runs only on
  `true`; the Akamai workflow has no push trigger;
- the suite gates the upload: `check_all.mjs` comes before the agent in the deploy job, and the agent's plan has
  build → gate → preflight → snapshot → upload → verify → rollback in order;
- rollback exists: a snapshot before the upload, a sync back on failure, and the five verify assertions listed here;
- the deploy agent and the training job, run with a trapped `fetch` and a `PATH` of recording shims (`aws`, `ssh`,
  `scp`, `git`, `python3`, `node`, `curl`), without credentials, with fake credentials, and with `--apply` but names
  absent, exit 0, make no request and start no process; the job refuses an uncommitted or already-run declaration;
- no token or key literal anywhere in the repository: no credential name assigned a literal in any tracked text file,
  no Akamai API client token shape, no private key block; the Akamai files also hold nothing shaped like a token, a
  32-hex or a 64-hex id; no `.mcp.json`, `.env` or `.edgerc` is tracked;
- `.mcp.json.example` parses, runs `uvx akamai-cloud-mcp`, and takes `LINODE_TOKEN` from the environment;
- this page names every environment variable the agent and the job read, covers setup, the CDN, headers, rollback and
  the MCP server, and states no price, plan size or limit.
