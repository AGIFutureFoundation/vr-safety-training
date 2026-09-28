# TILL memory — read this first

Short, durable lessons for the next team at this console (enterprise seat billing, `docs/payments.md`).

- **The worktree branch sat on the initial commit.** `git log --oneline -1` first; the merged tree is the coordinator's
  local branch tip (`git reset --hard <tip>` on your own worktree branch, never on the main checkout, never `fetch origin`
  unless told a batch merged).
- **Amounts are configuration, never code.** `auth-config.json`'s `payments.plans[].amountMinor` is null in the public
  build; `pmMoney(null)` reads "not configured" and a quote is `priced: false`. Checkers use a *fixture* amount on a copy
  of the block (`currency: "XTS"` — the ISO test code — so nothing reads as a real price).
- **`cleanPayments()` lives in auth.js and the block is read from the file only**, like the enterprise block. Add a
  field to the cleaner *and* to the shipped JSON, or the cleaner drops it.
- **The adapter's shape mirrors `agent-protocols.js`**: fresh instance per caller (`pmCreateAdapter`), `describe /
  quote / checkout / webhook / status`, refusal sentence `configure per the provider's current documentation`. A hosted
  provider is reached only through a `fetchImpl` the caller hands in — the source never spells `fetch(`, which the
  no-network scan forbids.
- **Idempotency is by event id**, kept in the store's `events` list. The mock's event ids are deterministic
  (`evt-<session>-completed`), so replaying a completion is a no-op by construction.
- **Release only at period end.** An agent that released unused seats mid-period and bought back to the cohort's
  planned size oscillated. Now `cohort.unused` is emitted only while a licence is in the renewal window, a renewal keeps
  `max(used, floor)`, and the release lowers the cohort's planned seats to what is kept (`enSetCohortSeats`).
- **The agent step is pure**: `pmAgentStep(state, policy, events, { config, now })` deep-copies the state and returns a
  new one; the runner (`pmAgentRun`) is the only impure part. Test the step with hand-written events; test the runner
  with `pmAgentEvents()` on the sample.
- **Console pages set no markup from strings** (`check_console` greps the sinks in `instructor/js/*.js`). The invoice is
  an SVG *string* handed to a Blob download.
- **Bundler order for the instructor app**: org.js → cohort.js → payments.js → pm-agent.js → billing.js → auth.js →
  account.js → controls.js → app.js. `python3 tools/bundle_webxr.py instructor` rebuilds only that dist.
