# REACTOR — eval and profile, before and after (the third wave)

Console REACTOR (docs/consoles/REACTOR.md). Scores: `AS_PORT=8978 node tools/eval_worlds.mjs --md …` (ASSAYER's rubric,
browser included). Profile: `node tools/check_reactor.mjs` (docs/perf/reactor.json) and a back-to-back A/B of the base
tree against this one; the machine was shared (load 16–35 on four cores), so only same-sitting ratios are claimed.

## Before (039f09e) — mean 98

| Subject | Score | loads (20) | legible (15) | resolves (20) | completable (15) | budget (15) | facts (15) | Owner |
|---|---:|---|---|---|---|---|---|---|
| Orleans Parish | **100** | 2/2 | 9/9 | 116/116 | 5/5 | 6/6 | 57/57 | PARISH → ASSAYER |
| Jefferson Parish | **100** | 2/2 | 9/9 | 74/74 | 5/5 | 6/6 | 34/34 | DELTA → ASSAYER |
| St. Bernard Parish | **100** | 2/2 | 9/9 | 64/64 | 5/5 | 6/6 | 32/32 | DELTA → ASSAYER |
| Plaquemines Parish | **100** | 2/2 | 9/9 | 69/69 | 5/5 | 6/6 | 37/37 | DELTA → ASSAYER |
| St. Tammany Parish | **100** | 2/2 | 9/9 | 70/70 | 5/5 | 6/6 | 38/38 | DELTA → ASSAYER |
| Downtown & Embarcadero | **97** | 2/2 | 9/9 | 63/63 | 4/5 | 6/6 | 34/34 | DELTA → ASSAYER |
| Mission & SoMa | **97** | 2/2 | 9/9 | 60/60 | 4/5 | 6/6 | 33/33 | DELTA → ASSAYER |
| Golden Gate Park, the Richmond & the Sunset | **97** | 2/2 | 9/9 | 57/57 | 4/5 | 6/6 | 34/34 | DELTA → ASSAYER |
| Marina & Presidio | **97** | 2/2 | 9/9 | 65/65 | 4/5 | 6/6 | 38/38 | DELTA → ASSAYER |
| Bayview & Hunters Point | **97** | 2/2 | 9/9 | 62/62 | 4/5 | 6/6 | 38/39 | DELTA → ASSAYER |
| Motor Pool | **100** | 2/2 | 9/9 | 140/140 | 70/70 | 2/2 | 70/71 | MOTORPOOL → ASSAYER |
| Characters (GRIOT) | **100** | 2/2 | 9/9 | 191/191 | 35/36 | 4/4 | 34/34 | GRIOT → ASSAYER |
| Play layer (SECONDLINE) | **100** | 2/2 | 8/8 | 196/196 | 78/78 | 1/1 | 42/42 | SECONDLINE → KREWE |
| Billing & membership (TILL) | **88** | 2/2 | 7/8 | 1/2 | 3/3 | 1/1 | 2/2 | TILL → ASSAYER |
| Deploy plan (EDGE) | **100** | 1/1 | 2/2 | 7/7 | 2/2 | 2/2 | 2/2 | EDGE → ASSAYER |

Mean 98.

1. **billing · resolves** (−10.0 points) — auth-config.json carries the null levels / applePay / googlePay / wallet keys (TILL was blocked writing them) — owner **TILL → owner**
2. **parish:sf-downtown · completable** (−3.0 points) — sf-downtown: the play layer offers three or more field lessons (0) — owner **SECONDLINE → BAYOU**
3. **parish:sf-mission · completable** (−3.0 points) — sf-mission: the play layer offers three or more field lessons (0) — owner **SECONDLINE → BAYOU**
4. **parish:sf-golden-gate-park · completable** (−3.0 points) — sf-golden-gate-park: the play layer offers three or more field lessons (0) — owner **SECONDLINE → BAYOU**
5. **parish:sf-marina · completable** (−3.0 points) — sf-marina: the play layer offers three or more field lessons (0) — owner **SECONDLINE → BAYOU**
6. **parish:sf-bayview · completable** (−3.0 points) — sf-bayview: the play layer offers three or more field lessons (0) — owner **SECONDLINE → BAYOU**
7. **billing · legible** (−1.9 points) — an Upgrade view (membership.html) is linked from the account chip (TILL next brief, item 8) — owner **TILL → next run**
8. **characters · completable** (−0.4 points) — a Bay World character hands off a quest (GRIOT's next brief, item 1) — owner **GRIOT → next run**
9. **parish:sf-bayview · facts** (−0.4 points) — sf-bayview: no history or statistics words in the module (record) — owner **DELTA → ASSAYER**
10. **motorpool · facts** (−0.2 points) — the fishing hulls carry fictional boat names ("GULF STAR", "BAYOU PEARL", "MISS DELTA") — decide named or generic (MOTORPOOL next brief, item 7) — owner **MOTORPOOL → next run**

## After (REACTOR cycles 1–5) — mean 99

| Subject | Score | loads (20) | legible (15) | resolves (20) | completable (15) | budget (15) | facts (15) | Owner |
|---|---:|---|---|---|---|---|---|---|
| Orleans Parish | **100** | 2/2 | 9/9 | 116/116 | 5/5 | 6/6 | 57/57 | PARISH → ASSAYER |
| Jefferson Parish | **100** | 2/2 | 9/9 | 74/74 | 5/5 | 6/6 | 34/34 | DELTA → ASSAYER |
| St. Bernard Parish | **100** | 2/2 | 9/9 | 64/64 | 5/5 | 6/6 | 32/32 | DELTA → ASSAYER |
| Plaquemines Parish | **100** | 2/2 | 9/9 | 69/69 | 5/5 | 6/6 | 37/37 | DELTA → ASSAYER |
| St. Tammany Parish | **100** | 2/2 | 9/9 | 70/70 | 5/5 | 6/6 | 38/38 | DELTA → ASSAYER |
| Downtown & Embarcadero | **97** | 2/2 | 9/9 | 63/63 | 4/5 | 6/6 | 34/34 | DELTA → ASSAYER |
| Mission & SoMa | **97** | 2/2 | 9/9 | 60/60 | 4/5 | 6/6 | 33/33 | DELTA → ASSAYER |
| Golden Gate Park, the Richmond & the Sunset | **97** | 2/2 | 9/9 | 57/57 | 4/5 | 6/6 | 34/34 | DELTA → ASSAYER |
| Marina & Presidio | **100** | 2/2 | 9/9 | 65/65 | 5/5 | 6/6 | 38/38 | DELTA → ASSAYER |
| Bayview & Hunters Point | **100** | 2/2 | 9/9 | 62/62 | 5/5 | 6/6 | 38/39 | DELTA → ASSAYER |
| Motor Pool | **100** | 2/2 | 9/9 | 140/140 | 70/70 | 2/2 | 70/71 | MOTORPOOL → ASSAYER |
| Characters (GRIOT) | **100** | 2/2 | 9/9 | 191/191 | 35/36 | 4/4 | 34/34 | GRIOT → ASSAYER |
| Play layer (SECONDLINE) | **100** | 2/2 | 8/8 | 196/196 | 78/78 | 1/1 | 42/42 | SECONDLINE → KREWE |
| Billing & membership (TILL) | **88** | 2/2 | 7/8 | 1/2 | 3/3 | 1/1 | 2/2 | TILL → ASSAYER |
| Deploy plan (EDGE) | **100** | 1/1 | 2/2 | 7/7 | 2/2 | 2/2 | 2/2 | EDGE → ASSAYER |

Mean 99.

1. **billing · resolves** (−10.0 points) — auth-config.json carries the null levels / applePay / googlePay / wallet keys (TILL was blocked writing them) — owner **TILL → owner**
2. **parish:sf-downtown · completable** (−3.0 points) — sf-downtown: the play layer offers three or more field lessons (0) — owner **SECONDLINE → BAYOU**
3. **parish:sf-mission · completable** (−3.0 points) — sf-mission: the play layer offers three or more field lessons (0) — owner **SECONDLINE → BAYOU**
4. **parish:sf-golden-gate-park · completable** (−3.0 points) — sf-golden-gate-park: the play layer offers three or more field lessons (0) — owner **SECONDLINE → BAYOU**
5. **billing · legible** (−1.9 points) — an Upgrade view (membership.html) is linked from the account chip (TILL next brief, item 8) — owner **TILL → next run**
6. **characters · completable** (−0.4 points) — a Bay World character hands off a quest (GRIOT's next brief, item 1) — owner **GRIOT → next run**
7. **parish:sf-bayview · facts** (−0.4 points) — sf-bayview: no history or statistics words in the module (record) — owner **DELTA → ASSAYER**
8. **motorpool · facts** (−0.2 points) — the fishing hulls carry fictional boat names ("GULF STAR", "BAYOU PEARL", "MISS DELTA") — decide named or generic (MOTORPOOL next brief, item 7) — owner **MOTORPOOL → next run**

Marina & Presidio and Bayview & Hunters Point rise 97 → 100: the eval now reads GOLDEN-B's San Francisco play layer
(`sg-sf-play.js`, ten lessons) beside SECONDLINE's. Downtown, Mission and Golden Gate Park stay at 97 — their lessons are
in their district data but on no play-layer module yet (tools/briefs/next/reactor-next.md, item 3).

## Engine profile, A/B 039f09e → cycle 5 (median of three alternating rounds, high tier, headless three.js)

`bootMs` = npBuildParish at the start site; `msPerChunk` = streaming every site; geometry checksums compared.

```
orleans                bootMs 719->696  msPerChunk 7.31->2.65  meshes 166->166  triangles 57789->57789 identical
jefferson              bootMs 464->64  msPerChunk 3.97->1.04  meshes 125->125  triangles 29765->29765 identical
st-bernard             bootMs 315->113  msPerChunk 7.71->1.26  meshes 139->139  triangles 37208->37208 identical
plaquemines            bootMs 522->204  msPerChunk 7.57->3.62  meshes 138->138  triangles 45472->45472 identical
st-tammany             bootMs 257->116  msPerChunk 1.84->0.72  meshes 112->112  triangles 35123->35123 identical
sf-downtown            bootMs 693->185  msPerChunk 5.38->0.73  meshes 117->117  triangles 38456->38456 identical
sf-mission             bootMs 569->163  msPerChunk 4.02->0.93  meshes 126->126  triangles 31278->31278 identical
sf-golden-gate-park    bootMs 265->93  msPerChunk 1.84->0.63  meshes 145->145  triangles 74715->74715 identical
sf-marina              bootMs 292->62  msPerChunk 2.51->0.85  meshes 146->146  triangles 64145->64145 identical
sf-bayview             bootMs 403->82  msPerChunk 3.37->1  meshes 125->125  triangles 35521->35521 identical
TOTAL                  bootMs 4499.0->1778.0 (60% less)  msPerChunk 45.5->13.4 (70% less)  meshes 1339.0->1339.0 (0% less)  triangles 449472.0->449472.0 (0% less)
```
