# ATMOS — next brief

1. A continuous clock in the parishes app (the T key still steps dawn/day/dusk/night): let `atWeather` advance with a slow
   world hour so fronts visibly roll in; `atmos.set` is cheap, call it every few seconds.
2. Porch lights only exist on garden/suburb houses; quarter blocks could take gallery lamps (same InstancedMesh).
3. The wet sheen tweaks CITYWORKS' street material and the engine's road ribbons; the sidewalks share the street material.
   A reflection of the lamps in puddles would need a cube map — out of budget on the phone tier; skip unless asked.
4. Sound: the port horn and traffic follow `atNearness`; Redwood has no arterials or port (zero). Bay World and Sierra Summit
   could mount `atMountSound` the same way (a toggle and a 0.5 s mix).
5. Fog sheets are hidden on the phone tier (scene fog only); a single low sheet may be affordable there.
