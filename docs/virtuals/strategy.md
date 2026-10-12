# SmartCiti.X on the agent network — integration strategy

How the Holodeck's robotics training would be offered as an agent on the Virtuals agent platform, through the Agent Commerce Protocol (ACP), under the project name **SmartCiti.X** and the agent token name **$Citi**. Status: **in preparation**. Nothing described here is live: no agent has been created, no offering published, no wallet made, no job run and no token launched.

> **Read this first.** The Virtuals sites and documentation (os.virtuals.io, the Virtuals docs and the EconomyOS whitepaper) **could not be reached from this build environment**. The only verifiable source used here is the owner's public repository `AGIFutureFoundation/acp-cli` — its `README.md`, `SKILL.md`, `docs/tokenization.md`, `docs/headless-deployment.md`, `migration.md`, `src/commands/*` and `src/lib/*`, read at commit `9aa61ae`. A statement sourced from those files says so. Anything about the wider Virtuals platform beyond them is marked **to verify against the official docs**. Nothing here states or implies a price, a supply, a fee, a valuation or a return for $Citi or any offering.

## 1. What SmartCiti.X is

SmartCiti.X is the network-facing agent of this platform. It is the provider side of the same engine the learner-facing agent Foreman uses (`agents/foreman/agent.json`, `docs/agent-roadmap.md`): Foreman stays on the learner's device and reads the passport; SmartCiti.X answers other agents' jobs using only things that carry no personal data — the skill registry, the simulation engine, and synthetic or explicitly consented datasets. The package is `agents/smartcitix/`; its checker is `tools/check_virtuals.mjs`, in `tools/check_all.mjs`.

$Citi is the agent token name the owner chose. In this repository it is a label and nothing more: no token exists, and whether one is ever launched is the owner's decision after legal review (section 6).

## 2. What SmartCiti.X offers as an ACP provider

acp-cli's README describes an offering as a job an agent can be hired to do, with a price, an SLA, requirements (a string or a JSON schema) and a deliverable; creating a job from an offering starts the escrow lifecycle. SmartCiti.X would publish four offerings, one file each under `agents/smartcitix/offerings/`, every price left `null` for the owner to set.

| Offering | What the buyer gets | Runs on | Local stub |
| --- | --- | --- | --- |
| `station-evaluation` | A robot or agent policy run through a station on the real procedure engine, scored the way a learner is scored: score, stars, unsafe actions, holds broken, pass or fail, deterministic for a seed | `WebXR/shared/robot.js` `runEpisode`, the station's task graph from `WebXR/shared/skill-registry.js` | `evaluateStation` |
| `robot-skill-dataset` | A curated slice of robot-skill episodes in the platform's native, LeRobot-style and RLDS-style layouts, with the manifest's licence and consent fields and the dataset card | `tools/export_dataset.mjs`, `tools/lib/dataset_formats.mjs` | `exportDatasetSlice` |
| `curriculum-query` | The stations of a programme, or one station's task graph — primitives in order, preconditions, failure labels, union | `skStationsForProgramme`, `skStation`, `skPreconditionsAt` | `curriculumQuery` |
| `lesson-service` | A lesson composed from real stations for a sentence such as "a lockout refresher for apprentices", with a reason for the order and a pass bar; the union-trade audiences today, and the K-12 programmes as they land in the registry | `WebXR/shared/lessons.js` `composeLesson` over the registry roster | `composeLessonJob` |

What never goes into an offering: `learner_progress`, `recommend_next_station` and `answer_learner` read the learner's passport and stay on the device. A dataset slice contains synthetic rollouts only, unless a learner has chosen to export their own episodes and the distributor holds that learner's or hall's permission — the export already says so in every episode's `licence` and `consent` fields.

A station evaluation is evidence of how a procedure played out under this engine's scoring. It is not a certification, and the deliverable says so.

## 3. What SmartCiti.X could consume as a buyer

acp-cli's README describes the client side as `acp browse` to find a provider, `acp client create-job` against an offering, then `acp client fund`, `acp client complete` or `acp client reject`, and optionally `acp client review`. Services SmartCiti.X could hire, each only after the owner decides to and with no learner data in the requirement:

- **Compute** — batch simulation or policy training on synthetic rollouts. acp-cli also names a compute account (`acp compute status`); how inference and compute are funded on the platform is managed from the dashboard, not the CLI, and is **to verify against the official docs**.
- **Data labelling** — failure-label review over synthetic episodes (never human episodes without consent covering it).
- **Translation review** — review of station text in the platform's languages, text only, no learner content.

## 4. How it maps onto acp-cli

Every command name below is copied from acp-cli's README; `tools/check_virtuals.mjs` fails if any command named in these docs is not in that README.

| acp-cli concept | What acp-cli says | SmartCiti.X use | Commands |
| --- | --- | --- | --- |
| Agent | An identity with an EVM wallet, created after browser sign-in; one active agent at a time | One agent named "SmartCiti.X", description from `agents/smartcitix/agent.json` | `acp configure start`, `acp configure complete`, `acp agent create`, `acp agent use`, `acp agent whoami`, `acp agent update` |
| Offerings | Jobs the agent can be hired to do: name, description, price type and value, SLA minutes, requirements, deliverable, required funds, hidden | The four offerings above, created hidden first | `acp offering create`, `acp offering list`, `acp offering update`, `acp offering delete` |
| Jobs | `open → budget_set → funded → submitted → completed / rejected`, or `expired`; the requirement arrives as the first message with `contentType: "requirement"` | The provider loop hands each requirement to the matching handler in `tools/smartcitix_provider.mjs` | `acp events listen`, `acp events drain`, `acp provider set-budget`, `acp provider submit`, `acp job list`, `acp job history`, `acp job watch`, `acp message send` |
| Resources | External data or service endpoints (URL plus a params schema), discoverable, not transactional | Possibly a read-only curriculum index later; none now, because it would need a hosted URL | `acp resource list`, `acp resource create` |
| Subscriptions | Reusable access packages with a duration of 7, 15, 30 or 90 days; the first job opens the window | Possibly a curriculum-query package later; none now, and no price is proposed here | `acp subscription list`, `acp subscription create` |
| Policy | An allowlist of contract or wallet addresses attached to a signer and enforced server-side; presets and custom policies | The most conservative choice the owner is comfortable with, decided by the owner | `acp policy list`, `acp policy global`, `acp policy show` |
| Chains | Supported chains depend on the environment (`IS_TESTNET`) | Testnet first, mainnet only after the milestones below | `acp chain list` |
| Wallet gate | Signing actions go through an approval gate (`src/lib/walletGate.ts`); anything that signs needs a signer added with browser approval, under a signer policy | Nothing in this repository signs. The owner adds a signer only when publishing jobs for real | `acp agent add-signer`, `acp agent signer-policy` |
| Tokenization | Launches a token for the active agent; requires a signer and funds as `docs/tokenization.md` describes | Only after legal review, by the owner, per `docs/tokenization.md` | `acp agent tokenize` |
| Operating guidance | The CLI ships its own skill text | The owner's runtime loads it next to `agents/smartcitix/SKILL.md` | `acp skill print` |

**Agent runtime.** acp-cli's `SKILL.md` is written for a skill-loading agent runtime (front matter with `name`, `description` and `metadata`, then operating recipes). `agents/smartcitix/SKILL.md` follows the same convention. The brief names a "Hermes Agent" runtime; `agents/smartcitix/hermes/` holds a profile and a tool manifest prepared for a skill-loading runtime of that name. Which runtime the owner means, and its exact profile and manifest conventions, are **to verify against the official docs** of that runtime; nothing external is installed or run here.

## 5. The $Citi agent token, as acp-cli describes tokenization

From acp-cli's `docs/tokenization.md` and README only:

- `acp agent tokenize` launches a token for the **active agent**. It requires an active agent (`acp agent use`) and a signer (`acp agent add-signer`); it refuses to run without a signer.
- The wallet needs the venue's currency and gas as that document describes; the chain list comes from the agent's EVM provider, and `--chain-id` and `--symbol` pick the chain and the symbol.
- The document describes optional launch settings (anti-sniper, pre-buy, Capital Formation, a 60-day experiment mode, an airdrop allocation, a Robotics launch flag, and a separate launchpad). This strategy **chooses none of them** and states no figure for any of them; each is a decision for the owner and their legal and financial advisers.
- The Robotics launch flag is described as marking an agent as embodied and eligible for a robot testing environment, with onboarding done outside the CLI. Whether that suits SmartCiti.X — a simulation-only trainer — is **to verify against the official docs**.
- The symbol the owner chose is shown here as "$Citi". Whether a symbol is passed with or without the leading sign, and any naming rule, is **to verify against the official docs**.

## 6. Governance and consent

- **No personal data, ever.** No names, crew tags (even hashed), training records, episodes, pose tracks or passport contents go into an offering, a requirement, a deliverable, a resource, a message or anything on-chain.
- **Opt-in or nothing.** Nothing without the learner's opt-in ever leaves the device; exports are local files the learner makes. A dataset slice defaults to synthetic rollouts (CC0-1.0, as the export states).
- **Not a credential.** Evaluations and lessons evidence a procedure under this engine's scoring; they certify no one.
- **The owner acts; this repository does not.** Every step that creates an agent, publishes an offering, adds a signer or launches a token is in `agents/smartcitix/runbook.md` for the owner to run, with no values filled in.
- **Legal review before any token.** No tokenization before the owner has obtained legal review of the token, the offerings and the jurisdictions involved.
- **Configuration outside the repository.** No key, secret, seed phrase or wallet address is ever committed; the checker fails the build if one appears in `agents/` or `docs/virtuals/`.

## 7. Milestones

Each milestone has acceptance tests; a milestone is done when its tests pass.

- **V0 — Package and local stub (this change).** Accept: `tools/check_virtuals.mjs` passes in `tools/check_all.mjs` — `agent.json` validates, every offering has acp-cli's offering fields with a `null` price and maps to a stub handler and a real registry entry, the stub's three dry runs (evaluation, dataset slice, curriculum query) produce deliverables without a network call, no secret or price figure appears, and every acp-cli command named here is in acp-cli's README.
- **V1 — Verified conventions.** Accept: every item marked "to verify against the official docs" is checked against the official Virtuals docs and the chosen runtime's docs, with the date checked recorded in this file; `agents/smartcitix/hermes/` is adjusted to the verified conventions; the checker still passes.
- **V2 — Testnet provider, owner-run.** Accept: the owner follows the runbook on testnet (`IS_TESTNET=true`); the offerings are created hidden; one test job per offering goes `open → budget_set → funded → submitted → completed` with the deliverable produced by `tools/smartcitix_provider.mjs`; no personal data appears in any requirement, message or deliverable.
- **V3 — Buyer dry run.** Accept: one compute or translation-review job is created as a client on testnet with a synthetic requirement and settled with `acp client complete` or `acp client reject`.
- **V4 — Legal review.** Accept: a written legal review of $Citi and the offerings, obtained by the owner, is on file outside this repository; any conditions it sets are reflected in the runbook.
- **V5 — Mainnet and tokenization decision (gated on V4).** Accept: the owner decides whether to publish the offerings visibly and whether to tokenize, per acp-cli's `docs/tokenization.md`; the V0 checks still pass; this file records the decision without any figure.

## 8. Risk register

| Risk | Effect | Mitigation |
| --- | --- | --- |
| Regulatory treatment of an agent token | A token launched without review may breach securities, consumer or tax rules in some jurisdiction | Legal review before any tokenization (V4); the runbook stops at that step; no economics stated here |
| Protocol details wrong or out of date | Offerings or jobs fail, or behave differently from this plan | Every detail beyond acp-cli's files marked to verify; V1 verifies against the official docs; acp-cli's own `acp skill print` is preferred over any cached copy |
| Personal data leaking into a job | Breach of the platform's consent promise | Offerings take no learner data; the stub rejects requirements with fields outside the schema; datasets default to synthetic |
| A deliverable read as a certification | Misrepresentation to a buyer | Every evaluation and lesson deliverable carries the not-a-certification notice |
| Key or secret committed | Loss of control of the agent | Keys stay in the owner's OS keychain as acp-cli describes; the checker scans `agents/` and `docs/virtuals/` |
| Runtime mismatch (Hermes conventions) | The profile does not load | Conventions marked to verify; SKILL.md follows acp-cli's own skill convention |
| Simulation mistaken for a real robot test | A buyer over-trusts a policy | Deliverables say "in simulation"; `noRobot` steps are never attempted |
