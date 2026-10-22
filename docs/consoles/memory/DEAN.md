# DEAN memory

- Base 4713545. Modules: shared/dn-modules.js (store vr-dean-v1, versions, modules, apply, progress), shared/dn-index.js (lesson index, frames), instructor/js/dean.js (tab), parishes app mount (board glow by material swap, hidden stations, #menu-dean).
- tools/export_shared.mjs -> exports/shared/holodeck-shared.json (+schema); tools/check_dean.mjs 531/531.
- Seams open: dnUsePacks(pkPacks), dnUseSessions(scSessions), STORYLINE must call dnCanSwitchPath before stChosenPath changes.
