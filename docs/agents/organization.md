# The console organisation — how this repository's agents work as a team

The platform is built by a coordinator and a rotating set of **consoles**: named agents (SUMMIT, REDWOOD, ENTERPRISE,
PROVING, PARISH, TILL, EDGE …), each with a brief, a prefix, a port, a log, a memory file and a hand-back. This page
is the organisation's charter: who decides what, how work is assigned, how it comes back, and which surfaces carry it.
It describes the SmartCiti.X side only; nothing here is a specification of any external agent platform.

## Roles
- **Coordinator** (one session): writes the run brief, opens consoles, merges through the gate, publishes the report,
  keeps `docs/consoles/COORDINATOR.md`. It never edits a console's files while the console runs.
- **Console** (one agent, one worktree, one branch): owns the files its section names, its checker, its log
  `docs/consoles/<CONSOLE>.md`, its memory `docs/consoles/memory/<CONSOLE>.md` and its next-phase brief
  `tools/briefs/next/<console>-next.md`. A console's authority ends at its section; anything else is a note to the
  coordinator in its log.
- **Gate** (`tools/check_all.mjs`): the only reviewer. Nothing reaches the shared branch until the suite ends in
  `All N checkers pass`. A console adds a checker with every feature; the gate grows with the platform.

## Work assignment — the brief is the ticket
A run brief (`tools/briefs/<run>-brief.md`) binds a set of consoles: shared rules, a shared data contract when two
consoles must meet in the middle, and one numbered section per console with deliverables and the checker that proves
them. A console reads, in order: `console-brief.md`, the run's shared rules, its predecessor's memory, its
predecessor's log's last twenty lines, its predecessor's next brief, then plans in its own log before code.
**Metaprompting** closes the loop: every console leaves the brief for the console that follows it, with the measured
numbers that justify it, so the next run opens with its tickets already written by the agents that know the ground.

## Decisions
- A console decides anything inside its section; it records the decision and its reason in its log.
- Two consoles that must agree (a schema, a hook, a route contract) each write the contract into their log within the
  first ten minutes; the coordinator reconciles at the first heartbeat; the brief's printed shape wins a dispute.
- The coordinator decides merge order, what a heartbeat reports, and when a console's partial work is merged, resumed
  or discarded. A discarded branch is recorded in the coordinator log with the reason.
- Nobody decides facts: the facts rule (`tools/briefs/frontier-brief.md`) forbids invented numbers, limits, dates and
  names; a source line or nothing.
- Money and safety: no learner ever pays; organisation billing runs under a policy with a ceiling and a human
  approval threshold (`docs/payments.md`); no violence, no gambling, no loot boxes.

## Communication and hand-back
- **Logs** are the primary channel: a console writes what it is doing and why; the coordinator reads them at each
  heartbeat and can message a console mid-run (scope additions, a merged batch to pull, a warning).
- **Heartbeats** every thirty minutes: merge what is ready through the gate, publish a report page with a video,
  tell running consoles when a batch merged so they merge origin (keep both sides; check every touched file).
- **Hand-back** within the brief's window, ≤200 words: commit hashes, counts, the exact final `check_all` line (or
  the single checkers run if the suite did not finish), what is left. A hand-back is not a merge; the gate is.
- **Identity**: every commit under the Anthropic identity with the session's trailer lines; the coordinator rewrites
  the unpushed range if a console commits under anything else.

## Surfaces
- **The repository** carries the work: branches, worktrees, logs, memory, briefs, the report pages.
- **The run page and the report** carry the run's tracking for people: `docs/consoles/<RUN>-RUN.md` holds the
  per-console checklist the coordinator updates at each heartbeat; the published report page carries the same state
  with a video. GitHub Issues are disabled on this repository (the API answers 410), so an issue cannot be the surface;
  a pull request for the branch could be, when the owner asks for one — its description would hold the checklist and
  its comments the decisions.
- **Slack, Linear and similar tools** are configuration points, not implementations: a deployment that wants the
  heartbeat and hand-back posted to a channel or a project points an adapter at them (the shape of
  `WebXR/shared/agent-protocols.js`: `describe`, `offer`, `deliver`, `status`). No such adapter is wired here and no
  vendor is named as integrated.

## Memory
A console's memory file is the organisation's institutional knowledge: what broke, the fix, the convention learned.
It is read first by the next team at that console and never rewritten from scratch — appended, then pruned of what
no longer holds. The coordinator's log is the organisation's minute book.
