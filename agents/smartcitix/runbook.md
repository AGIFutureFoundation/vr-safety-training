# SmartCiti.X runbook — for the owner

The owner's step-by-step to put SmartCiti.X on the Virtuals agent platform with acp-cli. **Nothing here has been run.** Every command is copied from acp-cli's `README.md` (`AGIFutureFoundation/acp-cli` at commit `9aa61ae`) with **no values filled in**: each `<...>` is yours to decide, on your own machine, at the time. Never paste a key, secret, seed phrase or wallet address into this repository.

Anything about the platform beyond acp-cli's own files is **to verify against the official docs** before you rely on it. acp-cli itself says the skill text bundled with the installed CLI is authoritative: run `acp skill print` after installing and prefer it over this page where they differ.

> **Stop before step 8.** Obtain legal review of any tokenization — the token, the offerings, the jurisdictions you and your buyers are in — before you run anything in step 8. This runbook states no price, supply, fee, valuation or return for $Citi, and none should be inferred from it.

## 1. Install acp-cli

Node.js 18 or later, then (README, Install):

```bash
npm i -g @virtuals-protocol/acp-cli
```

Start on testnet: acp-cli's README says `IS_TESTNET=true` switches chains, API and sign-in to testnet, with separate state files.

## 2. Sign in

If an agent runtime drives the CLI, use the split flow (README, Bootstrap):

```bash
acp configure start --json
acp configure complete --request-id <requestId> --json
```

At your own terminal, `acp configure` alone is fine.

## 3. Create the agent

Take the name and description from `agents/smartcitix/agent.json` (README, Agent Management):

```bash
acp agent create --name "<name>" --description "<description>" --image "<image URL>"
acp agent whoami
```

## 4. Review the offerings

Read each file in `agents/smartcitix/offerings/`. Set `priceType` and `priceValue` yourself — they are `null` here on purpose ("set by the owner"). Run the local stub on each before publishing:

```bash
node tools/smartcitix_provider.mjs --dry-run
node tools/check_virtuals.mjs
```

## 5. Add a signer (only when you are ready to take jobs)

Job actions need a signer (README, Agent Management). Choose the policy yourself; acp-cli describes `restricted`, `deny-all` and `unrestricted`:

```bash
acp agent add-signer --agent-id <agentId> --policy <policy>
acp agent signer-policy
```

Review policies first if you want a custom one (README, Wallet Policies): `acp policy list`, `acp policy global`, `acp policy show <id>`.

## 6. Publish the offerings, hidden first

One command per offering file, fields copied from the file (README, Offering Management):

```bash
acp offering create \
  --name "<name>" \
  --description "<description>" \
  --price-type <priceType> --price-value <priceValue> \
  --sla-minutes <slaMinutes> \
  --requirements '<requirements JSON>' \
  --deliverable '<deliverable JSON>' \
  --no-required-funds --hidden
acp offering list
```

Make one visible only when you decide to: `acp offering update --offering-id <offeringId> --no-hidden`.

## 7. Run the provider loop

acp-cli's `SKILL.md` describes it: one listener per file, drain, hand each requirement to the stub, then set the budget and submit (README, Event Streaming and Provider Commands):

```bash
acp events listen --output <events file>
acp events drain --file <events file> --limit <n>
node tools/smartcitix_provider.mjs --job <event JSON file>
acp provider set-budget --job-id <jobId> --amount <priceValue> --chain-id <chainId>
acp provider submit --job-id <jobId> --deliverable "<deliverable>" --chain-id <chainId>
acp job history --job-id <jobId> --chain-id <chainId>
```

Check every deliverable for personal data before you submit it. There should never be any.

## 8. Tokenize — only after legal review

**Do not start this step until you have a written legal review.** Then follow acp-cli's `docs/tokenization.md` in full: it lists the prerequisites (an active agent, a signer, the venue's currency and gas) and every optional launch setting. Decide each setting with your advisers; this runbook recommends none. The base command (README, Tokenization):

```bash
acp chain list
acp agent use --agent-id <agentId>
acp agent tokenize --chain-id <chainId> --symbol <symbol>
```

The symbol you chose is shown in this repository as "$Citi"; whether it is passed with the leading sign is to verify against the official docs.

## 9. Afterwards

Record in `docs/virtuals/strategy.md` what you verified against the official docs and on which date, and any condition from the legal review — without figures, keys or addresses.
