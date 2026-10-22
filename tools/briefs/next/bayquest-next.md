# BAYQUEST — next

- When BAYKEEPER (bk-street-drain-trash-capture-cleanout, bk-bioretention-rain-garden-excavation) and CLEANPORTS (charging
  yard, ZE yard tractor pre-use) stations merge: move `pendingStations` into each game's gate, rerun gen_gate_names and
  check_gates; point the yard shuffle's `drivables.prefer` at CLEANPORTS' real drivable ids.
- When BAYMAP's Oakland districts merge: resolve the guarded `anchors` (oak-west-oakland, oak-fruitvale-estuary) and add
  trail treasures there through gen_bq_trail.mjs with npWaterAt + road checks; add stories on those maps.
- When ESTUARY merges: the k12-es-* chain items and DEAN days stop being guarded; check_bayquest should then require them.
- DEAN: replace `bqApplyDean`'s dnAddTemplate guess with DEAN's real template API.
- Mount the board and trail triggers in Bay World itself (needs the bq modules in the bayworld bundle list).
- The combined WebXR/dist folder was not rebuilt (only `bundle_webxr.py parishes`); the coordinator's full bundle picks it up.
