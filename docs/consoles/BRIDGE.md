# Console BRIDGE — the Unity content bridge

Team: UNITY1 · Brief: `tools/briefs/unity-brief.md` (with `console-brief.md`) · Branch: `claude/vr-ar-safety-training-wkwmve`

Resume from this file alone: the exporter is `tools/export_unity.mjs`, the export lives under `exports/unity/SmartCitiX/`, the gate is `tools/check_unity_export.mjs` in `check_all`, the doc is `docs/unity.md`.

- 18:24 UTC · Fetched and fast-forwarded to the branch of record; read the briefs, `tools/lib/headless.mjs`, `eval_content.mjs`, `game.js`, `records.js`, `equipment.js`, `fleet.js`, `check_fleet.mjs`, `check_budget.mjs`, `check_all.mjs` · plan: (1) console, (2) `export_unity.mjs` content half (stations, programmes, worlds) read headlessly from both apps, (3) UPM runtime package with the four C# files, (4) glTF models through three r160's GLTFExporter with node polyfills, (5) checker in `check_all`, (6) `docs/unity.md`, hand-back · next: write the exporter.
