# VR Safety Training Explorer

Unity 6 + OpenXR prototype for exploring multiple safety-training sites and talking with Microsoft Rocketbox NPCs. The experience contains six workplace zones in one continuous campus:

![Chemical hands-on safety training with PPE and mission HUD](docs/images/chemical-hands-on-ppe.png)

## Training mechanics at a glance

![Safety-training mechanics workflow](docs/images/mechanics-workflow.svg)

The assessment engine owns hazards, action order, completion, and scoring. The NPC coach provides grounded, role-aware explanations and natural chat interaction without changing the deterministic training outcome.

## In-game documentation captures

| Training hub | Electrical safety coach |
| --- | --- |
| ![Five-module training hub](docs/images/training-hub.png) | ![Electrical coach dialogue and protected cable-crossing task](docs/images/electrical-coach-dialogue.png) |

- Construction: fall protection and blocked-access hazards
- Warehouse: spill and vehicle-route hazards
- Fire response: extinguisher access and evacuation hazards
- Chemical processing: solvent storage, labeling, and eyewash access
- Electrical maintenance: energized-panel lockout and protected cable crossings
- Immersive lab: XR headset safety — play-space clearance, tether management, AR route separation, hygiene and comfort handover ([module curriculum](docs/modules/xr-immersive-lab.md))

Each site contains two real hazards and two controlled look-alikes. Nothing is labeled or colored as a hazard before inspection. A correct identification earns 100 points; the first selection of a safe condition costs 25 points; repeats do not change the score. The deterministic training engine owns completion and scoring. The language model only produces grounded NPC coaching, so a model response cannot change the correct answer or score.

Six bright route lanes and portal pads move the learner across a continuous walkable ground plane; each site can also be entered directly through its portal. A startup grounding guard prevents the XR rig from dropping before locomotion is initialized. Each Rocketbox coach cycles through inspection guidance, progress-aware hints, control explanations, and a score-neutral debrief. Inspection events are written as JSONL under Unity's persistent data folder without learner identity or raw conversation text.

## Run the completed prototype

Run `Builds/Windows/VR-Safety-Training.exe`, or open this folder with Unity `6000.0.75f1` and play `Assets/SafetyTraining/Scenes/SafetyTrainingExplorer.unity`. The generated scene already contains the XR Origin, controller interaction, six sites, HUD, portals, hazards, and Rocketbox coaches. `Safety Training > Build Prototype Scene` regenerates it.

The scene supports WASD movement, right-mouse look, and mouse selection as a desktop fallback. In VR, inspection targets, coaches, and site portals use `XRSimpleInteractable` selection. Green and amber colors appear only after a learner makes a selection. The HUD uses a compact dark field-ops panel with site header, score, and wrapped feedback text.

## Construction practical

Construction Site is the hands-on lead scenario. Students complete a deliberately ordered five-step control loop by grabbing marked props with an XR controller (or clicking them in desktop fallback): pick up the PPE kit, set the exclusion barricade, install the guardrail kit, move the material cart to staging, and complete the final walkdown with the clipboard. Out-of-order actions produce an immediate HUD sequence cue; completed actions turn green and award a 20-point practical bonus. The sequence is repeat-safe and ends with a coach debrief prompt.

The construction pass uses authored multi-part model assemblies rather than single placeholder blocks: scaffold uprights/crossbars/decks/base jacks, PPE case contents and latch, barricade feet/posts/striping, rail-kit base plates/uprights, cart handle/wheels, and clipboard clip.

The site is also dressed with downloaded Poly Haven CC0 assets: a hand truck, sectioned ladder, cement bag, drill, and industrial barrel. Source attribution and local files are tracked under `Assets/ThirdParty/PolyHaven/`.

Rocketbox coaches now run an idle behavior loop: subtle body sway/weight shift for generic rigs, timed field-pointing and explanation gestures where humanoid bones are available, head motion during conversation, and a separate talking pose so chat interaction does not snap the NPC back to the default pose.

Environment lighting uses a warm directional sun with soft shadows, site work lights, tri-light ambient color, linear distance fog, a procedural sky, and one baked reflection probe per workplace. The baked probes avoid the GPU/headless instability of realtime cubemap updates while preserving stable VR performance.

Click any Rocketbox coach to open the live chat panel. Students can type a question and press Enter/Send; the coach answers through the configured OpenAI-compatible endpoint, with a grounded offline fallback when the endpoint is unavailable. Conversation context is retained for the active coach, while authored safety facts and deterministic scoring remain authoritative.

## Immersive lab module

Module 06 turns the delivery medium into the subject: the learner inspects a working XR bay and
controls what makes headset use unsafe. Two hazards (an equipment case left inside an active
room-scale boundary, and an AR walkthrough route crossing a powered equipment lane with no
barrier or spotter) sit beside two controlled look-alikes (an overhead-managed tether and a
stocked hygiene and comfort station). The practical is a three-step control sequence: clear the
play space, separate the AR route, and record the headset readiness sign-off. Objectives,
layout, facilitator script, comfort/stop rules, assessment thresholds, and sources are in
[`docs/modules/xr-immersive-lab.md`](docs/modules/xr-immersive-lab.md).

## Trade Skills Simulator (multi-trade demo)

`WebXR/trades/` is a seven-room vocational demo built on the same assessment
contract: **Isolation Bay** (electrical lockout/tagout and live-dead-live),
**Colour Studio** (hair stylist colour service and sanitation), **Hot Line**
(commercial cook: cross-contamination, cook temperature, grease flare-up),
**Draw Station** (phlebotomy two-identifier check and order of draw),
**Weld Bay** (hot work permit, lens shade, bead control, fire watch),
**Deploy Bay** (platform engineer / SRE: environment promotion, agent
permission scoping, canary-gated rollout), and **Rough-In Bay** (plumber /
pipefitter: DWV rough-in, backflow prevention, torch brazing, pressure test).
Each room is a distinct 3D environment with animated equipment, seeded hazard
traps, graded skill gauges, timed holds, combo scoring, stars, badges and
persistent XP.

Run the modular source over HTTP from `WebXR/trades/`, or deploy the generated
single file `WebXR/trades/dist/trade-skills-simulator.html`. `?room=<id>` deep
links a single trade. Build it with `python3 tools/bundle_webxr.py trades`;
check the content with `node tools/check_trades.mjs`. Details in
[`WebXR/trades/README.md`](WebXR/trades/README.md). It shares one apprentice
profile (level, XP, badges) with its sibling app `WebXR/smartcity/` — see
that README's "One profile, two apps" section.

## WebXR training network

Trade Skills Simulator is one of four independent WebXR apps under `WebXR/`. The other
three: **SmartCiti.X** (`WebXR/smartcity/`, 20 more union-trade AR/VR simulators — crane
operator, tower climber, lineworker and more — sharing the same apprentice profile as Trade
Skills Simulator), **Holodeck** (`WebXR/holodeck/`, a prompt-driven generator that builds a
scored safety-training procedure from a spoken or typed description, or loads any real
SmartCiti.X station by name), and the **Safety Campus** WebXR companion described below.
[`WebXR/portal/index.html`](WebXR/portal/index.html) is a static map linking all four with a
short description of each; open it first if exploring the WebXR suite rather than the Unity
build.

## Meta Quest and web deployment

Two additional delivery surfaces beyond the Windows PC-VR build:

- **Meta Quest standalone (native)**: `Safety Training > Configure Meta Quest (Android)` applies
  the OpenXR Android configuration (Meta Quest feature, Quest Touch profiles, IL2CPP/ARM64,
  Vulkan-first), and `Safety Training > Build Meta Quest APK` produces
  `Builds/Quest/VR-Safety-Training.apk` for `adb install -r`. Requires the Android Build Support
  module in the editor.
- **WebXR companion** (`WebXR/index.html`): a single static page carrying the full six-site
  inspection curriculum with the same deterministic scoring — immersive VR in the Meta Quest
  Browser (controller ray select, stick locomotion, snap turn) and a desktop mouse/keyboard
  fallback. Deployment notes, hosting assumptions (rb1.com), and the honest device-support
  matrix — including why Ray-Ban Meta display glasses cannot run it immersively — are in
  [`WebXR/README.md`](WebXR/README.md). Placement practicals and the LLM coach remain
  Unity-build features.

## Validation

- Core scoring smoke test: passed
- Unity EditMode suite: 11/11 passed
- OpenXR Project Validation: 0 issues out of 16 checks
- Independent visual QA: two reviewers passed the 13-frame construction-focused set under `Captures/construction-hands-on-v1`
- Windows standalone build: succeeded at `Builds/Windows/VR-Safety-Training.exe`

## LLM endpoint

`LlmEndpointConfig` defaults to a local OpenAI-compatible endpoint:

- URL: `http://localhost:11434/v1/chat/completions`
- Model: `hermes3:8b`

For a hosted provider, change the endpoint and model in the NPC inspector. Store the API key in an operating-system environment variable and set only its variable name in Unity. Do not put secrets in scenes, assets, or source control. If the endpoint is unavailable, NPCs use a deterministic offline response.

NPC replies are grounded in authored site facts, limited to concise complete sentences, and paginated when necessary. The deterministic training engine remains the only authority for hazards, scoring, progress, and completion.

## Rocketbox attribution

The selected character files under `Assets/ThirdParty/MicrosoftRocketbox` come from the Microsoft Rocketbox Avatar Library and retain its MIT license file. Research use should cite Gonzalez-Franco et al. (2020), *The Rocketbox library and the utility of freely available rigged avatars*.
