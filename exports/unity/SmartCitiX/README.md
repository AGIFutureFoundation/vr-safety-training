# SmartCiti.X Content Bridge (org.agifuturefoundation.smartcitix 1.0.0)

The SmartCiti.X ~Holodeck procedures, exported for a Unity runtime by `tools/export_unity.mjs` in the platform repository. The content stays authored in the WebXR modules; this package is generated from them and is never edited by hand.

## What is here

- `Content/stations/*.json` — 736 procedures: the ordered steps (kind, target, prompt, why), the hazards, the interruptions, the citations, the support line, the scene's hit ids and the equipment builders it places.
- `Content/programmes/*.json` — 61 curricula with their ladders, competencies and world anchors.
- `Content/worlds/*.json` — the Bay World and Fairway Park layout data (and the underwater world when it exists).
- `Content/index.json` — the file list, the nine step kinds and the pass rule.
- `Runtime/` — the assembly `SmartCitiX`: `StationCatalog` (loads the JSON), `StationRunner` (a MonoBehaviour state machine over the step kinds with the WebXR engine's scoring), `TrainingRecord` (the record shape the web apps write, with CSV and xAPI 1.0.3 output).
- `Models/*.glb` — the fleet and equipment builders as glTF binaries, with `Models/MANIFEST.json` naming every budget entry with its file or the reason it could not export.

## Import

1. In Unity 2021.3 or later, open **Window → Package Manager → + → Add package from disk…** and pick this folder's `package.json`; or copy the folder into your project's `Packages/`.
2. Copy `Content/` to `Assets/StreamingAssets/SmartCitiX/` (or keep it in the package and read it from `Path.Combine(Application.dataPath, ...)` in the editor).
3. Load and run:

```csharp
var catalog = SmartCitiX.StationCatalog.Load(Path.Combine(Application.streamingAssetsPath, "SmartCitiX"));
var station = catalog.Get("charge-point");
var runner = gameObject.AddComponent<SmartCitiX.StationRunner>();
runner.OnFeedback += f => Debug.Log(f.text);
runner.OnFinish += r => Debug.Log(r.ToRecord().ToJson());
runner.Begin(station);
// Wire your interactables' ids (station.hits) to runner.Select(id); hold/track to SetHolding;
// turn to Rotate; drag to DropAt; drive to DriveInput / DriveCheckDone.
```

The models import with Unity's glTF importer of your choice (glTFast or UnityGLTF). They are metres, +Z forward, +X the driver's side, y = 0 the ground; named child nodes are the parts a station animates.

## Pass rule

The same as the web apps: a run passes with **two or more stars and no unsafe action**. Three stars is a clean run inside par; two is at most one correction inside 1.5 × par. Missing or answering wrongly an interruption is an unsafe action.

## Licence

Content and code in this package are released under **CC0 1.0** by the AGI Future Foundation. Only content the platform owns or that is CC0, CC-BY or marketplace-licensed is ever exported: the fleet, equipment and tool models are the platform's own procedural builders. The ready-player avatar and the track GLB are not exported and must be licensed separately. No token, secret or model name is written into this export.
