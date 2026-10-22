# Phone pass

Measured 2026-09-28T08:45:37.389Z at commit 688afae: every world and both station apps at 360×640 and 390×844, touch emulation, headless Chromium under SwiftShader (paint times are relative to this shared machine; layout numbers are exact CSS px). First-contentful-paint budget 4000 ms. Captures under `docs/img/proving/`. Tool: `node tools/phone_pass.mjs`.

| Page | Size | horizontal overflow | first contentful paint | tap targets (under 44 px) | HUD text under 14 px | tier | page errors | capture |
|---|---|---:|---:|---|---|---|---|---|
| Bay World | 360x640 | 0 px | 272 ms | 15 (10) | 0 | low | 0 | [360x640](../img/proving/bayworld-360x640.png) |
| Bay World | 390x844 | 0 px | 220 ms | 15 (10) | 0 | low | 0 | [390x844](../img/proving/bayworld-390x844.png) |
| Redwood Reach | 360x640 | 0 px | 176 ms | 12 (7) | 0 | low | 0 | [360x640](../img/proving/redwood-360x640.png) |
| Redwood Reach | 390x844 | 0 px | 196 ms | 12 (7) | 0 | low | 0 | [390x844](../img/proving/redwood-390x844.png) |
| Sierra Summit | 360x640 | 0 px | 120 ms | 11 (7) | 0 | low | 0 | [360x640](../img/proving/summit-360x640.png) |
| Sierra Summit | 390x844 | 0 px | 128 ms | 11 (7) | 0 | low | 0 | [390x844](../img/proving/summit-390x844.png) |
| The Deep | 360x640 | 0 px | 232 ms | 17 (11) | 0 | low | 0 | [360x640](../img/proving/underwater-360x640.png) |
| The Deep | 390x844 | 0 px | 204 ms | 17 (11) | 0 | low | 0 | [390x844](../img/proving/underwater-390x844.png) |
| Bay Regatta | 360x640 | 0 px | 168 ms | 10 (8) | 0 | low | 0 | [360x640](../img/proving/regatta-360x640.png) |
| Bay Regatta | 390x844 | 0 px | 340 ms | 10 (8) | 0 | low | 0 | [390x844](../img/proving/regatta-390x844.png) |
| Fairway Park | 360x640 | 0 px | 196 ms | 15 (12) | 0 | low | 0 | [360x640](../img/proving/fairway-360x640.png) |
| Fairway Park | 390x844 | 0 px | 140 ms | 15 (12) | 0 | low | 0 | [390x844](../img/proving/fairway-390x844.png) |
| Trade Skills (station runner, hub) | 360x640 | 0 px | 152 ms | 7 (4) | 0 | null | 0 | [360x640](../img/proving/trades-360x640.png) |
| Trade Skills (station runner, hub) | 390x844 | 0 px | 460 ms | 7 (4) | 0 | null | 0 | [390x844](../img/proving/trades-390x844.png) |
| SmartCiti.X (station runner) | 360x640 | 0 px | 192 ms | 10 (6) | 0 | null | 0 | [360x640](../img/proving/smartcity-360x640.png) |
| SmartCiti.X (station runner) | 390x844 | 0 px | 204 ms | 10 (6) | 0 | null | 0 | [390x844](../img/proving/smartcity-390x844.png) |

## Tap targets under 44 px, by page

- **Bay World 360x640**: a.home-chip 81x26, #ctl-help-btn 32x32, #gt-account 80x32, #tr-lang-btn 44x32, #qm-chip 32x32, button 44x32, button 46x32, button 44x32, #hud-radio-btn 76x34, #hud-map-btn 92x34
- **Bay World 390x844**: a.home-chip 81x26, #ctl-help-btn 32x32, #gt-account 80x32, #tr-lang-btn 44x32, #qm-chip 32x32, button 44x32, button 61x32, button 44x32, #hud-radio-btn 76x34, #hud-map-btn 92x34
- **Redwood Reach 360x640**: a.home-chip 85x28, #ctl-help-btn 32x32, #gt-account 80x32, #tr-lang-btn 44x32, button 49x32, button 90x32, button 54x32
- **Redwood Reach 390x844**: a.home-chip 85x28, #ctl-help-btn 32x32, #gt-account 80x32, #tr-lang-btn 44x32, button 49x32, button 90x32, button 54x32
- **Sierra Summit 360x640**: a.home-chip 75x28, #ctl-help-btn 32x32, #gt-account 80x32, #tr-lang-btn 44x32, button 44x32, button 44x32, button 44x32
- **Sierra Summit 390x844**: a.home-chip 75x28, #ctl-help-btn 32x32, #gt-account 80x32, #tr-lang-btn 44x32, button 44x32, button 57x32, button 44x32
- **The Deep 360x640**: a.home-chip 81x26, #ctl-help-btn 32x32, #gt-account 80x32, #tr-lang-btn 44x32, #qm-chip 32x32, button 44x32, button 46x32, button 44x32, #hud-activities-btn 112x34, #hud-map-btn 92x34, #hud-surface-btn 157x34
- **The Deep 390x844**: a.home-chip 81x26, #ctl-help-btn 32x32, #gt-account 80x32, #tr-lang-btn 44x32, #qm-chip 32x32, button 44x32, button 61x32, button 44x32, #hud-activities-btn 112x34, #hud-map-btn 92x34, #hud-surface-btn 157x34
- **Bay Regatta 360x640**: a.home-chip 85x28, #ctl-help-btn 32x32, #gt-account 80x32, #tr-lang-btn 44x32, #qm-chip 32x32, button 49x32, button 90x32, button 54x32
- **Bay Regatta 390x844**: a.home-chip 85x28, #ctl-help-btn 32x32, #gt-account 80x32, #tr-lang-btn 44x32, #qm-chip 32x32, button 49x32, button 90x32, button 54x32
- **Fairway Park 360x640**: a.home-chip 81x26, #ctl-help-btn 32x32, #gt-account 80x32, #tr-lang-btn 44x32, #qm-chip 32x32, button 49x32, button 90x32, button 54x32, button.on 84x34, button 65x34, button 83x34, button 87x34
- **Fairway Park 390x844**: a.home-chip 81x26, #ctl-help-btn 32x32, #gt-account 80x32, #tr-lang-btn 44x32, #qm-chip 32x32, button 49x32, button 90x32, button 54x32, button.on 84x34, button 65x34, button 83x34, button 87x34
- **Trade Skills (station runner, hub) 360x640**: a.home-chip 72x26, #ctl-help-btn 32x44, #gt-account 95x32, #tr-lang-btn 45x32
- **Trade Skills (station runner, hub) 390x844**: a.home-chip 72x26, #ctl-help-btn 32x44, #gt-account 95x32, #tr-lang-btn 45x32
- **SmartCiti.X (station runner) 360x640**: a.home-chip 72x26, #ctl-help-btn 32x44, #gt-account 94x32, #tr-lang-btn 45x32, #speak-btn 40x44, #controls-btn 40x44
- **SmartCiti.X (station runner) 390x844**: a.home-chip 72x26, #ctl-help-btn 32x44, #gt-account 94x32, #tr-lang-btn 45x32, #speak-btn 40x44, #controls-btn 40x44

These are findings for the owning teams (the shared touch controls themselves are held to 48 px by `check_mobile`); `check_proving` holds the total to the recorded baseline so it cannot grow unnoticed.
