# The ecosystem: where this platform meets SmartCiti.X and Cognition.X

This page sets out the seams between this repository (the WebXR safety-training platform, "the Holodeck") and its two sibling repositories. Console ECOSYSTEM wrote it in loop 10, round 7. Every claim below cites a file and a commit. The sibling repositories were read from read-only local clones and never changed:

| Repository | Commit read | Licence | What we may do |
|---|---|---|---|
| `agifuturefoundation/smartciti.x` | `398f287` (398f28703162f6989d5573019c986df727737cef) | **no licence file** | Code against its documented contracts and cite them. **Nothing of its code or data is copied here.** |
| `agifuturefoundation/cognition.x` | `47c1820` (47c18207bd2ef3295c66fac80aa7005bd8a7f6b9) | Apache-2.0 for code (`LICENSE`), CC BY 4.0 for content (`LICENSE-CONTENT`) | Commit a small, attributed extract of the content. |
| Router.X | none | none | **There is no Router.X repository.** The interface below is the one this repo would expect from it, and it is **not yet built**. |

## What each repository is, in its own words

- **SmartCiti.X** (`README.md` at 398f287): "SmartCiti.X : Trade Craft Academy — implementation bundle v3.2 … Gamified training to enhance robotic and human integrations. The Adaptive Stack: the packs implementing the ACP protocol suite (v3.2)". It is a zero-dependency Node and ESM bundle. Its packs are: the control plane (`control/`: the learner profile, the ZPD dial, the skill graph, the sequencer and gates); the message bus and telemetry (`bus/`); the mentor fabric (`fabric/`); the station, lesson and agent registries (`stations/`, `lessons/`, `agents/`); security; ops; and brand and i18n. They are checked by `./verify_all.sh`, which reports "1,594 checks, all passing … with no model credentials required".
- **Cognition.X** (`README.md` at 47c1820): "an open curriculum system built from small, verifiable units called **blocks**. A block names one thing a learner can do, at one grade band, and pairs it with a **transfer check**". Blocks roll up into themes, tracks, credentials and packs. The dataset is `data/blocks.csv`: 17,450 blocks in 47 packs, described in `data/schema.md`. The repository also carries single-file apps, among them the Trades Network (`apps/trades-network/`, built from `data/unions/trade_unions.json`). It is checked by `python3 tools/validate_blocks.py` and `python3 tests/test_platform.py`.
- **This repository** (`README.md`): the WebXR training platform. It has stations under `WebXR/smartcity/` and `WebXR/trades/`, packs under `WebXR/packs/`, the robotics programme (`WebXR/shared/rp-programme-data.js`), the VBRIDGE governor (`vb-governor.js`), the Omega Hive (`oh-hive.js`), the robot arena (`ra-arena.js`) and DATAWORKS consent (`dx-data.js`). Its checkers live in `tools/check_*.mjs`.

## The seams

The table counts the seams. Each one has a section below that gives the shape on both sides.

| # | Seam | SmartCiti.X side (398f287) | Cognition.X side (47c1820) | This repo | Status |
|---|---|---|---|---|---|
| 1 | Learner profile | `control/lpa.mjs` `LearnerProfile(learnerId)`, `newSkillState(skillId, { theta, sigma, bkt })` | none | `WebXR/shared/competency.js` (`MASTERY`, `RUBRIC`), `passport.js`, `dx-data.js` consent | documented, not wired |
| 2 | Skill graph | `control/graph.mjs` `SkillGraph`, `TRANSFER`, `INTERFERENCE`; `control/README.md` (ACP-15) | blocks: `theme` × grade band, `transfer_check` | `skill-registry.js`, `rp-programme-data.js` `RP_TRACKS` levels | blocks bridged (seam 6) |
| 3 | Bus | `bus/bus.mjs` `TOPIC_OWNERS`, `SCHEMA_VERSION` "1.0.0", message `{ topic, role, schema_version, event_id, payload }` | none | **`WebXR/shared/eco-bus.js`** (new) | **adapter built, local only** |
| 4 | Telemetry and audit | `bus/telemetry.mjs` `envelope()`, `VERBS`, `MAX_CLOCK_SKEW_MS`, `MIN_USABLE_EVENTS`, `toXapi()`; `bus/audit.mjs` `AuditLog.append()` | none | `eco-bus.js`; `WebXR/shared/lrs.js` (xAPI) | **adapter built, validated** |
| 5 | Agents registry | `agents/registry/{advisors,crews}.json` (`contract`, `honesty`, `standing`) | Flow Hub agents (`apps/flow-hub/`) | `agents/smartcitix/agent.json`, `agents/foreman/agent.json`, `oh-hive-data.js` `OH_AGENTS` | documented |
| 6 | Stations and lessons | `stations/registry/stations.json` (25 stations: `station_id`, `skill_id`, `strand`, `tier`, `lesson`, `checklist`, …), `lessons/registry/lessons.json` | blocks per pack: Trade School, Robotics OS | `WebXR/packs/*.json` `stationNames`, `WebXR/smartcity/catalog.json` | **blocks bridge built** |
| 7 | Grade band | none | `grade`, `level` (K–2 … 11–12, "11–12 · adult") | adults-only rule (DATAWORKS), the K-12 apps | **enforced in the bridge** |
| 8 | Transfer check | `control/gates.mjs` (assessment gates) | `transfer_check` per block | the instructor console's sign-off (`tracking.js`) | shown read-only |
| 9 | Trades network | `unions/` (roster, halls) | `data/unions/trade_unions.json`, `apps/trades-network/` | `WebXR/packs` kind "union" (`unions`, `unionLine`) | documented, not wired |
| 10 | Router.X | none | none | the expected interface below | **absent: not yet built** |
| 11 | Flow orchestration (FlowHub) | none | `apps/flow-hub/` (built from `data/blocks.csv` by `tools/build_flow_hub.py`; a blocks browser and flow engine) | `WebXR/shared/flowhub.js` (flow schema, platform protocol 2), `docs/flowhub.md` | documented; the two do not speak each other's protocol yet |

**Seams documented: 0 → 11**, each with its sources.

### 1–2. Learner profile and skill graph

- **SmartCiti.X.** `LearnerProfile` holds a `Map` of skill states. Each state has `theta`, `sigma`, BKT mastery and decay (`control/lpa.mjs`, ACP-02). `SkillGraph` propagates credit along `TRANSFER` edges and flags `INTERFERENCE` (`control/graph.mjs`, ACP-15). A window with fewer than three usable events makes no update (`bus/telemetry.mjs`).
- **This repo.** Competency is scored per station against `competency.js`'s `MASTERY` and `RUBRIC`. The robotics programme's ladder is `RP_TRACKS[].levels`. Human data is collected only under DATAWORKS consent (`dx-data.js` `dxEligibility`: adults who have opted in, never K-12, demo or signed-out users; local only; revoking consent deletes).
- **The seam.** A station's id is the `module_id` the adapter sends, and its skills are `skill_ids`. SmartCiti.X's profile would be the consumer. It is not wired here: no profile state crosses.

### 3–4. Bus, telemetry and audit (the adapter)

`WebXR/shared/eco-bus.js` `ecoBus({ consent, clock, sessionId })` emits the following:

| This repo's event | SmartCiti.X shape | Topic / role |
|---|---|---|
| A learner's station event (`start`, `step-ok`, `step-wrong`, `hint`, `complete`, `fail`, `pause`, `resume`, `quit`, `control`) | ACP-01 envelope `{ event_id, ts, clock_skew_ms, ts_source, learner_id, session_id, context{ module_id, skill_ids, difficulty, modality, device_tier, scaffold_level }, verb, payload }`, inside a bus message `{ topic, role, schema_version, event_id, payload }` | `telemetry.event` / `client` (its single permitted writer in `TOPIC_OWNERS`) |
| A VBRIDGE governor decision (`allow-sim` / `refuse`, with reasons) | `AuditLog` entry `{ seq, ts, actor: "governor", action: "governor.<decision>", before, after, why, learner: null, skill }` | none at 398f287 (proposed in the SmartCiti.X brief) |
| An Omega Hive event (`speak`, `move`, `bid`, `award`, `dispatch`, `refused`, `approval-request`, `complete`, `mood`) | audit entry, `actor: "software-agent:<id>"`, `action: "hive.<type>"` | none (proposed) |
| An arena result (model, scenario, k of n, interval) | audit entry, `actor: "arena"`, `action: "arena.result"`, `after.physical: 0` | none (proposed) |

The adapter keeps SmartCiti.X's guards as written there. It dedupes on `event_id`. Past two minutes of clock skew it trusts the receipt time (`ts_source: "server"`). A missing modality becomes `"quiz"`. Fewer than three usable events means no profile update. Affect labels never reach an export (ACP-08). This repo's DATAWORKS rules apply on top. A learner event is emitted only for an eligible session: signed in, not demo, not K-12, adult attested and opted in. The learner id must already be a pseudonym. Affect, mood, name and free-text fields are stripped. Revoking consent deletes every message held. **The adapter is local only.** It makes no request, writes no storage and sends nothing.

`tools/check_eco.mjs` validates every event against the documented shapes. When a read-only SmartCiti.X clone is present, it also pushes the messages through SmartCiti.X's real `Bus` (strict) and `extractSignals`, and the audit entries through its `AuditLog`. It imports those modules at run time from the clone and copies nothing.

### 5. Agents registry

SmartCiti.X keeps advisors and crews as JSON registries with `contract`, `honesty` and `standing` (`agents/registry/*.json`). This repo's agents are `agents/smartcitix/agent.json` (with `offerings/*.json`) and the Omega Hive roster `OH_AGENTS` (`oh-hive-data.js`). All of this repo's agents are labelled "software agent". The two registries are not merged. The SmartCiti.X brief proposes reading `OH_AGENTS` as one more crew, with the governor's refusal rules attached.

### 6–8. Stations, lessons and the Cognition.X blocks

- **Cognition.X.** A block is `{ block_id, pack, track, code, grade, level, credential, theme, description, transfer_check }` (`data/schema.md`). The adult bands are "11–12 · adult" and "9–12 · adult". Trade School (47 blocks) and Robotics OS (640 adult blocks) are the packs this bridge reads.
- **This repo.** The union and trade stations are the `stationNames` of every pack whose kind is "union" or "programme" with audience "trades" (`WebXR/packs/index.json`): 670 stations. The robotics programme's skills are its six tracks at the four adult levels (`RP_TRACKS`): 24 skills. The awareness / K-12 level is never mapped.
- **The bridge** (`WebXR/shared/eco-blocks.js`). The rules are declared in `ECO_RULES` (15) and `ECO_RP_RULES` (6). A station takes the first rule whose station pattern matches its id and name at word starts. That rule offers its packs' blocks in an adult band whose text matches the rule's block pattern. Candidates are ranked by shared words, with ties broken by block id, and the top three are kept. A school band can be admitted only by a rule that names it with a reason. No rule does.
- **Result** (`docs/ecosystem/blocks-match.json`): **stations mapped 214 of 670, robotics skills 24 of 24.** The 456 unmatched stations are listed with the reason; most are hospitality, dental, aviation cabin, basketball and civic stations that no rule covers. The extract (`WebXR/shared/eco-blocks-data.js`) holds 91 blocks in 73 KB. It carries this attribution: *"Blocks from Cognition.X (agifuturefoundation/cognition.x, commit 47c1820), licensed CC BY 4.0. Extracted, unmodified, by tools/eco_extract.mjs."*
- **Shown** read-only in the instructor console's **Ecosystem** tab: "next blocks for this skill", with each block's band, credential and transfer check.
- Rebuild the extract with `node tools/eco_extract.mjs [path/to/cognition.x]`. The output is deterministic, with no timestamps.

### 9. Trades network

Cognition.X's Trades Network has 222 union and trade entries in 6 regions (`data/unions/trade_unions.json`: `regions`, `families`). SmartCiti.X has its own union roster (`unions/`). This repo's union packs carry `unions` and `unionLine`. **Nothing is joined.** Joining them would put union names next to this platform's stations, and this repo's rules forbid naming unions or trade bodies in its content. The Cognition.X brief keeps any such join on the Cognition.X side.

### 11. Flow orchestration (FlowHub)

This repo's `WebXR/shared/flowhub.js` defines its side of a flow contract (`flow = { id, title, version, start, nodes, edges, meta? }`, node kinds `station | programme | brief | checkin | gate | external`, over the `smartcitix:*` platform channel, protocol 2). Its header says, written before the clone was read, that "no FlowHub specification exists in this repository". At 47c1820 Cognition.X ships `apps/flow-hub/`: a single-file app built from the blocks dataset (`tools/build_flow_hub.py`, compact payload `{ version, bands, levels, packs: [{ name, slug, kind, blocks, tracks, loose }] }`) with its own flow engine and agents. **Neither implements the other's messages.** The blocks bridge (seam 6) is the first shared key between them: a station id on this side, a `block_id` on that side. A Flow Hub node of kind `external` pointing at a station id is the natural join. It is left to the Cognition.X brief, and nothing here assumes Flow Hub's internals. Cognition.X also carries a pack named "SmartCiti.X : New Orleans Trades" (`NOLATRADES`, 250 blocks, school bands K–2 … 11–12 only). The bridge does not map to it, because it has no adult band and no rule states one.

### 10. Router.X: absent, interface not yet built

**No Router.X repository exists.** No clone exists, and none is referenced by either sibling at the commits read. If one is built, this repo would expect the following from it. **This interface is not yet built.** Nothing calls it, and `tools/check_eco.mjs` checks that this page keeps saying so:

```js
// Router.X — EXPECTED interface, NOT YET BUILT (no repository exists).
// route({ learner_ref /* a pseudonym, adults only */, skill_id, station_id?, band }) ->
//   { next: [{ kind: "station" | "block" | "lesson", id, why }], source: { repo, commit }, refused?: reason }
// Rules it would have to keep: no network call from this repo to it without an owner's configuration; refuse for K-12, demo
// and signed-out users; every route explained (the "Why this?" rule of SmartCiti.X's audit log).
```

## Loop briefs for the other repositories

`tools/briefs/ecosystem/` holds metaprompt briefs for loop agents that a session **with push access** could run in the sibling repositories. They are briefs only. This repository changes nothing in them.

- `smartcitix-adopt-bus-adapter.md` brings this repo's adapter shapes into SmartCiti.X's bus, with the proposed topics.
- `cognitionx-vr-station-links.md` adds a VR-station link to the blocks that this bridge matched.
- `ecosystem-loop-rules.md` gives the shared rules, seams, evals and checker commands both briefs use.

## Checks

`node tools/check_eco.mjs` checks the following:

- the extract's provenance and size;
- that the match rules are deterministic (re-match, shuffled input, and a byte-identical full re-extract when the Cognition.X clone is present);
- that no K-12 block reaches an adult path unless its rule states it;
- that every adapter event is valid (and accepted by SmartCiti.X's real modules when its clone is present);
- that 0 network calls are made;
- that Router.X is marked absent here.
