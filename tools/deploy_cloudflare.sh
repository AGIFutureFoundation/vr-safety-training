#!/usr/bin/env bash
# Deploy the flat build to Cloudflare (console EDGE, docs/deploy-cloudflare.md).
#
#     tools/deploy_cloudflare.sh              # dry run: prints every command the agent would run, runs nothing
#     tools/deploy_cloudflare.sh --apply      # executes, only with CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID set
#     tools/deploy_cloudflare.sh --domain train.example.org --apply
#
# This is the thin shell front of tools/deploy_agent.mjs. The account id and the token come only from the
# environment — nothing is read from a file, nothing is echoed, nothing is written here. Every other argument
# is passed through to the agent (--log, --branch, --skip-build, --skip-gate, --base).
set -euo pipefail
cd "$(dirname "$0")/.."

for name in CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID; do
  if [ -n "${!name:-}" ]; then echo "[cf] $name: present (from the environment)"; else echo "[cf] $name: absent"; fi
done

apply=0
for a in "$@"; do [ "$a" = "--apply" ] && apply=1; done
if [ "$apply" = 1 ] && { [ -z "${CLOUDFLARE_API_TOKEN:-}" ] || [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; }; then
  echo "[cf] --apply needs both credentials in the environment; printing the plan instead."
fi
[ "$apply" = 1 ] || echo "[cf] dry run — add --apply to execute."

echo "[cf] node tools/deploy_agent.mjs $*"
exec node tools/deploy_agent.mjs "$@"
