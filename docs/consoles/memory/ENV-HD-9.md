# Memory: ENV-HD-9 (loop 10, round 9, `hd9`, port 9173)

- Base 61d85871 (fast-forward). One-hour round. Scratch `$SP/loop10/hd9/`: `probe.mjs` (ENV-HD-8's drive pointed at this
  worktree; plan JSON per map: `[site, "kind"|"street"|"wide", "day"|"night", label]`), `driveA.txt` (four stills),
  `driveB.txt` (the school), the stills.
- The port room's window opening: `IX_OPENINGS` in `ix-interiors.js`; hole x −6.5..6.5, y 1.0..3.0, z −6.0..−6.3
  (room-local; scene = room + [0, 4000, 0]). The sill keeps the name `ix-wall-0` because three skin modules look it up and
  retexture the shared wall material. The ixr picture plane (z −5.99) still covers the hole exactly.
- `hd3Scene` passes: the pass loop must `break` the outer loop too, or a later (looser) pass overwrites the choice.
- The cue-as-subject pass runs only when the chosen camera has the cue hidden, so cameras with an unhidden cue never move
  (ENV-HD-8's attempt grew the subject for every pass and moved two cameras).
- `hd6Build` records `footprint` per site; the app passes its corners as `subject`. Headless: build the mesh with
  `boards: []` to read footprints (the lamps do not count).
- A heartbeat stamp must come from `date -u +%H:%M` at write time; the first line this round was typed (01:38 for 01:35)
  and corrected in the next line.
