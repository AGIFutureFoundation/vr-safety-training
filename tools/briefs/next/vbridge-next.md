# VBRIDGE — next

1. K-12 station "Who is allowed to tell a robot what to do" (awareness level, no data, no fear framing), registered in RP_K12.
2. Panel: offer a COLEARN behaviour-cloning provider through `policyFor` (registered via ENTERPRISE-3 so its lineage is real),
   and show the governor's chain lines inline.
3. Governor: a per-client rate limit and a repeated-refusal flag (an agent re-sending refused jobs), both enumerated and tested.
4. Regenerate `guide-kb.js` so the Guide can answer from docs/virtuals-bridge.md.
5. A deployment proxy reference (server side, outside the public bundle) that maps acp-proxy descriptors to the ACP SDK, with its
   own key handling, only after review; keep the browser descriptor-only.
