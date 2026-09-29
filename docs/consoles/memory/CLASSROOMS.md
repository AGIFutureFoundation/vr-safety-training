# CLASSROOMS memory
- Module WebXR/shared/cr-classrooms.js (cr prefix); checker tools/check_classrooms.mjs; mounted in parishes app (crLaunch, crWorld, crDressed).
- Rooms: K-12 per school site (band upper primary, ceiling 8), union centre per union-hall site (5 craft bays), Academy on bp- maps (CR_ACADEMY_SITES), robotics bays (CR_ROBOTICS_SITES).
- INTERIORS shell: crRegisterDressers(ix, {parish, launch}); app guards with typeof ixRegisterDresser; fallback mount goes passive when dressers register.
- Guarded: ROBOTICS rb-robotics-data.js (game ids), rbOpenGame global; ACADEMY ids are catalog stations already.
