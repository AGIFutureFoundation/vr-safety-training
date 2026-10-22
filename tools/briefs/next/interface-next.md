# INTERFACE — next

1. When BAYQUEST and PROJECTSIM merge, mount them into the reserved `#menu-bayquest` (Play) and `#menu-sims` (Learn),
   and add their ids to `UX_TAB_MOUNTS` in `tools/check_interface.mjs`.
2. Contextual prompts: `#hud-prompt` still sits bottom-centre; project it over the board or sign it names
   (a screen-space anchor from the site's position), falling back to bottom-centre when off screen.
3. Carry the tab pattern (`uxMountTabs`) to Bay World, Redwood Reach and Sierra Summit menus, which still stack.
4. Phone HUD: the one-line state wraps to two lines at 390 px; consider a compact form (icons with labels in
   `aria-label`) that keeps text at 14 px or larger.
5. Rebundle `WebXR/dist/parishes.html` (python3 tools/bundle_webxr.py) at the coordinator's gate — the dist copy is stale.
6. check_a11y's standing failure (graded controls without a text readout in k12-by-* stations) belongs to the catalog owners.
