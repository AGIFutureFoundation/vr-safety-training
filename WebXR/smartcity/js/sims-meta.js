/**
 * GENERATED FILE — do not hand-edit. Run `node tools/gen_sims_meta.mjs`
 * after changing any sim's header fields (name, tagline, accent, badge,
 * game.ranks, etc.) to regenerate this from the real sim modules.
 *
 * This is the lightweight metadata the hub, the roster and the scenario
 * editor read to render instantly, before a sim's full module (steps,
 * hazards, build()) has been lazy-loaded. See smartcity/js/app.js's
 * loadSim()/findSim() and tools/bundle_webxr.py's smartcity dist layout.
 */
export const SIMS_META = [
  {
    "id": "charge-point",
    "index": "01",
    "domain": "Energy",
    "trade": "EV service technician",
    "category": "Energy & Power",
    "certification": "IBEW — NFPA 70E arc-flash qualified, EVITP-certified EV infrastructure technician",
    "name": "Charge Point",
    "title": "SmartCiti.X~ Charge Point VR",
    "tagline": "DC fast-charger fault isolation, capacitor discharge and busbar torque",
    "accent": 5884283,
    "accentCss": "#59c97b",
    "parSeconds": 205,
    "badge": {
      "id": "dc-clear",
      "name": "DC Clear",
      "note": "Full isolation with the DC link proven dead"
    },
    "stepCount": 11,
    "game": {
      "system": "Grid Certification",
      "currency": "GRID",
      "ranks": [
        "Bay Apprentice",
        "Bay Technician",
        "Commissioning Tech",
        "Fault Lead",
        "Grid Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "signal-cabinet",
    "index": "02",
    "domain": "Mobility",
    "trade": "Traffic signal technician",
    "category": "Mobility & Transit",
    "certification": "IBEW — IMSA Level II Traffic Signal Technician certified",
    "name": "Signal Cabinet",
    "title": "SmartCiti.X~ Signal Cabinet VR",
    "tagline": "Intersection work zone, controller fault diagnosis and conflict monitor integrity",
    "accent": 15909195,
    "accentCss": "#f2c14b",
    "parSeconds": 215,
    "badge": {
      "id": "intersection-safe",
      "name": "Intersection Safe",
      "note": "Zone, flash, repair and restore with nothing defeated"
    },
    "stepCount": 11,
    "game": {
      "system": "Intersection Command",
      "currency": "SIGNAL",
      "ranks": [
        "Cabinet Trainee",
        "Signal Technician",
        "Intersection Tech",
        "Controller Lead",
        "Command Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "valve-vault",
    "index": "03",
    "domain": "Water",
    "trade": "Water utility operator",
    "category": "Water & Environmental",
    "certification": "LIUNA — OSHA 29 CFR 1910.146 permit-required confined space entrant",
    "name": "Valve Vault",
    "title": "SmartCiti.X~ Valve Vault VR",
    "tagline": "Permit-required confined space entry: isolation, atmosphere, roles and retrieval",
    "accent": 5219327,
    "accentCss": "#4fa3ff",
    "parSeconds": 225,
    "badge": {
      "id": "entry-authority",
      "name": "Entry Authority",
      "note": "Permit to exit with every control in place"
    },
    "stepCount": 12,
    "game": {
      "system": "Entry Authority",
      "currency": "PERMIT",
      "ranks": [
        "Entrant",
        "Attendant",
        "Entry Supervisor",
        "Rescue Trained",
        "Authority Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "solar-deck",
    "index": "04",
    "domain": "Energy",
    "trade": "Solar / BESS technician",
    "category": "Energy & Power",
    "certification": "IBEW — NABCEP PV Installation Professional certified",
    "name": "Solar Deck",
    "title": "SmartCiti.X~ Solar Deck VR",
    "tagline": "Rooftop array and battery commissioning: fall protection, rapid shutdown and string test",
    "accent": 16758344,
    "accentCss": "#ffb648",
    "parSeconds": 215,
    "badge": {
      "id": "rooftop-authority",
      "name": "Rooftop Authority",
      "note": "Anchored, isolated and commissioned with no shortcut"
    },
    "stepCount": 11,
    "game": {
      "system": "Rooftop Authority",
      "currency": "SOLAR",
      "ranks": [
        "Roof Hand",
        "Array Technician",
        "String Tester",
        "Commissioning Lead",
        "Rooftop Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "splice-node",
    "index": "05",
    "domain": "Connectivity",
    "trade": "Fibre optic technician",
    "category": "Connectivity & Telecom",
    "certification": "CWA — BICSI Installer 2, Optical Fiber Technician certified",
    "name": "Splice Node",
    "title": "SmartCiti.X~ Splice Node VR",
    "tagline": "Dark-fibre confirmation, laser safety, cleave quality and splice loss budget",
    "accent": 10516991,
    "accentCss": "#a079ff",
    "parSeconds": 200,
    "badge": {
      "id": "photon-guild",
      "name": "Photon Guild",
      "note": "Dark fibre proven, splice inside budget"
    },
    "stepCount": 12,
    "game": {
      "system": "Photon Guild",
      "currency": "PHOTON",
      "ranks": [
        "Cable Hand",
        "Splicer",
        "Node Technician",
        "Loss Budget Lead",
        "Guild Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "flight-deck",
    "index": "06",
    "domain": "Aviation",
    "trade": "Drone / UAS ground technician",
    "category": "Mobility & Transit",
    "certification": "Teamsters — FAA Part 107 remote pilot certificate holder",
    "name": "Flight Deck",
    "title": "SmartCiti.X~ Flight Deck VR",
    "tagline": "Vertiport ramp safety: rotor lockout, battery handling, autonomous route planning and pre-flight release",
    "accent": 5231103,
    "accentCss": "#4fd1ff",
    "parSeconds": 240,
    "badge": {
      "id": "airside-clear",
      "name": "Airside Clear",
      "note": "Full ramp procedure with rotors safed throughout"
    },
    "stepCount": 14,
    "game": {
      "system": "Airside Command",
      "currency": "AIRSIDE",
      "ranks": [
        "Ramp Trainee",
        "Ground Crew",
        "Ramp Lead",
        "Release Certifier",
        "Airside Command"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "track-access",
    "index": "07",
    "domain": "Mobility",
    "trade": "Rail track worker",
    "category": "Mobility & Transit",
    "certification": "BMWED — FRA 49 CFR 214 Roadway Worker Protection qualified",
    "name": "Track Access",
    "title": "SmartCiti.X~ Track Access VR",
    "tagline": "Track possession, third-rail isolation and lookout protection",
    "accent": 15894859,
    "accentCss": "#f2894b",
    "parSeconds": 220,
    "badge": {
      "id": "possession-clear",
      "name": "Possession Clear",
      "note": "Full possession taken and handed back with nothing skipped"
    },
    "stepCount": 12,
    "game": {
      "system": "Right-of-Way",
      "currency": "TRACK",
      "ranks": [
        "Track Trainee",
        "Track Worker",
        "Possession Lead",
        "Protection Officer",
        "Right-of-Way Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "triage-point",
    "index": "08",
    "domain": "Emergency Services",
    "trade": "EMT / paramedic",
    "category": "Emergency Services",
    "certification": "IAEP — NREMT-Paramedic certified",
    "name": "Triage Point",
    "title": "SmartCiti.X~ Triage Point VR",
    "tagline": "START mass-casualty triage: rapid assessment, tagging and the golden hour",
    "accent": 15754331,
    "accentCss": "#f0645b",
    "parSeconds": 210,
    "badge": {
      "id": "golden-hour",
      "name": "Golden Hour",
      "note": "Every casualty triaged and tagged inside protocol time"
    },
    "stepCount": 10,
    "game": {
      "system": "Golden Hour",
      "currency": "TRIAGE",
      "ranks": [
        "First Responder",
        "Triage Trained",
        "Scene Lead",
        "Mass Casualty Officer",
        "Golden Hour Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "robot-cell",
    "index": "09",
    "domain": "Manufacturing",
    "trade": "Automation / robotics technician",
    "category": "Manufacturing & Automation",
    "certification": "UAW — ANSI/RIA R15.06 robot safety qualified",
    "name": "Robot Cell",
    "title": "SmartCiti.X~ Robot Cell VR",
    "tagline": "Six-axis robot cell lockout, light-curtain integrity and teach-pendant pick-and-place programming",
    "accent": 10516991,
    "accentCss": "#a079ff",
    "parSeconds": 260,
    "badge": {
      "id": "cell-locked",
      "name": "Cell Locked",
      "note": "Full lockout with the light curtain never defeated"
    },
    "stepCount": 14,
    "game": {
      "system": "Cell Lockout",
      "currency": "CELL",
      "ranks": [
        "Cell Trainee",
        "Cell Technician",
        "Automation Lead",
        "Cell Auditor",
        "Cell Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "chiller-plant",
    "index": "10",
    "domain": "Building Systems",
    "trade": "HVAC / refrigeration technician",
    "category": "Building Systems & Facilities",
    "certification": "UA — EPA Section 608 Universal refrigerant certified",
    "name": "Chiller Plant",
    "title": "SmartCiti.X~ Chiller Plant VR",
    "tagline": "District chiller isolation, refrigerant recovery and confined mechanical space entry",
    "accent": 5231103,
    "accentCss": "#4fd1ff",
    "parSeconds": 220,
    "badge": {
      "id": "cold-chain-clear",
      "name": "Cold Chain Clear",
      "note": "Full isolation and recovery with atmosphere proven safe"
    },
    "stepCount": 11,
    "game": {
      "system": "Cold Chain Command",
      "currency": "COLD",
      "ranks": [
        "Plant Trainee",
        "Chiller Technician",
        "Refrigerant Certified",
        "Plant Lead",
        "Cold Chain Command"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "tower-climb",
    "index": "11",
    "domain": "Telecom",
    "trade": "Telecom / broadcast tower technician",
    "category": "Connectivity & Telecom",
    "certification": "CWA — NATE Tower Climber Level II certified",
    "name": "Tower Climb",
    "title": "SmartCiti.X~ Tower Climb VR",
    "tagline": "Guyed tower climb: 100% tie-off, RF lockout and a controlled descent",
    "accent": 16742938,
    "accentCss": "#ff7a1a",
    "parSeconds": 240,
    "badge": {
      "id": "summit-authority",
      "name": "Summit Authority",
      "note": "Every clip made, every tool tethered, no unprotected air"
    },
    "stepCount": 12,
    "game": {
      "system": "Summit Authority",
      "currency": "SUMMIT",
      "ranks": [
        "Ground Hand",
        "Tower Climber",
        "Rigger",
        "Climb Lead",
        "Summit Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "steel-erector",
    "index": "12",
    "domain": "Construction",
    "trade": "Ironworker / structural steel connector",
    "category": "Construction & Structural Trades",
    "certification": "Ironworkers — OSHA 29 CFR 1926 Subpart R qualified connector",
    "name": "Steel Erector",
    "title": "SmartCiti.X~ Steel Erector VR",
    "tagline": "Structural steel connecting: fall protection, tag-line control and the bolt-up sequence",
    "accent": 16763904,
    "accentCss": "#ffcc00",
    "parSeconds": 235,
    "badge": {
      "id": "iron-certified",
      "name": "Iron Certified",
      "note": "Every connection made with fall protection live and the tag line in hand"
    },
    "stepCount": 12,
    "game": {
      "system": "Iron Certified",
      "currency": "IRON",
      "ranks": [
        "Ground Rigger",
        "Connector",
        "Raising Gang Lead",
        "Bolt-Up Certified",
        "Iron Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "crane-yard",
    "index": "13",
    "domain": "Construction",
    "trade": "Mobile crane operator / rigger",
    "category": "Construction & Structural Trades",
    "certification": "IUOE — NCCCO Mobile Crane Operator certified",
    "name": "Crane Yard",
    "title": "SmartCiti.X~ Crane Yard VR",
    "tagline": "Mobile crane pick: outrigger setup, load chart verification, anti-collision zone programming and a tag-line controlled lift",
    "accent": 3117019,
    "accentCss": "#2f8fdb",
    "parSeconds": 275,
    "badge": {
      "id": "rigging-command",
      "name": "Rigging Command",
      "note": "Set, verified against the chart and landed with the swing radius clear"
    },
    "stepCount": 15,
    "game": {
      "system": "Rigging Command",
      "currency": "RIG",
      "ranks": [
        "Yard Hand",
        "Rigger",
        "Signal Person",
        "Load Chart Certified",
        "Rigging Command"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "trench-box",
    "index": "14",
    "domain": "Construction",
    "trade": "Laborer / excavation and shoring",
    "category": "Construction & Structural Trades",
    "certification": "LIUNA — OSHA 29 CFR 1926 Subpart P Competent Person",
    "name": "Trench Box",
    "title": "SmartCiti.X~ Trench Box VR",
    "tagline": "Excavation shoring: competent-person inspection, atmosphere testing and protective systems",
    "accent": 8311585,
    "accentCss": "#7ed321",
    "parSeconds": 220,
    "badge": {
      "id": "ground-authority",
      "name": "Ground Authority",
      "note": "Trench inspected, tested and protected before anyone steps below grade"
    },
    "stepCount": 15,
    "game": {
      "system": "Ground Authority",
      "currency": "TRENCH",
      "ranks": [
        "Laborer",
        "Excavation Hand",
        "Competent Person",
        "Shoring Lead",
        "Ground Authority Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "boiler-room",
    "index": "15",
    "domain": "Facilities",
    "trade": "Stationary engineer / steamfitter",
    "category": "Building Systems & Facilities",
    "certification": "IUOE — state-licensed Stationary Engineer, boiler operation",
    "name": "Boiler Room",
    "title": "SmartCiti.X~ Boiler Room VR",
    "tagline": "Boiler lockout, confined-space firebox entry and a controlled re-light",
    "accent": 14170666,
    "accentCss": "#d83a2a",
    "parSeconds": 245,
    "badge": {
      "id": "steam-certified",
      "name": "Steam Certified",
      "note": "Isolated, cooled, tested and relit with nothing skipped"
    },
    "stepCount": 12,
    "game": {
      "system": "Steam Certified",
      "currency": "STEAM",
      "ranks": [
        "Fireman",
        "Boiler Operator",
        "Stationary Engineer",
        "Plant Lead",
        "Steam Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "elevator-pit",
    "index": "16",
    "domain": "Facilities",
    "trade": "Elevator constructor / mechanic",
    "category": "Building Systems & Facilities",
    "certification": "IUEC — NAESA QEI-qualified elevator mechanic",
    "name": "Elevator Pit",
    "title": "SmartCiti.X~ Elevator Pit VR",
    "tagline": "Pit and car-top entry: main line lockout, dual stop switches and governor inspection",
    "accent": 3003583,
    "accentCss": "#2dd4bf",
    "parSeconds": 235,
    "badge": {
      "id": "pit-certified",
      "name": "Pit Certified",
      "note": "Pit and car-top entry with both stop switches confirmed"
    },
    "stepCount": 12,
    "game": {
      "system": "Shaftway Authority",
      "currency": "SHAFT",
      "ranks": [
        "Pit Hand",
        "Car Mechanic",
        "Adjuster",
        "Inspector Lead",
        "Shaftway Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "abatement-chamber",
    "index": "17",
    "domain": "Environmental",
    "trade": "Asbestos / lead abatement worker",
    "category": "Water & Environmental",
    "certification": "LIUNA — EPA AHERA-certified asbestos abatement worker",
    "name": "Abatement Chamber",
    "title": "SmartCiti.X~ Abatement Chamber VR",
    "tagline": "Containment integrity, wet-method removal and the three-stage decon airlock",
    "accent": 13230693,
    "accentCss": "#c9e265",
    "parSeconds": 245,
    "badge": {
      "id": "containment-sealed",
      "name": "Containment Sealed",
      "note": "Full containment and decon with no shortcut on either"
    },
    "stepCount": 12,
    "game": {
      "system": "Containment Command",
      "currency": "ABATE",
      "ranks": [
        "Bag Handler",
        "Removal Tech",
        "Containment Lead",
        "Decon Supervisor",
        "Containment Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "rigging-loft",
    "index": "18",
    "domain": "Entertainment",
    "trade": "Theatrical rigger (IATSE)",
    "category": "Entertainment & Live Events",
    "certification": "IATSE — ETCP Certified Rigger, Arena",
    "name": "Rigging Loft",
    "title": "SmartCiti.X~ Rigging Loft VR",
    "tagline": "Counterweight fly-system operation: arbor inspection, balance, cued flying and automation cue programming",
    "accent": 16740270,
    "accentCss": "#ff6fae",
    "parSeconds": 265,
    "badge": {
      "id": "fly-qualified",
      "name": "Fly Qualified",
      "note": "Full fly cue with the arbor locked and the deck clear throughout"
    },
    "stepCount": 14,
    "game": {
      "system": "Fly Certified",
      "currency": "FLY",
      "ranks": [
        "Deck Hand",
        "Rail Operator",
        "Fly Rigger",
        "Head Flyman",
        "Fly Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "line-truck",
    "index": "19",
    "domain": "Energy",
    "trade": "Outside / overhead lineworker (IBEW)",
    "category": "Energy & Power",
    "certification": "IBEW — OSHA 29 CFR 1910.269 qualified electrical worker",
    "name": "Line Truck",
    "title": "SmartCiti.X~ Line Truck VR",
    "tagline": "Bucket-truck line work: rubber goods testing, isolation and correct grounding order",
    "accent": 16576033,
    "accentCss": "#fcee21",
    "parSeconds": 250,
    "badge": {
      "id": "storm-ready",
      "name": "Storm Ready",
      "note": "Full de-energized procedure with rubber proven and grounds applied in order"
    },
    "stepCount": 15,
    "game": {
      "system": "Storm Command",
      "currency": "VOLT",
      "ranks": [
        "Ground Hand",
        "Apprentice Lineman",
        "Journeyman Lineman",
        "Crew Lead",
        "Storm Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "dock-crane",
    "index": "20",
    "domain": "Maritime",
    "trade": "Longshoreman / container-crane operator",
    "category": "Maritime & Ports",
    "certification": "ILWU — OSHA 29 CFR 1917 qualified crane operator",
    "name": "Dock Crane",
    "title": "SmartCiti.X~ Dock Crane VR",
    "tagline": "Container lift: lashing release order, twist-lock verification and wind-limit discipline",
    "accent": 3832997,
    "accentCss": "#3a7ca5",
    "parSeconds": 240,
    "badge": {
      "id": "waterfront-certified",
      "name": "Waterfront Certified",
      "note": "Full lift cycle with the red zone clear and every lock verified"
    },
    "stepCount": 14,
    "game": {
      "system": "Waterfront Authority",
      "currency": "DOCK",
      "ranks": [
        "Lashing Hand",
        "Signal Person",
        "Crane Operator",
        "Gang Boss",
        "Waterfront Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "hunters-point",
    "index": "21",
    "domain": "Environmental",
    "trade": "Environmental monitoring technician",
    "category": "Environmental Monitoring",
    "certification": "LIUNA hazmat & environmental laborer — OSHA HAZWOPER (29 CFR 1910.120) 40-hour with annual refresher; chain-of-custody sampling under EPA QA/QC guidance",
    "name": "Hunters Point Briefing",
    "title": "SmartCiti.X~ Hunters Point Briefing VR",
    "tagline": "A real Superfund site, a real data-fraud case, a real community air-monitoring effort — flat briefing and knowledge check, not a walkable scene",
    "accent": 9425291,
    "accentCss": "#8fd18b",
    "parSeconds": 300,
    "badge": {
      "id": "data-integrity",
      "name": "Data Integrity",
      "note": "Every question on site status, oversight, data integrity and crew training answered without an unsafe conclusion"
    },
    "stepCount": 10,
    "flat": true,
    "dossier": [
      {
        "title": "What the site is",
        "body": "Hunters Point Naval Shipyard (HPNS) is an 866-acre former U.S. Navy shipyard on the southeast San Francisco waterfront. It has been on the EPA's National Priorities List (a Superfund site) since 1989. The Navy is the lead agency for investigation and cleanup; the U.S. EPA and California's regulators (DTSC and the Regional Water Board) oversee and enforce the Navy's work. Contamination includes radionuclides, PCBs, heavy metals, petroleum fuels, pesticides and volatile organic compounds, in soil and groundwater on land and in bay sediment offshore (the ~443-acre Parcel F).",
        "source": {
          "label": "EPA Superfund site profile",
          "url": "https://cumulis.epa.gov/supercpad/cursites/csitinfo.cfm?id=0902722"
        },
        "source2": {
          "label": "SF.gov — HPNS cleanup",
          "url": "https://www.sf.gov/hpns-cleanup-learn"
        }
      },
      {
        "title": "The data-integrity case",
        "body": "Between 2003 and 2014 the Navy's radiological remediation contractor, Tetra Tech EC, was required to survey soil and buildings and remediate excess radiation so parcels could be transferred to the city. Federal False Claims Act litigation alleged that employees and subcontractors substituted clean soil for potentially contaminated samples and fabricated radiological readings the Navy relied on. A Navy review found roughly 48% of the contractor's radiological data suspect or showing signs of manipulation; an EPA letter raised concerns about a far larger share in parts of the site. In August 2026 a federal judge approved a $57 million settlement of the government's False Claims Act claims; the company did not admit liability, and the settlement does not resolve a separate suit by homeowners.",
        "source": {
          "label": "U.S. Department of Justice press release (2026)",
          "url": "https://www.justice.gov/opa/pr/tetra-tech-ec-inc-agrees-pay-57m-settle-false-claims-act-allegations-falsifying-soil-test"
        }
      },
      {
        "title": "The community and the litigation",
        "body": "Bayview Hunters Point is a residential neighborhood next to the shipyard fence. Greenaction for Health and Environmental Justice filed a federal lawsuit against the Navy in 2024 alleging the cleanup is not protective of human health and the environment; a court hearing on it was held in February 2026, and in June 2026 Greenaction and the Marie Harrison Community Foundation issued a public call to action and demands. Marie Harrison (1948–2019) was a Greenaction organizer, a Bayview resident for decades and, as a young woman, a worker at the shipyard; residents later installed neighborhood air monitors in her memory. That community air-monitoring effort, run by Greenaction with the Marie Harrison Community Foundation, is the independent neighborhood air record this station points you to — there is no on-site monitoring program of ours here.",
        "source": {
          "label": "Greenaction — Bayview Hunters Point",
          "url": "https://greenaction.org/bayview-hunters-point/"
        },
        "source2": {
          "label": "Greenaction — in memory of Marie Harrison",
          "url": "https://greenaction.org/2020/05/06/in-honor-and-memory-of-marie-harrison-1-30-1948-5-5-2019/"
        }
      },
      {
        "title": "Who does the work",
        "body": "Environmental monitoring and remediation on a site like this is union trade work with real training gates: hazmat and environmental laborers (LIUNA) under OSHA HAZWOPER — a 40-hour course, three days of supervised field time and an annual 8-hour refresher (29 CFR 1910.120(e)); operating engineers (IUOE) on the excavators and soil-handling equipment; Teamsters hauling regulated soil under DOT hazardous-materials rules; radiation control technicians on survey and clearance; and industrial hygienists and environmental sampling technicians keeping chain of custody on every sample. The lesson of this site is that the last item is not paperwork — independent split samples, chain of custody and third-party verification are the only reason anyone can trust a clearance number.",
        "source": {
          "label": "OSHA 29 CFR 1910.120 — HAZWOPER",
          "url": "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.120"
        }
      }
    ],
    "game": {
      "system": "Site Awareness",
      "currency": "SAMPLE",
      "ranks": [
        "Site Aware",
        "Sampler",
        "Field Lead",
        "QA Verifier",
        "Integrity Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "air-monitor",
    "index": "22",
    "domain": "Environmental",
    "trade": "Environmental monitoring technician",
    "category": "Environmental Monitoring",
    "certification": "LIUNA hazmat & environmental laborer — OSHA HAZWOPER 40-hour (29 CFR 1910.120); perimeter air monitoring under a site-specific Air Monitoring Plan required by the EPA / state cleanup order",
    "name": "Perimeter Air",
    "title": "SmartCiti.X~ Perimeter Air VR",
    "tagline": "Real-time PM10 fence-line monitoring: wind, placement, flow calibration, zero check, and the exceedance response",
    "accent": 10475712,
    "accentCss": "#9fd8c0",
    "parSeconds": 235,
    "badge": {
      "id": "fence-line-true",
      "name": "Fence Line True",
      "note": "Monitors placed by the wind, proven at zero and flow, and an exceedance answered by the plan"
    },
    "stepCount": 10,
    "game": {
      "system": "Air Watch",
      "currency": "READING",
      "ranks": [
        "Monitor Tech",
        "Line Lead",
        "Plan Holder",
        "Exceedance Ready",
        "Air Watch Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  },
  {
    "id": "sampling-well",
    "index": "23",
    "domain": "Environmental",
    "trade": "Environmental sampling technician",
    "category": "Environmental Monitoring",
    "certification": "LIUNA hazmat & environmental laborer — OSHA HAZWOPER 40-hour (29 CFR 1910.120); low-flow groundwater sampling per the EPA Region 4 SESD operating procedure; chain of custody under the site QAPP (EPA QA/G-5)",
    "name": "Sampling Well",
    "title": "SmartCiti.X~ Sampling Well VR",
    "tagline": "Low-flow groundwater sampling: water level, pump set, stabilised purge, volatiles first, chain of custody",
    "accent": 7324625,
    "accentCss": "#6fc3d1",
    "parSeconds": 245,
    "badge": {
      "id": "chain-unbroken",
      "name": "Chain Unbroken",
      "note": "A stabilised low-flow sample, bottles in order, custody signed, nothing agitated and nothing dumped"
    },
    "stepCount": 11,
    "game": {
      "system": "Sample Integrity",
      "currency": "ALIQUOT",
      "ranks": [
        "Sampler",
        "Purge Lead",
        "Field Chemist",
        "Custody Holder",
        "Integrity Certified"
      ],
      "rankAt": [
        0,
        900,
        2200,
        4000,
        6500
      ]
    }
  }
];
