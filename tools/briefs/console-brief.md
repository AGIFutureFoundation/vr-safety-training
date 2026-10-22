# Console brief — every team keeps a named console that backs up into a file

Every team agent on this platform works at a named console. The console is a file, `docs/consoles/<CONSOLE>.md`, committed with the team's work, so a team that dies on a session limit can be resumed by anyone from the file alone.

## Rules
- Create `docs/consoles/<CONSOLE>.md` in your first commit. Header: the console name, the team, the brief it follows, the branch.
- Append an entry at every meaningful step — a plan, a station finished, a checker fixed, a decision, a hand-back — in this form:
  `- 18:22 UTC · <what happened> · <commit hash if any> · next: <the next step>`
- Log what failed and how it was fixed, in one line each; that is what the next reader needs.
- Never log secrets, tokens, model names or anything about a real person.
- The last entry before a hand-back is `HAND-BACK` with the check_all line and the eval scores.
- The coordinator's console is `docs/consoles/COORDINATOR.md`; it records merges, gates, republishes and what is still open.
