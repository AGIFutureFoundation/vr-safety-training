# VOICES memory (console `vc`, loop 10 round 2)

- GRIOT's rule is the contract: only a pack line is spoken, verbatim. `vcNpcVoice.say` enforces it structurally (it refuses text
  that is not in the character's pack), so the greeting, hand-off and no-match templates are read, never heard.
- Voices are local only (`localService === true`), checked twice (the picker and the controller). Off by default and not
  remembered. The synth is never touched while voice is off (0 speaks, 0 cancels), and an idle controller never calls `cancel()`
  (it would cut off the Guide's `voice-assist.js` speech or a peer's line).
- A profile is derived, not hand-written: temper from the role's words, place among its temper from the avatar index, then a
  separation pass (`VC_MIN_GAP` 0.10 of the band). 34/34 distinct; 13 were moved by the separation pass. The first two versions
  failed the checker (a 0.01 pitch gap; a collision across tempers) before the pass existed.
- `oh-voice.js` is shared with the Omega Hive: `pick`, `link`, `kick` and the stop/onend change were added without changing the
  hive's callers (`check_omega_hive` 15/0 before and after, EVAL lines identical). Linked controllers take turns at line
  boundaries: kick the peer before starting your own next line, or a long queue starves the other.
- npc.js is in four bundles; the flat bundler (and `buildSuite`) strip an import only on a line of its own (no trailing comment on
  an import line), and a module's top-level `const` must not be read at load by an earlier module (the parishes list has
  `vc-voices.js` after `npc.js`; `VC_CSS` is read only inside functions).
- Talk light: one shared mesh, attached to the speaking figure only while it speaks. An idle world has exactly the meshes it
  had; a speaking figure has one more (worst 9 of 12; +1 draw call, +140 triangles on desktop and phone).
- The hive's second language is a pack, not a translation of the English strings: `OH_PACKS[lang]` (cores, reason phrases, approval
  sentence), pools and padding per language, `ohAgentIn(agent, lang)` for the persona in that language. Facts are slotted from the
  event; a task's label stays out of the Spanish lines because it is English registry text. A Spanish line is never read by an
  English voice: `ohPickVoice` asks for the agent's language and returns null when no local voice has it.
- `ohHive` already takes `say`, `agents` and `supervisor` as options: a language needs no change inside `oh-hive.js`.
- A drive with a stubbed `speechSynthesis` under SwiftShader is slow (load 7-11): lines of 300 ms take about a second each, so waits
  must be generous (the first Spanish drive "spoke 7 of 17" only because the wait ended early).
- Dist bundles are rebuilt for drives and not committed (`git add` paths, never `WebXR/*/dist/`). The sandbox refuses commands that
  compute their program or pass a runtime-built path to git; use plain, separate commands or the editor tools.
- The commit trailer from the session's attribution note names a model; the user's rule (no model identifier in any file or
  commit message) wins, so commits carry the session link line only.
