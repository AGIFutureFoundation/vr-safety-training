# Standards registry

_Rendered from `tools/standards.json` by `node tools/check_standards.mjs --docs` on 2026-09-24: 334 entries across 90 bodies, over the 17 catalog categories. Never edit this page by hand._

This is the one place a standard this platform teaches against is written down: the body that publishes it, its title, the catalog categories it governs, and the forms a station's own text is matched against. `tools/eval_content.mjs` scores every station on the share of its cited authorities that resolve to an entry in scope for that station's category, and `tools/check_standards.mjs` gates on every station citing at least one in-scope entry and every programme guide naming a real one.

**A clause number is never invented.** ✓ marks a citation form we are sure of. ? marks an entry carried as a body and a title because the exact designation, edition or course code is not certain — there the claim is the body and the subject, not the number.

Scope is a judgement about what a standard governs, not a record of who cites it. A citation that resolves out of scope for a station's category costs that station in the content eval, which is how a code borrowed from somebody else's trade becomes visible.

## By body

### OSHA (71)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 29 CFR 1904 — Recording and reporting occupational injuries and illnesses | `osha-1904` | all 17 categories | `29 CFR 1904` |
| ✓ | 29 CFR 1910 — Occupational safety and health standards for general industry | `osha-1910` | all 17 categories | `29 CFR 1910` |
| ✓ | 29 CFR 1910.1000 — Air contaminants and the permissible exposure limits | `osha-1910-1000` | all 17 categories | `29 CFR 1910.1000` |
| ✓ | 29 CFR 1910.1026 — Chromium (VI) (hexavalent chromium exposure in welding and cutting of stainless and chromate-coated steel) | `osha-1910-1026` | Construction & Structural Trades, Manufacturing & Automation, Maritime & Ports, Trade Skills Simulator | `29 CFR 1910.1026` |
| ✓ | 29 CFR 1910.1030 — Bloodborne pathogens | `osha-1910-1030` | all 17 categories | `29 CFR 1910.1030` |
| ✓ | 29 CFR 1910.109 — Explosives and blasting agents | `osha-1910-109` | Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Maritime & Ports | `29 CFR 1910.109` |
| ✓ | 29 CFR 1910.1096 — Ionizing radiation | `osha-1910-1096` | Building Systems & Facilities, Community Environmental Justice, Dental & Oral Health, Environmental Monitoring, Maritime & Ports, Water & Environmental | `29 CFR 1910.1096` |
| ✓ | 29 CFR 1910.119 — Process safety management of highly hazardous chemicals | `osha-1910-119` | Building Systems & Facilities, Culinary & Hospitality, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Water & Environmental | `29 CFR 1910.119` |
| ✓ | 29 CFR 1910.120 — Hazardous waste operations and emergency response (HAZWOPER) | `osha-1910-120` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Emergency Services, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `29 CFR 1910.120`, `HAZWOPER` |
| ✓ | 29 CFR 1910.1200 — Hazard communication | `osha-1910-1200` | all 17 categories | `29 CFR 1910.1200` |
| ✓ | 29 CFR 1910.132 — Personal protective equipment, general requirements | `osha-1910-132` | all 17 categories | `29 CFR 1910.132` |
| ✓ | 29 CFR 1910.133 — Eye and face protection | `osha-1910-133` | all 17 categories | `29 CFR 1910.133` |
| ✓ | 29 CFR 1910.134 — Respiratory protection | `osha-1910-134` | all 17 categories | `29 CFR 1910.134` |
| ✓ | 29 CFR 1910.138 — Hand protection | `osha-1910-138` | all 17 categories | `29 CFR 1910.138` |
| ✓ | 29 CFR 1910.146 — Permit-required confined spaces | `osha-1910-146` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Culinary & Hospitality, Emergency Services, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Surface Prep & Coatings, Trade Skills Simulator, Water & Environmental | `29 CFR 1910.146` |
| ✓ | 29 CFR 1910.147 — The control of hazardous energy (lockout/tagout) | `osha-1910-147` | Building Systems & Facilities, Connectivity & Telecom, Construction & Structural Trades, Culinary & Hospitality, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Sewing & Garment Trades, Surface Prep & Coatings, Trade Skills Simulator, Water & Environmental | `29 CFR 1910.147` |
| ✓ | 29 CFR 1910.151 — Medical services and first aid | `osha-1910-151` | all 17 categories | `29 CFR 1910.151` |
| ✓ | 29 CFR 1910.156 — Fire brigades | `osha-1910-156` | Building Systems & Facilities, Emergency Services, Energy & Power, Manufacturing & Automation, Maritime & Ports | `29 CFR 1910.156` |
| ✓ | 29 CFR 1910.157 — Portable fire extinguishers | `osha-1910-157` | all 17 categories | `29 CFR 1910.157` |
| ✓ | 29 CFR 1910.178 — Powered industrial trucks | `osha-1910-178` | Building Systems & Facilities, Construction & Structural Trades, Culinary & Hospitality, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Sewing & Garment Trades, Trade Skills Simulator, Water & Environmental | `29 CFR 1910.178` |
| ✓ | 29 CFR 1910.212 — General requirements for all machines (machine guarding) | `osha-1910-212` | Building Systems & Facilities, Construction & Structural Trades, Culinary & Hospitality, Energy & Power, Entertainment & Live Events, Manufacturing & Automation, Maritime & Ports, Sewing & Garment Trades, Trade Skills Simulator, Water & Environmental | `29 CFR 1910.212` |
| ✓ | 29 CFR 1910.217 — Mechanical power presses | `osha-1910-217` | Manufacturing & Automation, Sewing & Garment Trades, Trade Skills Simulator | `29 CFR 1910.217` |
| ✓ | 29 CFR 1910.22 — Walking-working surfaces, general requirements | `osha-1910-22` | all 17 categories | `29 CFR 1910.22` |
| ✓ | 29 CFR 1910.23 — Ladders | `osha-1910-23` | all 17 categories | `29 CFR 1910.23` |
| ✓ | 29 CFR 1910.242 — Hand and portable powered tools and equipment, general | `osha-1910-242` | Building Systems & Facilities, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Trade Skills Simulator, Water & Environmental | `29 CFR 1910.242` |
| ✓ | 29 CFR 1910.252 — Welding, cutting and brazing, general requirements | `osha-1910-252` | Building Systems & Facilities, Construction & Structural Trades, Energy & Power, Manufacturing & Automation, Maritime & Ports, Surface Prep & Coatings, Trade Skills Simulator, Water & Environmental | `29 CFR 1910.252` |
| ✓ | 29 CFR 1910.268 — Telecommunications | `osha-1910-268` | Connectivity & Telecom, Energy & Power, Entertainment & Live Events, Mobility & Transit | `29 CFR 1910.268` |
| ✓ | 29 CFR 1910.269 — Electric power generation, transmission and distribution | `osha-1910-269` | Building Systems & Facilities, Connectivity & Telecom, Emergency Services, Energy & Power, Maritime & Ports | `29 CFR 1910.269` |
| ✓ | 29 CFR 1910.272 — Grain handling facilities | `osha-1910-272` | Culinary & Hospitality, Environmental Monitoring, Manufacturing & Automation, Water & Environmental | `29 CFR 1910.272` |
| ✓ | 29 CFR 1910.28 — Duty to have fall protection and falling object protection | `osha-1910-28` | all 17 categories | `29 CFR 1910.28` |
| ✓ | 29 CFR 1910.305 — Wiring methods, components and equipment for general use | `osha-1910-305` | Building Systems & Facilities, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Trade Skills Simulator | `29 CFR 1910.305` |
| ✓ | 29 CFR 1910.333 — Selection and use of work practices for electrical safety | `osha-1910-333` | Building Systems & Facilities, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Trade Skills Simulator | `29 CFR 1910.333` |
| ✓ | 29 CFR 1910.36 — Design and construction requirements for exit routes | `osha-1910-36` | all 17 categories | `29 CFR 1910.36` |
| ✓ | 29 CFR 1910.38 — Emergency action plans | `osha-1910-38` | all 17 categories | `29 CFR 1910.38` |
| ✓ | 29 CFR 1910.424 — SCUBA diving | `osha-1910-424` | Environmental Monitoring, Maritime & Ports, Water & Environmental | `29 CFR 1910.424` |
| ✓ | 29 CFR 1910.95 — Occupational noise exposure | `osha-1910-95` | all 17 categories | `29 CFR 1910.95` |
| ✓ | 29 CFR 1910 Subpart T — Commercial diving operations (dive team qualifications, the safe practices manual, pre-dive, during-dive and post-dive procedures, equipment and the dive record) | `osha-1910-subpart-t` | Environmental Monitoring, Maritime & Ports, Water & Environmental | `29 CFR 1910 Subpart T` |
| ✓ | 29 CFR 1915 — Occupational safety and health standards for shipyard employment | `osha-1915` | Maritime & Ports, Water & Environmental | `29 CFR 1915` |
| ✓ | 29 CFR 1915.12 — Precautions before entering a shipyard confined or enclosed space | `osha-1915-12` | Maritime & Ports | `29 CFR 1915.12` |
| ✓ | 29 CFR 1915.14 — Hot work authorisation in shipyard employment | `osha-1915-14` | Maritime & Ports | `29 CFR 1915.14` |
| ✓ | 29 CFR 1915.15 — Maintenance of safe conditions in shipyard spaces | `osha-1915-15` | Maritime & Ports | `29 CFR 1915.15` |
| ✓ | 29 CFR 1915.503 — Precautions for hot work (shipyard fire protection) | `osha-1915-503` | Maritime & Ports | `29 CFR 1915.503` |
| ✓ | 29 CFR 1915.504 — Fire watches | `osha-1915-504` | Building Systems & Facilities, Construction & Structural Trades, Manufacturing & Automation, Maritime & Ports | `29 CFR 1915.504` |
| ✓ | 29 CFR 1917 — Marine terminals | `osha-1917` | Maritime & Ports | `29 CFR 1917` |
| ✓ | 29 CFR 1918 — Safety and health regulations for longshoring | `osha-1918` | Maritime & Ports | `29 CFR 1918` |
| ✓ | 29 CFR 1926 — Safety and health regulations for construction | `osha-1926` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `29 CFR 1926` |
| ✓ | 29 CFR 1926.103 — Respiratory protection in construction | `osha-1926-103` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `29 CFR 1926.103` |
| ✓ | 29 CFR 1926.106 — Working over or near water | `osha-1926-106` | Community Environmental Justice, Construction & Structural Trades, Environmental Monitoring, Maritime & Ports, Water & Environmental | `29 CFR 1926.106` |
| ✓ | 29 CFR 1926.1101 — Asbestos in construction | `osha-1926-1101` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Environmental Monitoring, Surface Prep & Coatings, Water & Environmental | `29 CFR 1926.1101` |
| ✓ | 29 CFR 1926.1153 — Respirable crystalline silica in construction | `osha-1926-1153` | Community Environmental Justice, Construction & Structural Trades, Energy & Power, Environmental Monitoring, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `29 CFR 1926.1153` |
| ✓ | 29 CFR 1926.1425 — Keeping clear of the load (cranes and derricks in construction) | `osha-1926-1425` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Water & Environmental | `29 CFR 1926.1425` |
| ? | OSHA 29 CFR 1926.20(b)(2) Competent person accident prevention responsibilities | `osha-1926-20-b-2` | Building Systems & Facilities, Connectivity & Telecom, Construction & Structural Trades, Emergency Services, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Trade Skills Simulator, Water & Environmental | `29 CFR 1926.20(b)(2) Competent person accident prevention re` |
| ✓ | 29 CFR 1926.21 — Safety training and education in construction | `osha-1926-21` | Community Environmental Justice, Construction & Structural Trades | `29 CFR 1926.21` |
| ✓ | 29 CFR 1926.404 — Wiring design and protection on a construction site | `osha-1926-404` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `29 CFR 1926.404` |
| ✓ | 29 CFR 1926.405 — Wiring methods, components and equipment for general use in construction | `osha-1926-405` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `29 CFR 1926.405` |
| ✓ | 29 CFR 1926.416 — General requirements for electrical work practices in construction | `osha-1926-416` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Emergency Services, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `29 CFR 1926.416` |
| ✓ | 29 CFR 1926.451 — Scaffolds, general requirements | `osha-1926-451` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `29 CFR 1926.451` |
| ✓ | 29 CFR 1926.453 — Aerial lifts | `osha-1926-453` | Building Systems & Facilities, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Manufacturing & Automation, Maritime & Ports, Mobility & Transit | `29 CFR 1926.453` |
| ✓ | 29 CFR 1926.454 — Training requirements for scaffold erectors and users | `osha-1926-454` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `29 CFR 1926.454` |
| ✓ | 29 CFR 1926.501 — Duty to have fall protection | `osha-1926-501` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `29 CFR 1926.501` |
| ✓ | 29 CFR 1926.502 — Fall protection systems criteria and practices | `osha-1926-502` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `29 CFR 1926.502` |
| ✓ | 29 CFR 1926.62 — Lead in construction | `osha-1926-62` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `29 CFR 1926.62` |
| ✓ | 29 CFR 1926.701 — Concrete and masonry construction, general requirements | `osha-1926-701` | Construction & Structural Trades, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `29 CFR 1926.701` |
| ✓ | 29 CFR 1926.703 — Requirements for cast-in-place concrete | `osha-1926-703` | Construction & Structural Trades, Maritime & Ports, Water & Environmental | `29 CFR 1926.703` |
| ? | OSHA 29 CFR 1926 Subpart CC Cranes and derricks in construction | `osha-1926-subpart-cc` | Building Systems & Facilities, Connectivity & Telecom, Construction & Structural Trades, Emergency Services, Energy & Power, Entertainment & Live Events, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Trade Skills Simulator, Water & Environmental | `29 CFR 1926 Subpart CC Cranes and derricks in construction` |
| ? | OSHA 29 CFR 1926 Subpart L Scaffolds | `osha-1926-subpart-l` | Connectivity & Telecom, Construction & Structural Trades, Emergency Services, Energy & Power, Entertainment & Live Events | `29 CFR 1926 Subpart L Scaffolds` |
| ? | OSHA 29 CFR 1926 Subpart M Fall protection | `osha-1926-subpart-m` | Connectivity & Telecom, Construction & Structural Trades, Emergency Services, Energy & Power, Entertainment & Live Events | `29 CFR 1926 Subpart M Fall protection` |
| ? | OSHA 29 CFR 1926 Subpart P Excavations | `osha-1926-subpart-p` | Building Systems & Facilities, Connectivity & Telecom, Construction & Structural Trades, Emergency Services, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Trade Skills Simulator, Water & Environmental | `29 CFR 1926 Subpart P Excavations` |
| ? | OSHA 29 CFR 1926 Subpart Q Concrete and masonry construction | `osha-1926-subpart-q` | Construction & Structural Trades | `29 CFR 1926 Subpart Q Concrete and masonry construction` |
| ? | OSHA 29 CFR 1926 Subpart R Steel erection | `osha-1926-subpart-r` | Construction & Structural Trades | `29 CFR 1926 Subpart R Steel erection` |
| ? | OSHA Outreach Training Program — the 10-hour construction course (OSHA 10): voluntary awareness training taught by an authorized trainer, not a certification and not a substitute for the employer's own training | `osha-outreach-10` | Community Environmental Justice | `OSHA 10`, `OSHA Outreach Training Program` |

### NFPA (30)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | NFPA 1001 — Fire Fighter Professional Qualifications | `nfpa-1001` | Emergency Services | `NFPA 1001` |
| ✓ | NFPA 1002 — Fire Apparatus Driver/Operator Professional Qualifications | `nfpa-1002` | Emergency Services | `NFPA 1002` |
| ✓ | NFPA 1006 — Technical Rescue Personnel Professional Qualifications | `nfpa-1006` | Building Systems & Facilities, Construction & Structural Trades, Emergency Services, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Water & Environmental | `NFPA 1006` |
| ✓ | NFPA 101 — Life Safety Code | `nfpa-101` | Building Systems & Facilities, Community Environmental Justice, Culinary & Hospitality, Dental & Oral Health, Emergency Services, Entertainment & Live Events, Manufacturing & Automation, Maritime & Ports, Sewing & Garment Trades, Trade Skills Simulator | `NFPA 101` |
| ✓ | NFPA 1126 — Use of Pyrotechnics before a Proximate Audience | `nfpa-1126` | Entertainment & Live Events | `NFPA 1126` |
| ✓ | NFPA 1140 — Standard for Wildland Fire Protection | `nfpa-1140` | Community Environmental Justice, Emergency Services | `NFPA 1140` |
| ✓ | NFPA 1500 — Fire Department Occupational Safety, Health and Wellness Program | `nfpa-1500` | Emergency Services | `NFPA 1500` |
| ✓ | NFPA 1584 — Rehabilitation Process for Members during Emergency Operations and Training Exercises | `nfpa-1584` | Emergency Services | `NFPA 1584` |
| ✓ | NFPA 1670 — Operations and Training for Technical Search and Rescue Incidents | `nfpa-1670` | Building Systems & Facilities, Construction & Structural Trades, Emergency Services, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Water & Environmental | `NFPA 1670` |
| ✓ | NFPA 1710 — Organization and Deployment of Fire Suppression, EMS and Special Operations by Career Fire Departments | `nfpa-1710` | Emergency Services | `NFPA 1710` |
| ✓ | NFPA 17A — Standard for Wet Chemical Extinguishing Systems | `nfpa-17a` | Building Systems & Facilities, Culinary & Hospitality, Trade Skills Simulator | `NFPA 17A` |
| ? | NFPA 1901 — Automotive Fire Apparatus (now consolidated in the NFPA 1900 series) | `nfpa-1901` | Emergency Services | `NFPA 1901` |
| ✓ | NFPA 1977 — Protective Clothing and Equipment for Wildland Fire Fighting | `nfpa-1977` | Emergency Services | `NFPA 1977` |
| ✓ | NFPA 25 — Inspection, Testing and Maintenance of Water-Based Fire Protection Systems | `nfpa-25` | Building Systems & Facilities, Construction & Structural Trades, Culinary & Hospitality, Dental & Oral Health, Energy & Power, Entertainment & Live Events, Manufacturing & Automation, Maritime & Ports, Sewing & Garment Trades | `NFPA 25` |
| ✓ | NFPA 306 — Control of Gas Hazards on Vessels | `nfpa-306` | Maritime & Ports | `NFPA 306` |
| ✓ | NFPA 470 — Hazardous Materials/WMD Response Personnel Professional Qualifications | `nfpa-470` | Community Environmental Justice, Emergency Services, Energy & Power, Environmental Monitoring, Maritime & Ports, Water & Environmental | `NFPA 470` |
| ✓ | NFPA 472 — Competence of Responders to Hazardous Materials/WMD Incidents (consolidated into NFPA 470) | `nfpa-472` | Community Environmental Justice, Emergency Services, Environmental Monitoring, Maritime & Ports, Water & Environmental | `NFPA 472` |
| ✓ | NFPA 51B — Fire Prevention During Welding, Cutting and Other Hot Work | `nfpa-51b` | Building Systems & Facilities, Construction & Structural Trades, Energy & Power, Manufacturing & Automation, Maritime & Ports, Surface Prep & Coatings, Trade Skills Simulator, Water & Environmental | `NFPA 51B` |
| ✓ | NFPA 54 — National Fuel Gas Code | `nfpa-54` | Building Systems & Facilities, Culinary & Hospitality, Energy & Power, Trade Skills Simulator | `NFPA 54` |
| ✓ | NFPA 55 — Compressed Gases and Cryogenic Fluids Code | `nfpa-55` | Building Systems & Facilities, Culinary & Hospitality, Dental & Oral Health, Energy & Power, Manufacturing & Automation, Maritime & Ports, Water & Environmental | `NFPA 55` |
| ✓ | NFPA 69 — Standard on Explosion Prevention Systems | `nfpa-69` | Building Systems & Facilities, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Water & Environmental | `NFPA 69` |
| ? | NFPA 70 National Electrical Code Article 690 Solar photovoltaic systems | `nfpa-70-art-690` | Connectivity & Telecom, Energy & Power | `70 National Electrical Code Article 690 Solar photovoltaic s` |
| ✓ | NFPA 70E — Standard for Electrical Safety in the Workplace | `nfpa-70e` | Building Systems & Facilities, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Trade Skills Simulator | `NFPA 70E` |
| ✓ | NFPA 72 National Fire Alarm and Signaling Code | `nfpa-72` | Building Systems & Facilities, Emergency Services | `NFPA 72` |
| ✓ | NFPA 780 — Installation of Lightning Protection Systems | `nfpa-780` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Energy & Power, Environmental Monitoring | `NFPA 780` |
| ✓ | NFPA 820 — Fire Protection in Wastewater Treatment and Collection Facilities | `nfpa-820` | Environmental Monitoring, Water & Environmental | `NFPA 820` |
| ✓ | NFPA 85 — Boiler and Combustion Systems Hazards Code | `nfpa-85` | Building Systems & Facilities, Culinary & Hospitality, Energy & Power, Manufacturing & Automation, Maritime & Ports | `NFPA 85` |
| ✓ | NFPA 855 — Installation of Stationary Energy Storage Systems | `nfpa-855` | Building Systems & Facilities, Connectivity & Telecom, Energy & Power, Mobility & Transit | `NFPA 855` |
| ✓ | NFPA 96 — Ventilation Control and Fire Protection of Commercial Cooking Operations | `nfpa-96` | Building Systems & Facilities, Culinary & Hospitality, Manufacturing & Automation, Trade Skills Simulator | `NFPA 96` |
| ✓ | NFPA 99 — Health Care Facilities Code | `nfpa-99` | Building Systems & Facilities, Dental & Oral Health, Emergency Services | `NFPA 99` |

### Unions, apprenticeships and training funds (29)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | AFSCME member education and safety training for public-service and air-district members | `afscme-training` | Community Environmental Justice, Culinary & Hospitality, Dental & Oral Health, Emergency Services, Environmental Monitoring, Maritime & Ports, Water & Environmental | `AFSCME` |
| ? | ATU member training for bus and rail transit operations | `atu-training` | Mobility & Transit | `ATU` |
| ✓ | BAC and the International Masonry Institute — bricklayer, tile and refractory apprenticeship | `bac-imi` | Building Systems & Facilities, Construction & Structural Trades, Surface Prep & Coatings | `International Masonry Institute`, `BAC` |
| ? | BCTGM apprenticeship and safety training for bakery, confectionery and grain milling work | `bctgm-training` | Culinary & Hospitality, Manufacturing & Automation | `BCTGM` |
| ? | BMWED roadway worker training for track and structures maintenance | `bmwed-training` | Mobility & Transit | `BMWED` |
| ? | United Brotherhood of Carpenters International Training Fund — carpenter, pile driver and millwright apprenticeship | `carpenters-ictf` | Building Systems & Facilities, Construction & Structural Trades, Entertainment & Live Events, Maritime & Ports, Water & Environmental | `Carpenters`, `UBC`, `Pile Drivers` |
| ? | CWA member training for outside-plant, tower and broadcast work | `cwa-training` | Community Environmental Justice, Connectivity & Telecom, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Trade Skills Simulator, Water & Environmental | `CWA` |
| ✓ | IAFF training programmes, including Fire Ground Survival and the peer support model | `iaff-training` | Emergency Services | `IAFF`, `IAEP` |
| ✓ | IAM — the William W. Winpisinger Education and Technology Center's machinist and transportation training | `iam-winpisinger-center` | Manufacturing & Automation, Mobility & Transit, Trade Skills Simulator | `IAM` |
| ✓ | IATSE Training Trust Fund — stagecraft, rigging and entertainment electrical skills training | `iatse-training-trust` | Entertainment & Live Events | `IATSE` |
| ✓ | IBEW/NECA Joint Apprenticeship and Training Committee — inside and outside wireman apprenticeship standards, taught from the electrical training ALLIANCE curriculum | `ibew-neca-jatc` | Building Systems & Facilities, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Trade Skills Simulator | `IBEW/NECA JATC`, `IBEW`, `NECA` |
| ? | ILWU-PMA joint training for longshore, crane and clerk work, and the Inlandboatmen's Union marine division | `ilwu-pma-training` | Maritime & Ports, Water & Environmental | `ILWU`, `PMA`, `IBU` |
| ✓ | Ironworkers and IMPACT — apprenticeship and safety training for structural, ornamental and reinforcing ironwork | `ironworkers-impact` | Building Systems & Facilities, Construction & Structural Trades, Energy & Power, Maritime & Ports | `IMPACT`, `Ironworkers` |
| ✓ | IUOE local training funds and the IUOE National Training Fund — operating and stationary engineer apprenticeship | `iuoe-training` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Energy & Power, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Water & Environmental | `IUOE` |
| ✓ | IUPAT Finishing Trades Institute — industrial painter, glazier and drywall finisher apprenticeship, including lead and containment training | `iupat-fti` | Building Systems & Facilities, Construction & Structural Trades, Maritime & Ports, Surface Prep & Coatings | `Finishing Trades Institute`, `IUPAT` |
| ✓ | LIUNA Training and Education Fund — construction craft laborer, hazardous waste and environmental remediation curricula | `liuna-training-fund` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Emergency Services, Energy & Power, Environmental Monitoring, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `LIUNA Training`, `LIUNA` |
| ✓ | MEBA — the Calhoon MEBA Engineering School's licensed marine engineer training | `meba-calhoon-school` | Maritime & Ports | `MEBA` |
| ? | NAEMT course programmes — PHTLS, AMLS and EMS Safety | `naemt-courses` | Emergency Services | `NAEMT` |
| ✓ | NASW Code of Ethics and the association's practice standards for social work and crisis counselling | `nasw-code-of-ethics` | Community Environmental Justice, Dental & Oral Health, Emergency Services | `NASW Code of Ethics`, `NASW` |
| ? | SEIU and Workers United education and training funds for clinic, garment, food-service and public-service members | `seiu-training` | Building Systems & Facilities, Community Environmental Justice, Culinary & Hospitality, Dental & Oral Health, Emergency Services, Environmental Monitoring, Sewing & Garment Trades | `SEIU`, `Workers United` |
| ✓ | SIU — the Paul Hall Center for Maritime Training and Education's unlicensed mariner programmes | `siu-paul-hall-center` | Maritime & Ports | `SIU` |
| ✓ | SMART and the International Training Institute — sheet metal, rail and transportation apprenticeship | `smart-iti` | Building Systems & Facilities, Construction & Structural Trades, Manufacturing & Automation, Mobility & Transit, Trade Skills Simulator | `SMART` |
| ? | Teamsters apprenticeship and driver training programmes, including regulated-soil and yard work | `teamsters-training` | Community Environmental Justice, Culinary & Hospitality, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Mobility & Transit | `Teamsters`, `IBT` |
| ? | TWU member training for transit and airline ground operations | `twu-training` | Mobility & Transit | `TWU` |
| ✓ | UA — United Association plumber, pipefitter and HVAC service apprenticeship standards and UA Star certification | `ua-apprenticeship` | Building Systems & Facilities, Construction & Structural Trades, Culinary & Hospitality, Energy & Power, Manufacturing & Automation, Maritime & Ports, Trade Skills Simulator, Water & Environmental | `UA Star`, `UA` |
| ? | UAW joint apprenticeship and skilled-trades training for manufacturing and automation work | `uaw-training` | Manufacturing & Automation, Trade Skills Simulator | `UAW` |
| ? | UFCW member training for retail food, clinic and dental support work | `ufcw-training` | Culinary & Hospitality, Dental & Oral Health, Manufacturing & Automation | `UFCW` |
| ? | UNITE HERE hospitality training funds — cooks, housekeepers, bartenders and banquet staff | `unite-here-training` | Building Systems & Facilities, Culinary & Hospitality | `UNITE HERE` |
| ✓ | USW Tony Mazzocchi Center health, safety and environmental training | `usw-mazzocchi-center` | Community Environmental Justice, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Water & Environmental | `USW` |

### ANSI/ASSP (22)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | ANSI/ASSP A10.34 — Protection of the public on or adjacent to construction sites | `ansi-a10-34` | Construction & Structural Trades, Mobility & Transit, Surface Prep & Coatings | `ANSI A10.34` |
| ? | ANSI/ASSP A10.47 — Work zone safety for highway construction | `ansi-a10-47` | Construction & Structural Trades, Mobility & Transit, Surface Prep & Coatings | `ANSI A10.47` |
| ✓ | ANSI/ASSP A10.8 — Scaffolding safety requirements | `ansi-a10-8` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `ANSI A10.8` |
| ✓ | ANSI/ASSP A10.9 — Concrete and masonry construction safety requirements | `ansi-a10-9` | Construction & Structural Trades, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `ANSI A10.9` |
| ✓ | ANSI/SAIA A92 — Mobile elevating work platforms: design, safe use and training | `ansi-a92` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Culinary & Hospitality, Emergency Services, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `ANSI A92` |
| ? | ANSI/SAIA A92.9 — Mast-climbing work platforms | `ansi-a92-9` | Building Systems & Facilities, Construction & Structural Trades, Surface Prep & Coatings | `ANSI A92.9` |
| ✓ | ANSI B11 — Safety of machinery (the B11 series of machine-tool standards) | `ansi-b11` | Building Systems & Facilities, Construction & Structural Trades, Culinary & Hospitality, Energy & Power, Entertainment & Live Events, Manufacturing & Automation, Maritime & Ports, Sewing & Garment Trades, Trade Skills Simulator, Water & Environmental | `ANSI B11` |
| ? | ANSI B11.22 — Safety requirements for turning machines with automatic control | `ansi-b11-22` | Manufacturing & Automation, Trade Skills Simulator | `ANSI B11.22` |
| ✓ | ANSI B11.3 — Safety requirements for power press brakes | `ansi-b11-3` | Manufacturing & Automation, Sewing & Garment Trades, Trade Skills Simulator | `ANSI B11.3` |
| ✓ | ANSI/ITSDF B56.1 — Safety standard for low lift and high lift trucks | `ansi-b56-1` | Building Systems & Facilities, Construction & Structural Trades, Culinary & Hospitality, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Sewing & Garment Trades, Water & Environmental | `ANSI B56.1` |
| ✓ | ANSI E1.4 — Entertainment technology: manual counterweight rigging systems | `ansi-e1-4` | Entertainment & Live Events | `ANSI E1.4` |
| ? | ANSI E1.6 — Entertainment technology: powered hoist systems for the entertainment industry | `ansi-e1-6` | Entertainment & Live Events | `ANSI E1.6` |
| ✓ | ANSI/ISEA 105 — Hand protection classification, including the A1–A9 cut levels | `ansi-isea-105` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Culinary & Hospitality, Dental & Oral Health, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Sewing & Garment Trades, Surface Prep & Coatings, Trade Skills Simulator, Water & Environmental | `ANSI/ISEA 105`, `ANSI/ISEA A4`, `ANSI A4` |
| ✓ | ANSI/ISEA 107 — High-visibility safety apparel and accessories | `ansi-isea-107` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Culinary & Hospitality, Emergency Services, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `ANSI/ISEA 107`, `ANSI/ISEA-rated` |
| ✓ | ANSI/RIA R15.06 — Industrial robots and robot systems: safety requirements | `ansi-r15-06` | Building Systems & Facilities, Culinary & Hospitality, Manufacturing & Automation, Maritime & Ports, Trade Skills Simulator | `ANSI R15.06` |
| ✓ | ANSI/ASSP Z117.1 — Safety requirements for entering confined spaces | `ansi-z117-1` | Building Systems & Facilities, Construction & Structural Trades, Culinary & Hospitality, Emergency Services, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Surface Prep & Coatings, Trade Skills Simulator, Water & Environmental | `ANSI Z117.1` |
| ✓ | ANSI Z136 — Safe use of lasers, including Z136.2 for optical-fibre communication systems | `ansi-z136` | Building Systems & Facilities, Connectivity & Telecom, Dental & Oral Health, Entertainment & Live Events, Manufacturing & Automation, Trade Skills Simulator | `ANSI Z136` |
| ✓ | ANSI Z223.1 / NFPA 54 — National Fuel Gas Code | `ansi-z223-1` | Building Systems & Facilities, Culinary & Hospitality, Energy & Power, Trade Skills Simulator | `ANSI Z223.1` |
| ✓ | ANSI/ISEA Z358.1 — Emergency eyewash and shower equipment | `ansi-z358-1` | all 17 categories | `ANSI Z358.1` |
| ✓ | ANSI/ASSP Z359 — Fall Protection Code | `ansi-z359` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Emergency Services, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `ANSI Z359` |
| ✓ | ANSI/AWS Z49.1 — Safety in welding, cutting and allied processes | `ansi-z49-1` | Building Systems & Facilities, Construction & Structural Trades, Energy & Power, Manufacturing & Automation, Maritime & Ports, Surface Prep & Coatings, Trade Skills Simulator, Water & Environmental | `ANSI Z49.1` |
| ✓ | ANSI Z535.4 — Product safety signs and labels | `ansi-z535-4` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Culinary & Hospitality, Dental & Oral Health, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Sewing & Garment Trades, Surface Prep & Coatings, Trade Skills Simulator, Water & Environmental | `ANSI Z535.4` |

### EPA (16)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 40 CFR 122.26 — Storm water discharges under the NPDES permit programme | `epa-40-cfr-122-26` | Community Environmental Justice, Construction & Structural Trades, Environmental Monitoring, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `40 CFR 122.26` |
| ✓ | 40 CFR Part 136 — Test procedures for the analysis of pollutants | `epa-40-cfr-136` | Community Environmental Justice, Environmental Monitoring, Maritime & Ports, Water & Environmental | `40 CFR 136` |
| ✓ | 40 CFR Part 25 — Public participation in programmes under RCRA, the Safe Drinking Water Act and the Clean Water Act | `epa-40-cfr-25` | Community Environmental Justice, Environmental Monitoring, Water & Environmental | `40 CFR 25` |
| ✓ | 40 CFR 258.23 — Explosive gases control at municipal solid waste landfills | `epa-40-cfr-258-23` | Community Environmental Justice, Environmental Monitoring, Water & Environmental | `40 CFR 258.23` |
| ✓ | 40 CFR Part 280 — Technical standards for underground storage tanks | `epa-40-cfr-280` | Community Environmental Justice, Energy & Power, Environmental Monitoring, Water & Environmental | `40 CFR 280` |
| ✓ | 40 CFR Part 300 — National Oil and Hazardous Substances Pollution Contingency Plan | `epa-40-cfr-300` | Community Environmental Justice, Emergency Services, Environmental Monitoring, Maritime & Ports, Water & Environmental | `40 CFR 300` |
| ✓ | 40 CFR Part 441 — Dental office point source category (the amalgam separator rule) | `epa-40-cfr-441` | Dental & Oral Health | `40 CFR 441` |
| ✓ | 40 CFR Part 58 — Ambient air quality surveillance, including monitor siting and quality assurance | `epa-40-cfr-58` | Community Environmental Justice, Environmental Monitoring, Maritime & Ports, Water & Environmental | `40 CFR 58` |
| ✓ | 40 CFR Part 60 — Standards of performance for new stationary sources, with the Appendix A reference test methods | `epa-40-cfr-60` | Community Environmental Justice, Energy & Power, Environmental Monitoring, Maritime & Ports, Water & Environmental | `40 CFR 60` |
| ✓ | 40 CFR Part 61 — National Emission Standards for Hazardous Air Pollutants, including the asbestos NESHAP | `epa-40-cfr-61` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Environmental Monitoring, Surface Prep & Coatings, Water & Environmental | `40 CFR 61` |
| ✓ | 40 CFR Part 745 — Lead-based paint activities and the Renovation, Repair and Painting rule | `epa-40-cfr-745` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Surface Prep & Coatings | `40 CFR 745` |
| ✓ | 40 CFR Part 761 — Polychlorinated biphenyls (PCB) use, storage and disposal | `epa-40-cfr-761` | Building Systems & Facilities, Community Environmental Justice, Energy & Power, Environmental Monitoring, Water & Environmental | `40 CFR 761` |
| ✓ | EPA Method 9 (40 CFR Part 60 Appendix A) — visual determination of the opacity of emissions | `epa-method-9` | Community Environmental Justice, Environmental Monitoring | `EPA Method 9` |
| ✓ | EPA QA/G-5 — Guidance for quality assurance project plans, and the chain-of-custody practice built on it | `epa-qa-g5` | Community Environmental Justice, Environmental Monitoring, Maritime & Ports, Water & Environmental | `EPA QA/G-5`, `QA/G-5` |
| ✓ | Clean Air Act §608 (40 CFR Part 82 Subpart F) — refrigerant handling, recovery and technician certification | `epa-section-608` | Building Systems & Facilities, Culinary & Hospitality, Energy & Power, Manufacturing & Automation, Maritime & Ports, Trade Skills Simulator | `Section 608` |
| ✓ | MARSSIM — Multi-Agency Radiation Survey and Site Investigation Manual | `marssim` | Building Systems & Facilities, Community Environmental Justice, Environmental Monitoring, Water & Environmental | `MARSSIM` |

### ASME (11)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | ASME A17.1 — Safety Code for Elevators and Escalators | `asme-a17-1` | Building Systems & Facilities, Culinary & Hospitality, Entertainment & Live Events, Maritime & Ports, Mobility & Transit | `ASME A17.1` |
| ✓ | ASME B20.1 — Safety standard for conveyors and related equipment | `asme-b20-1` | Building Systems & Facilities, Construction & Structural Trades, Culinary & Hospitality, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Sewing & Garment Trades, Water & Environmental | `ASME B20.1` |
| ✓ | ASME B30.16 — Overhead underhung and stationary hoists | `asme-b30-16` | Building Systems & Facilities, Construction & Structural Trades, Entertainment & Live Events, Manufacturing & Automation, Maritime & Ports, Trade Skills Simulator | `ASME B30.16` |
| ? | ASME B30.2 — Overhead and gantry cranes (top running bridge, single or multiple girder, top running trolley hoist) | `asme-b30-2` | Building Systems & Facilities, Construction & Structural Trades, Manufacturing & Automation, Maritime & Ports, Trade Skills Simulator | `ASME B30.2` |
| ? | ASME B30.20 — Below-the-hook lifting devices | `asme-b30-20` | Building Systems & Facilities, Construction & Structural Trades, Manufacturing & Automation, Maritime & Ports, Trade Skills Simulator | `ASME B30.20` |
| ✓ | ASME B30.26 — Rigging hardware | `asme-b30-26` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Water & Environmental | `ASME B30.26` |
| ✓ | ASME B30.4 — Portal and pedestal cranes | `asme-b30-4` | Maritime & Ports | `ASME B30.4` |
| ✓ | ASME B30.5 — Mobile and locomotive cranes | `asme-b30-5` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Water & Environmental | `ASME B30.5`, `ANSI B30.5` |
| ✓ | ASME B30.9 — Slings | `asme-b30-9` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Water & Environmental | `ASME B30.9` |
| ✓ | ASME B31.9 — Building services piping | `asme-b31-9` | Building Systems & Facilities, Energy & Power, Trade Skills Simulator, Water & Environmental | `ASME B31.9` |
| ? | ASME Boiler and Pressure Vessel Code | `asme-bpvc` | Building Systems & Facilities | `Boiler and Pressure Vessel Code` |

### Cal/OSHA (7)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 8 CCR 3203 — Injury and Illness Prevention Program | `cal-osha-3203` | all 17 categories | `8 CCR 3203` |
| ✓ | 8 CCR 3342 — Workplace violence prevention plan | `cal-osha-3342` | Building Systems & Facilities, Community Environmental Justice, Culinary & Hospitality, Dental & Oral Health, Emergency Services, Environmental Monitoring, Maritime & Ports, Mobility & Transit | `8 CCR 3342` |
| ✓ | 8 CCR 3345 — Hotel housekeeping musculoskeletal injury prevention programme | `cal-osha-3345` | Building Systems & Facilities, Culinary & Hospitality | `8 CCR 3345` |
| ✓ | 8 CCR 5110 — Repetitive motion injuries | `cal-osha-5110` | Building Systems & Facilities, Culinary & Hospitality, Dental & Oral Health, Manufacturing & Automation, Sewing & Garment Trades, Trade Skills Simulator | `8 CCR 5110` |
| ✓ | 8 CCR 5141 — Control of harmful exposure to employees | `cal-osha-5141` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Culinary & Hospitality, Dental & Oral Health, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Sewing & Garment Trades, Surface Prep & Coatings, Trade Skills Simulator, Water & Environmental | `8 CCR 5141` |
| ✓ | 8 CCR 5141.1 — Protection from wildfire smoke | `cal-osha-5141-1` | Community Environmental Justice, Construction & Structural Trades, Emergency Services, Energy & Power, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Surface Prep & Coatings, Water & Environmental | `8 CCR 5141.1`, `wildfire-smoke rule`, `wildfire smoke rule` |
| ✓ | 8 CCR 5194 — Hazard Communication | `cal-osha-5194` | all 17 categories | `8 CCR 5194` |

### FMCSA (6)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 49 CFR Part 380 Subpart F — Entry-level driver training requirements for Class A and Class B commercial driver licence applicants, delivered by a provider listed on the Training Provider Registry | `fmcsa-49-cfr-380-subpart-f` | Maritime & Ports, Mobility & Transit | `49 CFR 380 Subpart F`, `49 CFR 380` |
| ✓ | 49 CFR Part 383 — Commercial driver's license standards; requirements and penalties, including the Class A, B and C vehicle groups and the knowledge and skills tests | `fmcsa-49-cfr-383` | Maritime & Ports, Mobility & Transit | `49 CFR 383` |
| ✓ | 49 CFR Part 392 — Driving of commercial motor vehicles, including conduct at railroad grade crossings, hazardous conditions, and the hand-held mobile phone and texting prohibitions | `fmcsa-49-cfr-392` | Maritime & Ports, Mobility & Transit | `49 CFR 392` |
| ✓ | 49 CFR Part 393 — Parts and accessories necessary for safe operation, including brakes, tires, emergency equipment and Subpart I protection against shifting and falling cargo | `fmcsa-49-cfr-393` | Maritime & Ports, Mobility & Transit | `49 CFR 393` |
| ✓ | 49 CFR Part 395 — Hours of service of drivers, including electronic logging devices | `fmcsa-49-cfr-395` | Maritime & Ports, Mobility & Transit | `49 CFR 395` |
| ✓ | 49 CFR Part 396 — Inspection, repair and maintenance, including the driver vehicle inspection report | `fmcsa-49-cfr-396` | Maritime & Ports, Mobility & Transit | `49 CFR 396` |

### NSF (6)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | NSF/ANSI 18 — Manual food and beverage dispensing equipment | `nsf-ansi-18` | Culinary & Hospitality, Trade Skills Simulator | `NSF/ANSI 18` |
| ✓ | NSF/ANSI 2 — Food equipment | `nsf-ansi-2` | Culinary & Hospitality, Trade Skills Simulator | `NSF/ANSI 2` |
| ✓ | NSF/ANSI 4 — Commercial cooking, rethermalization and powered hot food holding equipment | `nsf-ansi-4` | Culinary & Hospitality, Trade Skills Simulator | `NSF/ANSI 4` |
| ✓ | NSF/ANSI/CAN 61 — Drinking water system components: health effects | `nsf-ansi-61` | Building Systems & Facilities, Construction & Structural Trades, Surface Prep & Coatings, Trade Skills Simulator, Water & Environmental | `NSF/ANSI 61` |
| ✓ | NSF/ANSI 7 — Commercial refrigerators and freezers | `nsf-ansi-7` | Culinary & Hospitality, Trade Skills Simulator | `NSF/ANSI 7` |
| ✓ | NSF/ANSI 8 — Commercial powered food preparation equipment | `nsf-ansi-8` | Culinary & Hospitality, Trade Skills Simulator | `NSF/ANSI 8` |

### USCG (6)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 33 CFR Part 126 — Handling of dangerous cargo at waterfront facilities | `uscg-33-cfr-126` | Maritime & Ports | `33 CFR 126` |
| ✓ | 33 CFR Part 151 — Vessel pollution prevention and ballast water management | `uscg-33-cfr-151` | Environmental Monitoring, Maritime & Ports, Water & Environmental | `33 CFR 151` |
| ✓ | 33 CFR 155.710 — Duties and qualifications of the person in charge of an oil transfer | `uscg-33-cfr-155-710` | Maritime & Ports | `33 CFR 155.710` |
| ✓ | 33 CFR 156.150 — Declaration of inspection before an oil transfer | `uscg-33-cfr-156-150` | Maritime & Ports | `33 CFR 156.150` |
| ? | 46 CFR Part 197 Subpart B — Commercial diving operations from vessels and facilities under Coast Guard jurisdiction | `uscg-46-cfr-197-subpart-b` | Maritime & Ports, Water & Environmental | `46 CFR 197 Subpart B`, `46 CFR 197` |
| ✓ | 46 CFR Subchapter M — Inspection of towing vessels | `uscg-subchapter-m` | Maritime & Ports, Water & Environmental | `46 CFR Subchapter M`, `Subchapter M` |

### IMO (5)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | IMO Ballast Water Management Convention | `imo-bwm` | Environmental Monitoring, Maritime & Ports, Water & Environmental | `IMO BWM Convention`, `BWM Convention` |
| ? | IMO Cargo Securing Manual requirements | `imo-csm` | Maritime & Ports | `Cargo Securing Manual requirements` |
| ✓ | MARPOL — International Convention for the Prevention of Pollution from Ships | `imo-marpol` | Environmental Monitoring, Maritime & Ports, Water & Environmental | `IMO MARPOL`, `MARPOL` |
| ✓ | SOLAS — International Convention for the Safety of Life at Sea | `imo-solas` | Maritime & Ports | `IMO SOLAS`, `SOLAS` |
| ✓ | STCW — Convention on Standards of Training, Certification and Watchkeeping for Seafarers | `imo-stcw` | Maritime & Ports | `IMO STCW`, `STCW` |

### ISO (5)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | IEC 61010 — Safety requirements for electrical measurement, control and laboratory equipment (the CAT ratings) | `iec-61010` | Building Systems & Facilities, Connectivity & Telecom, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Trade Skills Simulator | `IEC 61010` |
| ✓ | ISO 10218 — Robots and robotic devices: safety requirements for industrial robots | `iso-10218` | Building Systems & Facilities, Manufacturing & Automation, Trade Skills Simulator | `ISO 10218` |
| ✓ | ISO 23908 — Sharps injury protection: requirements and test methods | `iso-23908` | Dental & Oral Health, Emergency Services, Trade Skills Simulator | `ISO 23908` |
| ✓ | ISO 6710 — Single-use containers for human venous blood specimen collection | `iso-6710` | Dental & Oral Health, Emergency Services, Trade Skills Simulator | `ISO 6710` |
| ✓ | ISO/IEC 27001 — Information security management systems | `iso-iec-27001` | Building Systems & Facilities, Connectivity & Telecom, Trade Skills Simulator | `IEC 27001`, `ISO 27001` |

### SSPC (5)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | SSPC Guide 6 — Guide for containing surface preparation debris generated during paint removal operations | `sspc-guide-6` | Construction & Structural Trades, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `SSPC Guide 6` |
| ? | SSPC-QP 1 — Qualification procedure for painting contractors doing field application on complex industrial structures, now administered by AMPP | `sspc-qp-1` | Construction & Structural Trades, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `SSPC-QP 1` |
| ? | SSPC-QP 2 — Qualification procedure for painting contractors removing hazardous coatings in the field from complex structures, now administered by AMPP | `sspc-qp-2` | Construction & Structural Trades, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `SSPC-QP 2` |
| ✓ | SSPC-SP 10 / NACE No. 2 — Near-white metal blast cleaning | `sspc-sp-10` | Construction & Structural Trades, Energy & Power, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `SSPC-SP 10` |
| ✓ | SSPC-SP surface preparation standards (SP 1 to SP 11), now published by AMPP | `sspc-surface-preparation` | Construction & Structural Trades, Energy & Power, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `SSPC-SP`, `SSPC`, `AMPP` |

### AWS (4)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | AWS D1.1 — Structural Welding Code, Steel | `aws-d1-1` | Construction & Structural Trades, Manufacturing & Automation, Maritime & Ports, Trade Skills Simulator | `AWS D1.1` |
| ✓ | AWS D1.5 — Bridge Welding Code | `aws-d1-5` | Construction & Structural Trades, Mobility & Transit | `AWS D1.5` |
| ? | AWS D3.6M — Underwater Welding Code | `aws-d3-6` | Maritime & Ports, Water & Environmental | `AWS D3.6` |
| ✓ | AWS D9.1/D9.1M — Sheet Metal Welding Code | `aws-d9-1` | Building Systems & Facilities, Construction & Structural Trades, Manufacturing & Automation, Trade Skills Simulator | `AWS D9.1` |

### Cal. ABC (4)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | California Business and Professions Code §25602 — sale to an obviously intoxicated person | `abc-25602` | Culinary & Hospitality | `Cal. Bus. & Prof. Code §25602`, `§25602`, `25602` |
| ✓ | California Business and Professions Code §25631 — hours of legal sale of alcoholic beverages | `abc-25631` | Culinary & Hospitality | `Cal. Bus. & Prof. Code §25631`, `§25631`, `25631` |
| ✓ | California Business and Professions Code §25658 — sale or furnishing of alcohol to a person under 21 | `abc-25658` | Culinary & Hospitality | `Cal. Bus. & Prof. Code §25658`, `§25658`, `25658` |
| ✓ | California Responsible Beverage Service Training Act — ABC RBS certification for anyone who serves alcohol | `abc-rbs-training` | Culinary & Hospitality | `RBS` |

### FRA (4)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 49 CFR Part 214 — Railroad workplace safety, including roadway worker protection | `fra-49-cfr-214` | Mobility & Transit | `49 CFR 214` |
| ✓ | 49 CFR Part 218 — Railroad operating practices, including blue signal protection of workers | `fra-49-cfr-218` | Mobility & Transit | `49 CFR 218` |
| ✓ | 49 CFR Part 232 — Brake system safety standards for freight and other non-passenger trains | `fra-49-cfr-232` | Mobility & Transit | `49 CFR 232` |
| ✓ | 49 CFR Part 242 — Qualification and certification of conductors | `fra-49-cfr-242` | Mobility & Transit | `49 CFR 242` |

### ASHRAE (3)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | ANSI/ASHRAE 111 — Measurement, Testing, Adjusting and Balancing of Building HVAC Systems | `ashrae-111` | Building Systems & Facilities, Construction & Structural Trades, Manufacturing & Automation | `ASHRAE 111` |
| ✓ | ANSI/ASHRAE 15 — Safety Standard for Refrigeration Systems | `ashrae-15` | Building Systems & Facilities, Culinary & Hospitality, Manufacturing & Automation, Maritime & Ports, Trade Skills Simulator | `ASHRAE 15` |
| ✓ | ANSI/ASHRAE 188 — Legionellosis: risk management for building water systems | `ashrae-188` | Building Systems & Facilities, Culinary & Hospitality, Dental & Oral Health, Maritime & Ports | `ASHRAE 188` |

### ASSE (3)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | ASSE 1013 — Reduced pressure principle backflow preventers | `asse-1013` | Building Systems & Facilities, Culinary & Hospitality, Trade Skills Simulator, Water & Environmental | `ASSE 1013`, `ANSI/ASSE 1013` |
| ? | ASSE 1020 — Pressure vacuum breaker assemblies | `asse-1020` | Building Systems & Facilities, Trade Skills Simulator, Water & Environmental | `ASSE 1020`, `ANSI/ASSE 1020` |
| ? | ASSE 5110 — Backflow prevention assembly tester professional qualification | `asse-5110` | Building Systems & Facilities, Culinary & Hospitality, Trade Skills Simulator, Water & Environmental | `ASSE 5110`, `ANSI/ASSE 5110` |

### AWWA (3)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | AWWA C651 — Disinfecting water mains | `awwa-c651` | Construction & Structural Trades, Surface Prep & Coatings, Water & Environmental | `AWWA C651` |
| ✓ | AWWA C652 — Disinfection of water-storage facilities | `awwa-c652` | Surface Prep & Coatings, Water & Environmental | `AWWA C652` |
| ✓ | AWWA M14 — Backflow prevention and cross-connection control manual | `awwa-m14` | Building Systems & Facilities, Culinary & Hospitality, Trade Skills Simulator, Water & Environmental | `AWWA M14` |

### Cal. Labor Code (3)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | California Labor Code §351 — gratuities are the sole property of the employee | `labor-code-351` | Culinary & Hospitality | `Labor Code §351`, `Cal. Labor Code §351` |
| ✓ | California Labor Code §512 — meal periods | `labor-code-512` | Culinary & Hospitality | `Labor Code §512`, `Cal. Labor Code §512` |
| ✓ | California Labor Code §6310 — no retaliation for reporting an unsafe condition | `labor-code-6310` | all 17 categories | `Labor Code §6310`, `Cal. Labor Code §6310` |

### CFPB (3)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | Consumer Financial Protection Bureau consumer guidance — credit reports and scores, debt collection, budgeting, emergency savings and payday loans | `cfpb-consumer-guidance` | Community Environmental Justice | `CFPB`, `Consumer Financial Protection Bureau` |
| ? | The Fair Credit Reporting Act as the CFPB describes it — free credit reports from the nationwide credit reporting companies and the right to dispute inaccurate or incomplete information | `cfpb-fair-credit-reporting` | Community Environmental Justice | `Fair Credit Reporting Act`, `FCRA` |
| ? | The Truth in Lending Act as the CFPB describes it — the annual percentage rate and finance charge disclosed in writing before a consumer signs for credit | `cfpb-truth-in-lending` | Community Environmental Justice, Dental & Oral Health | `Truth in Lending Act`, `Truth in Lending` |

### DOL (3)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 29 CFR Part 531 — Wage payments under the Fair Labor Standards Act, including the tip credit | `dol-29-cfr-531` | Culinary & Hospitality | `29 CFR 531` |
| ✓ | 29 CFR 531.52 — General characteristics of tips | `dol-29-cfr-531-52` | Culinary & Hospitality | `29 CFR 531.52` |
| ? | Registered apprenticeship standards, as a category — the written standards a sponsor registers with the U.S. Department of Labor or a State Apprenticeship Agency: the term, on-the-job learning, related instruction, the progressive wage schedule, the ratio, the probationary period and the selection procedure | `dol-apprenticeship-standards` | Community Environmental Justice | `apprenticeship standard`, `registered apprenticeship` |

### FDA (3)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 21 CFR Part 101 — Food labeling, including the major food allergens | `fda-21-cfr-101` | Culinary & Hospitality, Trade Skills Simulator | `21 CFR 101` |
| ✓ | FDA clearance of medical and dental devices — the labelled indications a device may be used for | `fda-cleared-devices` | Dental & Oral Health, Emergency Services, Trade Skills Simulator | `FDA-cleared`, `FDA clearance` |
| ✓ | FDA Food Code — the model code for retail food establishments | `fda-food-code` | Culinary & Hospitality, Trade Skills Simulator | `FDA Food Code` |

### IEEE (3)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | IEEE 450 — Maintenance, testing and replacement of vented lead-acid batteries for stationary applications | `ieee-450` | Building Systems & Facilities, Connectivity & Telecom, Energy & Power | `IEEE 450` |
| ✓ | IEC/IEEE 80005 — Utility connections in port: high-voltage shore connection systems | `ieee-80005` | Energy & Power, Maritime & Ports | `IEEE 80005` |
| ✓ | IEEE C2 — National Electrical Safety Code (NESC) | `ieee-c2-nesc` | Building Systems & Facilities, Connectivity & Telecom, Emergency Services, Energy & Power, Mobility & Transit | `NESC`, `IEEE C2` |

### NIOSH (3)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | NIOSH criteria documents, Health Hazard Evaluations and the Pocket Guide to Chemical Hazards | `niosh-criteria` | all 17 categories | `NIOSH` |
| ? | NIOSH Ergonomics guidance for seated repetitive work | `niosh-ergonomics` | Sewing & Garment Trades, Trade Skills Simulator | `Ergonomics guidance for seated repetitive work` |
| ✓ | Revised NIOSH Lifting Equation and its Applications Manual — recommended weight limit and lifting index for two-handed manual lifting | `niosh-lifting-equation` | Culinary & Hospitality, Manufacturing & Automation, Maritime & Ports, Mobility & Transit | `Revised NIOSH Lifting Equation`, `NIOSH Lifting Equation` |

### PHMSA (3)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 49 CFR Part 172 — Hazardous materials table, communications, emergency response information and training | `phmsa-49-cfr-172` | Community Environmental Justice, Dental & Oral Health, Emergency Services, Energy & Power, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Water & Environmental | `49 CFR 172` |
| ✓ | 49 CFR Part 177 — Carriage by public highway, including loading, unloading and segregation of hazardous materials on the vehicle | `phmsa-49-cfr-177` | Emergency Services, Maritime & Ports, Mobility & Transit | `49 CFR 177` |
| ✓ | 49 CFR Part 192 — Transportation of natural and other gas by pipeline: minimum federal safety standards | `phmsa-49-cfr-192` | Building Systems & Facilities, Culinary & Hospitality, Energy & Power, Water & Environmental | `49 CFR 192` |

### SMACNA (3)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | SMACNA Architectural Sheet Metal Manual — flashings, copings, gutters, panels and expansion | `smacna-architectural-sheet-metal` | Building Systems & Facilities, Construction & Structural Trades, Manufacturing & Automation | `SMACNA Architectural Sheet Metal Manual` |
| ✓ | SMACNA HVAC Duct Construction Standards — Metal and Flexible (pressure classes, seam and joint construction, reinforcement and hangers) | `smacna-hvac-duct-construction` | Building Systems & Facilities, Construction & Structural Trades, Manufacturing & Automation, Trade Skills Simulator | `SMACNA` |
| ? | SMACNA Seismic Restraint Manual — guidelines for mechanical systems (bracing of duct, pipe and equipment) | `smacna-seismic-restraint` | Building Systems & Facilities, Construction & Structural Trades, Manufacturing & Automation | `SMACNA Seismic Restraint Manual` |

### WHO (3)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | World Health Organization technical and field guidance for health emergencies and outbreak response | `who-guidance` | Emergency Services | `WHO` |
| ? | WHO guidance on infection prevention and control in health care | `who-ipc-guidance` | Emergency Services | `WHO infection prevention and control guidance` |
| ? | WHO outbreak communication guidance | `who-outbreak-communication` | Emergency Services | `WHO outbreak communication guidance` |

### AASHTO (2)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | AASHTO Manual for Bridge Element Inspection and the LRFD Bridge Design Specifications | `aashto-bridge-inspection` | Construction & Structural Trades, Mobility & Transit | `AASHTO` |
| ? | AASHTO Maintenance Manual for Roadways and Bridges | `aashto-maintenance-manual` | Construction & Structural Trades, Mobility & Transit, Surface Prep & Coatings | `AASHTO Maintenance Manual` |

### FAA (2)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 14 CFR Part 107 — Small unmanned aircraft systems | `faa-14-cfr-107` | Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Emergency Services, Environmental Monitoring, Mobility & Transit | `14 CFR 107` |
| ? | 14 CFR 139.303 — Personnel training for airport movement-area operations | `faa-14-cfr-139-303` | Mobility & Transit | `14 CFR 139.303` |

### HHS (2)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 45 CFR Part 46 — Federal Policy for the Protection of Human Subjects (the Common Rule) | `hhs-45-cfr-46` | Community Environmental Justice, Dental & Oral Health, Environmental Monitoring | `45 CFR 46` |
| ✓ | HIPAA Privacy and Security Rules (45 CFR Parts 160 and 164) | `hipaa-privacy-rule` | Community Environmental Justice, Dental & Oral Health, Emergency Services, Trade Skills Simulator | `HIPAA` |

### IIAR (2)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | ANSI/IIAR 2 — Safe design of closed-circuit ammonia refrigeration systems | `iiar-2` | Building Systems & Facilities, Culinary & Hospitality, Manufacturing & Automation, Maritime & Ports | `IIAR 2` |
| ✓ | ANSI/IIAR 6 — Inspection, testing and maintenance of closed-circuit ammonia refrigeration systems | `iiar-6` | Building Systems & Facilities, Culinary & Hospitality, Manufacturing & Automation, Maritime & Ports | `IIAR 6` |

### RCRA (2)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 40 CFR Part 261 — Identification and listing of hazardous waste | `rcra-40-cfr-261` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Dental & Oral Health, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `40 CFR 261` |
| ✓ | 40 CFR Part 262 — Standards applicable to generators of hazardous waste, including the manifest | `rcra-40-cfr-262` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Dental & Oral Health, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `40 CFR 262`, `RCRA` |

### AAPD (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | AAPD Reference Manual guidance on behaviour guidance and preventive care for paediatric patients | `aapd-reference-manual` | Dental & Oral Health | `AAPD` |

### ACGIH (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | ACGIH Threshold Limit Values and Biological Exposure Indices | `acgih-tlvs` | Building Systems & Facilities, Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Culinary & Hospitality, Dental & Oral Health, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Mobility & Transit, Sewing & Garment Trades, Surface Prep & Coatings, Trade Skills Simulator, Water & Environmental | `ACGIH` |

### ACI (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | ACI concrete field testing technician certification and ACI 301 specifications for structural concrete | `aci-concrete-practice` | Construction & Structural Trades, Maritime & Ports, Water & Environmental | `ACI` |

### ADA (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | American Dental Association and FDA guidance on prescribing dental radiographs | `ada-radiographic-guidance` | Dental & Oral Health | `ADA/FDA`, `ADA's`, `ADA’s` |

### ADCI (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | Association of Diving Contractors International — International Consensus Standards for Commercial Diving and Underwater Operations | `adci-consensus-standards` | Environmental Monitoring, Maritime & Ports, Water & Environmental | `ADCI`, `Association of Diving Contractors International` |

### ADHA (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | ADHA Standards for Clinical Dental Hygiene Practice | `adha-standards` | Dental & Oral Health | `ADHA` |

### API (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | API RP 1604 — Closure of underground petroleum storage tanks | `api-1604` | Community Environmental Justice, Energy & Power, Environmental Monitoring, Water & Environmental | `API 1604` |

### ATF (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 27 CFR Part 555 — Commerce in explosives | `atf-27-cfr-555` | Construction & Structural Trades, Entertainment & Live Events | `27 CFR 555` |

### BAAQMD (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | Bay Area Air Quality Management District regulations, complaint line and Community Advisory Council process | `baaqmd-regulations` | Community Environmental Justice, Environmental Monitoring | `BAAQMD` |

### BCDC (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | San Francisco Bay Plan and BCDC permit conditions under the McAteer-Petris Act | `bcdc-bay-plan` | Community Environmental Justice, Construction & Structural Trades, Environmental Monitoring, Maritime & Ports, Water & Environmental | `BCDC` |

### BICSI (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | BICSI Installer 2 and Optical Fiber installer credentials | `bicsi-installer` | Connectivity & Telecom | `BICSI` |

### CalCode (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | California Retail Food Code (Health and Safety Code Division 104, Part 7) — the FDA Food Code as California adopts it | `calcode-retail-food` | Culinary & Hospitality, Trade Skills Simulator | `California Retail Food Code`, `CalCode` |

### California Government Code (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | The Ralph M. Brown Act, California Government Code section 54950 and following — open and public meetings of local legislative bodies: the posted agenda, the public's right to comment, action only on noticed items, and the bar on serial meetings of a majority | `brown-act` | Community Environmental Justice | `Ralph M. Brown Act`, `Brown Act` |

### CARB (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | CARB At-Berth Regulation for ocean-going vessels | `carb-at-berth` | Maritime & Ports | `At-Berth Regulation for ocean-going vessels` |

### CDC (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | CDC infection-prevention and public-health guidance, including the Guidelines for Infection Control in Dental Health-Care Settings and Legionella control guidance | `cdc-guidance` | Building Systems & Facilities, Community Environmental Justice, Culinary & Hospitality, Dental & Oral Health, Emergency Services, Environmental Monitoring, Trade Skills Simulator, Water & Environmental | `CDC` |

### CIT (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | CIT International's Crisis Intervention Team core elements for response to people in crisis | `cit-international-model` | Community Environmental Justice, Emergency Services | `CIT International`, `Crisis Intervention Team` |

### CVSA (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | CVSA North American Standard Inspection Program and North American Standard Out-of-Service Criteria for roadside inspection of drivers and commercial motor vehicles | `cvsa-out-of-service-criteria` | Maritime & Ports, Mobility & Transit | `CVSA` |

### DOJ (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | Americans with Disabilities Act Title II — programme accessibility for public entities and their services | `ada-title-ii` | Community Environmental Justice, Culinary & Hospitality, Dental & Oral Health, Emergency Services, Mobility & Transit | `Title II of the ADA`, `Americans with Disabilities Act`, `ADA accommodation` |

### ETCP (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | ETCP Certified Rigger (Arena and Theatre) and Certified Entertainment Electrician credentials | `etcp-certification` | Construction & Structural Trades, Entertainment & Live Events | `ETCP` |

### EVITP (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | EVITP electric vehicle infrastructure training programme certification | `evitp-certification` | Energy & Power | `EVITP` |

### FCC (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | FCC radiofrequency exposure limits for transmitter sites (47 CFR 1.1310) | `fcc-rf-exposure` | Connectivity & Telecom, Entertainment & Live Events, Mobility & Transit | `FCC` |

### FEMA (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | FEMA Emergency Management Institute IS-100 and IS-700 independent-study courses in ICS and NIMS | `fema-is-courses` | Community Environmental Justice, Emergency Services, Environmental Monitoring | `FEMA IS-100`, `FEMA IS-700`, `FEMA` |

### FPPC (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | The Political Reform Act of 1974, administered by the Fair Political Practices Commission — annual economic-interest disclosure on the Statement of Economic Interests (Form 700), disqualification from any decision an official has a financial interest in, and gift limits and gift reporting | `political-reform-act` | Community Environmental Justice | `Political Reform Act`, `Fair Political Practices Commission`, `Form 700` |

### IASC (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | Inter-Agency Standing Committee (IASC) cluster approach and cluster coordination guidance | `iasc-cluster-coordination` | Emergency Services | `IASC` |

### IMSA (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | IMSA Traffic Signal Technician certification | `imsa-traffic-signal` | Construction & Structural Trades, Mobility & Transit | `IMSA` |

### IRS (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | Internal Revenue Service guidance for workers — Form W-4 and the Tax Withholding Estimator, Form W-2, estimated tax on self-employment income, splitting a refund, free tax help, and how the IRS does and does not contact taxpayers | `irs-consumer-guidance` | Community Environmental Justice | `IRS`, `Internal Revenue Service` |

### IWC (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | California Industrial Welfare Commission wage orders, including Wage Order 5 for public housekeeping | `iwc-wage-orders` | Building Systems & Facilities, Culinary & Hospitality | `Wage Order 5`, `Wage Order`, `IWC` |

### MARAD (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | U.S. Maritime Administration mariner training and workforce standards, delivered through the state and federal maritime academies | `marad-mariner-training` | Maritime & Ports | `MARAD` |

### municipal ethics code (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | A city or county ethics code and the charter's ethics provisions — gifts from interested parties, lobbyist contact, misuse of public position and the revolving door; named generically, with no one jurisdiction's sections cited | `municipal-ethics-code` | Community Environmental Justice | `city ethics code`, `municipal ethics code` |

### MUTCD (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | Manual on Uniform Traffic Control Devices — temporary traffic control for work zones (Part 6) | `mutcd` | Community Environmental Justice, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Water & Environmental | `MUTCD` |

### NABCEP (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | NABCEP PV Installation Professional certification | `nabcep-pv` | Energy & Power | `NABCEP` |

### NATE (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | NATE tower climber fall-protection and climber safety training | `nate-climber-training` | Connectivity & Telecom | `NATE` |

### NBIS (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 23 CFR Part 650 Subpart C — National Bridge Inspection Standards | `nbis-23-cfr-650` | Construction & Structural Trades, Mobility & Transit | `23 CFR 650`, `NBIS`, `National Bridge Inspection Standards` |

### NCCCO (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | NCCCO mobile crane, tower crane and rigger/signalperson certification | `nccco-certification` | Building Systems & Facilities, Community Environmental Justice, Construction & Structural Trades, Energy & Power, Entertainment & Live Events, Environmental Monitoring, Maritime & Ports, Mobility & Transit, Water & Environmental | `NCCCO` |

### NCTSN (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | Psychological First Aid Field Operations Guide (NCTSN and the National Center for PTSD), and the WHO field guide | `pfa-field-guide` | Community Environmental Justice, Emergency Services | `Psychological First Aid` |

### NEBB (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | NEBB Procedural Standard for Testing, Adjusting and Balancing of Environmental Systems, and NEBB TAB technician certification | `nebb-tab-procedural-standard` | Building Systems & Facilities, Construction & Structural Trades, Manufacturing & Automation | `NEBB` |

### NEC/NFPA 70 (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | NFPA 70 — National Electrical Code | `nec-nfpa-70` | all 17 categories | `NFPA 70`, `NEC` |

### NETA (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | NETA Acceptance Testing Specifications (ATS) and Maintenance Testing Specifications (MTS) for electrical power equipment | `neta-ats` | Building Systems & Facilities, Connectivity & Telecom, Construction & Structural Trades, Energy & Power, Maritime & Ports | `NETA` |

### NIMS/ICS (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | NIMS incident command system — the structure a multi-agency response runs inside | `nims-ics` | Community Environmental Justice, Emergency Services, Energy & Power, Environmental Monitoring, Manufacturing & Automation, Maritime & Ports, Water & Environmental | `NIMS`, `ICS` |

### NOAA (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | NOAA tide predictions and NOAA Fisheries Endangered Species Act consultation for in-water work | `noaa-tides-and-esa` | Community Environmental Justice, Environmental Monitoring, Maritime & Ports, Water & Environmental | `NOAA` |

### NRC (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | 10 CFR Part 20 — Standards for protection against radiation | `nrc-10-cfr-20` | Building Systems & Facilities, Community Environmental Justice, Dental & Oral Health, Environmental Monitoring, Water & Environmental | `10 CFR 20`, `10 CFR Part 20` |

### NREMT (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | NREMT national EMS certification at the EMT and Paramedic levels | `nremt-certification` | Emergency Services | `NREMT` |

### NWCG (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | NWCG wildland firefighter training (S-130/S-190) and the Incident Response Pocket Guide | `nwcg-wildland-training` | Community Environmental Justice, Emergency Services | `NWCG`, `Incident Response Pocket Guide` |

### PTI (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | PTI field personnel certification and unbonded post-tensioning practice | `pti-post-tensioning` | Construction & Structural Trades | `PTI` |

### Red Cross (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | American Red Cross shelter operations, Disaster Mental Health and first aid/CPR course standards | `red-cross-disaster-services` | Community Environmental Justice, Emergency Services | `Red Cross` |

### RETA (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | RETA industrial refrigeration operator certification | `reta-refrigeration-operator` | Building Systems & Facilities, Culinary & Hospitality, Manufacturing & Automation, Maritime & Ports | `RETA` |

### Robert's Rules (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | Robert's Rules of Order Newly Revised — the parliamentary authority a body adopts in its own rules of procedure: a practice the body chooses, not a law | `roberts-rules` | Community Environmental Justice | `Robert's Rules of Order`, `Robert's Rules` |

### RWQCB (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | Regional Water Quality Control Board Clean Water Act §401 certification and waste discharge requirements | `rwqcb-401-certification` | Community Environmental Justice, Construction & Structural Trades, Environmental Monitoring, Maritime & Ports, Surface Prep & Coatings, Water & Environmental | `RWQCB`, `Regional Water Quality Control Board`, `Section 401` |

### SAMHSA (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | SAMHSA's six principles of a trauma-informed approach | `samhsa-trauma-informed` | Community Environmental Justice, Dental & Oral Health, Emergency Services | `SAMHSA`, `trauma-informed care` |

### ServSafe (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | ServSafe Food Protection Manager and ServSafe Alcohol certification (National Restaurant Association) | `servsafe-certification` | Culinary & Hospitality, Trade Skills Simulator | `ServSafe` |

### Sphere (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | The Sphere Handbook: Humanitarian Charter and Minimum Standards in Humanitarian Response | `sphere-handbook` | Emergency Services | `Sphere Handbook` |

### state CDL handbook (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | The commercial driver's license manual each state issues for its CDL knowledge and skills tests — driving safely, space management, speed and following distance, mountain, night and fog driving, railroad crossings and backing | `state-cdl-handbook` | Mobility & Transit | `state CDL handbook` |

### SWANA (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | SWANA Manager of Landfill Operations certification | `swana-landfill-operations` | Environmental Monitoring, Water & Environmental | `SWANA` |

### TTB (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ? | TTB alcohol labelling and standards of fill (27 CFR Part 5) | `ttb-labeling` | Culinary & Hospitality | `TTB` |

### USACE (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | Clean Water Act §404 permit conditions for the discharge of dredged or fill material | `usace-section-404` | Community Environmental Justice, Construction & Structural Trades, Environmental Monitoring, Maritime & Ports, Water & Environmental | `Section 404`, `Army Corps` |

### USDA (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | USDA Food Safety and Inspection Service inspection and grading marks on meat and poultry | `usda-fsis-marks` | Culinary & Hospitality, Trade Skills Simulator | `USDA` |

### USFWS (1)

| | Standard or programme | Registry id | Governs | Cited as |
|---|---|---|---|---|
| ✓ | Endangered Species Act §7 consultation and species protection measures set by the U.S. Fish and Wildlife Service | `usfws-esa` | Community Environmental Justice, Environmental Monitoring, Maritime & Ports, Water & Environmental | `USFWS`, `U.S. Fish and Wildlife Service`, `Endangered Species Act` |

## By programme

What governs each training programme in `WebXR/smartcity/js/curricula.js`, as its `guides` field names it.

### Inside Wireman — First Period

`electrical-first-period` · IBEW — International Brotherhood of Electrical Workers

**Union and trade guide.** IBEW/NECA Joint Apprenticeship and Training Committee — inside and outside wireman apprenticeship standards, taught from the electrical training ALLIANCE curriculum

**Standards.**

- ✓ NFPA 70E — Standard for Electrical Safety in the Workplace (`nfpa-70e`)
- ✓ NFPA 70 — National Electrical Code (`nec-nfpa-70`)
- ✓ 29 CFR 1910.147 — The control of hazardous energy (lockout/tagout) (`osha-1910-147`)
- ✓ 29 CFR 1910.333 — Selection and use of work practices for electrical safety (`osha-1910-333`)
- ✓ 29 CFR 1910.269 — Electric power generation, transmission and distribution (`osha-1910-269`)
- ✓ 29 CFR 1926.404 — Wiring design and protection on a construction site (`osha-1926-404`)
- ✓ EVITP electric vehicle infrastructure training programme certification (`evitp-certification`)

### Confined Space — Entry and Rescue

`confined-space` · LIUNA, UA, IUOE and IAFF technical rescue

**Union and trade guide.** LIUNA Training and Education Fund — construction craft laborer, hazardous waste and environmental remediation curricula · UA — United Association plumber, pipefitter and HVAC service apprenticeship standards and UA Star certification · IUOE local training funds and the IUOE National Training Fund — operating and stationary engineer apprenticeship · IAFF training programmes, including Fire Ground Survival and the peer support model

**Standards.**

- ✓ 29 CFR 1910.146 — Permit-required confined spaces (`osha-1910-146`)
- ✓ ANSI/ASSP Z117.1 — Safety requirements for entering confined spaces (`ansi-z117-1`)
- ✓ 29 CFR 1910.134 — Respiratory protection (`osha-1910-134`)
- ✓ NFPA 1006 — Technical Rescue Personnel Professional Qualifications (`nfpa-1006`)
- ✓ NFPA 1670 — Operations and Training for Technical Search and Rescue Incidents (`nfpa-1670`)
- ✓ NIOSH criteria documents, Health Hazard Evaluations and the Pocket Guide to Chemical Hazards (`niosh-criteria`)

### Working at Height — Fall Protection

`fall-protection` · Ironworkers, Carpenters, CWA and NATE climbers

**Union and trade guide.** Ironworkers and IMPACT — apprenticeship and safety training for structural, ornamental and reinforcing ironwork · United Brotherhood of Carpenters International Training Fund — carpenter, pile driver and millwright apprenticeship · CWA member training for outside-plant, tower and broadcast work

**Standards.**

- ? NATE tower climber fall-protection and climber safety training (`nate-climber-training`)
- ✓ 29 CFR 1926.501 — Duty to have fall protection (`osha-1926-501`)
- ✓ 29 CFR 1926.502 — Fall protection systems criteria and practices (`osha-1926-502`)
- ✓ 29 CFR 1926.451 — Scaffolds, general requirements (`osha-1926-451`)
- ✓ 29 CFR 1926.454 — Training requirements for scaffold erectors and users (`osha-1926-454`)
- ✓ 29 CFR 1910.28 — Duty to have fall protection and falling object protection (`osha-1910-28`)
- ✓ ANSI/ASSP Z359 — Fall Protection Code (`ansi-z359`)
- ✓ ANSI/ASSP A10.8 — Scaffolding safety requirements (`ansi-a10-8`)
- ✓ ANSI/SAIA A92 — Mobile elevating work platforms: design, safe use and training (`ansi-a92`)

### Hazmat and Environmental Response

`hazmat-environmental` · LIUNA hazmat and environmental crews, IAFF, and environmental technicians

**Union and trade guide.** LIUNA Training and Education Fund — construction craft laborer, hazardous waste and environmental remediation curricula · IAFF training programmes, including Fire Ground Survival and the peer support model

**Standards.**

- ✓ 29 CFR 1910.120 — Hazardous waste operations and emergency response (HAZWOPER) (`osha-1910-120`)
- ✓ 29 CFR 1910.134 — Respiratory protection (`osha-1910-134`)
- ✓ 29 CFR 1926.1101 — Asbestos in construction (`osha-1926-1101`)
- ✓ NFPA 470 — Hazardous Materials/WMD Response Personnel Professional Qualifications (`nfpa-470`)
- ✓ 40 CFR Part 262 — Standards applicable to generators of hazardous waste, including the manifest (`rcra-40-cfr-262`)
- ✓ 40 CFR 122.26 — Storm water discharges under the NPDES permit programme (`epa-40-cfr-122-26`)
- ✓ 40 CFR Part 58 — Ambient air quality surveillance, including monitor siting and quality assurance (`epa-40-cfr-58`)
- ✓ EPA QA/G-5 — Guidance for quality assurance project plans, and the chain-of-custody practice built on it (`epa-qa-g5`)

### Rigging and Lifting

`rigging-lifting` · Ironworkers, IUOE crane operators, ILWU and IATSE riggers

**Union and trade guide.** Ironworkers and IMPACT — apprenticeship and safety training for structural, ornamental and reinforcing ironwork · IUOE local training funds and the IUOE National Training Fund — operating and stationary engineer apprenticeship · ILWU-PMA joint training for longshore, crane and clerk work, and the Inlandboatmen's Union marine division · IATSE Training Trust Fund — stagecraft, rigging and entertainment electrical skills training

**Standards.**

- ✓ ASME B30.5 — Mobile and locomotive cranes (`asme-b30-5`)
- ✓ ASME B30.9 — Slings (`asme-b30-9`)
- ✓ ASME B30.16 — Overhead underhung and stationary hoists (`asme-b30-16`)
- ✓ ASME B30.26 — Rigging hardware (`asme-b30-26`)
- ✓ 29 CFR 1926.1425 — Keeping clear of the load (cranes and derricks in construction) (`osha-1926-1425`)
- ✓ NCCCO mobile crane, tower crane and rigger/signalperson certification (`nccco-certification`)
- ✓ ETCP Certified Rigger (Arena and Theatre) and Certified Entertainment Electrician credentials (`etcp-certification`)
- ✓ ANSI E1.4 — Entertainment technology: manual counterweight rigging systems (`ansi-e1-4`)

### Stationary Engineer — Building Plant

`stationary-engineer` · IUOE — International Union of Operating Engineers, stationary locals

**Union and trade guide.** IUOE local training funds and the IUOE National Training Fund — operating and stationary engineer apprenticeship · UA — United Association plumber, pipefitter and HVAC service apprenticeship standards and UA Star certification

**Standards.**

- ✓ NFPA 85 — Boiler and Combustion Systems Hazards Code (`nfpa-85`)
- ✓ NFPA 25 — Inspection, Testing and Maintenance of Water-Based Fire Protection Systems (`nfpa-25`)
- ✓ ANSI/ASHRAE 15 — Safety Standard for Refrigeration Systems (`ashrae-15`)
- ✓ ANSI/ASHRAE 188 — Legionellosis: risk management for building water systems (`ashrae-188`)
- ✓ Clean Air Act §608 (40 CFR Part 82 Subpart F) — refrigerant handling, recovery and technician certification (`epa-section-608`)
- ✓ ASME A17.1 — Safety Code for Elevators and Escalators (`asme-a17-1`)
- ✓ 29 CFR 1910.147 — The control of hazardous energy (lockout/tagout) (`osha-1910-147`)
- ✓ 29 CFR 1910.146 — Permit-required confined spaces (`osha-1910-146`)

### Port and Terminal Operations

`port-operations` · ILWU longshore, MEBA and SIU marine engineers, IBT terminal drivers

**Union and trade guide.** ILWU-PMA joint training for longshore, crane and clerk work, and the Inlandboatmen's Union marine division · MEBA — the Calhoon MEBA Engineering School's licensed marine engineer training · SIU — the Paul Hall Center for Maritime Training and Education's unlicensed mariner programmes · Teamsters apprenticeship and driver training programmes, including regulated-soil and yard work

**Standards.**

- ? U.S. Maritime Administration mariner training and workforce standards, delivered through the state and federal maritime academies (`marad-mariner-training`)
- ✓ 29 CFR 1917 — Marine terminals (`osha-1917`)
- ✓ 29 CFR 1918 — Safety and health regulations for longshoring (`osha-1918`)
- ✓ 33 CFR 155.710 — Duties and qualifications of the person in charge of an oil transfer (`uscg-33-cfr-155-710`)
- ✓ 33 CFR 156.150 — Declaration of inspection before an oil transfer (`uscg-33-cfr-156-150`)
- ✓ SOLAS — International Convention for the Safety of Life at Sea (`imo-solas`)
- ✓ ASME B30.4 — Portal and pedestal cranes (`asme-b30-4`)

### Transit and Ramp Operations

`transit-ramp` · ATU, TWU, IAM and IBEW signal locals

**Union and trade guide.** ATU member training for bus and rail transit operations · TWU member training for transit and airline ground operations · IAM — the William W. Winpisinger Education and Technology Center's machinist and transportation training · BMWED roadway worker training for track and structures maintenance · IBEW/NECA Joint Apprenticeship and Training Committee — inside and outside wireman apprenticeship standards, taught from the electrical training ALLIANCE curriculum

**Standards.**

- ✓ 49 CFR Part 214 — Railroad workplace safety, including roadway worker protection (`fra-49-cfr-214`)
- ✓ 49 CFR Part 218 — Railroad operating practices, including blue signal protection of workers (`fra-49-cfr-218`)
- ? 14 CFR 139.303 — Personnel training for airport movement-area operations (`faa-14-cfr-139-303`)
- ✓ 29 CFR 1910.178 — Powered industrial trucks (`osha-1910-178`)
- ✓ Manual on Uniform Traffic Control Devices — temporary traffic control for work zones (Part 6) (`mutcd`)
- ✓ IMSA Traffic Signal Technician certification (`imsa-traffic-signal`)

### Energy Transition Systems

`energy-transition` · IBEW outside construction and utility locals

**Union and trade guide.** IBEW/NECA Joint Apprenticeship and Training Committee — inside and outside wireman apprenticeship standards, taught from the electrical training ALLIANCE curriculum

**Standards.**

- ✓ NFPA 70E — Standard for Electrical Safety in the Workplace (`nfpa-70e`)
- ✓ NFPA 855 — Installation of Stationary Energy Storage Systems (`nfpa-855`)
- ✓ NFPA 70 — National Electrical Code (`nec-nfpa-70`)
- ✓ NABCEP PV Installation Professional certification (`nabcep-pv`)
- ✓ IEEE 450 — Maintenance, testing and replacement of vented lead-acid batteries for stationary applications (`ieee-450`)
- ✓ NETA Acceptance Testing Specifications (ATS) and Maintenance Testing Specifications (MTS) for electrical power equipment (`neta-ats`)
- ✓ 29 CFR 1910.269 — Electric power generation, transmission and distribution (`osha-1910-269`)
- ✓ 29 CFR 1910.147 — The control of hazardous energy (lockout/tagout) (`osha-1910-147`)

### Live Events Production

`live-events` · IATSE — International Alliance of Theatrical Stage Employees

**Union and trade guide.** IATSE Training Trust Fund — stagecraft, rigging and entertainment electrical skills training

**Standards.**

- ✓ ETCP Certified Rigger (Arena and Theatre) and Certified Entertainment Electrician credentials (`etcp-certification`)
- ✓ ANSI E1.4 — Entertainment technology: manual counterweight rigging systems (`ansi-e1-4`)
- ? ANSI E1.6 — Entertainment technology: powered hoist systems for the entertainment industry (`ansi-e1-6`)
- ✓ ASME B30.16 — Overhead underhung and stationary hoists (`asme-b30-16`)
- ✓ NFPA 70E — Standard for Electrical Safety in the Workplace (`nfpa-70e`)
- ✓ NFPA 1126 — Use of Pyrotechnics before a Proximate Audience (`nfpa-1126`)
- ✓ 27 CFR Part 555 — Commerce in explosives (`atf-27-cfr-555`)
- ✓ 29 CFR 1910.28 — Duty to have fall protection and falling object protection (`osha-1910-28`)

### Hunters Point Clean-up and Bay Restoration

`hunters-point-bay-restoration` · LIUNA Local 261 hazmat and environmental laborers, IUOE Local 3 operating engineers, Teamsters regulated-soil drivers, Pile Drivers Local 34 (Carpenters), UA Local 38 plumbers and pipefitters, and the Inlandboatmen's Union of the Pacific

**Union and trade guide.** LIUNA Training and Education Fund — construction craft laborer, hazardous waste and environmental remediation curricula · IUOE local training funds and the IUOE National Training Fund — operating and stationary engineer apprenticeship · Teamsters apprenticeship and driver training programmes, including regulated-soil and yard work · United Brotherhood of Carpenters International Training Fund — carpenter, pile driver and millwright apprenticeship · UA — United Association plumber, pipefitter and HVAC service apprenticeship standards and UA Star certification · ILWU-PMA joint training for longshore, crane and clerk work, and the Inlandboatmen's Union marine division

**Standards.**

- ✓ 29 CFR 1910.120 — Hazardous waste operations and emergency response (HAZWOPER) (`osha-1910-120`)
- ✓ 29 CFR 1910.134 — Respiratory protection (`osha-1910-134`)
- ✓ 29 CFR 1926.1101 — Asbestos in construction (`osha-1926-1101`)
- ✓ MARSSIM — Multi-Agency Radiation Survey and Site Investigation Manual (`marssim`)
- ✓ 10 CFR Part 20 — Standards for protection against radiation (`nrc-10-cfr-20`)
- ✓ 40 CFR Part 262 — Standards applicable to generators of hazardous waste, including the manifest (`rcra-40-cfr-262`)
- ✓ Clean Water Act §404 permit conditions for the discharge of dredged or fill material (`usace-section-404`)
- ✓ San Francisco Bay Plan and BCDC permit conditions under the McAteer-Petris Act (`bcdc-bay-plan`)
- ✓ Regional Water Quality Control Board Clean Water Act §401 certification and waste discharge requirements (`rwqcb-401-certification`)

### Culinary — The Working Kitchen

`culinary-kitchen` · UNITE HERE Local 2 cooks, dishwashers and banquet staff; AFSCME and SEIU school and hospital food service

**Union and trade guide.** UNITE HERE hospitality training funds — cooks, housekeepers, bartenders and banquet staff · AFSCME member education and safety training for public-service and air-district members · SEIU and Workers United education and training funds for clinic, garment, food-service and public-service members

**Standards.**

- ✓ FDA Food Code — the model code for retail food establishments (`fda-food-code`)
- ✓ California Retail Food Code (Health and Safety Code Division 104, Part 7) — the FDA Food Code as California adopts it (`calcode-retail-food`)
- ✓ ServSafe Food Protection Manager and ServSafe Alcohol certification (National Restaurant Association) (`servsafe-certification`)
- ✓ NFPA 96 — Ventilation Control and Fire Protection of Commercial Cooking Operations (`nfpa-96`)
- ✓ NFPA 17A — Standard for Wet Chemical Extinguishing Systems (`nfpa-17a`)
- ✓ 8 CCR 3203 — Injury and Illness Prevention Program (`cal-osha-3203`)
- ✓ 29 CFR 1910.147 — The control of hazardous energy (lockout/tagout) (`osha-1910-147`)
- ✓ NSF/ANSI 2 — Food equipment (`nsf-ansi-2`)
- ✓ NSF/ANSI 7 — Commercial refrigerators and freezers (`nsf-ansi-7`)

### Dental Hygiene — Unspoken Smiles

`dental-hygiene-unspoken-smiles` · SEIU and UFCW dental and clinic staff, AFSCME public-health hygienists, and the ADHA as the profession's body

**Union and trade guide.** SEIU and Workers United education and training funds for clinic, garment, food-service and public-service members · UFCW member training for retail food, clinic and dental support work · AFSCME member education and safety training for public-service and air-district members

**Standards.**

- ✓ ADHA Standards for Clinical Dental Hygiene Practice (`adha-standards`)
- ✓ CDC infection-prevention and public-health guidance, including the Guidelines for Infection Control in Dental Health-Care Settings and Legionella control guidance (`cdc-guidance`)
- ✓ 29 CFR 1910.1030 — Bloodborne pathogens (`osha-1910-1030`)
- ✓ 29 CFR 1910.1200 — Hazard communication (`osha-1910-1200`)
- ✓ 40 CFR Part 441 — Dental office point source category (the amalgam separator rule) (`epa-40-cfr-441`)
- ✓ American Dental Association and FDA guidance on prescribing dental radiographs (`ada-radiographic-guidance`)
- ? AAPD Reference Manual guidance on behaviour guidance and preventive care for paediatric patients (`aapd-reference-manual`)
- ✓ HIPAA Privacy and Security Rules (45 CFR Parts 160 and 164) (`hipaa-privacy-rule`)
- ✓ ISO 23908 — Sharps injury protection: requirements and test methods (`iso-23908`)

### Dental Careers — Unspoken Smiles

`dental-careers-unspoken-smiles` · SEIU and UFCW dental and clinic staff, AFSCME public-health dental staff, the ADHA and the ADAA as the professions' bodies, DANB as the assisting credential

**Union and trade guide.** SEIU and Workers United education and training funds for clinic, garment, food-service and public-service members · UFCW member training for retail food, clinic and dental support work · AFSCME member education and safety training for public-service and air-district members

**Standards.**

- ✓ ADHA Standards for Clinical Dental Hygiene Practice (`adha-standards`)
- ✓ CDC infection-prevention and public-health guidance, including the Guidelines for Infection Control in Dental Health-Care Settings and Legionella control guidance (`cdc-guidance`)
- ✓ 29 CFR 1910.1030 — Bloodborne pathogens (`osha-1910-1030`)
- ✓ 29 CFR 1910.1200 — Hazard communication (`osha-1910-1200`)
- ✓ 40 CFR Part 441 — Dental office point source category (the amalgam separator rule) (`epa-40-cfr-441`)
- ✓ American Dental Association and FDA guidance on prescribing dental radiographs (`ada-radiographic-guidance`)
- ? AAPD Reference Manual guidance on behaviour guidance and preventive care for paediatric patients (`aapd-reference-manual`)
- ✓ HIPAA Privacy and Security Rules (45 CFR Parts 160 and 164) (`hipaa-privacy-rule`)
- ✓ ISO 23908 — Sharps injury protection: requirements and test methods (`iso-23908`)

### Civic Leadership and Emotional Intelligence

`civic-leadership-and-ei` · SEIU and AFSCME public-service staff, the trades' own apprenticeship coordinators, and community organisations that train residents for public life

**Union and trade guide.** SEIU and Workers United education and training funds for clinic, garment, food-service and public-service members · AFSCME member education and safety training for public-service and air-district members

**Standards.**

- ✓ SAMHSA's six principles of a trauma-informed approach (`samhsa-trauma-informed`)
- ✓ NIMS incident command system — the structure a multi-agency response runs inside (`nims-ics`)

### Property Management — Twenty Zones

`property-management` · SEIU 87 and SEIU-USWW janitors and building staff, IUOE Local 39 stationary engineers, UNITE HERE for residential hospitality staff, and the apartment association's certified apartment manager and maintenance technician credentials

**Union and trade guide.** SEIU and Workers United education and training funds for clinic, garment, food-service and public-service members · IUOE local training funds and the IUOE National Training Fund — operating and stationary engineer apprenticeship · UNITE HERE hospitality training funds — cooks, housekeepers, bartenders and banquet staff

**Standards.**

- ✓ 29 CFR 1910.147 — The control of hazardous energy (lockout/tagout) (`osha-1910-147`)
- ✓ NFPA 72 National Fire Alarm and Signaling Code (`nfpa-72`)
- ✓ NFPA 25 — Inspection, Testing and Maintenance of Water-Based Fire Protection Systems (`nfpa-25`)

### Outbreak and Disease Response — WHO and UN Practice

`outbreak-response-who` · SEIU and AFSCME public-health staff, NNU and CNA nurses, and the humanitarian workforce that deploys under UN clusters

**Union and trade guide.** SEIU and Workers United education and training funds for clinic, garment, food-service and public-service members · AFSCME member education and safety training for public-service and air-district members

**Standards.**

- ✓ CDC infection-prevention and public-health guidance, including the Guidelines for Infection Control in Dental Health-Care Settings and Legionella control guidance (`cdc-guidance`)
- ✓ 29 CFR 1910.1030 — Bloodborne pathogens (`osha-1910-1030`)
- ✓ 29 CFR 1910.134 — Respiratory protection (`osha-1910-134`)
- ✓ NIMS incident command system — the structure a multi-agency response runs inside (`nims-ics`)

### Job Readiness Edition — wojrc.org programmes

`job-readiness-edition` · Teamsters for warehouse and driving work, ILWU for the port side, the building-trades apprenticeship programmes the edition prepares people for, and SEIU/AFSCME for the public-benefit and wellness staff

**Union and trade guide.** Teamsters apprenticeship and driver training programmes, including regulated-soil and yard work · ILWU-PMA joint training for longshore, crane and clerk work, and the Inlandboatmen's Union marine division · SEIU and Workers United education and training funds for clinic, garment, food-service and public-service members

**Standards.**

- ✓ 29 CFR 1910.178 — Powered industrial trucks (`osha-1910-178`)
- ✓ SAMHSA's six principles of a trauma-informed approach (`samhsa-trauma-informed`)

### Bay Area Union Edition — Sheet Metal, Bridge, Port and Marine

`bay-area-union-edition` · SMART sheet metal workers, the Ironworkers and IUPAT bridge crews with the Pile Drivers of the Carpenters, ILWU longshore and maintenance workers with the PMA training programme and IUOE crane maintenance, and the marine unions: the Inlandboatmen's Union of the ILWU, MEBA and SIU, with the Pile Drivers' commercial divers for the underwater work

**Union and trade guide.** SMART and the International Training Institute — sheet metal, rail and transportation apprenticeship · Ironworkers and IMPACT — apprenticeship and safety training for structural, ornamental and reinforcing ironwork · IUPAT Finishing Trades Institute — industrial painter, glazier and drywall finisher apprenticeship, including lead and containment training · United Brotherhood of Carpenters International Training Fund — carpenter, pile driver and millwright apprenticeship · ILWU-PMA joint training for longshore, crane and clerk work, and the Inlandboatmen's Union marine division · MEBA — the Calhoon MEBA Engineering School's licensed marine engineer training · SIU — the Paul Hall Center for Maritime Training and Education's unlicensed mariner programmes

**Standards.**

- ✓ 46 CFR Subchapter M — Inspection of towing vessels (`uscg-subchapter-m`)

### Bartending — Behind the Bar

`bartending-course` · UNITE HERE Local 2 bartenders and barbacks

**Union and trade guide.** UNITE HERE hospitality training funds — cooks, housekeepers, bartenders and banquet staff

**Standards.**

- ✓ California Responsible Beverage Service Training Act — ABC RBS certification for anyone who serves alcohol (`abc-rbs-training`)
- ✓ California Business and Professions Code §25602 — sale to an obviously intoxicated person (`abc-25602`)
- ✓ California Business and Professions Code §25631 — hours of legal sale of alcoholic beverages (`abc-25631`)
- ✓ California Business and Professions Code §25658 — sale or furnishing of alcohol to a person under 21 (`abc-25658`)
- ✓ ServSafe Food Protection Manager and ServSafe Alcohol certification (National Restaurant Association) (`servsafe-certification`)
- ✓ California Retail Food Code (Health and Safety Code Division 104, Part 7) — the FDA Food Code as California adopts it (`calcode-retail-food`)
- ✓ 8 CCR 3342 — Workplace violence prevention plan (`cal-osha-3342`)
- ✓ 8 CCR 3203 — Injury and Illness Prevention Program (`cal-osha-3203`)
- ✓ California Labor Code §351 — gratuities are the sole property of the employee (`labor-code-351`)
- ✓ 29 CFR Part 531 — Wage payments under the Fair Labor Standards Act, including the tip credit (`dol-29-cfr-531`)

### Hunters Point Edition — Can We Live?

`hunters-point-can-we-live` · Community science with the Marie Harrison Community Foundation and Greenaction as partners; LIUNA hazmat laborers, IUOE operators, Teamsters and radiation technicians on the site-work pathway

**Union and trade guide.** LIUNA Training and Education Fund — construction craft laborer, hazardous waste and environmental remediation curricula · IUOE local training funds and the IUOE National Training Fund — operating and stationary engineer apprenticeship · Teamsters apprenticeship and driver training programmes, including regulated-soil and yard work · SEIU and Workers United education and training funds for clinic, garment, food-service and public-service members

**Standards.**

- ✓ EPA QA/G-5 — Guidance for quality assurance project plans, and the chain-of-custody practice built on it (`epa-qa-g5`)
- ✓ 40 CFR Part 25 — Public participation in programmes under RCRA, the Safe Drinking Water Act and the Clean Water Act (`epa-40-cfr-25`)
- ✓ 40 CFR Part 58 — Ambient air quality surveillance, including monitor siting and quality assurance (`epa-40-cfr-58`)
- ✓ Bay Area Air Quality Management District regulations, complaint line and Community Advisory Council process (`baaqmd-regulations`)
- ✓ MARSSIM — Multi-Agency Radiation Survey and Site Investigation Manual (`marssim`)
- ✓ 45 CFR Part 46 — Federal Policy for the Protection of Human Subjects (the Common Rule) (`hhs-45-cfr-46`)
- ✓ 29 CFR 1910.120 — Hazardous waste operations and emergency response (HAZWOPER) (`osha-1910-120`)
- ✓ 29 CFR 1910.134 — Respiratory protection (`osha-1910-134`)
- ✓ 8 CCR 5141.1 — Protection from wildfire smoke (`cal-osha-5141-1`)

### Sewing and Garment Trades

`sewing-garment-trades` · Workers United (SEIU) garment and textile workers, and UNITE HERE where the sewing room sits inside a hotel or uniform service

**Union and trade guide.** SEIU and Workers United education and training funds for clinic, garment, food-service and public-service members · UNITE HERE hospitality training funds — cooks, housekeepers, bartenders and banquet staff

**Standards.**

- ✓ 29 CFR 1910.212 — General requirements for all machines (machine guarding) (`osha-1910-212`)
- ✓ 29 CFR 1910.147 — The control of hazardous energy (lockout/tagout) (`osha-1910-147`)
- ✓ 29 CFR 1910.1200 — Hazard communication (`osha-1910-1200`)
- ✓ 8 CCR 5110 — Repetitive motion injuries (`cal-osha-5110`)
- ✓ NIOSH criteria documents, Health Hazard Evaluations and the Pocket Guide to Chemical Hazards (`niosh-criteria`)
- ✓ ANSI B11 — Safety of machinery (the B11 series of machine-tool standards) (`ansi-b11`)
- ✓ ANSI B11.3 — Safety requirements for power press brakes (`ansi-b11-3`)
- ✓ ANSI/ISEA 105 — Hand protection classification, including the A1–A9 cut levels (`ansi-isea-105`)

### Bridge and Structural Trades

`bridge-and-structural` · Ironworkers (IW), IUPAT bridge painters, IUOE operating engineers and LIUNA on the deck

**Union and trade guide.** Ironworkers and IMPACT — apprenticeship and safety training for structural, ornamental and reinforcing ironwork · IUPAT Finishing Trades Institute — industrial painter, glazier and drywall finisher apprenticeship, including lead and containment training · IUOE local training funds and the IUOE National Training Fund — operating and stationary engineer apprenticeship · LIUNA Training and Education Fund — construction craft laborer, hazardous waste and environmental remediation curricula

**Standards.**

- ✓ 29 CFR 1926.501 — Duty to have fall protection (`osha-1926-501`)
- ✓ 29 CFR 1926.62 — Lead in construction (`osha-1926-62`)
- ✓ 29 CFR 1926.1153 — Respirable crystalline silica in construction (`osha-1926-1153`)
- ✓ ANSI/ASSP Z359 — Fall Protection Code (`ansi-z359`)
- ✓ AWS D1.5 — Bridge Welding Code (`aws-d1-5`)
- ✓ SSPC-SP surface preparation standards (SP 1 to SP 11), now published by AMPP (`sspc-surface-preparation`)
- ✓ 23 CFR Part 650 Subpart C — National Bridge Inspection Standards (`nbis-23-cfr-650`)
- ✓ AASHTO Manual for Bridge Element Inspection and the LRFD Bridge Design Specifications (`aashto-bridge-inspection`)
- ✓ Manual on Uniform Traffic Control Devices — temporary traffic control for work zones (Part 6) (`mutcd`)

### Hotel Workers — Back of House

`hotel-workers` · UNITE HERE hotel housekeepers, laundry and banquet staff

**Union and trade guide.** UNITE HERE hospitality training funds — cooks, housekeepers, bartenders and banquet staff

**Standards.**

- ✓ 8 CCR 3345 — Hotel housekeeping musculoskeletal injury prevention programme (`cal-osha-3345`)
- ✓ 8 CCR 3342 — Workplace violence prevention plan (`cal-osha-3342`)
- ✓ 8 CCR 5110 — Repetitive motion injuries (`cal-osha-5110`)
- ✓ 29 CFR 1910.1200 — Hazard communication (`osha-1910-1200`)
- ✓ 29 CFR 1910.1030 — Bloodborne pathogens (`osha-1910-1030`)
- ✓ NFPA 96 — Ventilation Control and Fire Protection of Commercial Cooking Operations (`nfpa-96`)
- ✓ California Industrial Welfare Commission wage orders, including Wage Order 5 for public housekeeping (`iwc-wage-orders`)

### Builders — Carpenters, Laborers and Masons

`builders-trades` · UBC carpenters, LIUNA laborers, BAC bricklayers and IUOE operators

**Union and trade guide.** United Brotherhood of Carpenters International Training Fund — carpenter, pile driver and millwright apprenticeship · LIUNA Training and Education Fund — construction craft laborer, hazardous waste and environmental remediation curricula · BAC and the International Masonry Institute — bricklayer, tile and refractory apprenticeship · IUOE local training funds and the IUOE National Training Fund — operating and stationary engineer apprenticeship

**Standards.**

- ✓ 29 CFR 1926.701 — Concrete and masonry construction, general requirements (`osha-1926-701`)
- ✓ 29 CFR 1926.703 — Requirements for cast-in-place concrete (`osha-1926-703`)
- ✓ 29 CFR 1926.451 — Scaffolds, general requirements (`osha-1926-451`)
- ✓ 29 CFR 1926.1153 — Respirable crystalline silica in construction (`osha-1926-1153`)
- ✓ ANSI/ASSP A10.9 — Concrete and masonry construction safety requirements (`ansi-a10-9`)
- ✓ ANSI/ASSP A10.8 — Scaffolding safety requirements (`ansi-a10-8`)
- ? ACI concrete field testing technician certification and ACI 301 specifications for structural concrete (`aci-concrete-practice`)
- ? PTI field personnel certification and unbonded post-tensioning practice (`pti-post-tensioning`)
- ✓ ASME B30.9 — Slings (`asme-b30-9`)

### First Responders — Fire, EMS, Police, Crisis and Relief

`first-responders` · IAFF firefighters and EMS, NAGE and AFSCME EMS locals, police officer associations and the FOP, NASW and SEIU 1021 social workers and crisis counsellors, AFSCME and LIUNA disaster-relief crews with the Red Cross volunteer workforce

**Union and trade guide.** IAFF training programmes, including Fire Ground Survival and the peer support model · NAEMT course programmes — PHTLS, AMLS and EMS Safety · NASW Code of Ethics and the association's practice standards for social work and crisis counselling · AFSCME member education and safety training for public-service and air-district members · SEIU and Workers United education and training funds for clinic, garment, food-service and public-service members · LIUNA Training and Education Fund — construction craft laborer, hazardous waste and environmental remediation curricula

**Standards.**

- ✓ NFPA 1001 — Fire Fighter Professional Qualifications (`nfpa-1001`)
- ✓ NFPA 1500 — Fire Department Occupational Safety, Health and Wellness Program (`nfpa-1500`)
- ✓ NFPA 1584 — Rehabilitation Process for Members during Emergency Operations and Training Exercises (`nfpa-1584`)
- ✓ NFPA 1710 — Organization and Deployment of Fire Suppression, EMS and Special Operations by Career Fire Departments (`nfpa-1710`)
- ✓ NFPA 1140 — Standard for Wildland Fire Protection (`nfpa-1140`)
- ✓ NFPA 1977 — Protective Clothing and Equipment for Wildland Fire Fighting (`nfpa-1977`)
- ✓ NREMT national EMS certification at the EMT and Paramedic levels (`nremt-certification`)
- ✓ CIT International's Crisis Intervention Team core elements for response to people in crisis (`cit-international-model`)
- ✓ SAMHSA's six principles of a trauma-informed approach (`samhsa-trauma-informed`)
- ✓ Psychological First Aid Field Operations Guide (NCTSN and the National Center for PTSD), and the WHO field guide (`pfa-field-guide`)
- ✓ American Red Cross shelter operations, Disaster Mental Health and first aid/CPR course standards (`red-cross-disaster-services`)
- ✓ NIMS incident command system — the structure a multi-agency response runs inside (`nims-ics`)
- ? FEMA Emergency Management Institute IS-100 and IS-700 independent-study courses in ICS and NIMS (`fema-is-courses`)
- ? NWCG wildland firefighter training (S-130/S-190) and the Incident Response Pocket Guide (`nwcg-wildland-training`)
- ✓ 29 CFR 1910.134 — Respiratory protection (`osha-1910-134`)
- ✓ 29 CFR 1910.156 — Fire brigades (`osha-1910-156`)
- ✓ 29 CFR 1910.1030 — Bloodborne pathogens (`osha-1910-1030`)

### Situational Awareness — Interruption Drill

`situational-awareness` · Cross-craft — run as a refresher block by IBEW, UA, LIUNA, Ironworkers and IAFF locals

**Union and trade guide.** IBEW/NECA Joint Apprenticeship and Training Committee — inside and outside wireman apprenticeship standards, taught from the electrical training ALLIANCE curriculum · UA — United Association plumber, pipefitter and HVAC service apprenticeship standards and UA Star certification · LIUNA Training and Education Fund — construction craft laborer, hazardous waste and environmental remediation curricula · Ironworkers and IMPACT — apprenticeship and safety training for structural, ornamental and reinforcing ironwork · IAFF training programmes, including Fire Ground Survival and the peer support model

**Standards.**

- ✓ 29 CFR 1926 — Safety and health regulations for construction (`osha-1926`)
- ✓ 29 CFR 1910.146 — Permit-required confined spaces (`osha-1910-146`)
- ✓ NFPA 70E — Standard for Electrical Safety in the Workplace (`nfpa-70e`)
- ✓ NFPA 25 — Inspection, Testing and Maintenance of Water-Based Fire Protection Systems (`nfpa-25`)
- ✓ 8 CCR 3203 — Injury and Illness Prevention Program (`cal-osha-3203`)

### Ports, Maritime and Bay Ecology

`ports-maritime-ecology` · ILWU, the Inlandboatmen's Union of the Pacific, IBEW port electricians, LIUNA and the environmental technicians who monitor the bay

**Union and trade guide.** ILWU-PMA joint training for longshore, crane and clerk work, and the Inlandboatmen's Union marine division · IBEW/NECA Joint Apprenticeship and Training Committee — inside and outside wireman apprenticeship standards, taught from the electrical training ALLIANCE curriculum · LIUNA Training and Education Fund — construction craft laborer, hazardous waste and environmental remediation curricula · AFSCME member education and safety training for public-service and air-district members

**Standards.**

- ✓ 29 CFR 1917 — Marine terminals (`osha-1917`)
- ✓ 29 CFR 1918 — Safety and health regulations for longshoring (`osha-1918`)
- ✓ 29 CFR 1910.120 — Hazardous waste operations and emergency response (HAZWOPER) (`osha-1910-120`)
- ✓ IEC/IEEE 80005 — Utility connections in port: high-voltage shore connection systems (`ieee-80005`)
- ✓ MARPOL — International Convention for the Prevention of Pollution from Ships (`imo-marpol`)
- ✓ Clean Water Act §404 permit conditions for the discharge of dredged or fill material (`usace-section-404`)
- ✓ San Francisco Bay Plan and BCDC permit conditions under the McAteer-Petris Act (`bcdc-bay-plan`)
- ✓ NOAA tide predictions and NOAA Fisheries Endangered Species Act consultation for in-water work (`noaa-tides-and-esa`)
- ✓ Endangered Species Act §7 consultation and species protection measures set by the U.S. Fish and Wildlife Service (`usfws-esa`)

### Air Quality — Monitoring and Control

`air-quality-monitoring` · AFSCME air-district technicians, LIUNA environmental laborers, IUOE and USW plant crews

**Union and trade guide.** AFSCME member education and safety training for public-service and air-district members · LIUNA Training and Education Fund — construction craft laborer, hazardous waste and environmental remediation curricula · IUOE local training funds and the IUOE National Training Fund — operating and stationary engineer apprenticeship · USW Tony Mazzocchi Center health, safety and environmental training

**Standards.**

- ✓ EPA Method 9 (40 CFR Part 60 Appendix A) — visual determination of the opacity of emissions (`epa-method-9`)
- ✓ 40 CFR Part 60 — Standards of performance for new stationary sources, with the Appendix A reference test methods (`epa-40-cfr-60`)
- ✓ 40 CFR Part 58 — Ambient air quality surveillance, including monitor siting and quality assurance (`epa-40-cfr-58`)
- ✓ Bay Area Air Quality Management District regulations, complaint line and Community Advisory Council process (`baaqmd-regulations`)
- ✓ EPA QA/G-5 — Guidance for quality assurance project plans, and the chain-of-custody practice built on it (`epa-qa-g5`)
- ✓ NIOSH criteria documents, Health Hazard Evaluations and the Pocket Guide to Chemical Hazards (`niosh-criteria`)

