# AVATARS-HD memory

- Base 048869d5 (loop 10 round 4). Prefix `aa`/`AA_` (AGENT-AVATARS' files), port 9121. New module `WebXR/shared/aa-agent-hd.js`
  (no imports, on purpose: the instructor bundle draws portraits from it without crew.js or three.js). It is listed before
  `aa-agent-portraits.js` in both the parishes and the instructor bundles. Checker: `tools/check_agent_avatars.mjs` section 9
  (91 checks in all; it imports the vendored three.js for section 9 only, the rest still runs on the stub). Drive:
  `tools/drive_avatars_hd.mjs [port] [stillsDir]` (rebuild `python3 tools/bundle_webxr.py parishes instructor` first; not in
  the gate; it writes the 1920×1080 stills).
- One description, three uses: `aaHdSpec(agent)` → `aaHdGeometry(spec)` gives plain arrays. They feed the three.js figure
  (`aaHdBuild`: one SkinnedMesh body and one unlit SkinnedMesh glow on one Skeleton, plus the mouth's lit opening, a plain mesh
  on the mouth bone), the software rasteriser (`aaHdRender`: portraits and silhouettes) and the checker. The pose is one pure
  function, `aaHdPose(spec, st)`. Bones are bound with zero rotation, so the skinning matrix is world × translate(-bind). The
  rasteriser reproduces three.js's Euler XYZ matrix exactly.
- Twist matters. A twist on the elbow (rotation.y) turns the wrist's local axes, so wrist flexion for a palm-in hand is about
  local z, not x. The stop hand is the elbow twisted π/2 (palm back in the hanging frame), the forearm flexed up (shoulder -1.25,
  elbow -1.35) and the wrist at z -0.54: palm forward, fingers up.
- three.js r160 reads vertex colours as linear. `aaHdBuild` converts the spec's sRGB colours; the rasteriser uses them as they are.
- No skin. A role colour mixed into the whole shell looked like skin (red and pink). The shell is cool porcelain (0.83, 0.88,
  0.93). The role colour goes only on the visor band, the halo, the shoulder caps, the belt, the badge and the collar or yoke.
  The checker holds the head and hands at least 0.15 RGB from crew.js's twelve tones (closest 0.177). In the page, the body
  material's emissive must stay a cool lift (0x5a6e82 at 0.5). An accent emissive (0.12) tinted every shell and joint in the
  page's light: Lio's head read tan in shade. The rasteriser does not show this, so look at a page still after a colour change.
- Opt-in: `aaMountAgentAvatars({ hd: true })` builds HD only when tier === "high" and three.js has SkinnedMesh/Skeleton/Bone.
  The outdoor mount in app.js passes `hd: true` (placed after `tier: npTierName,`, because `check_hive_world` greps the line's
  ending `route: …, blocked: … });`). The robotics rooms (hw-hive-world.js) do not ask, so they keep today's figure inside
  IX_BUDGET: three HD figures at about 2,700 triangles would take the cell hall past its 6,000 on high.
- Gestures are logged on every tier with `on` (the event type, or the speak's `about`) and `jobId`. Kinds: raise (bid), accept
  (award), stop (refused), approve (a speak with about "approved"), nod (complete). The approval's kind is "approve", not "nod",
  because section 3 holds the nod count equal to completions. The latest event wins.
- The mouth: `f.talk.words` holds the caption's word onsets (`aaWordOnsets`, spread by word length over the line's window).
  `talkStart` re-times them at the voice's rate; `talkWord(id, charIndex)` records boundaries in `f.talk.bw`, and once one
  arrives the mouth follows boundaries only. `aaVoiceHooks(world, id)` → `{ onstart, onboundary, onend }`. oh-voice.js does not
  forward `u.onboundary` yet (HIVE-4's file): it needs `u.onboundary = (e) => item.opts.onboundary?.(e)`.
- Portraits: `aaPortrait(agent, { size, scale })` (the seam for HIVE-4's tab) and `aaPortraitImg` both draw from the figure:
  `aaPortraitFigureRgba` → canvas → PNG, cached. `data-aa-raster` stays `png@<k>x` (older drives read it) and
  `data-aa-source` is "figure". Tokens keep the SVG raster.
- The stills freeze a pose by replacing `window.__parishTest.agentAvatars.animate` with a no-op, after running the original
  forward to the moment wanted (the app calls `aaWorld?.animate` by property each frame).
