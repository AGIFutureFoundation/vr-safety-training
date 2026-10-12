# The ecosystem: SmartCiti.X and Cognition.X

Where this platform meets its sibling repositories, the blocks bridge and the bus adapter; Router.X is not a repository yet.

## Where the platform meets SmartCiti.X and Cognition.X

This platform has sibling repositories under the same organisation, SmartCiti.X (a trades-academy stack with a learner profile, a skill graph and a message bus) and Cognition.X (an open curriculum built from small verifiable blocks). This page is about the seams: where the shapes on each side meet. Both were read at a named commit, read-only. Nothing is wired into either of them, no partnership or endorsement is implied, and a third piece, Router.X, has no repository at all.

- 11 seams documented, each with the shape on both sides and the file that shows it `docs/ecosystem.md`

- 214 of 670 union and trade stations mapped to a Cognition.X block by declared rules, 456 unmatched and listed `docs/ecosystem/blocks-match.json`

- 24 of 24 adult robotics-programme skills mapped to blocks `docs/ecosystem/blocks-match.json`

- 91 blocks in the committed extract (73 KB, attributed, CC BY 4.0) `docs/ecosystem/blocks-match.json`

### The seams, one by one

11 seams, none to start with, each with its sources in `docs/ecosystem.md`. The sibling files are named in plain text because they are not in this repository; the commits read were 398f287 (SmartCiti.X) and 47c1820 (Cognition.X).

| Seam | SmartCiti.X side | Cognition.X side | This repository | Status |
|---|---|---|---|---|
| **Learner profile** | control/lpa.mjs | none | `WebXR/shared/competency.js`, `WebXR/shared/passport.js` | documented, not wired |
| **Skill graph** | control/graph.mjs | blocks by theme and grade band, each with a transfer check | `WebXR/shared/skill-registry.js`, `WebXR/shared/rp-programme-data.js` | blocks bridged |
| **Bus** | bus/bus.mjs | none | `WebXR/shared/eco-bus.js` | adapter built, local only |
| **Telemetry and audit** | bus/telemetry.mjs, bus/audit.mjs | none | `WebXR/shared/eco-bus.js`, `WebXR/shared/lrs.js` | adapter built, shapes validated |
| **Agents registry** | agents/registry | the Flow Hub agents | `agents/smartcitix/agent.json`, `WebXR/shared/oh-hive-data.js` | documented |
| **Stations and lessons** | stations/registry/stations.json | blocks per pack | `WebXR/packs/index.json` | blocks bridged |
| **Grade band** | none | grade and level, with adult bands | the adults-only rule for learner data | enforced in the bridge |
| **Transfer check** | control/gates.mjs | a transfer check on each block | the instructor console’s sign-off | shown read-only |
| **Trades network** | unions/ | data/unions/trade_unions.json | union packs under `WebXR/packs/` | documented, not wired |
| **Flow orchestration** | none | apps/flow-hub/, a blocks browser and flow engine | `WebXR/shared/flowhub.js`, `docs/flowhub.md` | documented; the platforms do not speak each other’s protocol yet |
| **Router.X** | none | none | the interface this repository would expect | absent: no repository, not yet built |

### The blocks bridge: stations mapped to blocks

A set of declared text rules, 15 for stations and 6 for the robotics programme’s skills, maps a station to the Cognition.X blocks of its pack in an adult band. The rules are plain text matches on the station’s id and name, so the same input always gives the same answer. The result, with every unmatched station listed and the reason: 214 of 670 union and trade stations (about 32%) and 24 of 24 adult robotics-programme skills. 6 skills of the programme are for a school-age band and are left out of the adult path. The committed extract holds 91 blocks (73 KB) under their CC BY 4.0 licence, with the source commit, the licence and the attribution line, and the instructor console shows them read-only as the next blocks for a skill.

Source: `docs/ecosystem/blocks-match.json` (its counts and provenance) and the console’s commit message.

### The bus adapter

`WebXR/shared/eco-bus.js` turns this platform’s learner events, governor decisions, hive events and arena results into the message and audit shapes that SmartCiti.X documents at commit 398f287, keeping that repository’s own guards as written there. It is local only: it sends nothing, and learner events are emitted only for a learner who has opted in, as the data terms require. `tools/check_eco.mjs` validates every event against the documented shape. It does so for 2,189 events (11 telemetry messages and 2,178 audit entries), which SmartCiti.X’s own modules also accept when run read-only, with 0 network calls.

### Loop briefs for the other repositories

3 briefs, in this repository’s metaprompt style, for a session that has push access to the sibling repositories: the shared loop rules, one brief that adopts the bus adapter in SmartCiti.X and one that adds a link from a Cognition.X block to a VR station. They are briefs only. Nothing in either repository is changed, and this repository cannot push to them. Source: `tools/briefs/ecosystem/`.

### Read honestly

- **Documented, mostly not wired.** The bus adapter and the blocks bridge are built and checked locally. No learner profile, event or block crosses into either sibling repository, and nothing here changes them.

- **Licences.** SmartCiti.X has no licence file, so nothing of its code or data is copied: this repository codes against its documented contracts and cites the file and commit. Cognition.X is licensed Apache-2.0 for code and CC BY 4.0 for content, so a small attributed extract of its content is committed.

- **The match is rule-based and partial.** Most stations are not matched: hospitality, dental, cabin and sports stations, among others, are not covered by any rule. A matched block is a suggestion for an instructor to read, not a verdict about a learner.

- **Router.X is absent.** No repository exists for it. The interface this repository would expect from it is written down and marked not yet built.

**Round seven ** of this loop is merged; its figures were read from the console branches with a read-only git show: `ECOSYSTEM` (branch head `da7cdd84`, 6 commits of its own; its console note is committed; merged). Each figure is checked against a committed file or a commit message, and a rebuild re-reads the final state.

Sources: `docs/ecosystem.md`, `docs/ecosystem/blocks-match.json` and the console’s commit messages, read from its branch with git show.

### Round 8: `ECOSYSTEM-2`, the ecosystem behind consent

Round 8: `ECOSYSTEM-2`, tip 5641ee4d (read at the merged head 112a4d68), 4 commits of its own since a10f1ff8, merged into the head of round 8, 112a4d68; its console note is committed, and the table below is that note’s own. Each figure is a token of the commit message or note row it is quoted from, checked when this page is built.

- the Ecosystem tab's built-page drive is check_eco leg 7 ()

- 13 declared adult-band rules, stations mapped 214 → 285 of 670 ()

- station events into the in-memory eco-bus adapter, only under DATAWORKS consent ()

- console note, memory and the next brief ()

| Eval | Before | After | Source |
|---|---|---|---|
| Tab drive in the built page | measured once by hand | a checker leg: 309 options (238 before the new rules), electrical blocks as the extract, 0 page errors, 0 requests and 0 storage writes after the click | check_eco 7 |
| Stations mapped | 214 of 670 | 285 of 670 (385 unmatched, listed with the reason); round-7 rows unchanged (214 of 214) | check_eco 1, 2, 2b; docs/ecosystem/blocks-match.json |
| Extract | 91 blocks, 73.0 KB | 157 blocks, 114.8 KB (limit 200 KB), all in an adult band | check_eco 1, 3 |
| eco-bus events from a real opted-in session | 0 (no page loaded the adapter) | headless real Session: 5 of 5 valid, also accepted by SmartCiti.X's real Bus; built page: 2 of 2 valid | check_eco 8, 9 |
| Events held for K-12, demo and signed-out (and not opted in) | n/a | 0, 0, 0 (and 0), headless and in the built page | check_eco 8, 9 |
| Held after revoke | n/a | 0 (6 → 0 headless, including a run in progress; 2 → 0 in the page once consent is removed) | check_eco 8, 9 |
| Network calls | 0 | 0 | check_eco 5, 8 |
| Fixture lines valid | none | not done (left) | |
| check_eco with and without the clones | 7 of 7 (round 7) | 10 of 10 passed with the clones; 9 passed and 1 skipped (2b) with ECO_SIBLINGS=/nonexistent | node tools/check_eco.mjs; ECO_SIBLINGS=/nonexistent node tools/check_eco.mjs |

Source: `docs/consoles/ECOSYSTEM-2.md` at the merged head 112a4d68, the evaluation table as the console wrote it (before → after, with its sources).


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `709cd68e`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
