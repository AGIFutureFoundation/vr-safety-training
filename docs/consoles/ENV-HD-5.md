# Console ENV-HD-5

- Console: ENV-HD-5 (loop 10, round 5, prefix `hd5`, port 9133)
- Brief: `$SP/loop10/brief-r5.md` (section ENV-HD-5), under the Rules of `$SP/loop10/brief.md`, the Shared rules of
  `packs-brief.md` and the reactor loop of `packs-brief-3.md`
- Base: e252b25f (fast-forward; loop 10 rounds 1–4 merged), branch `worktree-agent-a6814868e45070b08`

## What is here
- **The Louisiana rooms inside the balanced budget** (`WebXR/shared/lar-rooms.js`, `WebXR/shared/hd2-room-skins.js`).
  LA-ROOMS drew one 512 × 120 canvas per name sign on balanced as on high, which put its six rooms at 3.21–6.02 MiB on
  balanced before any skin, over the 3 MiB room budget. `LAR_SIGN_PX` now gives balanced the phone tier's 256 × 60 (high
  keeps 512 × 120), `larSignMaterial` takes the tier, and `HD2_SIGN_BYTES.balanced` counts the same. The six rooms are
  2.47–2.86 MiB on balanced with the skin's floor (and walls where they fit); meshes, triangles and lights are unchanged
  (only a canvas's resolution changed; the sign planes are 1.8 × 0.42 m on every tier).

## Evals (before → after, each with its source)
| eval | before | after | source |
|---|---|---|---|

## Cycles
1. Reason: the LA rooms fit balanced's 3 MiB with their name signs at the phone size, and the checker's model of a sign
   canvas must follow the module (a coordinator attempt changed the size alone and 24 checks failed: `check_room_skins`
   line 81 modelled 512 × 120 on balanced); proof = `check_room_skins` ("rooms over their budget before the skin … none",
   6 of 6 ≤ 3 MiB measured). Act: `LAR_SIGN_PX` and `larSignMaterial(THREE, text, tier)`; `HD2_SIGN_BYTES.balanced`
   256 × 60; the checker's model `larSignPx(tier)`, a failing check for any room over its budget before the skin (it was
   reported only), and a measured pass — the six LA rooms built again on three tiers under a recording canvas stub, with
   LA-ROOMS' dressers and the skin, every texture measured (shell signs, name signs, skin maps) against the model and
   `HD2_SIGN_BYTES`. Observe: "ROOM-SKINS: all 480 checks pass" (401 before); LA rooms on balanced 3.21–6.02 → 2.47–2.86
   MiB, 6 of 6 ≤ 3 MiB, measured = model on 18 of 18 builds. Mutation test: with balanced set back to 512 × 120 the measured
   pass fails (canvases 512 × 120 against the model's 256 × 60; 6.35 MiB measured against 2.84). `check_la_rooms` 3,787,
   `check_hd4` 118, `check_interiors` 957 pass.

## Seams
- `lar-rooms.js`: `LAR_SIGN_PX` (`{ high: [512, 120], balanced: [256, 60], low: [256, 60] }`), `larSignMaterial(THREE, text,
  tier)` (was `low`).
- `hd2-room-skins.js`: `HD2_SIGN_BYTES.balanced` = 256 × 60 × 4 × 4/3.

## Left
