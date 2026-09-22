# Quick series reviews

Three scripts make a four-minute review film of a programme: a title card, then
each station's title card over its spawn view and the first steps of a real run
with its index, name and tagline spoken, then an outro.

1. `node rec_review.mjs <series> <id>...` — one clip per station (serve WebXR on 8970).
2. `python3 gen_review_narration.py <series> <id>...` — Kokoro `am_michael` lines.
3. `python3 build_review.py <series> "<Title>" <id>...` — trims each clip to the
   station appearing, pads it to its narration, and concatenates.

The scripts carry the scratchpad paths of the session that wrote them; change
`BASE` before running elsewhere. The Kokoro model files are not in the repo.
