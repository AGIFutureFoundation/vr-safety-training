# SMILES — next

1. K-12 dental classroom stations (e.g. brushing every surface, snacks and smiles, a first dental visit) authored to the
   catalog's K-12 schema, so the field lessons and games point at dedicated K-12 stations instead of the nearest classroom ones.
2. In-world props for the games at their sites (a toothbrush sculpture, a fountain, market stalls) through the massing
   `details` hook or a site kit, instanced per chunk, with a phone tier.
3. Site-board entries: open a game from its site's board (today the games open from the Play tab only).
4. Satellite ground: `npSatelliteUrl` should return null for a `procedural: true` map (today it would build a URL at the
   nominal frame if a deployment configures a token); needs the check_parishes satellite assertion to skip procedural maps.
5. A connector pair once a second programme world is registered (`programme-worlds-west` / `-south` are pending).
