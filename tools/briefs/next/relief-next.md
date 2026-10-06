# RELIEF — next

1. A headless run of the parishes app with a stub token and Playwright route interception serving synthetic Terrain-RGB
   PNGs (the success path end to end in a browser; the checker proves it with a stub fetch today).
2. NEIGHBORHOODS' and EASTBAY's new maps: run the RELIEF audit (docs/consoles/RELIEF.md cycle 1) on their hills; the
   runtime relief already works for them by their lon/lat box.
3. Hunters Point hill (sf-bayview) was left where it was — its position was not certain enough to move.
4. Rebuild WebXR/parishes/dist/parishes.html at integration (rl-relief.js is in the bundle list; the dist was not
   committed here to avoid conflicts).
