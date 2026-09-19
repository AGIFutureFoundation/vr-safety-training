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
    "weather": "overcast",
    "indoor": null,
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
    "weather": "rain",
    "indoor": null,
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
    "weather": "rain",
    "indoor": null,
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
    "weather": "overcast",
    "indoor": null,
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
    "weather": "rain",
    "indoor": "service",
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
    "weather": "clear",
    "indoor": null,
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
    "weather": "fog",
    "indoor": null,
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
    "weather": "overcast",
    "indoor": null,
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
    "weather": "clear",
    "indoor": "shop",
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
    "weather": "clear",
    "indoor": "plant",
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
    "weather": "wind",
    "indoor": null,
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
    "weather": "wind",
    "indoor": null,
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
    "weather": "wind",
    "indoor": null,
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
    "weather": "rain",
    "indoor": null,
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
    "weather": "clear",
    "indoor": "plant",
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
    "weather": "clear",
    "indoor": "service",
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
    "weather": "clear",
    "indoor": "plant",
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
    "weather": "clear",
    "indoor": "theatre",
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
    "weather": "overcast",
    "indoor": null,
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
    "weather": "wind",
    "indoor": null,
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
    "weather": "clear",
    "indoor": null,
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
    "weather": "wind",
    "indoor": null,
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
    "weather": "overcast",
    "indoor": null,
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
  },
  {
    "id": "press-brake",
    "index": "24",
    "domain": "Manufacturing",
    "trade": "Sheet-metal press brake operator",
    "category": "Manufacturing & Automation",
    "certification": "IAM — OSHA 29 CFR 1910.147 lockout/tagout; ANSI B11.3 press brake safeguarding; light-curtain (presence-sensing device) verification per manufacturer's procedure",
    "name": "Press Brake",
    "weather": "clear",
    "indoor": "shop",
    "title": "SmartCiti.X~ Press Brake VR",
    "tagline": "Tooling change under lockout, light-curtain proof, back gauge, tonnage, first-article bend",
    "accent": 14263361,
    "accentCss": "#d9a441",
    "parSeconds": 240,
    "badge": {
      "id": "curtain-proven",
      "name": "Curtain Proven",
      "note": "Tooling changed locked out, the curtain proven at three heights, and a first article inside tolerance"
    },
    "stepCount": 11,
    "game": {
      "system": "Bend Authority",
      "currency": "STROKE",
      "ranks": [
        "Helper",
        "Operator",
        "Setup Operator",
        "Lead Operator",
        "Bend Authority Certified"
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
    "id": "decon-line",
    "index": "25",
    "domain": "Emergency Services",
    "trade": "Hazmat firefighter / decon technician",
    "category": "Emergency Services",
    "certification": "IAFF — NFPA 470 hazardous materials operations (decontamination mission-specific competency); OSHA 29 CFR 1910.120(q) emergency response",
    "name": "Decon Line",
    "weather": "wind",
    "indoor": null,
    "title": "SmartCiti.X~ Decon Line VR",
    "tagline": "Hazmat decontamination corridor: zones by the wind, pools in order, gross wash, doffing order, runoff contained",
    "accent": 15909195,
    "accentCss": "#f2c14b",
    "parSeconds": 250,
    "badge": {
      "id": "corridor-clean",
      "name": "Corridor Clean",
      "note": "A corridor set by the wind, a responder walked through clean, mask on until the suit is off, and not a litre to the drain"
    },
    "stepCount": 11,
    "game": {
      "system": "Decon Command",
      "currency": "PASS",
      "ranks": [
        "Decon Tech",
        "Corridor Lead",
        "Decon Officer",
        "Hazmat Ops",
        "Decon Command Certified"
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
    "id": "stage-power",
    "index": "26",
    "domain": "Entertainment",
    "trade": "Stage / touring electrician",
    "category": "Entertainment & Live Events",
    "certification": "IATSE — ETCP Certified Entertainment Electrician; NEC Article 520 (theaters) and 525 / single-pole separable connector (cam-lock) sequence; NFPA 70E qualified for the verification",
    "name": "Stage Power",
    "weather": "clear",
    "indoor": "theatre",
    "title": "SmartCiti.X~ Stage Power VR",
    "tagline": "Company switch tie-in: lockout, live-dead-live, cam-locks ground-first, cover and strain relief, energise, phase check, load test",
    "accent": 13073919,
    "accentCss": "#c77dff",
    "parSeconds": 235,
    "badge": {
      "id": "ground-first",
      "name": "Ground First",
      "note": "A tie-in proven dead, cammed ground-first, covered, energised and phase-checked with no shortcut"
    },
    "stepCount": 11,
    "game": {
      "system": "Tie-In Authority",
      "currency": "AMP",
      "ranks": [
        "Deck Electrician",
        "Distro Tech",
        "Head Electrician",
        "Production Electrician",
        "Tie-In Certified"
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
    "id": "container-lashing",
    "index": "27",
    "domain": "Maritime",
    "trade": "Longshore worker — lasher",
    "category": "Maritime & Ports",
    "certification": "ILWU — OSHA 29 CFR 1918 (longshoring) marine terminal safety; ship's Cargo Securing Manual (IMO CSS Code) lashing pattern; fall protection on lashing bridges",
    "name": "Container Lashing",
    "weather": "wind",
    "indoor": null,
    "title": "SmartCiti.X~ Container Lashing VR",
    "tagline": "Deck stow securing: crane held off, twist-locks proven, rods and turnbuckles to the pattern, fall protection on the bridge, torque checked",
    "accent": 5217758,
    "accentCss": "#4f9dde",
    "parSeconds": 240,
    "badge": {
      "id": "stow-secured",
      "name": "Stow Secured",
      "note": "Every twist-lock proven, every rod to the pattern, the bridge worked tied off, the crane held until clear"
    },
    "stepCount": 11,
    "game": {
      "system": "Stow Authority",
      "currency": "LASH",
      "ranks": [
        "Lasher",
        "Lead Lasher",
        "Hatch Boss",
        "Walking Boss",
        "Stow Authority Certified"
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
    "id": "lift-station",
    "index": "28",
    "domain": "Water",
    "trade": "Wastewater collection system operator",
    "category": "Water & Environmental",
    "certification": "AFSCME / LIUNA — state wastewater collection system operator certification (CWEA Collection System Maintenance Grade II or equivalent); OSHA 29 CFR 1910.146 permit-required confined space; 1910.147 lockout/tagout",
    "name": "Lift Station",
    "weather": "rain",
    "indoor": "plant",
    "title": "SmartCiti.X~ Lift Station VR",
    "tagline": "Wet-well pump pull: gas test, lockout, bypass pumping, guide-rail lift, no-entry retrieval, restart and level check",
    "accent": 6009000,
    "accentCss": "#5bb0a8",
    "parSeconds": 245,
    "badge": {
      "id": "well-never-entered",
      "name": "Well Never Entered",
      "note": "Gas tested, locked out, bypassed, pump pulled from the top and restarted with the well never entered"
    },
    "stepCount": 10,
    "game": {
      "system": "Collection Command",
      "currency": "LIFT",
      "ranks": [
        "Operator I",
        "Operator II",
        "Crew Lead",
        "Collection Supervisor",
        "Collection Command Certified"
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
    "id": "mooring-line",
    "index": "29",
    "domain": "Maritime",
    "trade": "Line handler / wharf mooring crew",
    "category": "Maritime & Ports",
    "certification": "ILWU / SIU — OSHA 29 CFR 1917 marine terminals (mooring operations); OCIMF Mooring Equipment Guidelines snap-back awareness; port authority line-handling qualification",
    "name": "Mooring Line",
    "weather": "wind",
    "indoor": null,
    "title": "SmartCiti.X~ Mooring Line VR",
    "tagline": "Taking a ship's lines: snap-back zone, heaving line, eye on the bollard, tension by radio, stopper, and the bight you never stand in",
    "accent": 5223400,
    "accentCss": "#4fb3e8",
    "parSeconds": 230,
    "badge": {
      "id": "out-of-the-bight",
      "name": "Out of the Bight",
      "note": "Every line taken from outside the snap-back zone, hands clear, tension called by radio, stopper held"
    },
    "stepCount": 10,
    "game": {
      "system": "Wharf Authority",
      "currency": "LINE",
      "ranks": [
        "Line Handler",
        "Lead Handler",
        "Mooring Boss",
        "Wharf Supervisor",
        "Wharf Authority Certified"
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
    "id": "chain-hoist",
    "index": "30",
    "domain": "Entertainment",
    "trade": "Entertainment rigger — chain motors",
    "category": "Entertainment & Live Events",
    "certification": "IATSE — ETCP Certified Rigger (Arena); ANSI E1.6-1 powered hoists; manufacturer chain-motor inspection and load-rating compliance",
    "name": "Chain Hoist",
    "weather": "clear",
    "indoor": "theatre",
    "title": "SmartCiti.X~ Chain Hoist VR",
    "tagline": "Flying a truss: load calc, chain inspection, bridle angle, moused hooks, test lift, deck clear, trim and lock",
    "accent": 16747100,
    "accentCss": "#ff8a5c",
    "parSeconds": 240,
    "badge": {
      "id": "trim-locked",
      "name": "Trim Locked",
      "note": "A truss flown on calculated points, inspected chain, moused hooks, a proven test lift and a clear deck"
    },
    "stepCount": 10,
    "game": {
      "system": "Fly Authority",
      "currency": "POINT",
      "ranks": [
        "Deck Hand",
        "Up-Rigger",
        "Head Rigger",
        "Production Rigger",
        "Fly Authority Certified"
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
    "id": "conveyor-guard",
    "index": "31",
    "domain": "Manufacturing",
    "trade": "Conveyor maintenance technician",
    "category": "Manufacturing & Automation",
    "certification": "UAW / IAM — OSHA 29 CFR 1910.147 lockout/tagout; ASME B20.1 conveyor safety (guarding of nip points, emergency stops); 1910.212 machine guarding",
    "name": "Conveyor Guard",
    "weather": "clear",
    "indoor": "shop",
    "title": "SmartCiti.X~ Conveyor Guard VR",
    "tagline": "Belt jam clearance: e-stop, lockout, stored-energy release, try-start, guard off and back on, pull-cord restored, restart",
    "accent": 9358054,
    "accentCss": "#8ecae6",
    "parSeconds": 225,
    "badge": {
      "id": "nip-point-never",
      "name": "Nip Point Never",
      "note": "A jam cleared with the belt locked and proven dead, the guard back on, and the pull-cord live before the restart"
    },
    "stepCount": 11,
    "game": {
      "system": "Line Guard",
      "currency": "BELT",
      "ranks": [
        "Line Tech",
        "Maintenance Tech",
        "Line Lead",
        "Maintenance Lead",
        "Line Guard Certified"
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
    "id": "cell-site-battery",
    "index": "32",
    "domain": "Telecom",
    "trade": "Cell site / DC power technician",
    "category": "Connectivity & Telecom",
    "certification": "CWA — telecom DC power plant (−48 V) technician; OSHA 29 CFR 1910.305(j)(7) / IEEE 450 stationary battery maintenance; NFPA 70E for the electrical work",
    "name": "Cell Site Battery",
    "weather": "overcast",
    "indoor": null,
    "title": "SmartCiti.X~ Cell Site Battery VR",
    "tagline": "−48 V plant string replacement: ventilate for hydrogen, PPE, isolate the string, insulated tools, terminal covers, cell checks, return to bus",
    "accent": 10980346,
    "accentCss": "#a78bfa",
    "parSeconds": 240,
    "badge": {
      "id": "string-swapped-live",
      "name": "String Swapped Live",
      "note": "A battery string replaced on a live plant with the cabinet ventilated, tools insulated, terminals covered and every cell checked"
    },
    "stepCount": 11,
    "game": {
      "system": "Plant Authority",
      "currency": "CELL",
      "ranks": [
        "Site Tech",
        "Power Tech",
        "Plant Lead",
        "Regional Power Lead",
        "Plant Authority Certified"
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
    "id": "substation-switching",
    "index": "33",
    "domain": "Energy",
    "trade": "Substation electrician / switching operator",
    "category": "Energy & Power",
    "certification": "IBEW — utility switching and tagging authorisation; OSHA 29 CFR 1910.269 (electric power generation, transmission and distribution); NFPA 70E arc-flash PPE for the verification",
    "name": "Substation Switching",
    "weather": "overcast",
    "indoor": null,
    "title": "SmartCiti.X~ Substation Switching VR",
    "tagline": "Feeder outage on a written switching order: read-back, breaker open, disconnects open, test dead, grounds on, tag, hand-off",
    "accent": 16758861,
    "accentCss": "#ffb84d",
    "parSeconds": 245,
    "badge": {
      "id": "order-held",
      "name": "Order Held",
      "note": "Every step of the switching order read back, done in sequence, tested dead and grounded before the hand-off"
    },
    "stepCount": 11,
    "game": {
      "system": "Switching Authority",
      "currency": "STEP",
      "ranks": [
        "Sub Tech",
        "Switching Operator",
        "Senior Operator",
        "System Operator",
        "Switching Authority Certified"
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
    "id": "bus-depot-lift",
    "index": "34",
    "domain": "Mobility",
    "trade": "Transit bus technician — electric fleet",
    "category": "Mobility & Transit",
    "certification": "ATU / IAM — ASE Transit Bus (H series) with H8 EV / hybrid-electric; ALI Lifting It Right (ANSI/ALI ALOIM); OSHA 1910.147 lockout for high-voltage disable",
    "name": "Bus Depot Lift",
    "weather": "clear",
    "indoor": "garage",
    "title": "SmartCiti.X~ Bus Depot Lift VR",
    "tagline": "Electric bus on column lifts: HV disable and prove, chocks, pad placement, synchronised raise, locks down, under-bus work, controlled lower",
    "accent": 8115081,
    "accentCss": "#7bd389",
    "parSeconds": 240,
    "badge": {
      "id": "on-the-locks",
      "name": "On the Locks",
      "note": "HV proven off, columns synced, an 18-tonne bus on its mechanical locks before a hand went underneath"
    },
    "stepCount": 10,
    "game": {
      "system": "Depot Authority",
      "currency": "RAISE",
      "ranks": [
        "Fleet Tech",
        "EV Tech",
        "Lead Tech",
        "Shop Supervisor",
        "Depot Authority Certified"
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
    "id": "fire-pump",
    "index": "35",
    "domain": "Building Systems",
    "trade": "Fire sprinkler fitter / fire pump technician",
    "category": "Building Systems & Facilities",
    "certification": "UA — journeyman sprinkler fitter; NFPA 25 (inspection, testing and maintenance of water-based systems) annual fire pump flow test; NICET Inspection & Testing of Water-Based Systems",
    "name": "Fire Pump",
    "weather": "clear",
    "indoor": "plant",
    "title": "SmartCiti.X~ Fire Pump VR",
    "tagline": "Annual pump flow test: alarm notification, controller to manual, test header to safe discharge, churn / 100% / 150% points, curve compared, system restored",
    "accent": 14834780,
    "accentCss": "#e25c5c",
    "parSeconds": 245,
    "badge": {
      "id": "curve-met",
      "name": "Curve Met",
      "note": "A pump flowed at three points, read against its nameplate curve, with the alarm company told and the system restored"
    },
    "stepCount": 12,
    "game": {
      "system": "Pump Authority",
      "currency": "GPM",
      "ranks": [
        "Apprentice Fitter",
        "Journeyman Fitter",
        "Inspector",
        "Senior Inspector",
        "Pump Authority Certified"
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
    "id": "scaffold-erection",
    "index": "36",
    "domain": "Construction",
    "trade": "Scaffold erector / carpenter",
    "category": "Construction & Structural Trades",
    "certification": "UBC (Carpenters) — scaffold erector qualification; OSHA 29 CFR 1926.451 / 1926.454 scaffold competent person; fall protection during erection per 1926.451(g)",
    "name": "Scaffold Erection",
    "weather": "wind",
    "indoor": null,
    "title": "SmartCiti.X~ Scaffold Erection VR",
    "tagline": "Frame scaffold, two lifts: ground and sills, base plates, plumb and level, tie-ins, full planking, guardrails, ladder access, green tag",
    "accent": 15771194,
    "accentCss": "#f0a63a",
    "parSeconds": 250,
    "badge": {
      "id": "green-tagged",
      "name": "Green Tagged",
      "note": "A scaffold built on sound ground, plumb, tied, fully planked, guarded and tagged by the competent person"
    },
    "stepCount": 12,
    "game": {
      "system": "Scaffold Authority",
      "currency": "LIFT",
      "ranks": [
        "Erector",
        "Lead Erector",
        "Competent Person",
        "Scaffold Foreman",
        "Scaffold Authority Certified"
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
    "id": "aerial-ladder",
    "index": "37",
    "domain": "Emergency Services",
    "trade": "Firefighter — aerial apparatus driver/operator",
    "category": "Emergency Services",
    "certification": "IAFF — NFPA 1002 Chapter 6 aerial apparatus driver/operator; NFPA 1901 aerial device stabilization and operating limits; NFPA 1500 / OSHA 1910.269 ten-foot clearance from energised overhead lines",
    "name": "Aerial Ladder",
    "weather": "wind",
    "indoor": null,
    "title": "SmartCiti.X~ Aerial Ladder VR",
    "tagline": "Aerial apparatus set-up: size-up, spot at the corner outside the collapse zone, chock, stabilizers on pads to level, PTO, raise and rotate clear of the lines, tip above the roofline, lock, belt, report",
    "accent": 13775147,
    "accentCss": "#d2312b",
    "parSeconds": 260,
    "badge": {
      "id": "tip-on-target",
      "name": "Tip On Target",
      "note": "Spotted outside the collapse zone, level on pads, ten feet from the lines, and the tip landed just above the roofline first time"
    },
    "stepCount": 12,
    "game": {
      "system": "Truck Company",
      "currency": "SPOT",
      "ranks": [
        "Probie",
        "Truckie",
        "Driver/Operator",
        "Aerial Operator",
        "Truck Company Certified"
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
    "id": "chlorine-room",
    "index": "38",
    "domain": "Water & Environmental",
    "trade": "Water treatment plant operator",
    "category": "Water & Environmental",
    "certification": "State / AWWA Water Treatment Operator Grade II; Chlorine Institute Pamphlets 1 and 65 (cylinder handling, Emergency Kit A); OSHA 29 CFR 1910.1000 chlorine PEL and 1910.134 respiratory protection; NFPA 55 compressed gas storage",
    "name": "Chlorine Room",
    "weather": "clear",
    "indoor": "plant",
    "title": "SmartCiti.X~ Chlorine Room VR",
    "tagline": "150-lb chlorine cylinder change: room monitor and SCBA before the door, empty isolated and capped, full one on the scale and chained, new gasket, yoke a quarter turn past snug, ammonia leak test, valve one turn, wrench on the stem",
    "accent": 8378536,
    "accentCss": "#7fd8a8",
    "parSeconds": 270,
    "badge": {
      "id": "tight-and-tested",
      "name": "Tight and Tested",
      "note": "A change with a new gasket, a quarter-turn yoke, a clean ammonia test and the valve opened one turn — first time"
    },
    "stepCount": 12,
    "game": {
      "system": "Plant Operations",
      "currency": "PPM",
      "ranks": [
        "Operator-in-Training",
        "Grade I",
        "Grade II",
        "Chief Operator",
        "Plant Operations Certified"
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
    "id": "forklift-dock",
    "index": "39",
    "domain": "Manufacturing & Automation",
    "trade": "Powered industrial truck operator — warehouse and dock",
    "category": "Manufacturing & Automation",
    "certification": "OSHA 29 CFR 1910.178(l) powered industrial truck operator training and evaluation (three-year re-evaluation); ANSI/ITSDF B56.1 counterbalanced trucks; IBT (Teamsters) and UFCW warehouse locals' PIT programmes",
    "name": "Forklift Dock",
    "weather": "clear",
    "indoor": "garage",
    "title": "SmartCiti.X~ Forklift Dock VR",
    "tagline": "Dock load-out: pre-shift inspection, belt on, trailer chocked and dock-locked before the plate, load against the capacity plate, forks under and mast back, low and steady, ramp in reverse, rack height, and the trailer that crept",
    "accent": 15901243,
    "accentCss": "#f2a23b",
    "parSeconds": 240,
    "badge": {
      "id": "dock-clean",
      "name": "Dock Clean",
      "note": "A load-out with the trailer secured before the plate, the load inside the plate rating, the mast back and low, and the ramp taken in reverse — first time"
    },
    "stepCount": 12,
    "game": {
      "system": "Dock Operations",
      "currency": "LIFT",
      "ranks": [
        "Trainee",
        "Certified Operator",
        "Lead Operator",
        "Dock Supervisor",
        "Dock Operations Certified"
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
    "id": "fly-system",
    "index": "40",
    "domain": "Entertainment & Live Events",
    "trade": "Theatrical rigger / fly operator",
    "category": "Entertainment & Live Events",
    "certification": "IATSE — ETCP Certified Rigger (Theatre); ANSI E1.4-1 manual counterweight rigging systems; OSHA 29 CFR 1910.28 fall protection on the loading bridge; venue 'heads up' and lineset-tagging procedure",
    "name": "Fly System",
    "weather": "clear",
    "indoor": "theatre",
    "title": "SmartCiti.X~ Fly System VR",
    "tagline": "Counterweight lineset load: rail locked, deck cleared with a call, batten in, fixtures hung and safetied, loader clipped in on the bridge, bricks to match the pipe with spreaders and a lock ring, balanced test lift, trim, lock, clamp, tag",
    "accent": 10516991,
    "accentCss": "#a079ff",
    "parSeconds": 260,
    "badge": {
      "id": "in-balance",
      "name": "In Balance",
      "note": "A lineset loaded to the pipe, spreadered and ringed, test-lifted in balance and tagged — first time"
    },
    "stepCount": 12,
    "game": {
      "system": "Fly Crew",
      "currency": "BRICK",
      "ranks": [
        "Deckhand",
        "Loader",
        "Fly Operator",
        "Head Flyman",
        "Fly Crew Certified"
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
    "id": "bunkering-watch",
    "index": "41",
    "domain": "Maritime & Ports",
    "trade": "Marine engineer — person in charge of oil transfer",
    "category": "Maritime & Ports",
    "certification": "MEBA / SIU / MM&P — USCG 33 CFR 155.710 person in charge of oil transfer; 33 CFR 156.150 declaration of inspection; MARPOL Annex VI bunker delivery note and sample (Reg. 18); ISGOTT ship/barge bunkering checklist; STCW A-VI/1",
    "name": "Bunkering Watch",
    "weather": "overcast",
    "indoor": null,
    "title": "SmartCiti.X~ Bunkering Watch VR",
    "tagline": "Fuel-oil transfer: plan and signed DOI, scuppers plugged and drip tray and SOPEP kit set, flange bolted all round, radio and emergency stop tested, line-up tank-first, slow start, soundings, topping off at reduced rate, manifold closed, sample sealed, BDN signed",
    "accent": 4172248,
    "accentCss": "#3fa9d8",
    "parSeconds": 270,
    "badge": {
      "id": "not-a-drop",
      "name": "Not a Drop",
      "note": "A transfer with the deck contained before the hose, every bolt in, a slow start, and topping off at the reduced rate — first time"
    },
    "stepCount": 12,
    "game": {
      "system": "Engine Department",
      "currency": "TONNE",
      "ranks": [
        "Wiper",
        "Oiler",
        "Third Engineer",
        "Second Engineer",
        "Chief Engineer Certified"
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
    "id": "microwave-backhaul",
    "index": "42",
    "domain": "Connectivity & Telecom",
    "trade": "Microwave / RF technician — backhaul",
    "category": "Connectivity & Telecom",
    "certification": "CWA and IBEW telecom locals; FCC 47 CFR 1.1310 maximum permissible exposure and OSHA 29 CFR 1910.268(p) RF work practices; NATE CTS tower/rooftop climber; TIA-222 structural loading and TIA-1019 rigging",
    "name": "Microwave Backhaul",
    "weather": "overcast",
    "indoor": null,
    "title": "SmartCiti.X~ Microwave Backhaul VR",
    "tagline": "Rooftop link re-alignment: RF survey and MPE boundary, far end keyed down and locked out, fall protection before the parapet, dish freed, panned and tilted on receive level, polarisation proven, torqued, weatherproofed, path handed back",
    "accent": 6280136,
    "accentCss": "#5fd3c8",
    "parSeconds": 250,
    "badge": {
      "id": "path-restored",
      "name": "Path Restored",
      "note": "A link re-aligned with the far end locked out, the boundary respected and the receive level inside spec — first time"
    },
    "stepCount": 11,
    "game": {
      "system": "Backhaul Ops",
      "currency": "dBm",
      "ranks": [
        "Helper",
        "RF Technician",
        "Link Engineer",
        "Backhaul Lead",
        "Backhaul Ops Certified"
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
    "id": "stormwater-outfall",
    "index": "43",
    "domain": "Environmental Monitoring",
    "trade": "Environmental sampling technician — stormwater",
    "category": "Environmental Monitoring",
    "certification": "Clean Water Act NPDES industrial stormwater permit (first-flush grab within 30 minutes of discharge); 40 CFR 136 approved methods, preservation and hold times; chain-of-custody per EPA SESD; OSHA HAZWOPER awareness and 29 CFR 1910.146 for confined vault access",
    "name": "Stormwater Outfall",
    "weather": "rain",
    "indoor": null,
    "title": "SmartCiti.X~ Stormwater Outfall VR",
    "tagline": "Wet-weather NPDES grab: permit window, meters calibrated before the rain, bank staged with a buddy and tripod, grab from the flow, bottles in preservation order, field readings logged, custody sealed, sample on ice",
    "accent": 7915680,
    "accentCss": "#78c8a0",
    "parSeconds": 260,
    "badge": {
      "id": "first-flush",
      "name": "First Flush",
      "note": "A grab inside the permit window, in preservation order, sealed and iced — first time"
    },
    "stepCount": 11,
    "game": {
      "system": "Field Sampling",
      "currency": "mL",
      "ranks": [
        "Field Assistant",
        "Sampling Technician",
        "Field Lead",
        "QA Officer",
        "Field Sampling Certified"
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
    "id": "battery-yard",
    "index": "44",
    "domain": "Energy & Power",
    "trade": "Battery energy storage technician — grid scale",
    "category": "Energy & Power",
    "certification": "IBEW outside construction and utility locals; NFPA 855 stationary energy storage installation; NFPA 70E DC arc-flash boundary and shock approach; OSHA 29 CFR 1910.147 lockout/tagout and 1910.269 for the utility interconnection; UL 9540A thermal-runaway test data",
    "name": "Battery Yard",
    "weather": "overcast",
    "indoor": null,
    "title": "SmartCiti.X~ Battery Yard VR",
    "tagline": "Grid battery module swap: gas and vent check from outside, stop from the controller, AC before DC, rack disconnects in order, bleed-down wait, live-dead-live on the DC bus, racks grounded, insulated tools, thermal check before the door",
    "accent": 10475599,
    "accentCss": "#9fd84f",
    "parSeconds": 280,
    "badge": {
      "id": "bus-proven-dead",
      "name": "Bus Proven Dead",
      "note": "AC before DC, the full bleed-down waited out, and live-dead-live on a tested meter — first time"
    },
    "stepCount": 12,
    "game": {
      "system": "Storage Operations",
      "currency": "kWh",
      "ranks": [
        "Apprentice",
        "Storage Technician",
        "Commissioning Tech",
        "Site Lead",
        "Storage Operations Certified"
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
    "id": "confined-rescue",
    "index": "45",
    "domain": "Emergency Services",
    "trade": "Technical rescue technician — confined space",
    "category": "Emergency Services",
    "certification": "IAFF — NFPA 1006 confined-space rescue technician and NFPA 1670 operations level; OSHA 29 CFR 1910.146(k) permit-space rescue and 1910.134(g)(3) two-in two-out; ANSI Z359 fall-arrest and rescue systems",
    "name": "Confined Rescue",
    "weather": "overcast",
    "indoor": null,
    "title": "SmartCiti.X~ Confined Rescue VR",
    "tagline": "Below-grade rescue: refuse the unprotected entry, isolate and ventilate, monitor top to bottom, tripod and mechanical advantage rigged, air-supplied entrant on a tended line, patient packaged, controlled haul, atmosphere log handed over",
    "accent": 15759947,
    "accentCss": "#f07a4b",
    "parSeconds": 290,
    "badge": {
      "id": "two-came-out",
      "name": "Two Came Out",
      "note": "A rescue where the rescuer was on air and on a line, the atmosphere was logged, and both people came up — first time"
    },
    "stepCount": 11,
    "game": {
      "system": "Rescue Company",
      "currency": "HAUL",
      "ranks": [
        "Rescue Recruit",
        "Rescue Technician",
        "Rigging Lead",
        "Rescue Officer",
        "Rescue Company Certified"
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
    "id": "airport-ramp",
    "index": "46",
    "domain": "Mobility & Transit",
    "trade": "Airline ramp agent / ground handler",
    "category": "Mobility & Transit",
    "certification": "IAM and Transport Workers Union ramp locals; IATA Ground Operations Manual (AHM 630 ground support equipment, ERA safety envelope); FAA 14 CFR 139.303 personnel training and 139.329 movement-area safety; OSHA 29 CFR 1910.178 for powered ramp equipment",
    "name": "Airport Ramp",
    "weather": "overcast",
    "indoor": null,
    "title": "SmartCiti.X~ Airport Ramp VR",
    "tagline": "Gate turn: FOD walk and equipment restraint line, marshal onto the lead-in, chocks before anything touches it, cones set, ground power and headset to the flight deck, bridge to the door, loader at walking pace, all-clear only when chocks and cones are back",
    "accent": 6534640,
    "accentCss": "#63b5f0",
    "parSeconds": 250,
    "badge": {
      "id": "clean-turn",
      "name": "Clean Turn",
      "note": "Chocks before contact, cones set, headset before pushback and the all-clear given last — first time"
    },
    "stepCount": 11,
    "game": {
      "system": "Ramp Operations",
      "currency": "TURN",
      "ranks": [
        "Ramp Agent",
        "Lead Agent",
        "Turn Coordinator",
        "Ramp Supervisor",
        "Ramp Operations Certified"
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
    "id": "cooling-tower",
    "index": "47",
    "domain": "Building Systems & Facilities",
    "trade": "Stationary engineer — water treatment and cooling towers",
    "category": "Building Systems & Facilities",
    "certification": "IUOE Local stationary engineer; ASHRAE 188 building water management program and Guideline 12 Legionella control; CDC / OSHA Legionella toolkit for cooling towers; OSHA 29 CFR 1910.134 respiratory protection and 1910.147 lockout/tagout; EPA FIFRA-registered biocide label compliance",
    "name": "Cooling Tower",
    "weather": "wind",
    "indoor": null,
    "title": "SmartCiti.X~ Cooling Tower VR",
    "tagline": "Quarterly clean and Legionella control: plan and last culture read, tower down and fan locked, respirator before the basin, biofilm physically removed, drift eliminator checked, biocide shock to the label, conductivity and halogen back in range, log signed",
    "accent": 7326184,
    "accentCss": "#6fc9e8",
    "parSeconds": 270,
    "badge": {
      "id": "no-aerosol",
      "name": "No Aerosol",
      "note": "Fan locked before the basin was touched, respirator on, biofilm removed and the shock dosed to the label — first time"
    },
    "stepCount": 11,
    "game": {
      "system": "Water Management",
      "currency": "PPM",
      "ranks": [
        "Oiler",
        "Stationary Engineer",
        "Water Treatment Lead",
        "Chief Engineer",
        "Water Management Certified"
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
    "id": "concrete-pour",
    "index": "48",
    "domain": "Construction & Structural Trades",
    "trade": "Cement mason / concrete finisher and laborer",
    "category": "Construction & Structural Trades",
    "certification": "OPCMIA cement masons and LIUNA laborers; ACI Concrete Field Testing Technician Grade I (slump ASTM C143, air C231, cylinders C31); OSHA 29 CFR 1926 Subpart Q concrete and masonry (1926.701 impalement protection, 1926.703 formwork); ACI 347 formwork pressure and OSHA 1926.1153 respirable crystalline silica",
    "name": "Concrete Pour",
    "weather": "overcast",
    "indoor": null,
    "title": "SmartCiti.X~ Concrete Pour VR",
    "tagline": "Wall pour from a boom pump: pre-pour walk, rebar capped and forms braced, slump and air tested before the first yard, nobody under the boom, placement rate inside the form pressure, vibrated not segregated, cylinders cast, finish on the clock",
    "accent": 13222580,
    "accentCss": "#c9c2b4",
    "parSeconds": 280,
    "badge": {
      "id": "clean-placement",
      "name": "Clean Placement",
      "note": "A pour tested before it started, placed inside the form's rate and consolidated without segregating — first time"
    },
    "stepCount": 12,
    "game": {
      "system": "Placement Crew",
      "currency": "YARD",
      "ranks": [
        "Laborer",
        "Finisher",
        "Cement Mason",
        "Pour Foreman",
        "Placement Crew Certified"
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
    "id": "cnc-cell",
    "index": "49",
    "domain": "Manufacturing & Automation",
    "trade": "CNC machinist — vertical machining centre",
    "category": "Manufacturing & Automation",
    "certification": "IAM and USW machinist locals; NIMS Machining Level I CNC Milling (setup, operation, programming); OSHA 29 CFR 1910.212 machine guarding and 1910.147 lockout/tagout; ANSI B11.22 safety requirements for turning and milling centres; OSHA 1910.242(b) limiting compressed air for cleaning",
    "name": "CNC Cell",
    "weather": "clear",
    "indoor": "shop",
    "title": "SmartCiti.X~ CNC Cell VR",
    "tagline": "Machining centre setup and first part: setup sheet, spindle stopped and locked before the envelope, workholding torqued, tool measured and offset, single-block dry run above the part, door closed, first article measured, chips brushed not blown",
    "accent": 9415108,
    "accentCss": "#8fa9c4",
    "parSeconds": 260,
    "badge": {
      "id": "first-article-good",
      "name": "First Article Good",
      "note": "A setup proven by a dry run and a first article inside tolerance, with nothing reaching into a live envelope — first time"
    },
    "stepCount": 12,
    "game": {
      "system": "Machine Shop",
      "currency": "THOU",
      "ranks": [
        "Apprentice",
        "Operator",
        "Setup Machinist",
        "Lead Machinist",
        "Machine Shop Certified"
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
    "id": "backflow-test",
    "index": "50",
    "domain": "Water & Environmental",
    "trade": "Certified backflow prevention assembly tester",
    "category": "Water & Environmental",
    "certification": "UA plumbers and pipefitters; ASSE 5110 Backflow Prevention Assembly Tester certification and ASSE 1013 reduced-pressure principle assemblies; USC FCCCHR field test procedure; state cross-connection control programme and EPA Safe Drinking Water Act obligations on the purveyor",
    "name": "Backflow Test",
    "weather": "clear",
    "indoor": "service",
    "title": "SmartCiti.X~ Backflow Test VR",
    "tagline": "Annual RP assembly test: hazard identified, customer notified before the water goes off, gauge zeroed and hoses bled, check one, check two and the relief opening point each tested in order, assembly restored slowly, report signed and filed",
    "accent": 5224649,
    "accentCss": "#4fb8c9",
    "parSeconds": 250,
    "badge": {
      "id": "no-cross-connection",
      "name": "No Cross Connection",
      "note": "A test run in order on a bled gauge, with the customer told first and the assembly restored without a hammer — first time"
    },
    "stepCount": 11,
    "game": {
      "system": "Cross-Connection Control",
      "currency": "PSID",
      "ranks": [
        "Apprentice",
        "Journeyman",
        "Certified Tester",
        "Programme Inspector",
        "Cross-Connection Certified"
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
    "id": "transformer-vault",
    "index": "51",
    "domain": "Utility distribution",
    "trade": "Substation / underground distribution electrician",
    "category": "Energy & Power",
    "certification": "IBEW — underground distribution journeyman; NFPA 70E arc-flash boundary and PPE category; OSHA 29 CFR 1910.269 for the switching, clearance and grounding; ASTM D3612 dissolved-gas sampling",
    "name": "Transformer Vault",
    "weather": "rain",
    "indoor": null,
    "title": "SmartCiti.X~ Transformer Vault VR",
    "tagline": "Padmount switching under a written order: clearance, hot stick, load-break elbows, grounds applied, oil drawn for DGA",
    "accent": 5231103,
    "accentCss": "#4fd1ff",
    "parSeconds": 260,
    "badge": {
      "id": "vault-clear",
      "name": "Vault Clear",
      "note": "A padmount switched and grounded to a written order, with the oil drawn clean and the vault left safe"
    },
    "stepCount": 12,
    "game": {
      "system": "Vault Authority",
      "currency": "KVA",
      "ranks": [
        "Apprentice",
        "Cable Splicer",
        "UD Journeyman",
        "Switching Authority",
        "Vault Authority Certified"
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
    "id": "wind-nacelle",
    "index": "52",
    "domain": "Renewable generation",
    "trade": "Wind turbine technician",
    "category": "Energy & Power",
    "certification": "IBEW / IUOE — utility-scale wind technician; GWO Basic Safety Training (working at height, first aid, manual handling, fire awareness); OSHA 29 CFR 1910.147 for the rotor, yaw and converter locks; 1910.269 for the electrical isolation",
    "name": "Wind Nacelle",
    "weather": "wind",
    "indoor": null,
    "title": "SmartCiti.X~ Wind Nacelle VR",
    "tagline": "Gearbox service ninety metres up: rotor lock, yaw lock, converter isolation, oil sampled hot, brake pads gauged, hatch closed",
    "accent": 7268279,
    "accentCss": "#6ee7b7",
    "parSeconds": 270,
    "badge": {
      "id": "nacelle-certified",
      "name": "Nacelle Certified",
      "note": "A gearbox serviced with all three locks proven, sampled hot, and the nacelle left closed and clear"
    },
    "stepCount": 13,
    "game": {
      "system": "Nacelle Authority",
      "currency": "MWH",
      "ranks": [
        "Trainee Tech",
        "Wind Tech",
        "Lead Tech",
        "Site Lead",
        "Nacelle Authority Certified"
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
    "id": "digester-gas",
    "index": "53",
    "domain": "Wastewater treatment",
    "trade": "Wastewater plant operator / pipefitter",
    "category": "Water & Environmental",
    "certification": "UA / AFSCME — wastewater treatment operator and plant pipefitter; OSHA 29 CFR 1910.146 permit-required confined space; NFPA 820 for the classified area; 1910.147 energy control; NFPA 69 explosion prevention by purging",
    "name": "Digester Gas",
    "weather": "fog",
    "indoor": null,
    "title": "SmartCiti.X~ Digester Gas VR",
    "tagline": "Flame arrester change on a live biogas main: classified-area control, nitrogen purge, LEL and H2S proven, no hot work, bonded and re-leak-tested",
    "accent": 8702998,
    "accentCss": "#84cc16",
    "parSeconds": 265,
    "badge": {
      "id": "gas-free-proven",
      "name": "Gas Free Proven",
      "note": "A biogas main opened only after purge, LEL and H2S were all proven, and closed leak-tight"
    },
    "stepCount": 14,
    "game": {
      "system": "Digester Authority",
      "currency": "SCFM",
      "ranks": [
        "Operator I",
        "Operator II",
        "Plant Pipefitter",
        "Shift Supervisor",
        "Digester Authority Certified"
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
    "id": "data-hall",
    "index": "54",
    "domain": "Data centre",
    "trade": "Critical facilities electrician",
    "category": "Connectivity & Telecom",
    "certification": "IBEW — critical facilities / data centre electrician; NFPA 70E arc-flash risk assessment and energised electrical work permit; OSHA 29 CFR 1910.333 for working on or near live parts; Uptime Institute concurrent maintainability practice",
    "name": "Data Hall",
    "weather": "overcast",
    "indoor": null,
    "title": "SmartCiti.X~ Data Hall VR",
    "tagline": "Busway tap-off on a live overhead run: EEWP, A/B side proven, arc PPE, boundary held, torqued and thermally verified",
    "accent": 3718648,
    "accentCss": "#38bdf8",
    "parSeconds": 250,
    "badge": {
      "id": "concurrent-certified",
      "name": "Concurrent Certified",
      "note": "A tap-off landed on a live busway with the redundant side proven, the boundary held and nothing dropped"
    },
    "stepCount": 12,
    "game": {
      "system": "Hall Authority",
      "currency": "KW",
      "ranks": [
        "Facilities Apprentice",
        "Critical Electrician",
        "Shift Engineer",
        "Hall Lead",
        "Hall Authority Certified"
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
