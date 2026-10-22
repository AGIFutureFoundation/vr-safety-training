# Robot training job on an hourly GPU instance (Akamai Cloud)

Console AKAMAI. Script: `deploy/akamai/ak-robot-train.mjs`. Deploy page: `docs/deploy-akamai.md`.

**The plain statement first: this job has never run.** No account, token or instance existed when it was written,
and the API host was not reachable from the session that wrote it. Nothing below reports a result, a timing, a price
or a region. The script is a dry run by default and does nothing without `LINODE_TOKEN`, every `AK_TRAIN_*` name
below and the explicit `--apply` flag; `tools/check_deploy_akamai.mjs` proves the dry run calls nothing.

## What the job does

| # | Step | What happens | What stops it |
|---|---|---|---|
| 1 | preflight | `LINODE_TOKEN` and every `AK_TRAIN_*` name present; the declaration file committed and unmodified; `tools/arena_eval.mjs` in the tree | any name absent → prints the plan, exits 0, nothing runs; a declaration problem → exits 1, nothing created |
| 2 | declare | appends `{ declarationSha256, protocol, commit, started, label }` to `deploy/akamai/runs.jsonl` **before** anything is created | — |
| 3 | provision | `POST https://api.linode.com/v4/linode/instances`: type `$AK_TRAIN_TYPE`, region `$AK_TRAIN_REGION`, image `$AK_TRAIN_IMAGE`, the public key from `$AK_TRAIN_SSH_PUBKEY`, tag `smartciti-x-robot-train`, a one-time root password generated in memory and never written | a non-2xx answer → step 7 |
| 4 | wait | `GET …/linode/instances/<id>` until `status` is `running`, then `ssh … true` until it answers | 15 minutes to running, 5 to ssh → step 7 |
| 5 | run | installs the pinned Node.js release from nodejs.org, receives the exact commit by `git archive` over ssh (no repository credential on the instance), runs `node tools/arena_eval.mjs --quiet` under `timeout $AK_TRAIN_MAX_MINUTES` | a non-zero exit is recorded, then steps 6 and 7 |
| 6 | collect | `scp` of `docs/evals/arena.json` to `deploy/akamai/out/<declaration sha256, first 12>/arena.json`, with `run.json` (commit, declaration, remote command, exit code, start and end times, type and region names) | — |
| 7 | destroy | `DELETE …/linode/instances/<id>` in a `finally` block, whatever happened, then a `GET` that must answer 404 | a failed destroy exits **2** and prints the instance label to delete by hand in Cloud Manager |

`tools/arena_eval.mjs` is ROBO-ARENA's tool (round 6b): every model family, including the small language-conditioned
model it trains (`WebXR/shared/ra-lm.js`), runs the same scenarios on the declared held-out seeds through the VBRIDGE
governor. Simulated robots only; the governor's rules stand (e-stop first, the physical path disabled); nothing on the
instance reaches hardware, a wallet or a learner's data — consented takes stay on the learner's device and are not in
the archive.

## The declared-protocol rules, enforced

- **Declared before it runs.** The job takes `--declaration <file>` (default `docs/evals/arena-declared.json`) and
  refuses a file that is missing, not committed, or modified since the last commit. `tools/arena_eval.mjs` refuses on
  its own if the code's models, scenarios, seeds or model settings differ from the declaration.
- **Fixed held-out seeds.** The seeds are the declaration's; the job passes no seed of its own.
- **Run once.** The declaration's sha256 is written to `deploy/akamai/runs.jsonl` before the instance exists, so a
  failed or interrupted run still counts; a second `--apply` on the same declaration is refused. A declaration whose
  `protocol.version` already has committed results in `docs/evals/arena.json` is refused too: those held-out seeds
  were measured once already (round 6b measured `ra/1` on seeds 7121–7180). A new GPU run needs a new declaration
  with a new version and new held-out seeds, committed first.
- **Reported whatever it scores.** The copied-back JSON is the result. The job never overwrites
  `docs/evals/arena.json`; the owner reads `deploy/akamai/out/<sha12>/` and commits it with a note, whatever it says.

## Why a GPU instance, honestly

Today's arena and the small model are plain Node.js and use no GPU: on the instance they run on its CPUs. The job is
written for an hourly GPU plan because the next, larger robot model is meant to train there; until that model exists,
the owner may set `AK_TRAIN_TYPE` to any plan `--discover` lists. Hourly plans bill while the instance exists, which
is why step 7 runs in a `finally` block and why `AK_TRAIN_MAX_MINUTES` bounds the remote run. This page names no
price: see the provider's current pricing page before running.

## Environment, by name

| Name | What | Where it comes from |
|---|---|---|
| `LINODE_TOKEN` | personal access token, **Linodes: read/write** only | Cloud Manager → API Tokens; a separate token from the read-only one the MCP server uses |
| `AK_TRAIN_TYPE` | instance type id | `node deploy/akamai/ak-robot-train.mjs --discover` (read-only; prints what the API lists) |
| `AK_TRAIN_REGION` | region id where that type is offered | the same listing |
| `AK_TRAIN_IMAGE` | image id (an Ubuntu LTS image) | Cloud Manager's image list |
| `AK_TRAIN_SSH_PUBKEY` / `AK_TRAIN_SSH_KEY` | paths to a key pair made for this job | `ssh-keygen -t ed25519 -f ~/.ssh/ak-train` |
| `AK_TRAIN_MAX_MINUTES` | optional, default 120 | — |
| `AK_TRAIN_NODE_VERSION` | optional, default 22.11.0 | — |

## Running it

```sh
node deploy/akamai/ak-robot-train.mjs                    # the plan; calls nothing
LINODE_TOKEN=… node deploy/akamai/ak-robot-train.mjs --discover          # read-only listing of types and regions
export LINODE_TOKEN=… AK_TRAIN_TYPE=… AK_TRAIN_REGION=… AK_TRAIN_IMAGE=… AK_TRAIN_SSH_PUBKEY=~/.ssh/ak-train.pub AK_TRAIN_SSH_KEY=~/.ssh/ak-train
node deploy/akamai/ak-robot-train.mjs --apply --declaration docs/evals/arena-declared-v2.json --log deploy/akamai/out/run.log
```

The `…` are typed into the shell from a password manager, never into a file in the tree; the network allowlist needs
`api.linode.com` (the API), `nodejs.org` (from the instance) and ssh to the instance's address.
