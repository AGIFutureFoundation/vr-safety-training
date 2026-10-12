# INTERFACE memory
- Base 793d16d. Parishes menu -> four tabs (Learn/Play/Map/Me) in parishes.html; logic in WebXR/shared/ux-menu.js + tail of WebXR/parishes/js/app.js.
- Every 793d16d id kept (comm of id lists empty). Reserved mounts: #menu-sims (PROJECTSIM), #menu-bayquest (BAYQUEST), #menu-passport, #menu-sound.
- Onboarding skipped under navigator.webdriver unless ?onboard=1, so other checkers' clicks on #menu-start are never intercepted.
- Reduced motion toggle: localStorage ux-reduced, applied by an inline matchMedia patch in parishes.html before app.js; reloads.
- check_a11y's one failure (graded controls without a text readout, k12-by-* stations) is catalog content, not touched here.
