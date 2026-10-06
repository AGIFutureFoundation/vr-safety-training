# Partner demo pages

One overview page per partner team, each with a narrated demo video, a plain overview, the full station details
and build info. Four team consoles built them from the brief in `tools/briefs/showcase-brief.md`. Each console's
step log is in `docs/consoles/`.

| Page | Programmes | Console |
|---|---|---|
| [pathway](pathway/index.html) | Pathway Edition and Job Readiness Edition, prepared for Joyce Guy and the team | BEACON |
| [smiles](smiles/index.html) | Dental Careers and Dental Hygiene, prepared for the Unspoken Smiles team | SMILE |
| [courtside](courtside/index.html) | Basketball Fundamentals with the teamwork and emotional-intelligence stations | COURTSIDE |
| [clear](clear/index.html) | Hunters Point Clean-up and Bay Restoration, the C.L.E.A.R. demo | CLEARWATER |

Every count on a page is computed by the scripts in its `build/` folder from `WebXR/smartcity/catalog.json`,
`docs/investor/stations.csv`, the world data modules and `git log`. Facts about the partner organisations are limited
to their own published text, quoted verbatim, or to the name alone where the repo holds nothing else.

The demo videos are about 4–5 MB each. They are kept out of git and published with the private pages, so opening a
page from the repo shows the poster frame without the video. To rebuild a page, run its data script, then its page
script. For a video, record with `*_rec_pages.mjs` and the station recorder, then assemble with `*_video.py` or
`*_promo.py`.
