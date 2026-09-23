# Documentation index

Every page under `docs/`, one line each. Pages marked *generated* are written by a tool and are never edited by hand; the command that rewrites each one is named beside it.

## Overview and white papers

| Page | What it is |
|---|---|
| [product-overview.md](product-overview.md) | What SmartCiti.X is in one paragraph, the editions with their station counts, the feature list grouped by layer, the stack in one table, the deployment options, and what is verified against what is only asserted. Every number named to its source file. |
| [whitepaper/SmartCitiX-Whitepaper-v2.md](whitepaper/SmartCitiX-Whitepaper-v2.md) · [.html](whitepaper/SmartCitiX-Whitepaper-v2.html) | The white paper, second revision (2026-09-23, end of day): executive summary, the problem, the current version at 316 procedures and 29 programmes including the ladder layer, the homepage and sign-in, the scenic districts and the five newest editions, the stack, compliance posture, roadmap, forty questions and answers, a letter to investors, and appendices. The HTML is self-contained beside `whitepaper/figures/`. |
| [whitepaper/SmartCitiX-Whitepaper.md](whitepaper/SmartCitiX-Whitepaper.md) · [.html](whitepaper/SmartCitiX-Whitepaper.html) | The first revision, written earlier the same day at 235 procedures and 24 programmes; kept in place for the record. |

## Status and series

| Page | What it is |
|---|---|
| [STATUS.md](STATUS.md) | The dated build log: live totals (stations, categories, programmes, checkers, corpus mean, standards), then one section per wave with its stations and eval scores, the checkers added, the pages to read, screenshots and what failed first. Its totals are those of the 225-procedure roster; the catalog and `node tools/check_all.mjs` are the current source. |
| [wiki/SmartCitiX-Training-Series.md](wiki/SmartCitiX-Training-Series.md) | *Generated* (`node tools/gen_wiki.mjs`). Every training programme with its union, certifications, station table (conditions, steps, interruptions, eval score, why each station is in the programme) and a spawn screenshot per station. |

## Assurance

| Page | What it is |
|---|---|
| [compliance/README.md](compliance/README.md) | What an enterprise training office needs before running the platform: how a procedure is assured before it ships, what records exist, and the rules for real sites, consent, licensed assets and accessibility. |
| [compliance/compliance-matrix.md](compliance/compliance-matrix.md) | *Generated* (`node tools/gen_compliance.mjs`). Every procedure with the standards its own text cites, every standard with the procedures that carry it, and the stations citing fewer than two. |
| [standards/README.md](standards/README.md) | *Generated* (`node tools/check_standards.mjs --docs`). The standards registry: every standard, code and union programme taught against, by body and by programme, with its scope and whether the citation form is verified. |
| [proof-of-training.md](proof-of-training.md) | The mastery rule, the 34 competencies and the standards they evidence, the Proof tab, the CSV, badge and printed exports, and the scoring rubric. |

## Running it

| Page | What it is |
|---|---|
| [controls.md](controls.md) | Keyboard presets, the gamepad mapping and the voice grammar: one action table for every input, and the two rules the input checker enforces. |
| [devices.md](devices.md) | The 33 head-worn devices and six run profiles, what each device record carries, the three procurement questions the app cannot answer, a pilot short list and how to test a device. |
| [instructor-console.md](instructor-console.md) | The instructor console: its three views, what each control does to a learner's session, what is logged where, the relay for a networked class and the observer protocol. |
| [ei-guide.md](ei-guide.md) | The guide's emotional-intelligence layer: what it says after a hazard, a repeat or a missed interruption, and the unscored end-of-run check-in. |
| [robot-training.md](robot-training.md) | The dental block as a robot training simulator: the embodiment schema, keep-out volumes, force classes, off-limits steps, the dataset layout and how to run an episode. |

## Unity prototype

| Page | What it is |
|---|---|
| [modules/xr-immersive-lab.md](modules/xr-immersive-lab.md) | Curriculum for the Unity build's Immersive Lab module: XR headset safety — play-space clearance, tethers, AR route separation, hygiene and comfort handover — with objectives, layout, script, assessment and sources. |
| [images/](images/) | The captures and the mechanics diagram the top-level README embeds for the Unity build. |

## Screenshots

`screenshots/` holds the images the pages above embed, by subject: `smartcity/` (one spawn view per SmartCiti.X station, named `<station-id>_spawn.png`, plus the sample-environment view), `avatars/` (crew figures before and after, the hub guide), `console/`, `controls/`, `devices/`, `proof/` and `robot/`.

## Where the rest lives

The apps' own READMEs are beside the code: [`../WebXR/README.md`](../WebXR/README.md), [`../WebXR/smartcity/README.md`](../WebXR/smartcity/README.md), [`../WebXR/trades/README.md`](../WebXR/trades/README.md), [`../WebXR/ACCESSIBILITY.md`](../WebXR/ACCESSIBILITY.md) and [`../WebXR/assets/env/README.md`](../WebXR/assets/env/README.md) for the asset licence rules. The briefs the build loop and the station teams work from are under [`../tools/briefs/`](../tools/briefs/). The practitioner review packet is generated at [`../WebXR/smartcity/REVIEW.md`](../WebXR/smartcity/REVIEW.md). The Unity prototype's status is [`../STATUS.md`](../STATUS.md).
