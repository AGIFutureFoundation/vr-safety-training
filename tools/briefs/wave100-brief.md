# Wave 100 brief — one hundred more environments, thirteen union packs

The user asked for one hundred more highly detailed environments with deep union modules, richer textures and colours, and more assets. Thirteen packs of eight stations, each pack one new programme (or an extension where the programme already exists). `station-brief.md`, `ladder-brief.md` §Content rules and `assets-brief.md` bind every pack.

## Packs, prefixes and programmes
| Pack | Prefix | Programme id | Union / training body |
|---|---|---|---|
| Elevator constructors | `ew-` | `elevator-constructors` | IUEC and the NEIEP apprenticeship as a body |
| Plumbers and pipefitters | `pl-` | `plumbers-and-pipefitters` | UA Local 38 apprenticeship as a body |
| Insulators and boilermakers | `ib-` | `insulators-and-boilermakers` | Insulators Local 16, Boilermakers Local 549 as bodies |
| Roofers and waterproofers | `rf-` | `roofers-and-waterproofers` | Roofers Local 40 as a body |
| Glaziers and architectural metal | `gl-` | `glaziers-and-architectural-metal` | IUPAT DC 16 glaziers as a body |
| Heavy equipment operators | `op-` | `heavy-equipment-operators` | IUOE Local 3 training as a body |
| Cement masons and plasterers | `cm-` | `cement-masons-and-plasterers` | OPCMIA Local 300 as a body |
| Warehouse and logistics automation | `tw-` | `warehouse-and-logistics-automation` | Teamsters as a body |
| Railroad crafts | `ra-` | `railroad-crafts` | BLET, SMART-TD, BMWED as bodies; FRA 49 CFR parts |
| Aviation maintenance and ground | `av-` | `aviation-maintenance-and-ground` | IAM, TWU as bodies; FAA 14 CFR parts |
| Healthcare support | `hc-` | `healthcare-support` | SEIU-UHW, NUHW as bodies; CDC, OSHA 1910.1030 |
| Education support staff | `ed-` | `education-support-staff` | AFT, CSEA as bodies |
| Water and gas utility crews | `ut-` | `water-and-gas-utility-crews` | UWUA, IBEW gas locals as bodies; 49 CFR 192 |

## Rules particular to this wave
- **Textures and colour.** Every station uses `surfaceTexture`/`texturedMat` from `citykit.js` for its ground, its main structure and at least two props (brick, block, concrete, corrugated steel, asphalt, wood grain, tile, safety stripes, grating), and a deliberate palette: an accent, a ground tone and a structure tone that read as the trade's real place. No flat single-colour boxes for the big surfaces.
- **Assets.** Vehicles and plant from `fleet.js`/`equipment.js`; site dressing from `props.js`; tools from `toolkit.js`; signage pad from `signage.js`. A builder that does not exist yet is added to the kit and documented, never inlined.
- **Facts.** No clause numbers, pressures, loads, exposure limits or hours you are not certain of: "per the permit", "per the label", "per the manufacturer's manual". Union names as training bodies only; no endorsement claimed.
- **Registration.** `node tools/add_station.mjs <id>` after each station; append the programme entry at the **end** of the `CURRICULA` array in `curricula.js` (one entry per pack, `stations` with a one-sentence `why` each, `guides` from existing ids, `accent` a hex colour). Add a programme competency to `WebXR/shared/competency.js` in the `PROGRAMME_COMPETENCIES` tier (id = programme id, `kind: "programme"`, standards from the registry, `require` about half the stations).
- **Gate.** After each station: `check_all` all pass, eval ≥95 with `standards.score` 1, commit. Browser drives and screenshots belong to the integrator.
