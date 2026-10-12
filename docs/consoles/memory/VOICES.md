# VOICES memory (console `vc`, loop 10 round 2)

- GRIOT's rule is the contract: only a pack line is spoken, verbatim. `vcNpcVoice.say` enforces it structurally (it refuses text
  that is not in the character's pack), so the greeting, hand-off and no-match templates are read, never heard.
- Voices are local only (`localService === true`), checked twice (the picker and the controller). Off by default and not
  remembered. The synth is never touched while voice is off (0 speaks, 0 cancels).
- A profile is derived, not hand-written: temper from the role's words, place among its temper from the avatar index, then a
  separation pass (`VC_MIN_GAP` 0.10 of the band). 34/34 distinct; 13 were moved by the separation pass.
- `oh-voice.js` is shared with the Omega Hive: `pick`, `link`, `kick` and the stop/onend change were added without changing the
  hive's callers (`check_omega_hive` 15/0 before and after).
- npc.js is in four bundles; the flat bundler strips imports only on a line of their own (no trailing comment on an import line)
  and a module's top-level `const` must not be read at load by an earlier module (the parishes list has `vc-voices.js` after
  `npc.js`; `VC_CSS` is read only inside functions).
- Talk light: one shared mesh, attached to the speaking figure only while it speaks. An idle world has exactly the meshes it
  had; a speaking figure has one more (worst 9 of 12).
- Dist bundles are rebuilt for drives and not committed (`git add` paths, never `WebXR/*/dist/`).
