# AGENTGYM next

1. Train something from the preference pairs (a Bradley–Terry reward model over run features, or a bandit over agent styles), and evaluate it with ag_eval against the four baselines.
2. Run agents live on the page: load the station engine in the browser so ratings carry full step observations, not just recorded frames.
3. Improve the retrieval heuristic honestly: synonyms from the station's itemNames and itemNotes, and use of the wrong-touch feedback text. Report it against the same 721 × 3 grid.
4. Link the page from the homepage or the data page, and do a headless browser capture pass.
5. Extend the task API to the trades rooms (`loadTrades()`) and to catalog stations outside smartcity.
