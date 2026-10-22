# LANDMARKS — memory

- Kit: `WebXR/shared/lm-landmarks.js` (14 kinds, one mesh each, `LM_BUDGET` per kind with a phone tier). Engine hook:
  `np-world.js` → `parish-lm-kit` group, `world.lmKits`. Maps tag landmarks with `"lm": "<kind>"` (keeps their own `kind`,
  which check_parishes' water rule and other checkers read).
- Tagged: sf-downtown (ferry-building, coit-tower, bay-bridge-suspension, wharf-pier-shed, + new transamerica-pyramid,
  cable-car-turntable, painted-ladies), sf-marina (golden-gate-bridge), oak-west-oakland (bay-bridge-east-tower on the toll-plaza
  landmark via lmAlong 0.85, container-cranes), oak-downtown-lake (lake-merritt-pergola).
- Unused by existing maps (for NEIGHBORHOODS / EASTBAY): cable-car, victorian-house, lighthouse.
- Checker: `tools/check_landmarks.mjs` (~22 s). Stills: `$SP/packs/landmarks/*.png`.
