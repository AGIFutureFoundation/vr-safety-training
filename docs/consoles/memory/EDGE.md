# EDGE memory — read this first at this console

Short, durable lessons for the next team on the Cloudflare layer (docs/deploy-cloudflare.md).

- **The worktree may start at the wrong commit.** This one opened at the two-commit initial tree, not the
  coordinator's. `git log --oneline --all | head` shows the coordinator's branch tip; `git reset --hard <that>`
  is a local ref move, not a fetch, and the brief's "no fetch" rule allows it.
- **One project, Functions for the API.** A Pages `wrangler.toml` (`pages_build_output_dir`) cannot also be a
  Worker (`main`). The /api router is a module under `workers/edge/` that exports both `onRequest` (Pages) and
  `default.fetch` (Worker); `functions/**` files are one-line re-exports; `workers/edge/wrangler.toml` publishes
  the standalone Worker optionally. `WebXR/dist/_routes.json` keeps Function invocations to `/api/*` and
  `/auth-config.json` — without it every static request would count as an invocation.
- **The pages read `auth-config.json` beside themselves**, not an API. So the injection route answers the file's
  own path (`functions/auth-config.json.js`) and `auth.js` needs no change. Whitelist the enterprise keys from KV;
  never merge a whole KV object into the config.
- **Nothing in `dist/` is hash-named.** `immutable` on an unhashed URL strands returning visitors on old code
  after a rebuild. Bundles get `max-age=0, must-revalidate` (ETag 304s); only `vendor/ media/ models/ og/ icons/
  tracks/img/` are immutable. Hash-naming `shared/*.js` in the bundler is the honest next step.
- **`_redirects` folder rule for a shared folder.** `bayworld/` holds the Atlas too; `/bayworld/` must fold onto
  `bayworld.html` only. The generator emits the folder rule only for the page whose index is `index.html`.
- **The bundler's edge step runs only on a full build** (`python3 tools/bundle_webxr.py` with no args). To refresh
  the three files alone: `python3 -c "import sys; sys.path.insert(0,'tools'); import bundle_webxr as b; b.write_edge_files()"`.
- **Your own checker must not carry a fake credential.** A 32-hex or 40-char literal in `check_deploy.mjs` trips
  its own secret scan; build fakes with `.repeat()`/`join()` at run time.
- **Ids in wrangler output are 32 hex too.** The log redactor replaces any such line whole; log verdicts, not ids.
- **wrangler is not installed here** and `npm install` is blocked; the checker prints the skip note. In CI the
  workflow installs it (`npm install --no-save wrangler`).
- **TILL's handler contract** (`workers/payments/handler.mjs`): default `handle(request, env)`, named `ROUTES`
  (`{ method, path }` or `"METHOD /path"`; `cfRoute()` normalises both). The stub here is marked; on an add/add
  conflict take TILL's file whole. The secret is `env.PAYMENTS_WEBHOOK_SECRET` (set by name by the agent).
