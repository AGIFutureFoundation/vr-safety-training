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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "certification": "LIUNA — OSHA 29 CFR 1910.146 permit-required confined space entrant; ANSI/ASSP Z117.1 confined spaces; NIOSH confined-space entry criteria",
    "name": "Valve Vault",
    "weather": "rain",
    "indoor": null,
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "certification": "CWA and IBEW outside-plant technicians; OSHA 29 CFR 1910.268, the telecommunications standard, for work in and around a street node; the ANSI Z136 laser safety series for optical-fibre communication systems; NFPA 70E for the -48 V power plant in the cabinet; BICSI Installer 2, Optical Fiber, and the carrier's own loss budget and port tag-out procedure",
    "name": "Splice Node",
    "weather": "rain",
    "indoor": "service",
    "district": null,
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
    "stepCount": 14,
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "certification": "IAFF and IAEP fire-based EMS crews; state paramedic licence at the NREMT level; START triage as the regional mass-casualty protocol adopts it, worked inside a NIMS incident command structure; the NFPA 1006 job performance requirements for technical rescue personnel on the collapse; OSHA 29 CFR 1910.1030 bloodborne pathogens for every patient contact",
    "name": "Triage Point",
    "weather": "overcast",
    "indoor": null,
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "stepCount": 13,
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "certification": "Ironworkers (IBB) — OSHA 29 CFR 1926 Subpart R qualified connector; fall protection under ANSI Z359 and rigging signals per ASME B30.5",
    "name": "Steel Erector",
    "weather": "wind",
    "indoor": null,
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "certification": "IUEC elevator constructors; ASME A17.1 / CSA B44, the safety code for elevators and escalators, and its A17.2 inspection guide; OSHA 29 CFR 1910.147, the control of hazardous energy, for the machine room isolation; NFPA 70 Article 620 for the elevator supply and NFPA 70E for proving it dead; NAESA-accredited QEI inspection",
    "name": "Elevator Pit",
    "weather": "clear",
    "indoor": "service",
    "district": null,
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
    "stepCount": 13,
    "interruptCount": 2,
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
    "certification": "LIUNA abatement workers; OSHA 29 CFR 1926.1101, the asbestos standard for construction, and 29 CFR 1910.134 respiratory protection; EPA AHERA worker accreditation and the EPA asbestos NESHAP for the waste; the project design and clearance criteria in the containment plan",
    "name": "Abatement Chamber",
    "weather": "clear",
    "indoor": "plant",
    "district": null,
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
    "interruptCount": 0,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "stepCount": 16,
    "interruptCount": 2,
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
    "certification": "ILWU — OSHA 29 CFR 1917 qualified crane operator; ASME B30.4 portal, tower and pillar crane standard",
    "name": "Dock Crane",
    "weather": "wind",
    "indoor": null,
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 0,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "stepCount": 12,
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "certification": "IAM and Transport Workers Union ramp locals; IATA Ground Operations Manual (AHM 630 ground support equipment, ERA safety envelope); FAA 14 CFR 139.303 personnel training and 139.329 movement-area safety; OSHA 29 CFR 1910.178 for powered ramp equipment; ANSI/ISEA 107 high-visibility apparel for anyone on the movement area",
    "name": "Airport Ramp",
    "weather": "overcast",
    "indoor": null,
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "stepCount": 13,
    "interruptCount": 2,
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
    "certification": "UA plumbers and pipefitters; ANSI/ASSE 5110 Backflow Prevention Assembly Tester certification testing ANSI/ASSE 1013 reduced-pressure principle assemblies built to NSF/ANSI/CAN 61; AWWA M14 cross-connection control guidance and the purveyor's programme; EPA Safe Drinking Water Act obligations on the purveyor",
    "name": "Backflow Test",
    "weather": "clear",
    "indoor": "service",
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "district": null,
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
    "interruptCount": 2,
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
    "indoor": "datahall",
    "district": null,
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
    "interruptCount": 2,
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
  },
  {
    "id": "mast-climber",
    "index": "55",
    "domain": "Construction access",
    "trade": "Mast climber erector / ironworker",
    "category": "Construction & Structural Trades",
    "certification": "Ironworkers / LIUNA — mast climbing work platform erector; ANSI A92.9 for MCWP design, erection and use; OSHA 29 CFR 1926.451 scaffold general requirements and 1926.502 fall protection",
    "name": "Mast Climber",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Mast Climber VR",
    "tagline": "Adding a mast section and climbing: tie spacing, plumb, rated load and its distribution, overload cut-out proven, emergency descent rehearsed",
    "accent": 16486972,
    "accentCss": "#fb923c",
    "parSeconds": 265,
    "badge": {
      "id": "mast-certified",
      "name": "Mast Certified",
      "note": "A mast section added, tied and plumbed, with the deck loaded inside its distribution chart and the cut-out proven"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Mast Authority",
      "currency": "TIES",
      "ranks": [
        "Apprentice Erector",
        "Erector",
        "Lead Erector",
        "Erection Supervisor",
        "Mast Authority Certified"
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
    "id": "hazmat-entry",
    "index": "56",
    "domain": "Emergency response",
    "trade": "Hazardous materials technician",
    "category": "Emergency Services",
    "certification": "IAFF / IAEP — hazardous materials technician; OSHA 29 CFR 1910.120(q) HAZWOPER emergency response; NFPA 472/1072 competencies; 1910.134 respiratory protection for the SCBA",
    "name": "Hazmat Entry",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Hazmat Entry VR",
    "tagline": "Level A entry on air: zones set, suit checked and pressure-tested, buddy and backup in place, air managed to the rule of thirds, out through decon",
    "accent": 16498468,
    "accentCss": "#fbbf24",
    "parSeconds": 280,
    "badge": {
      "id": "entry-certified",
      "name": "Entry Certified",
      "note": "A Level A entry made and reversed with the air managed, the buddy kept and the decon line walked"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Entry Authority",
      "currency": "PSI",
      "ranks": [
        "Operations",
        "Technician",
        "Entry Team Lead",
        "Hazmat Officer",
        "Entry Authority Certified"
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
    "id": "ammonia-plant",
    "index": "60",
    "domain": "Facilities",
    "trade": "Industrial refrigeration operator / refrigeration fitter",
    "category": "Building Systems & Facilities",
    "certification": "RETA CARO / CIRO industrial refrigeration operator; UA refrigeration service technicians and IUOE stationary engineers; IIAR 6 inspection, testing and maintenance and IIAR 2 machinery-room provisions; ASHRAE 15 refrigeration machinery rooms; OSHA 29 CFR 1910.119 process safety management where the charge is 10,000 lb or more; 1910.147 lockout/tagout; 1910.134 respiratory protection",
    "name": "Ammonia Plant",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Ammonia Plant VR",
    "tagline": "Detection alarm on an arena ice plant: everything decided at the outside panel first, entry on air, circuit pumped down and locked, seal changed, discharge open before suction on the way back",
    "accent": 3718648,
    "accentCss": "#38bdf8",
    "parSeconds": 300,
    "badge": {
      "id": "room-held",
      "name": "Room Held",
      "note": "An ammonia alarm worked from the outside in: ventilation first, entry on air, circuit pumped down and returned in the right order"
    },
    "stepCount": 16,
    "interruptCount": 2,
    "game": {
      "system": "Refrigeration Authority",
      "currency": "PSIG",
      "ranks": [
        "Plant Attendant",
        "Refrigeration Operator",
        "Lead Operator",
        "Chief Engineer",
        "Refrigeration Authority Certified"
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
    "id": "pyro-cue",
    "index": "61",
    "domain": "Live events",
    "trade": "Pyrotechnic operator / stage technician",
    "category": "Entertainment & Live Events",
    "certification": "IATSE stage locals; NFPA 1126 use of pyrotechnics before a proximate audience; OSHA 29 CFR 1910.109 storage and handling of explosives and blasting agents; ATF licensing and magazine rules under 27 CFR Part 555 for the acquisition and storage of explosive materials; state or provincial pyrotechnic operator licensing, which varies by jurisdiction; the local AHJ's permit and sign-off for this venue and this show",
    "name": "Pyro Cue",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Pyro Cue VR",
    "tagline": "A proximate effect set and fired: permit and fallout zone first, device loaded last, line shunted until the panel tests it, armed only on the all-clear, and a misfire nobody walks up to",
    "accent": 16742972,
    "accentCss": "#ff7a3c",
    "parSeconds": 280,
    "badge": {
      "id": "cue-held",
      "name": "Cue Held",
      "note": "An effect set, tested, armed on the all-clear and fired — and a misfire handled from the panel rather than from the stage"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Firing Authority",
      "currency": "CUE",
      "ranks": [
        "Deck Hand",
        "Pyro Assistant",
        "Pyrotechnic Operator",
        "Effects Lead",
        "Firing Authority Certified"
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
    "id": "post-tension",
    "index": "58",
    "domain": "Construction",
    "trade": "Ironworker — post-tensioning crew",
    "category": "Construction & Structural Trades",
    "certification": "Ironworkers (IW) reinforcing and post-tensioning crews; PTI Level 1 and Level 2 certification for unbonded post-tensioning field personnel; ACI 318 for the compressive strength the concrete must reach before the tendons are stressed; OSHA 29 CFR 1926 Subpart Q concrete and masonry construction — 1926.701(c) post-tensioning: nobody but the crew essential to the operation behind the jack, and signs and barriers limiting access to the area during tensioning",
    "name": "Post Tension",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Post Tension VR",
    "tagline": "Stressing tendons in a cast-in-place slab: strength proven before transfer, calibrated jack and gauge, both end cones barricaded and nobody behind the ram, force ramped, elongation measured against the record, and nothing cut until the engineer accepts it",
    "accent": 15699786,
    "accentCss": "#ef8f4a",
    "parSeconds": 285,
    "badge": {
      "id": "tendon-certified",
      "name": "Tendon Certified",
      "note": "A tendon stressed with the cone kept empty, the elongation inside tolerance and the tails cut only after acceptance"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Stressing Authority",
      "currency": "KIP",
      "ranks": [
        "Apprentice",
        "Reinforcing Ironworker",
        "PT Installer",
        "Stressing Foreman",
        "Stressing Authority Certified"
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
    "id": "shipyard-hotwork",
    "index": "57",
    "domain": "Maritime",
    "trade": "Shipyard boilermaker / marine welder",
    "category": "Maritime & Ports",
    "certification": "IBB — International Brotherhood of Boilermakers, Iron Ship Builders, Blacksmiths, Forgers and Helpers; OSHA 29 CFR 1915 Subpart B confined and enclosed spaces in shipyard employment (1915.12 testing before entry, 1915.14 hot work, 1915.15 maintenance of safe conditions); 1915 Subpart D welding, cutting and heating; 1915.503 precautions for hot work and 1915.504 fire watches; NFPA 306 control of gas hazards on vessels and the Marine Chemist certificate; USCG requirements for hot work aboard inspected tank vessels",
    "name": "Shipyard Hot Work",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Shipyard Hot Work VR",
    "tagline": "Burning an insert out of a tank boundary on a Marine Chemist's certificate: read the findings space by space, get the void behind the plate certified, ventilate continuously, bottles on deck, fire watch both sides and after",
    "accent": 16347926,
    "accentCss": "#f97316",
    "parSeconds": 310,
    "badge": {
      "id": "certificate-read",
      "name": "Certificate Read",
      "note": "Hot work done inside the four corners of a Marine Chemist's certificate — the right spaces, the right finding, inside the hours"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Gas Free Engineering",
      "currency": "AMPS",
      "ranks": [
        "Yard Helper",
        "Fitter",
        "Boilermaker",
        "Lead Boilermaker",
        "Hot Work Certified"
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
    "id": "grain-bin",
    "index": "59",
    "domain": "Manufacturing",
    "trade": "Grain elevator operator / bin entry crew",
    "category": "Manufacturing & Automation",
    "certification": "BCTGM — grain miller and terminal elevator operator, with the grain-handling locals; OSHA 29 CFR 1910.272 grain handling facilities, whose entry provisions at 1910.272(g) cover bins, silos and tanks: equipment that presents a danger de-energised, disconnected, locked out and tagged; a body harness with lifeline; an observer stationed outside with communications maintained; rescue equipment suited to the structure; and no entry underneath a bridging condition or where built-up grain on the sides could fall and bury. Walking down grain is prohibited by the same standard. OSHA 1910.147 energy control; 1910.146 permit-required confined spaces where it applies",
    "name": "Grain Bin",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Grain Bin VR",
    "tagline": "Breaking a bridge in a terminal bin: everything that moves grain locked out first, dust down and bonded, atmosphere proved, the crust worked from above on a tight line with an observer who never leaves the hatch",
    "accent": 14722136,
    "accentCss": "#e0a458",
    "parSeconds": 300,
    "badge": {
      "id": "never-on-the-grain",
      "name": "Never On The Grain",
      "note": "A bridge broken from above with the bin locked out, the line tight and the observer still at the hatch"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Bin Entry Authority",
      "currency": "BUSHEL",
      "ranks": [
        "Elevator Hand",
        "Grain Miller",
        "Bin Entry Lead",
        "Elevator Superintendent",
        "Bin Entry Authority Certified"
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
    "id": "landfill-gas",
    "index": "62",
    "domain": "Environmental",
    "trade": "Landfill gas technician / wellfield operator",
    "category": "Environmental Monitoring",
    "certification": "LIUNA and IUOE landfill and wellfield crews; SWANA Manager of Landfill Operations; 40 CFR 258.23 methane monitoring at the property boundary and in site structures; the NSPS gas collection and control requirements for landfills at 40 CFR 60, including the 55 °C wellhead operating temperature those standards have used; OSHA 29 CFR 1910.146 where a knockout or manhole is entered",
    "name": "Landfill Gas",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Landfill Gas VR",
    "tagline": "Tuning an extraction well: knockout drained, analyser proven, methane and oxygen and temperature read before the valve is touched, and a perimeter probe that decides whether any of it was enough",
    "accent": 10729532,
    "accentCss": "#a3b83c",
    "parSeconds": 270,
    "badge": {
      "id": "field-balanced",
      "name": "Field Balanced",
      "note": "A well tuned on what comes out of it rather than on how far the valve was opened"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Wellfield Authority",
      "currency": "SCFM",
      "ranks": [
        "Field Hand",
        "Wellfield Technician",
        "Lead Technician",
        "Gas System Supervisor",
        "Wellfield Authority Certified"
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
    "id": "hot-tap",
    "index": "66",
    "domain": "Water",
    "trade": "Pipefitter / water distribution tapping crew",
    "category": "Water & Environmental",
    "certification": "UA pipefitters and plumbers with LIUNA on the excavation; AWWA C651 disinfecting water mains and the utility's own tapping specification; state water distribution operator certification for the return to service; OSHA 29 CFR 1926 Subpart P excavations for the bell hole; 1926 Subpart O for the equipment working over it",
    "name": "Hot Tap",
    "weather": "rain",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Hot Tap VR",
    "tagline": "Cutting into a live main: sleeve proven before the valve opens, cutter proven clear before the valve closes, coupon accounted for, and the main disinfected before it serves anybody",
    "accent": 3711953,
    "accentCss": "#38a3d1",
    "parSeconds": 300,
    "badge": {
      "id": "tap-held",
      "name": "Tap Held",
      "note": "A live main tapped and stopped with the pressure test done first, the coupon on the cutter and the section disinfected before it went back"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Tapping Authority",
      "currency": "PSI",
      "ranks": [
        "Labourer",
        "Tapping Crew",
        "Lead Fitter",
        "Distribution Foreman",
        "Tapping Authority Certified"
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
    "id": "rcl-switching",
    "index": "63",
    "domain": "Rail",
    "trade": "Remote control locomotive operator / switchman",
    "category": "Mobility & Transit",
    "certification": "SMART Transportation Division and BLET — the carrier's remote control locomotive operator certification, over conductor and engineer certification under FRA 49 CFR 242 and 240; 49 CFR 218 Subpart B blue signal protection of workers; 49 CFR 232 brake system standards, including the securement of unattended equipment",
    "name": "RCL Switching",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ RCL Switching VR",
    "tagline": "A remote control shove worked from the ground: point protection on every movement, a blue signal put up and taken down by the one hand it protects, three-step before anybody fouls the equipment, and securement proved by pulling against it",
    "accent": 4886754,
    "accentCss": "#4a90e2",
    "parSeconds": 300,
    "badge": {
      "id": "point-protected",
      "name": "Point Protected",
      "note": "A cut shoved, coupled, secured and left in the clear with the leading end never once out of sight"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Yard Authority",
      "currency": "CARS",
      "ranks": [
        "Switchman",
        "RCL Operator",
        "Yard Foreman",
        "Yardmaster",
        "Yard Authority Certified"
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
    "id": "aerial-lashing",
    "index": "64",
    "domain": "Telecom",
    "trade": "Outside plant aerial technician (line and cable placer)",
    "category": "Connectivity & Telecom",
    "certification": "CWA and IBEW outside-plant locals; OSHA 29 CFR 1910.268 telecommunications; 29 CFR 1926 Subpart V and 1910.269 for the supply space a communications worker is not qualified to enter; ANSI A92 for the vehicle-mounted aerial device; the National Electrical Safety Code for joint-use separations; MUTCD temporary traffic control",
    "name": "Aerial Lashing",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Aerial Lashing VR",
    "tagline": "Placing fibre on an existing strand from a bucket over a live road: traffic control first, pole sounded, strand bonded, the supply space kept above you and the sag left where the make-ready put it",
    "accent": 3918256,
    "accentCss": "#3bc9b0",
    "parSeconds": 300,
    "badge": {
      "id": "span-placed",
      "name": "Span Placed",
      "note": "A span lashed with the lane closed, the strand bonded and the supply space never entered"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Outside Plant Authority",
      "currency": "SPAN",
      "ranks": [
        "Cable Hand",
        "Aerial Technician",
        "Line Placer",
        "OSP Crew Lead",
        "Outside Plant Authority Certified"
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
    "id": "ev-extrication",
    "index": "65",
    "domain": "Emergency response",
    "trade": "Firefighter — vehicle rescue technician",
    "category": "Emergency Services",
    "certification": "IAFF / IAEP — vehicle rescue technician; NFPA 1006 technical rescue vehicle and machinery competencies; NFPA 1670 vehicle and machinery search and rescue; the vehicle manufacturer's Emergency Response Guide for the high-voltage shutdown, the crib points and the cut points",
    "name": "EV Extrication",
    "weather": "rain",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ EV Extrication VR",
    "tagline": "Trapped occupant in a battery-electric car: chock and crib first, shut the high voltage down off the manufacturer's guide, wait out the stored energy, mark the orange and the undeployed airbags, protect the patient, cut only where the sheet says, and watch the pack",
    "accent": 16347926,
    "accentCss": "#f97316",
    "parSeconds": 300,
    "badge": {
      "id": "ev-rescue",
      "name": "EV Rescue",
      "note": "An occupant freed from a battery-electric car with the high voltage down, the wait kept, nothing orange cut, and the pack still being watched when the patient left"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Rescue Group",
      "currency": "RESCUE",
      "ranks": [
        "Firefighter",
        "Vehicle Rescue Operations",
        "Vehicle Rescue Technician",
        "Extrication Officer",
        "EV Rescue Certified"
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
    "id": "tank-lining",
    "index": "70",
    "domain": "Coatings",
    "trade": "Industrial painter / protective coatings applicator",
    "category": "Surface Prep & Coatings",
    "certification": "IUPAT industrial painters and the bridge and tank locals; AMPP (formerly SSPC and NACE) applicator and coating inspector qualification, with the surface preparation standard the specification names; NSF/ANSI 61 certification for a coating in contact with drinking water; AWWA C652 disinfection of water-storage facilities before return to service; OSHA 29 CFR 1910.146 permit-required confined spaces, 1910.134 for the supplied-air respirator and its breathing-air quality, and 1926.1153 respirable crystalline silica",
    "name": "Tank Lining",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Tank Lining VR",
    "tagline": "Blasting and lining a potable water tank: breathing air proven before the hood goes on, profile and dew point measured before the first coat, film thickness held, holidays found, and the tank disinfected before it holds water again",
    "accent": 6205636,
    "accentCss": "#5eb0c4",
    "parSeconds": 300,
    "badge": {
      "id": "lining-held",
      "name": "Lining Held",
      "note": "A tank lined on measured numbers — breathing air, profile, dew point, film thickness and a holiday test — and disinfected before it went back"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Coatings Authority",
      "currency": "MIL",
      "ranks": [
        "Helper",
        "Blaster",
        "Applicator",
        "Coatings Foreman",
        "Coatings Authority Certified"
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
    "id": "arena-rigging",
    "index": "69",
    "domain": "Live events",
    "trade": "Arena rigger — up-rigger / down-rigger",
    "category": "Entertainment & Live Events",
    "certification": "IATSE stage locals — ETCP Certified Rigger (Arena); the ESTA E1 series for entertainment rigging practice; OSHA 29 CFR 1926 Subpart M fall protection; the venue's rigging grid drawing and the production's rigging plot as the governing documents",
    "name": "Arena Rigging",
    "weather": "overcast",
    "indoor": "theatre",
    "district": null,
    "title": "SmartCiti.X~ Arena Rigging VR",
    "tagline": "Setting a point in the roof steel: the point called and confirmed both ways, the bridle worked out on the plot, the beam checked against the grid drawing, the floor cleared and watched, tied off to structure the whole time",
    "accent": 2282478,
    "accentCss": "#22d3ee",
    "parSeconds": 290,
    "badge": {
      "id": "point-set",
      "name": "Point Set",
      "note": "One point found, calculated, hung and tagged — over a floor nobody was standing on"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "High Steel Authority",
      "currency": "POINT",
      "ranks": [
        "Ground Rigger",
        "Down-Rigger",
        "Up-Rigger",
        "Head Rigger",
        "High Steel Certified"
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
    "id": "stack-test",
    "index": "68",
    "domain": "Environmental",
    "trade": "Source emissions tester / stack testing technician",
    "category": "Environmental Monitoring",
    "certification": "IUOE and USW plant crews working with the testing contractor's source-testing team; the EPA reference methods in 40 CFR Part 60 Appendix A — Method 1 traverse points, Method 2 velocity by pitot, Method 3 gas composition, Method 4 moisture and Method 5 particulate; the facility's operating permit and the test protocol approved under it; OSHA 29 CFR 1910 Subpart D for the sampling platform, its guardrail and its fixed ladder",
    "name": "Stack Test",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Stack Test VR",
    "tagline": "An isokinetic source test from the sampling platform: traverse points calculated, train leak-checked both ends, the rate held across the traverse, and everything recovered into labelled containers",
    "accent": 14711391,
    "accentCss": "#e07a5f",
    "parSeconds": 310,
    "badge": {
      "id": "run-stands",
      "name": "The Run Stands",
      "note": "A traverse taken isokinetically, bracketed by leak checks that both passed, and recovered so an auditor can follow it"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Source Test Authority",
      "currency": "DSCF",
      "ranks": [
        "Test Assistant",
        "Sampling Technician",
        "Team Leader",
        "Qualified Source Tester",
        "Source Test Authority"
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
    "id": "pilot-transfer",
    "index": "67",
    "domain": "Maritime",
    "trade": "Deck officer / able seafarer — pilot transfer party",
    "category": "Maritime & Ports",
    "certification": "IOMM&P — International Organization of Masters, Mates & Pilots; ILA / IBU where the boat's crew are covered; SOLAS Chapter V regulation 23 (pilot transfer arrangements); IMO Assembly Resolution A.1045(27) as amended, pilot transfer arrangements; ISO 799 pilot ladders and the manufacturer's certificate; the flag State's requirements and the ship's own SMS procedure for pilot transfer under the ISM Code",
    "name": "Pilot Transfer",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Pilot Transfer VR",
    "tagline": "Rigging a pilot ladder at sea: certificate and inspection before it goes over the side, the arrangement to the approved drawing, lifebuoy and light and heaving line at the point of transfer first, combination secured to itself, officer in attendance with the bridge, and the ship's lee held",
    "accent": 16765286,
    "accentCss": "#ffd166",
    "parSeconds": 300,
    "badge": {
      "id": "ladder-fit-to-climb",
      "name": "Fit To Climb",
      "note": "A pilot ladder rigged to the drawing on a certified ladder, attended from the moment it went over the side"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Deck Department",
      "currency": "FATHOM",
      "ranks": [
        "Ordinary Seafarer",
        "Able Seafarer",
        "Third Officer",
        "Chief Officer",
        "Deck Department Certified"
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
    "id": "gas-leak-survey",
    "index": "71",
    "domain": "Energy",
    "trade": "Gas distribution serviceperson / leak survey technician",
    "category": "Energy & Power",
    "certification": "UWUA and USW gas-utility locals — operator-qualified for leakage survey and leak investigation; 49 CFR Part 192 (PHMSA minimum safety standards for gas distribution pipelines, including its leakage-survey, investigation and repair requirements) and the operator's own written leak-grading and re-check procedure made under it; NFPA 54 for the customer fuel-gas piping downstream of the meter; OSHA 29 CFR 1910.146 where migrated gas puts a manhole or a vault into the survey",
    "name": "Gas Leak Survey",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Gas Leak Survey VR",
    "tagline": "Reported odour over a distribution main: instrument zeroed in clean air, ignition sources controlled, bar-holed outward along the trench and the utilities, graded on where the gas is, inside readings evacuated rather than investigated",
    "accent": 16164387,
    "accentCss": "#f6a623",
    "parSeconds": 310,
    "badge": {
      "id": "leak-graded",
      "name": "Leak Graded",
      "note": "An odour call worked out to its edges and graded on where the gas was, with nothing on the street left able to light it"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Leak Survey Authority",
      "currency": "SCALE",
      "ranks": [
        "Serviceperson",
        "Leak Investigator",
        "Survey Technician",
        "Survey Crew Leader",
        "Leak Survey Authority Certified"
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
    "id": "cath-lab",
    "index": "72",
    "domain": "Facilities",
    "trade": "Hospital facilities electrician / health care building engineer",
    "category": "Building Systems & Facilities",
    "certification": "IBEW and IUOE hospital locals — health care facility maintenance; NFPA 99 health care facilities code for patient care space categories and the essential electrical system; NFPA 70 Article 517 for health care facility wiring, isolated power systems and the reference grounding point; NFPA 70E for the risk assessment at the panel; OSHA 29 CFR 1910.147 control of hazardous energy; the hospital's own interim life safety measures and its written clinical authorisation to take the room down",
    "name": "Cath Lab",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Cath Lab VR",
    "tagline": "Planned outage on a cath lab branch panel: clinical authorisation and a window with nobody on the table, the life-safety branch left alone, isolated power read rather than silenced, grounding tested rather than assumed, room confirmed by the clinical team before hand-back",
    "accent": 3003583,
    "accentCss": "#2dd4bf",
    "parSeconds": 320,
    "badge": {
      "id": "room-returned",
      "name": "Room Returned",
      "note": "A patient care space taken down inside an agreed window and handed back by the people who own it"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Health Care Facility Authority",
      "currency": "mA",
      "ranks": [
        "Building Mechanic",
        "Hospital Electrician",
        "Lead Electrician",
        "Facilities Engineer",
        "Health Care Facility Authority Certified"
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
    "id": "bridge-blast",
    "index": "73",
    "domain": "Coatings",
    "trade": "Abrasive blaster / lead-paint removal technician",
    "category": "Surface Prep & Coatings",
    "certification": "IUPAT industrial painters; SSPC-QP 2 certified lead-paint removal contractor and the SSPC-SP 10 near-white blast standard the specification names; OSHA 29 CFR 1926.62 lead in construction, including baseline and periodic blood-lead surveillance; 1926.103 / 1910.134 supplied-air respiratory protection and Grade D breathing air; 40 CFR 261 (RCRA) characteristic hazardous waste D008 for lead debris",
    "name": "Bridge Blast",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Bridge Blast VR",
    "tagline": "Full containment on a highway girder: breathing air proven, negative pressure held, blasted to near-white, and the lead waste labelled and staged before it ever reaches the road",
    "accent": 14263361,
    "accentCss": "#d9a441",
    "parSeconds": 320,
    "badge": {
      "id": "containment-held",
      "name": "Containment Held",
      "note": "A lead-paint containment worked start to finish on measured numbers — breathing air, negative pressure, profile and the waste manifest — with no breach"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Coatings Authority",
      "currency": "MIL",
      "ranks": [
        "Helper",
        "Blaster",
        "Competent Person",
        "Coatings Foreman",
        "Coatings Authority Certified"
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
    "id": "broadcast-truck",
    "index": "74",
    "domain": "Entertainment",
    "trade": "Outside-broadcast / utility electrician",
    "category": "Entertainment & Live Events",
    "certification": "IATSE broadcast and IBEW utility electricians; NEC Article 525 (carnivals, fairs and similar events) and Article 530 (motion picture and television studios); NFPA 70E qualified for the lockout/verification; OSHA 29 CFR 1910.147 lockout/tagout on the generator breaker; NEC 250.6 and 702 on generator neutral-ground bonding and objectionable current",
    "name": "Broadcast Truck",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Broadcast Truck VR",
    "tagline": "Generator power to an outside-broadcast truck: neutral-ground bond checked, camloks landed ground-first, GFCI proven, and the transfer to shore power held clean without dropping the truck's UPS",
    "accent": 3133856,
    "accentCss": "#2fd1a0",
    "parSeconds": 300,
    "badge": {
      "id": "clean-transfer",
      "name": "Clean Transfer",
      "note": "A generator tie-in bonded, cammed ground-first and GFCI-proven, with the transfer to shore power held clean and the UPS never dropped"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Tie-In Authority",
      "currency": "AMP",
      "ranks": [
        "Deck Electrician",
        "Distro Tech",
        "Utility Electrician",
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
    "id": "pump-and-treat",
    "index": "79",
    "domain": "Water",
    "trade": "Pipefitter / groundwater pump-and-treat plant operator",
    "category": "Water & Environmental",
    "certification": "UA Local 38 plumbers and pipefitters on the piping and vessel work; LIUNA hazmat laborers under OSHA HAZWOPER (29 CFR 1910.120); IUOE stationary engineers on the treatment plant; NPDES discharge permit under the Clean Water Act; EPA RCRA hazardous-waste generator standards (40 CFR 262) for spent carbon; the site O&M manual under its Record of Decision",
    "name": "Pump and Treat",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Pump and Treat VR",
    "tagline": "Groundwater treatment O&M: well flow and drawdown against design, blower and off-gas carbon checked, a GAC vessel isolated, bled and changed out, lead/lag swapped, and a compliance sample sealed under chain of custody",
    "accent": 3131862,
    "accentCss": "#2fc9d6",
    "parSeconds": 290,
    "badge": {
      "id": "carbon-clean",
      "name": "Carbon Clean",
      "note": "A GAC vessel isolated, bled to zero, drummed as hazardous waste and lead/lag swapped, with the compliance sample sealed under chain of custody"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Treatment Authority",
      "currency": "GPM",
      "ranks": [
        "Operator I",
        "Operator II",
        "Lead Operator",
        "Plant Supervisor",
        "Treatment Authority Certified"
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
    "id": "tide-gate",
    "index": "80",
    "domain": "Water",
    "trade": "Operating engineer / laborer — tidal wetland restoration crew",
    "category": "Water & Environmental",
    "certification": "IUOE Local 3 operating engineers on the plant; LIUNA laborers on the cofferdam and gate work; Pile Drivers Local 34 (Carpenters) on the culvert carpentry; a U.S. Army Corps of Engineers Section 404 permit and the Regional Water Board's Clean Water Act (CWA) Section 401 certification; the San Francisco Bay Conservation and Development Commission (BCDC); OSHA 29 CFR 1926.106 for work near water; the fish-window restriction on in-water work",
    "name": "Tide Gate",
    "weather": "wind",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Tide Gate VR",
    "tagline": "Tide-window gate swap: levels read before the cofferdam goes in, a failed flap gate backed out and replaced, the new gate levelled to design elevation, and the cofferdam pulled in order before the first flood",
    "accent": 9083722,
    "accentCss": "#8a9b4a",
    "parSeconds": 300,
    "badge": {
      "id": "gate-holds",
      "name": "Gate Holds",
      "note": "A tide gate swapped inside the low-water window, levelled to design and proven on the first flood"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Tidal Works Authority",
      "currency": "TIDE",
      "ranks": [
        "Laborer",
        "Wetland Hand",
        "Crew Lead",
        "Restoration Foreman",
        "Tidal Works Certified"
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
    "id": "living-shoreline",
    "index": "77",
    "domain": "Environmental",
    "trade": "Marine construction laborer / living shoreline crew",
    "category": "Water & Environmental",
    "certification": "Pile Drivers Local 34 (United Brotherhood of Carpenters) marine construction; LIUNA laborers; U.S. Army Corps of Engineers Clean Water Act (CWA) Section 404 permit conditions; San Francisco Bay Conservation and Development Commission (BCDC) permit; San Francisco Bay Regional Water Quality Control Board CWA Section 401 water quality certification; seasonal in-water work window for fish protection; OSHA 29 CFR 1926 waterfront construction",
    "name": "Living Shoreline",
    "weather": "wind",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Living Shoreline VR",
    "tagline": "Building a living shoreline on a falling tide: curtain set and tensioned, coir and oyster shell to the stakes, cordgrass at grade, silt fence at the edge, and the reach walked before the flood takes anything back",
    "accent": 6266458,
    "accentCss": "#5f9e5a",
    "parSeconds": 290,
    "badge": {
      "id": "reach-secured",
      "name": "Reach Secured",
      "note": "The whole reach placed to grade, curtain tight, and nothing left for the flood to take — first time"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Shoreline Crew",
      "currency": "TIDE",
      "ranks": [
        "Laborer",
        "Crew Hand",
        "Lead Hand",
        "Site Steward",
        "Shoreline Certified"
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
    "id": "dredge-barge",
    "index": "78",
    "domain": "Maritime",
    "trade": "Dredge deck lead / marine construction crew",
    "category": "Maritime & Ports",
    "certification": "IUOE Local 3 operating engineers (dredge crane operator); Inlandboatmen's Union of the Pacific (IBU, ILWU marine division) — tug and scow crew; U.S. Army Corps of Engineers dredging permit conditions; San Francisco Bay Dredged Material Management Office (DMMO) sediment testing; OSHA 29 CFR 1926 Subpart CC cranes and derricks; USCG barge and towing regulations",
    "name": "Dredge Barge",
    "weather": "fog",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Dredge Barge VR",
    "tagline": "Environmental dredging of contaminated bay sediment: baseline turbidity read, curtain and anchors checked, the closed bucket over the open one, a controlled cycle with no overflow, the scow to the freeboard line, decant tested before discharge, and the tug called before the scow moves",
    "accent": 8164261,
    "accentCss": "#7c93a5",
    "parSeconds": 300,
    "badge": {
      "id": "clean-cut",
      "name": "Clean Cut",
      "note": "A load dredged, tested and moved without a reading over limit or a line unaccounted for"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Dredge Deck",
      "currency": "CY",
      "ranks": [
        "Deckhand",
        "Dredge Deck Lead",
        "Scow Boss",
        "Dredging Foreman",
        "Dredge Deck Certified"
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
    "id": "rad-survey",
    "index": "75",
    "domain": "Environmental",
    "trade": "Radiation control technician",
    "category": "Environmental Monitoring",
    "certification": "LIUNA hazmat & environmental laborer — OSHA HAZWOPER 40-hour (29 CFR 1910.120); NRC 10 CFR 20 occupational dose limits; EPA MARSSIM (Multi-Agency Radiation Survey and Site Investigation Manual) walkover and static-count methodology; the site's radiological work plan and QAPP chain of custody",
    "name": "Rad Survey",
    "weather": "fog",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Rad Survey VR",
    "tagline": "Gamma walkover and static count on a shoreline parcel: instrument bracketed by a check source, a gridded scan, GPS-tagged flags and a split sample under chain of custody",
    "accent": 13582254,
    "accentCss": "#cf3fae",
    "parSeconds": 280,
    "badge": {
      "id": "bracketed-day",
      "name": "Bracketed Day",
      "note": "Instrument proven against the check source before the grid and after it, every flagged reading GPS-logged, and the independent lab's split never touched"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Survey Integrity",
      "currency": "COUNT",
      "ranks": [
        "Field Tech",
        "Grid Walker",
        "Static Counter",
        "QA Verifier",
        "Survey Integrity Certified"
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
    "id": "soil-loadout",
    "index": "76",
    "domain": "Environmental",
    "trade": "Excavation & haul-out crew — IUOE operator, LIUNA hazmat laborer directing, Teamsters driver",
    "category": "Environmental Monitoring",
    "certification": "IUOE Local 3 operating engineers on the excavator; LIUNA hazmat laborers under OSHA HAZWOPER 40-hour (29 CFR 1910.120) directing the load from the ground; Teamsters drivers with DOT hazmat endorsements hauling it; EPA RCRA hazardous-waste manifest (40 CFR 262); the site's Air Monitoring Plan",
    "name": "Soil Loadout",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Soil Loadout VR",
    "tagline": "Excavation and haul-out from a remediation cell: zones set from the wind, dust read clean before the first bucket, a lined and tarped load under a hazardous-waste manifest, and the perimeter alarm that stops everything",
    "accent": 15774761,
    "accentCss": "#f0b429",
    "parSeconds": 290,
    "badge": {
      "id": "clean-load",
      "name": "Clean Load",
      "note": "Zones set from the wind, dust read clean before the first bucket, the load lined, tarped and manifested, and the alarm answered the instant it sounded"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Load Control",
      "currency": "MANIFEST",
      "ranks": [
        "Ground Guide",
        "Loadout Hand",
        "Manifest Lead",
        "Zone Authority",
        "Load Control Certified"
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
    "id": "vapor-mitigation",
    "index": "83",
    "domain": "Building Systems",
    "trade": "Sub-slab depressurisation system installer",
    "category": "Building Systems & Facilities",
    "certification": "UA Local 38 plumbers and pipefitters on the piping and vessel work; IBEW Local 6 electricians on the fan circuit under OSHA 29 CFR 1910.147 control of hazardous energy; LIUNA hazmat laborers on cuttings and waste handling; system design and commissioning per ASTM E2121 sub-slab depressurisation practice, the EPA OSWER vapor intrusion technical guide, and California DTSC's vapor intrusion guidance",
    "name": "Vapor Mitigation",
    "weather": "overcast",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Vapor Mitigation VR",
    "tagline": "Commissioning a sub-slab depressurisation system: communication proven at every test point, the fan circuit proven dead before the housing opens, the fan hung and vented clear of any intake, the vacuum verified against design, and an indoor-air sample sealed under chain of custody",
    "accent": 10518271,
    "accentCss": "#a07eff",
    "parSeconds": 300,
    "badge": {
      "id": "field-proven",
      "name": "Field Proven",
      "note": "A communication test, a proven-dead fan circuit, a vacuum verified at every point against design, and an indoor-air sample sealed under chain of custody — all clean"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Vapor Intrusion Control",
      "currency": "IN.WC",
      "ranks": [
        "Installer I",
        "Installer II",
        "Lead Installer",
        "System Commissioner",
        "Vapor Intrusion Certified"
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
    "id": "well-install",
    "index": "84",
    "domain": "Environmental",
    "trade": "Environmental geologist — field lead",
    "category": "Environmental Monitoring",
    "certification": "IUOE Local 3 drillers and rig operators; LIUNA hazmat laborers under OSHA HAZWOPER (29 CFR 1910.120); ASTM D5092 standard practice for monitoring well design and installation; California well construction standards (DWR Bulletin 74); the county well permit and the site's quality assurance project plan (QAPP)",
    "name": "Well Install",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Well Install VR",
    "tagline": "Hollow-stem auger monitoring well: locate and permit checked, the mast raised inside its clearance, cuttings screened and drummed, screen and casing set, filter pack and seal placed and hydrated before the grout, the well developed clear, the survey point logged",
    "accent": 9083503,
    "accentCss": "#8a9a6f",
    "parSeconds": 320,
    "badge": {
      "id": "well-of-record",
      "name": "Well of Record",
      "note": "A boring drilled inside its clearance and exclusion zone, cuttings drummed as IDW, a seal hydrated before the grout, and a survey point logged — nothing free-fallen, nothing on the ground"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Boring Log Authority",
      "currency": "FT-BGS",
      "ranks": [
        "Field Assistant",
        "Field Geologist",
        "Field Lead",
        "Senior Field Lead",
        "Boring Log Certified"
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
    "id": "sediment-cap",
    "index": "81",
    "domain": "Maritime",
    "trade": "Cap placement deck lead / marine construction crew",
    "category": "Maritime & Ports",
    "certification": "IUOE Local 3 operating engineers (spreader barge); Inlandboatmen's Union of the Pacific (IBU, ILWU marine division) — barge and tug crew; LIUNA laborers; U.S. Army Corps of Engineers Section 404 permit conditions; San Francisco Bay Dredged Material Management Office (DMMO) cap material testing; Regional Water Quality Control Board CWA Section 401 water quality certification; USCG barge and towing regulations",
    "name": "Sediment Cap",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Sediment Cap VR",
    "tagline": "Capping contaminated bay sediment left in place: design thickness read off the permit, bathymetry checked against the plan, a turbidity curtain anchored, sand placed in thin lifts one grid cell at a time, thickness proven by core rather than by eye, and the placement stopped the moment turbidity or a short core says so",
    "accent": 13214282,
    "accentCss": "#c9a24a",
    "parSeconds": 300,
    "badge": {
      "id": "cap-to-grade",
      "name": "Cap To Grade",
      "note": "A design grid cell capped to its full thickness, cores proving it, without a turbidity reading over limit"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Cap Deck",
      "currency": "LIFT",
      "ranks": [
        "Deckhand",
        "Cap Deck Lead",
        "Placement Boss",
        "Capping Foreman",
        "Cap Deck Certified"
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
    "id": "eelgrass-transplant",
    "index": "82",
    "domain": "Environmental",
    "trade": "Dive supervisor / commercial diving crew",
    "category": "Water & Environmental",
    "certification": "Pile Drivers Local 34 (United Brotherhood of Carpenters) commercial divers; OSHA 29 CFR 1910 Subpart T commercial diving operations; Association of Diving Contractors International (ADCI) consensus standards; U.S. Army Corps of Engineers Clean Water Act (CWA) Section 404 permit conditions; San Francisco Bay Conservation and Development Commission (BCDC) permit; NOAA Fisheries eelgrass mitigation policy for California; USCG diver-down flag carriage requirements",
    "name": "Eelgrass Transplant",
    "weather": "clear",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Eelgrass Transplant VR",
    "tagline": "Diver-assisted eelgrass restoration: the dive plan and the tide window read, the donor bed harvested to its permitted share, shoots bundled inside the holding time, the standby diver ready before anyone splashes, planted to the grid on the surface tender's line, and the divers recalled the moment a vessel or the visibility says so",
    "accent": 4173455,
    "accentCss": "#3fae8f",
    "parSeconds": 300,
    "badge": {
      "id": "bed-established",
      "name": "Bed Established",
      "note": "A donor bed harvested to its permitted share and a new bed planted to the grid, with every diver accounted for the whole time"
    },
    "stepCount": 11,
    "interruptCount": 2,
    "game": {
      "system": "Dive Deck",
      "currency": "SHOOT",
      "ranks": [
        "Tender",
        "Dive Deck Hand",
        "Dive Supervisor",
        "Lead Supervisor",
        "Dive Deck Certified"
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
    "id": "pcb-equipment-removal",
    "index": "87",
    "domain": "Energy",
    "trade": "Electrician and rigger's helper — IBEW Local 6 electrician, LIUNA hazmat laborer, IUOE Local 3 hoist operator",
    "category": "Energy & Power",
    "certification": "IBEW Local 6 electricians and LIUNA hazmat laborers; OSHA 29 CFR 1910.147 lockout/tagout and 1910.269 electrical safety-related work practices; EPA TSCA 40 CFR 761 PCB marking, storage and disposal; OSHA HAZWOPER 40-hour for anyone working the exclusion zone; DOT 49 CFR 172 hazardous-materials shipping papers",
    "name": "PCB Equipment Removal",
    "weather": "clear",
    "indoor": "plant",
    "district": null,
    "title": "SmartCiti.X~ PCB Equipment Removal VR",
    "tagline": "A derelict switch room's PCB transformer, taken down as a regulated shipment: nameplate against the inventory, the circuit proven dead and locked out, the unit lifted onto a lined pallet, sealed, labelled and manifested",
    "accent": 15778841,
    "accentCss": "#f0c419",
    "parSeconds": 310,
    "badge": {
      "id": "pcb-shipment",
      "name": "PCB Shipment",
      "note": "A PCB transformer isolated, rigged and manifested with no shortcut on the lockout, the oil or the paperwork"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "PCB Custody",
      "currency": "MICROGRAM",
      "ranks": [
        "Helper",
        "Rigger's Hand",
        "Lead Rigger",
        "Isolation Authority",
        "PCB Custody Certified"
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
    "id": "transite-pipe-removal",
    "index": "88",
    "domain": "Environmental",
    "trade": "Asbestos abatement laborer and pipefitter — LIUNA asbestos laborer, UA Local 38 pipefitter, IUOE Local 3 excavation operator",
    "category": "Water & Environmental",
    "certification": "LIUNA asbestos and hazmat laborers, Cal/OSHA-registered for asbestos work, with UA Local 38 on the pipe and IUOE Local 3 on the excavation; OSHA 29 CFR 1926.1101 Class II asbestos work; EPA NESHAP 40 CFR 61 Subpart M; the local air district's asbestos notification; OSHA 29 CFR 1926 Subpart P excavations",
    "name": "Transite Pipe Removal",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Transite Pipe Removal VR",
    "tagline": "Asbestos-cement water pipe out of an excavation as Class II work: wetted and kept wet, cut with a snap cutter — never a power saw — double-bagged at the point of removal, and the air sampling pump running the whole time",
    "accent": 14164778,
    "accentCss": "#d8232a",
    "parSeconds": 300,
    "badge": {
      "id": "pipe-out-clean",
      "name": "Pipe Out Clean",
      "note": "A transite run removed wet, hand-cut, bagged at the point of removal and manifested, with the sampling pump running the whole job"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Fibre Control",
      "currency": "FIBRE",
      "ranks": [
        "Ground Hand",
        "Wet-Method Crew",
        "Lead Laborer",
        "Regulated-Area Authority",
        "Fibre Control Certified"
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
    "id": "creosote-pile-removal",
    "index": "85",
    "domain": "Maritime",
    "trade": "Pile removal deck lead / rigger — marine construction crew",
    "category": "Maritime & Ports",
    "certification": "Pile Drivers Local 34 (United Brotherhood of Carpenters) marine construction; IUOE Local 3 operating engineers (crane); Inlandboatmen's Union of the Pacific (IBU, ILWU marine division) — barge and tug crew; U.S. Army Corps of Engineers Section 404 permit conditions; San Francisco Bay Conservation and Development Commission (BCDC) permit; San Francisco Bay Regional Water Quality Control Board CWA Section 401 water quality certification; State Coastal Conservancy creosote pile removal program testing and disposal practice; OSHA 29 CFR 1926 Subpart CC cranes and derricks in construction",
    "name": "Creosote Pile Removal",
    "weather": "overcast",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Creosote Pile Removal VR",
    "tagline": "Pulling a derelict creosote pile clean: the removal plan and work window read, a turbidity curtain anchored, the choker rigged to the pile head, a steady vertical pull with no stub left below the mudline, the pile drained over the barge, cut and binned, and the sediment settled before the curtain comes up",
    "accent": 3812902,
    "accentCss": "#3a2e26",
    "parSeconds": 300,
    "badge": {
      "id": "clean-pull",
      "name": "Clean Pull",
      "note": "A pile pulled whole, or its stub marked and logged, drained over the barge, and no reading over the curtain's limit"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Pile Deck",
      "currency": "FT",
      "ranks": [
        "Deckhand",
        "Pile Deck Lead",
        "Rigging Boss",
        "Removal Foreman",
        "Pile Deck Certified"
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
    "id": "bioswale-build",
    "index": "86",
    "domain": "Environmental",
    "trade": "Laborer / stormwater bioswale construction crew",
    "category": "Water & Environmental",
    "certification": "LIUNA laborers; IUOE Local 3 operating engineers (grading and compaction equipment); San Francisco Bay Regional Water Quality Control Board municipal stormwater (NPDES) permit; San Francisco Stormwater Management Requirements and Design Guidelines; Clean Water Act Section 402 municipal separate storm sewer system (MS4) practice; OSHA 29 CFR 1926 Subpart P excavations for the underdrain trench",
    "name": "Bioswale Build",
    "weather": "overcast",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Bioswale Build VR",
    "tagline": "Building a stormwater bioswale to grade: the design read against the survey stakes, subgrade compaction checked and the underdrain laid to fall, engineered soil placed loose to depth, check dams and the overflow riser set to the design numbers, plants set to the plan, and the first inflow watched to see the swale actually work",
    "accent": 5929530,
    "accentCss": "#5a7a3a",
    "parSeconds": 300,
    "badge": {
      "id": "swale-to-grade",
      "name": "Swale To Grade",
      "note": "A bioswale built to the design grade, with a clean subgrade, an unpacked soil mix, and the first inflow disperses across the dams"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Swale Crew",
      "currency": "IN/HR",
      "ranks": [
        "Laborer",
        "Crew Hand",
        "Grade Lead",
        "Site Steward",
        "Swale Certified"
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
    "id": "shore-power-hookup",
    "index": "89",
    "domain": "Maritime & Ports",
    "trade": "Port electrician — shore power (cold ironing)",
    "category": "Maritime & Ports",
    "certification": "IBEW port electricians; ILWU Local 10 — the longshore side of the hookup; California Air Resources Board At-Berth Regulation; IEC/ISO/IEEE 80005-1 high-voltage shore connection; NFPA 70E; OSHA 1918 marine terminals",
    "name": "Shore Power Hookup",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Shore Power Hookup VR",
    "tagline": "Cold ironing a berthed ship: compatibility and berth rating checked against the plan, the CMS positioned, the reel paid out by crane, ground landed first, interlock and pilot circuit proven, the breaker closed on the port's order, synchronisation confirmed, and the auxiliaries shut down clean",
    "accent": 3051478,
    "accentCss": "#2e8fd6",
    "parSeconds": 260,
    "badge": {
      "id": "cold-iron-clean",
      "name": "Cold Iron Clean",
      "note": "Ground proven first, the breaker closed only on the port's order, synchronisation confirmed with the ship, and both auxiliaries shut down clean — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Shore Power Crew",
      "currency": "VOLT",
      "ranks": [
        "Apprentice Electrician",
        "Journeyman",
        "Port Electrician",
        "Lead Electrician",
        "Shore Power Certified"
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
    "id": "spill-boom-deploy",
    "index": "90",
    "domain": "Maritime & Ports",
    "trade": "Marine environmental responder — boom deployment",
    "category": "Maritime & Ports",
    "certification": "Inlandboatmen's Union of the Pacific (IBU) and ILWU marine division — boat and boom crew; LIUNA hazmat laborers — shore crew; OSHA 29 CFR 1910.120 HAZWOPER; U.S. Coast Guard federal on-scene coordinator; National Contingency Plan, 40 CFR 300; California Office of Spill Prevention and Response (OSPR)",
    "name": "Spill Boom Deploy",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Spill Boom Deploy VR",
    "tagline": "Fuel-dock spill drill: source secured, NRC and OSPR notified, the plan read, boom rigged on deck and worked into a J against the current with the skiff, ends anchored, skimmer staged, sorbent and PPE out for the shore crew, and a decon corridor for anyone leaving the water's edge",
    "accent": 15233578,
    "accentCss": "#e8722a",
    "parSeconds": 280,
    "badge": {
      "id": "boom-holding",
      "name": "Boom Holding",
      "note": "Source secured first, the J held against the current, both ends anchored, and the shore crew worked clean behind PPE and decon — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Spill Response Crew",
      "currency": "BOOM",
      "ranks": [
        "Deckhand",
        "Boom Handler",
        "Response Boat Lead",
        "Spill Response Technician",
        "OSPR Certified"
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
    "id": "ust-removal",
    "index": "93",
    "domain": "Environmental",
    "trade": "Excavation & UST closure crew — LIUNA hazmat laborer directing, IUOE Local 3 operating engineer, UA Local 38 pipefitter",
    "category": "Environmental Monitoring",
    "certification": "EPA UST closure rule (40 CFR 280) and API 1604 closure of underground petroleum storage tanks; the state water board's UST closure requirements for the soil sampling; OSHA HAZWOPER (29 CFR 1910.120); OSHA 29 CFR 1926 Subpart P excavations for the pit and its shoring",
    "name": "UST Removal",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ UST Removal VR",
    "tagline": "Closing out an underground fuel tank: product pumped and the tank proven inert on the LEL, the pit shored, the tank rigged and lifted by the laborer directing rather than the operator's own eye, and the pit sampled and fenced before anyone leaves",
    "accent": 11027498,
    "accentCss": "#a8442a",
    "parSeconds": 300,
    "badge": {
      "id": "tank-out-clean",
      "name": "Tank Out Clean",
      "note": "Product pumped, the tank proven inert at both risers, rigged and lifted with nobody under the load, and the pit sampled under chain of custody and fenced before the crew left"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Closure Authority",
      "currency": "LEL",
      "ranks": [
        "Ground Hand",
        "Excavation Crew",
        "Rigging Lead",
        "Closure Foreman",
        "Closure Authority Certified"
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
    "id": "isco-injection",
    "index": "94",
    "domain": "Water",
    "trade": "In-situ chemical oxidation crew — LIUNA hazmat laborers, UA Local 38 pipefitters, IUOE stationary engineers",
    "category": "Water & Environmental",
    "certification": "OSHA HAZWOPER (29 CFR 1910.120) for everyone on the injection pad; ITRC's in-situ chemical oxidation guidance and the site's Record of Decision setting the design dose and pressure; the well permit governing the injection points; DOT hazmat rules for shipping the oxidant; the Regional Water Board's waste discharge requirements for the rinse water and spent totes",
    "name": "ISCO Injection",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ ISCO Injection VR",
    "tagline": "In-situ chemical oxidation of a groundwater plume: permanganate mixed to design in the batch tank, the manifold pressure-tested before it runs, the injection held at design pressure and flow while the neighbouring wells are watched for daylighting, and the spent totes and rinse handled as hazardous",
    "accent": 8208302,
    "accentCss": "#7d3fae",
    "parSeconds": 300,
    "badge": {
      "id": "oxidant-contained",
      "name": "Oxidant Contained",
      "note": "The oxidant mixed to design, the manifold proven tight before it ran, the injection held in band with nothing daylighting, and the spent totes and rinse handled as hazardous"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Oxidation Authority",
      "currency": "PPM",
      "ranks": [
        "Batch Hand",
        "Injection Crew",
        "Manifold Lead",
        "Plume Authority",
        "Oxidation Authority Certified"
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
    "id": "building-rad-scan",
    "index": "97",
    "domain": "Environmental",
    "trade": "Radiation control technician — building structure-surface survey",
    "category": "Environmental Monitoring",
    "certification": "LIUNA hazmat and environmental laborers assisting the survey; IUOE Local 3 operating engineers on the aerial lift that reaches the upper wall lanes; OSHA HAZWOPER 40-hour (29 CFR 1910.120); NRC 10 CFR 20 occupational dose limits; EPA MARSSIM structure-surface survey methodology; the site's radiological work plan and QAPP chain of custody; California Department of Public Health (CDPH) Radiologic Health Branch oversight",
    "name": "Building Rad Scan",
    "weather": "clear",
    "indoor": "plant",
    "district": null,
    "title": "SmartCiti.X~ Building Rad Scan VR",
    "tagline": "A derelict building's structure-surface survey ahead of demolition: instrument bracketed by a check source, floor and walls scanned to the plan's coverage, drains scanned as collection points, and a swipe bagged under chain of custody",
    "accent": 14172080,
    "accentCss": "#d83fb0",
    "parSeconds": 300,
    "badge": {
      "id": "building-released",
      "name": "Building Released",
      "note": "Instrument bracketed at both ends of the day, the reclassification flagged the moment the drain called for it, and no shortcut on the mark, the photo or the swipe"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Structure Survey Integrity",
      "currency": "DPM",
      "ranks": [
        "Grid Walker",
        "Wall Scanner",
        "Drain Checker",
        "Release Reviewer",
        "Structure Survey Certified"
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
    "id": "haul-road-dust",
    "index": "98",
    "domain": "Environmental",
    "trade": "Haul road dust control crew — Teamsters haul and water-truck drivers, LIUNA laborers, IUOE Local 3",
    "category": "Environmental Monitoring",
    "certification": "Teamsters drivers on the haul trucks and the water truck; LIUNA laborers on the wheel wash and the sweep; IUOE Local 3 on the water truck's pump and spray-bar equipment; the site's Dust Control Plan under the cleanup order; Bay Area AQMD Regulation 6 particulate limits and its construction dust requirements; EPA 40 CFR Part 58 monitor siting and operation; OSHA 1926 traffic-control provisions; DOT load-securement rules for the tarp",
    "name": "Haul Road Dust",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Haul Road Dust VR",
    "tagline": "Dust control on the haul road during a soil haul: monitors read against their action level, the road wetted on the plan's schedule, the load tarped and washed clean before the gate, and the alarm that stops the haul the moment the wind turns",
    "accent": 16764723,
    "accentCss": "#ffcf33",
    "parSeconds": 290,
    "badge": {
      "id": "clean-haul",
      "name": "Clean Haul",
      "note": "Every pass wetted to the plan's frequency, every load tarped and washed before the gate, and the alarm answered the instant the wind turned"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Dust Control",
      "currency": "PASS",
      "ranks": [
        "Ground Hand",
        "Wash Attendant",
        "Pass Lead",
        "Monitor Authority",
        "Dust Control Certified"
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
    "id": "ballast-water-sampling",
    "index": "99",
    "domain": "Maritime & Ports",
    "trade": "Ship's engineer / port state control inspector — ballast water compliance",
    "category": "Maritime & Ports",
    "certification": "Inlandboatmen's Union of the Pacific (IBU) and SIU — ship's side; ILWU marine clerks and AFSCME port state inspectors — the boarding team; IMO International Convention for the Control and Management of Ships' Ballast Water and Sediments (BWM Convention); U.S. Coast Guard ballast water management regulations, 33 CFR Part 151 Subpart D; California State Lands Commission's Marine Invasive Species Program (MISP); OSHA 29 CFR 1915 Subpart B enclosed and confined spaces",
    "name": "Ballast Water Sampling",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Ballast Water Sampling VR",
    "tagline": "Port state inspection of a ship's ballast water: record book and management plan against the voyage, the treatment system's certificate checked, the sampling point isolated and flushed, a representative sample under chain of custody, the indicative analysis run, discharge held on the port's order, the officer's signature, and enclosed-space rules observed at the sounding pipe",
    "accent": 3964584,
    "accentCss": "#3c7ea8",
    "parSeconds": 300,
    "badge": {
      "id": "clean-hold",
      "name": "Clean Hold",
      "note": "A sample drawn to protocol, chain of custody unbroken, and the discharge held until the number came back — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Boarding Team",
      "currency": "TANK",
      "ranks": [
        "Cadet",
        "Third Engineer",
        "Second Engineer",
        "Chief Engineer",
        "Port State Certified"
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
    "id": "spartina-removal",
    "index": "100",
    "domain": "Environmental",
    "trade": "Invasive species control laborer — Spartina crew",
    "category": "Water & Environmental",
    "certification": "LIUNA laborers — control crew; California Department of Pesticide Regulation (DPR) qualified applicator license for imazapyr, an EPA-registered aquatic herbicide; OSHA 29 CFR 1910.1200 Hazard Communication for the concentrate's SDS and label; Invasive Spartina Project treatment protocol and reporting; U.S. Fish and Wildlife Service — Endangered Species Act, Ridgway's rail buffer; San Francisco Bay Regional Water Quality Control Board Clean Water Act (CWA) NPDES aquatic pesticide permit; San Francisco Bay Conservation and Development Commission (BCDC) permit",
    "name": "Spartina Removal",
    "weather": "wind",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Spartina Removal VR",
    "tagline": "Invasive hybrid cordgrass control on a restored marsh: treatment map and tide window read, boundary and rail buffer set out, imazapyr mixed off the marsh to the label rate, sprayer calibrated, applied under the wind limit with the drift card checked, clumps flagged for follow-up, containers triple-rinsed, and the treatment logged",
    "accent": 13214247,
    "accentCss": "#c9a227",
    "parSeconds": 300,
    "badge": {
      "id": "buffer-held",
      "name": "Buffer Held",
      "note": "Every clump on the map treated at the label rate, the rail's buffer never crossed — first time"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Spartina Crew",
      "currency": "CLUMP",
      "ranks": [
        "Laborer",
        "Crew Hand",
        "Lead Applicator",
        "Crew Steward",
        "Spartina Certified"
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
    "id": "nitrous-oxide-monitoring",
    "index": "125",
    "domain": "Dental & Oral Health",
    "trade": "Dental hygienist",
    "category": "Dental & Oral Health",
    "certification": "The Dental Hygiene Board of California's nitrous oxide-oxygen sedation permit for hygienists, held separately from the hygiene licence, and the scope the state dental practice act sets for it; NIOSH's recommended exposure limit for nitrous oxide of 25 ppm during administration and its scavenging-system guidance; the ADA's guidelines for the use of sedation and general anesthesia; OSHA 29 CFR 1910.1030 bloodborne pathogens for patient contact",
    "name": "Nitrous Oxide Monitoring",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Nitrous Oxide Monitoring VR",
    "tagline": "Permit, patient screening, fail-safe and scavenging checks, titration and monitored recovery on a nitrous oxide-oxygen sedation",
    "accent": 9426633,
    "accentCss": "#8fd6c9",
    "parSeconds": 260,
    "badge": {
      "id": "clean-titration",
      "name": "Clean Titration",
      "note": "Permit verified, screening clean, and the whole sedation held inside the permit's ceiling"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Sedation Practice",
      "currency": "N2O",
      "ranks": [
        "Permit Candidate",
        "Permitted Hygienist",
        "Sedation Lead",
        "Board Reviewer",
        "Sedation Certified"
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
    "id": "chairside-emergency",
    "index": "126",
    "domain": "Dental & Oral Health",
    "trade": "Dental hygienist",
    "category": "Dental & Oral Health",
    "certification": "The American Heart Association's Basic Life Support for Healthcare Providers; the ADA's guidance on the recognition and management of medical emergencies in the dental office, including the office emergency kit; the state dental board's practice act for first response before EMS arrival; OSHA 29 CFR 1910.1030 bloodborne pathogens for rescue breaths and any blood or saliva exposure",
    "name": "Chairside Emergency",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Chairside Emergency VR",
    "tagline": "Syncope, escalating to anaphylaxis and a pulseless patient — the office emergency kit, BLS and the AED",
    "accent": 15770459,
    "accentCss": "#f0a35b",
    "parSeconds": 270,
    "badge": {
      "id": "chair-to-code",
      "name": "Chair to Code",
      "note": "The full escalation answered clean — syncope, anaphylaxis and the AED"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Emergency Response",
      "currency": "BLS",
      "ranks": [
        "First on Scene",
        "Kit Trained",
        "Code Lead",
        "Team Captain",
        "Response Certified"
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
    "id": "amalgam-waste-handling",
    "index": "127",
    "domain": "Dental & Oral Health",
    "trade": "Dental hygienist",
    "category": "Dental & Oral Health",
    "certification": "The EPA's amalgam separator rule (40 CFR 441) and its 95 percent removal standard for dental offices that place or remove amalgam; the state's mercury and hazardous dental waste rules; OSHA 29 CFR 1910.1000 air contaminants for mercury vapour and 1910.1200 hazard communication; the ADA's best management practices for amalgam waste",
    "name": "Amalgam Waste Handling",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Amalgam Waste Handling VR",
    "tagline": "Separator certification and canister change, scrap routed to the amalgam waste stream, the recycler's manifest and a mercury spill kit",
    "accent": 13214282,
    "accentCss": "#c9a24a",
    "parSeconds": 255,
    "badge": {
      "id": "closed-loop",
      "name": "Closed Loop",
      "note": "Every gram of scrap into the amalgam stream — nothing to the trash, the sharps or the drain"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Mercury Handling",
      "currency": "HG",
      "ranks": [
        "Waste Handler",
        "Separator Trained",
        "Compliance Lead",
        "Environmental Officer",
        "Mercury Certified"
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
    "id": "banquet-hot-hold",
    "index": "113",
    "domain": "Culinary & Hospitality",
    "trade": "Banquet cook",
    "category": "Culinary & Hospitality",
    "certification": "UNITE HERE Local 2 banquet and culinary staff; the California Retail Food Code (the FDA Food Code as adopted) on hot holding at 135°F or above and Time as a Public Health Control; the ANSI-accredited California Food Handler card and ServSafe Manager certification; NSF/ANSI 4 commercial cooking and hot-holding equipment; OSHA 29 CFR 1910.157 portable fire extinguishers for the open flame at every chafer; Cal/OSHA's general industry safety orders",
    "name": "Banquet Hot Hold",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Banquet Hot Hold VR",
    "tagline": "Banquet hot line: hot boxes probed, chafers lit lid-open, the buffet walked, time tags honoured, and the pull-down done to the rule",
    "accent": 14718766,
    "accentCss": "#e0972e",
    "parSeconds": 260,
    "badge": {
      "id": "service-standard",
      "name": "Service Standard",
      "note": "Every pan probed, every chafer lit correctly, and a clean pull-down"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Service Standard",
      "currency": "COVERS",
      "ranks": [
        "Banquet Runner",
        "Line Cook",
        "Chef de Partie",
        "Banquet Captain",
        "Service Standard Certified"
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
    "id": "cafeteria-serving",
    "index": "114",
    "domain": "Culinary & Hospitality",
    "trade": "School nutrition service worker",
    "category": "Culinary & Hospitality",
    "certification": "AFSCME and SEIU school and hospital food service workers; the USDA National School Lunch Program meal pattern and offer-versus-serve rules under 7 CFR Part 210; the California Retail Food Code (the FDA Food Code as adopted) on hot and cold holding; the ANSI-accredited California Food Handler card and ServSafe Manager certification; NSF/ANSI 7 commercial refrigeration for the milk cooler; Cal/OSHA's general industry safety orders",
    "name": "Cafeteria Serving",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Cafeteria Serving VR",
    "tagline": "The school lunch line: meal pattern, offer versus serve, wells probed and logged, and the count for the reimbursement claim",
    "accent": 5222601,
    "accentCss": "#4fb0c9",
    "parSeconds": 250,
    "badge": {
      "id": "reimbursable-meal",
      "name": "Reimbursable Meal",
      "note": "Every tray to the meal pattern, every well in temperature, the count reconciled"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Reimbursable Meal",
      "currency": "TRAYS",
      "ranks": [
        "Cafeteria Aide",
        "Line Server",
        "Kitchen Lead",
        "Nutrition Manager",
        "Reimbursable Meal Certified"
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
    "id": "grill-line-burns",
    "index": "115",
    "domain": "Culinary & Hospitality",
    "trade": "Line cook — grill / sauté",
    "category": "Culinary & Hospitality",
    "certification": "UNITE HERE Local 2 line cooks; OSHA 29 CFR 1910.151 medical services and first aid; Cal/OSHA's general industry safety orders; NFPA 96 ventilation control and fire protection of commercial cooking operations, especially the grease baffle filters a flambé never gets lit near; NSF/ANSI 4 commercial cooking equipment; the American Burn Association's first-aid guidance for thermal burns",
    "name": "Grill Line Burns",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Grill Line Burns VR",
    "tagline": "The grill and sauté line: handles in, a dry pan, calls through the aisle, a flambé clear of the filters, and the burn drill run cold",
    "accent": 15225903,
    "accentCss": "#e8542f",
    "parSeconds": 245,
    "badge": {
      "id": "cool-under-fire",
      "name": "Cool Under Fire",
      "note": "A clean line walk and a burn drill run to the full twenty minutes"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Cool Under Fire",
      "currency": "SEARS",
      "ranks": [
        "Line Trainee",
        "Line Cook",
        "Sauté Station",
        "Line Lead",
        "Cool Under Fire Certified"
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
    "id": "oyster-reef-monitoring",
    "index": "91",
    "domain": "Environmental",
    "trade": "Environmental monitoring technician / restoration monitoring crew",
    "category": "Water & Environmental",
    "certification": "Environmental monitoring technicians; LIUNA laborers (reef construction and habitat crews); California State Coastal Conservancy Living Shorelines Program grant monitoring conditions; San Francisco Bay Regional Water Quality Control Board permit monitoring conditions; NOAA Fisheries; San Francisco Bay Conservation and Development Commission (BCDC) permit; seasonal in-water work window for fish protection",
    "name": "Oyster Reef Monitoring",
    "weather": "fog",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Oyster Reef Monitoring VR",
    "tagline": "Quarterly reef monitoring on a falling tide: fixed quadrats found by tag and GPS, density counted and logged before the frame moves, tiles turned back to their mark, the sonde read against the permit's own flag level, the drill counted, and the sheet reconciled with the photos before the flood",
    "accent": 13880504,
    "accentCss": "#d3ccb8",
    "parSeconds": 300,
    "badge": {
      "id": "reef-reconciled",
      "name": "Reef Reconciled",
      "note": "Every fixed quadrat, tile and pin read to the plan and the sheet squared with the photos before the flood — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Monitoring Crew",
      "currency": "SPAT",
      "ranks": [
        "Field Tech",
        "Reef Tech",
        "Lead Tech",
        "Monitoring Steward",
        "Reef Certified"
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
    "id": "marsh-transect-survey",
    "index": "92",
    "domain": "Environmental",
    "trade": "Environmental monitoring technician / vegetation survey crew",
    "category": "Environmental Monitoring",
    "certification": "Environmental monitoring technicians (AFSCME in public agencies); LIUNA laborers on the Invasive Spartina Project control crew; U.S. Fish and Wildlife Service Endangered Species Act consultation — Ridgway's rail and salt marsh harvest mouse; Invasive Spartina Project treatment protocols; San Francisco Bay Conservation and Development Commission (BCDC) permit; San Francisco Bay Regional Water Quality Control Board monitoring conditions",
    "name": "Marsh Transect Survey",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Marsh Transect Survey VR",
    "tagline": "Vegetation survey on a fixed transect: bearing set from the start stake, tape run taut to the end stake, percent cover read to protocol class at every quadrat, elevation shot against the benchmark, the invasive hybrid Spartina flagged for the control crew, and the channel edge's erosion pins read before the tide takes the low transect",
    "accent": 7637564,
    "accentCss": "#748a3c",
    "parSeconds": 295,
    "badge": {
      "id": "transect-closed",
      "name": "Transect Closed",
      "note": "Every quadrat covered, elevation shot, and the channel edge read before a flushed bird or the tide stopped the line — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Survey Crew",
      "currency": "COVER",
      "ranks": [
        "Field Tech",
        "Transect Tech",
        "Lead Tech",
        "Survey Steward",
        "Transect Certified"
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
    "id": "opacity-reading",
    "index": "95",
    "domain": "Environmental",
    "trade": "Visible emissions observer / certified Method 9 reader",
    "category": "Environmental Monitoring",
    "certification": "AFSCME air-district inspector — certified under EPA Method 9 (40 CFR 60 Appendix A), recertified every six months by reading a smoke generator against a panel of known opacities; Bay Area Air Quality Management District Regulation 6 (particulate matter) as enforced against the plant's Title V permit; IUOE stationary engineers and USW plant crews who run the boiler this observation is taken on; OSHA 29 CFR 1910 Subpart D fall protection where the observation point is elevated",
    "name": "Opacity Reading",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Opacity Reading VR",
    "tagline": "EPA Method 9 by the book: certification checked, the sun kept at your back, the plume's densest point read for six minutes, and the average carried against the permit",
    "accent": 10471136,
    "accentCss": "#9fc6e0",
    "parSeconds": 260,
    "badge": {
      "id": "smoke-school-certified",
      "name": "Smoke School Certified",
      "note": "A Method 9 observation taken from the right ground, read past the steam, and averaged honestly against the permit"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Visible Emissions Authority",
      "currency": "OPACITY",
      "ranks": [
        "Trainee Observer",
        "Field Observer",
        "Certified Reader",
        "Lead Observer",
        "Visible Emissions Authority"
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
    "id": "mobile-air-lab",
    "index": "96",
    "domain": "Environmental",
    "trade": "Community air-monitoring van technician",
    "category": "Environmental Monitoring",
    "certification": "AFSCME air-district technicians and LIUNA environmental laborers under OSHA HAZWOPER 40-hour (29 CFR 1910.120); Bay Area Air Quality Management District community monitoring practice; EPA 40 CFR Part 58 ambient air quality monitoring and Appendix A quality assurance; the site's Air Monitoring Plan under the cleanup order; California AB 617 community air monitoring",
    "name": "Mobile Air Lab",
    "weather": "smoke",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Mobile Air Lab VR",
    "tagline": "A monitoring van sited by the wind, its instruments proven at zero and span, a reference sample running for the community's own check, and the first hour read against the action level",
    "accent": 3135428,
    "accentCss": "#2fd7c4",
    "parSeconds": 265,
    "badge": {
      "id": "van-proven",
      "name": "Van Proven",
      "note": "A deployment sited on the wind rather than on convenience, with instruments proven and a reference sample running before the first hour is trusted"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Mobile Air Authority",
      "currency": "MICROGRAM",
      "ranks": [
        "Van Trainee",
        "Field Technician",
        "Deployment Lead",
        "QA Technician",
        "Mobile Air Authority"
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
    "id": "operatory-turnover",
    "index": "116",
    "domain": "Dental Hygiene",
    "trade": "Dental hygienist",
    "category": "Dental & Oral Health",
    "certification": "ADHA (American Dental Hygienists' Association) infection-control guidance; the CDC's Guidelines for Infection Control in Dental Health-Care Settings (2003) and its 2016 Summary; OSHA 29 CFR 1910.1030 bloodborne pathogens and 1910.1200 hazard communication; the Dental Hygiene Board of California and the state dental practice act",
    "name": "Operatory Turnover",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Operatory Turnover VR",
    "tagline": "Dirty-to-clean turnover: sharps and instruments contained at point of use, surfaces held to full contact time, barriers changed, lines flushed, the next setup laid out sterile",
    "accent": 6212034,
    "accentCss": "#5ec9c2",
    "parSeconds": 210,
    "badge": {
      "id": "turnover-clean",
      "name": "Turnover Clean",
      "note": "A full dirty-to-clean turnover with every contact time honoured and nothing left for the next patient to find"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Chairside Standard",
      "currency": "SEAL",
      "ranks": [
        "Junior Assistant",
        "Chairside Hygienist",
        "Lead Hygienist",
        "Infection Control Lead",
        "Chairside Standard Certified"
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
    "id": "instrument-reprocessing",
    "index": "117",
    "domain": "Dental Hygiene",
    "trade": "Dental hygienist",
    "category": "Dental & Oral Health",
    "certification": "The CDC's Guidelines for Infection Control in Dental Health-Care Settings (2003) and its 2016 Summary; ANSI/AAMI ST79 for steam sterilization in health care facilities; the FDA's reprocessing requirements for reusable medical devices; OSHA 29 CFR 1910.1030 bloodborne pathogens; the Dental Hygiene Board of California practice act",
    "name": "Instrument Reprocessing",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Instrument Reprocessing VR",
    "tagline": "Sterilization centre: mechanical cleaning, inspection, chemical-indicator packaging, an autoclave cycle read from its own printout, and the weekly spore test that proves it worked",
    "accent": 7326112,
    "accentCss": "#6fc9a0",
    "parSeconds": 260,
    "badge": {
      "id": "cycle-verified",
      "name": "Cycle Verified",
      "note": "A load cleaned, packaged, run and biologically verified end to end with no shortcut"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Sterile Processing",
      "currency": "CYCLE",
      "ranks": [
        "New Processor",
        "Sterile Tech",
        "Lead Processor",
        "Sterilization Supervisor",
        "Sterile Processing Certified"
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
    "id": "sharps-exposure-response",
    "index": "118",
    "domain": "Dental Hygiene",
    "trade": "Dental hygienist",
    "category": "Dental & Oral Health",
    "certification": "OSHA 29 CFR 1910.1030 bloodborne pathogens — the exposure control plan, engineering controls and the post-exposure evaluation; ISO 23908 for sharps injury protection devices; OSHA's sharps injury log recordkeeping requirement; the CDC's post-exposure prophylaxis guidance; the Dental Hygiene Board of California practice act",
    "name": "Sharps Exposure Response",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Sharps Exposure Response VR",
    "tagline": "A needlestick mid-scaling: stopped safely, washed not squeezed, reported at once, the source pursued with consent, evaluation inside the hours that matter, and the stick logged and reviewed",
    "accent": 15901243,
    "accentCss": "#f2a23b",
    "parSeconds": 230,
    "badge": {
      "id": "exposure-managed",
      "name": "Exposure Managed",
      "note": "A needlestick handled start to finish inside the hours that make post-exposure prophylaxis meaningful"
    },
    "stepCount": 11,
    "interruptCount": 2,
    "game": {
      "system": "Exposure Response",
      "currency": "HOUR",
      "ranks": [
        "New Hygienist",
        "Chairside Responder",
        "Exposure Lead",
        "Safety Officer",
        "Exposure Response Certified"
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
    "id": "dish-pit",
    "index": "110",
    "domain": "Culinary & Hospitality",
    "trade": "UNITE HERE Local 2 dishwasher / kitchen steward",
    "category": "Culinary & Hospitality",
    "certification": "The FDA Food Code as adopted in the California Retail Food Code; OSHA 29 CFR 1910.1200 hazard communication and the safety data sheet for every chemical on the line; ANSI/ISEA Z358.1 emergency eyewash and shower equipment; Cal/OSHA general industry safety orders; UNITE HERE Local 2, with AFSCME and SEIU food-service members held to the same warewashing standard in school and hospital kitchens",
    "name": "Dish Pit",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Dish Pit VR",
    "tagline": "The dish machine and the three-compartment sink: concentrate lines checked, sanitiser strip-tested and logged, the machine's final rinse read against the gauge, wash-rinse-sanitise held for its contact time, the eyewash proven clear, and a splash to the eye drilled",
    "accent": 5230988,
    "accentCss": "#4fd18c",
    "parSeconds": 260,
    "badge": {
      "id": "clear-rinse",
      "name": "Clear Rinse",
      "note": "Lines checked, strip tested and logged, gauge read, contact time held, eyewash proven clear — no shortcuts"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Warewashing",
      "currency": "PPM",
      "ranks": [
        "Pot Runner",
        "Steward",
        "Lead Steward",
        "Kitchen Safety Rep",
        "Warewashing Certified"
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
    "id": "grease-trap",
    "index": "111",
    "domain": "Culinary & Hospitality",
    "trade": "UNITE HERE Local 2 kitchen steward / facilities laborer",
    "category": "Culinary & Hospitality",
    "certification": "SFPUC fats-oils-and-grease (FOG) programme and grease interceptor maintenance requirements; OSHA 29 CFR 1910.146 permit-required confined spaces, for telling the under-sink unit and the outdoor in-ground interceptor apart; Cal/OSHA general industry safety orders; OSHA 29 CFR 1910.1200 hazard communication for the SDS on the degreaser; UNITE HERE Local 2, with AFSCME and SEIU members maintaining the same equipment in public kitchens",
    "name": "Grease Trap",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Grease Trap VR",
    "tagline": "Servicing the under-sink grease interceptor: confined-space question answered, lid lifted with the tool, grease and solids measured against the 25 percent rule, contents pumped to a sealed container, baffles checked, unit rinsed and resealed, manifest and log filed",
    "accent": 14197311,
    "accentCss": "#d8a23f",
    "parSeconds": 270,
    "badge": {
      "id": "sealed-and-logged",
      "name": "Sealed and Logged",
      "note": "A service with the confined-space call made correctly, nothing to the drain, and the manifest and log both filed"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "FOG Programme",
      "currency": "GAL",
      "ranks": [
        "Porter",
        "Trap Tech",
        "Lead Steward",
        "Facilities Rep",
        "FOG Certified"
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
    "id": "allergen-control",
    "index": "112",
    "domain": "Culinary & Hospitality",
    "trade": "UNITE HERE Local 2 line cook",
    "category": "Culinary & Hospitality",
    "certification": "FDA major food allergen labelling under FALCPA, with sesame added as the ninth allergen by the FASTER Act; the FDA Food Code as adopted in the California Retail Food Code; ServSafe Allergens training; Cal/OSHA general industry safety orders for the hot line itself; UNITE HERE Local 2, with AFSCME and SEIU food-service members running the same allergen protocol in school and hospital kitchens",
    "name": "Allergen Control",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Allergen Control VR",
    "tagline": "An allergen order on the line: the ticket's flag called back, the purple board and dedicated tools pulled, hands washed and gloves changed, the mise checked against the recipe's allergen list, the dish built in the dedicated pan away from the shared fryer, and the plate marked and walked personally to the pass",
    "accent": 9068504,
    "accentCss": "#8a5fd8",
    "parSeconds": 260,
    "badge": {
      "id": "flagged-and-walked",
      "name": "Flagged and Walked",
      "note": "An allergen order called back, built on dedicated tools with no shared contact, and walked to the pass by the cook who made it"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Line Discipline",
      "currency": "PICK",
      "ranks": [
        "Prep Cook",
        "Line Cook",
        "Lead Line",
        "Sous Chef",
        "Allergen Certified"
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
    "id": "walk-in-cooler",
    "index": "107",
    "domain": "Culinary & Hospitality",
    "trade": "Line cook / kitchen worker — cold storage",
    "category": "Culinary & Hospitality",
    "certification": "California Retail Food Code / FDA Food Code §3-501.16 cold holding at 41 °F or below, §3-302.11 raw-to-ready storage order and §3-501.17 date marking; California Food Handler card and ServSafe Food Protection Manager; the means-of-egress principle behind OSHA 29 CFR 1910.36 — nobody works in a room they cannot get out of, which is why a walk-in has an inside release; NSF/ANSI 7 commercial refrigeration equipment; Cal/OSHA Title 8 General Industry Safety Orders on manual lifting; UNITE HERE Local 2",
    "name": "Walk-In Cooler",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Walk-In Cooler VR",
    "tagline": "Opening check and a stocking run: inside release and light proven before the door closes, 41 °F confirmed, gasket and floor checked, raw-below-ready stocking, FIFO dates, a case lifted right, and the compressor alarm read",
    "accent": 7329481,
    "accentCss": "#6fd6c9",
    "parSeconds": 260,
    "badge": {
      "id": "cold-and-clear",
      "name": "Cold and Clear",
      "note": "A stocking run with the release proven, 41 °F confirmed, nothing raw over ready and every case dated — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Cold Storage",
      "currency": "CHILL",
      "ranks": [
        "Prep Cook",
        "Line Cook",
        "Lead Cook",
        "Kitchen Supervisor",
        "Cold Storage Certified"
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
    "id": "receiving-dock-food",
    "index": "108",
    "domain": "Culinary & Hospitality",
    "trade": "Receiving clerk / kitchen worker — food deliveries",
    "category": "Culinary & Hospitality",
    "certification": "California Retail Food Code / FDA Food Code §3-202.11 receiving temperatures and §3-202.15 package integrity; California Food Handler card and ServSafe Food Protection Manager; HACCP, which treats receiving as its own critical control point; OSHA 29 CFR 1910.22 walking-working surfaces for the dock apron; NSF/ANSI 2 food equipment; UNITE HERE Local 2 and the Teamsters drivers on the other side of the dock plate",
    "name": "Receiving Dock Food",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Receiving Dock Food VR",
    "tagline": "A delivery at the kitchen dock: invoice against the order, the truck's reefer read before the door opens, every cold and frozen item probed and refused outside the limit, packaging and dates checked, refusals logged, goods moved to cold storage in the window, and the log signed",
    "accent": 15905083,
    "accentCss": "#f2b13b",
    "parSeconds": 265,
    "badge": {
      "id": "clean-receipt",
      "name": "Clean Receipt",
      "note": "A delivery received with every temperature checked, nothing refused going to storage and the log signed clean — first time"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Receiving Line",
      "currency": "DOCK",
      "ranks": [
        "Porter",
        "Receiving Clerk",
        "Lead Receiver",
        "Kitchen Supervisor",
        "Receiving Certified"
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
    "id": "prep-cooling",
    "index": "109",
    "domain": "Culinary & Hospitality",
    "trade": "Line cook — hot food cooling",
    "category": "Culinary & Hospitality",
    "certification": "California Retail Food Code / FDA Food Code §3-501.14 cooling — 135 °F to 70 °F within 2 hours, and a total of 6 hours to 41 °F or below; §3-501.15 cooling methods (shallow pans, ice paddles, rapid-chill equipment); §3-501.17 date marking; HACCP, which treats cooling as its own critical control point; California Food Handler card and ServSafe Food Protection Manager; NSF/ANSI 7 rapid-chill equipment; OSHA 29 CFR 1910.132 PPE for handling product at both ends of this task's temperature range; UNITE HERE Local 2",
    "name": "Prep Cooling",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Prep Cooling VR",
    "tagline": "Cooling stock and a hotel pan of rice inside the Food Code's clock: shallow pans, an ice paddle, the blast chiller, temperatures logged at two and six hours, a pan covered only once cold, dated with its own discard date, and the reheat-or-discard call when the two-hour mark is missed",
    "accent": 8370408,
    "accentCss": "#7fb8e8",
    "parSeconds": 270,
    "badge": {
      "id": "cooled-clean",
      "name": "Cooled Clean",
      "note": "A batch cooled inside both Food Code windows, dated with its own discard date and logged — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Cooling Line",
      "currency": "CHILL",
      "ranks": [
        "Prep Cook",
        "Line Cook",
        "Lead Cook",
        "Kitchen Supervisor",
        "Cooling Certified"
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
    "id": "knife-skills",
    "index": "101",
    "domain": "Food service",
    "trade": "Prep cook",
    "category": "Culinary & Hospitality",
    "certification": "UNITE HERE Local 2 — hospitality and food service; the FDA Food Code as adopted in the California Retail Food Code; California Food Handler card and ServSafe Food Protection Manager; Cal/OSHA General Industry Safety Orders; OSHA 29 CFR 1910.138 hand protection; ANSI/ISEA 105 cut-resistance ratings; NSF/ANSI 2 food-contact equipment for the boards and prep surfaces",
    "name": "Knife Skills",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Knife Skills VR",
    "tagline": "Board anchored, edge honed, claw grip, the cut-resistant glove on the mandoline, and a clean sanitised close",
    "accent": 15249454,
    "accentCss": "#e8b02e",
    "parSeconds": 230,
    "badge": {
      "id": "clean-board",
      "name": "Clean Board",
      "note": "A full prep run with the edge honed, the glove on for the mandoline, and nothing left in the sink"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Board Authority",
      "currency": "DICE",
      "ranks": [
        "Dish Hand",
        "Prep Cook",
        "Line Cook",
        "Lead Prep",
        "Board Authority Certified"
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
    "id": "slicer-lockout",
    "index": "102",
    "domain": "Food service",
    "trade": "Deli / prep cook",
    "category": "Culinary & Hospitality",
    "certification": "UNITE HERE Local 2 — hospitality and food service; Cal/OSHA General Industry Safety Orders; OSHA 29 CFR 1910.147 control of hazardous energy; OSHA 29 CFR 1910.138 hand protection; ANSI/ISEA 105 cut-resistance ratings; NSF/ANSI 8 commercial food slicer sanitation",
    "name": "Slicer Lockout",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Slicer Lockout VR",
    "tagline": "Cord locked before the guard comes off, the blade cleaned gloved and edge-away, sanitiser contact time, and the interlock proven before the plug goes back in",
    "accent": 14242378,
    "accentCss": "#d9524a",
    "parSeconds": 235,
    "badge": {
      "id": "blade-secured",
      "name": "Blade Secured",
      "note": "A full changeover clean with the cord locked out first and the interlock proven before power came back"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Lockout Authority",
      "currency": "AMP",
      "ranks": [
        "Dish Hand",
        "Deli Cook",
        "Line Lead",
        "Kitchen Supervisor",
        "Lockout Authority Certified"
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
    "id": "bakery-mixer",
    "index": "103",
    "domain": "Food service",
    "trade": "Baker",
    "category": "Culinary & Hospitality",
    "certification": "UNITE HERE Local 2 — hospitality and food service; AFSCME and SEIU school and hospital food service; Cal/OSHA General Industry Safety Orders; OSHA 29 CFR 1910.212 machine guarding; OSHA 29 CFR 1910.147 control of hazardous energy; NSF/ANSI 8 commercial mixer sanitation",
    "name": "Bakery Mixer",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Bakery Mixer VR",
    "tagline": "Bowl guard proven, the lift locked, the attachment pinned, ingredients through the chute, and the mixer stopped before anything comes near the bowl",
    "accent": 13209946,
    "accentCss": "#c9915a",
    "parSeconds": 240,
    "badge": {
      "id": "guard-proven",
      "name": "Guard Proven",
      "note": "A full batch with the guard interlock proven, the lift locked, and every scrape done on a stopped machine"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Mixer Authority",
      "currency": "BATCH",
      "ranks": [
        "Dish Hand",
        "Baker's Helper",
        "Mixer Operator",
        "Lead Baker",
        "Mixer Authority Certified"
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
    "id": "fryer-oil-change",
    "index": "104",
    "domain": "Culinary",
    "trade": "Line cook — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "UNITE HERE Local 2 kitchen safety training; the California Retail Food Code (used-oil handling and equipment cleaning as adopted from the FDA Food Code); Cal/OSHA General Industry Safety Orders on personal protective equipment and slip hazards, and OSHA 29 CFR 1910.132/1910.22; NSF/ANSI 4 commercial cooking equipment; the fryer manufacturer's cool-down and boil-out procedure",
    "name": "Fryer Oil Change",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Fryer Oil Change VR",
    "tagline": "Cold vat, caddy not a bucket, boil-out, the dry route to the rendering bin, and a covered element before the heat goes back on",
    "accent": 15904276,
    "accentCss": "#f2ae14",
    "parSeconds": 260,
    "badge": {
      "id": "line-certified",
      "name": "Line Certified",
      "note": "A full oil change with the vat cold, the caddy used, the route dry and the element covered before power"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Line Certified",
      "currency": "FRY",
      "ranks": [
        "Prep Cook",
        "Line Cook",
        "Station Lead",
        "Sous Chef",
        "Line Certified"
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
    "id": "hood-suppression",
    "index": "105",
    "domain": "Culinary",
    "trade": "Line cook / kitchen fire warden — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "UNITE HERE Local 2 kitchen fire-warden training; NFPA 96 ventilation control and fire protection of commercial cooking operations; NFPA 17A wet chemical extinguishing systems; the California Fire Code; OSHA 29 CFR 1910.157 portable extinguishers; the local fire department's semi-annual suppression-system inspection",
    "name": "Hood Suppression",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Hood Suppression VR",
    "tagline": "The cook's-side hood inspection and the fire response: filters, fusible links, the pull station's clear path, and the drill itself",
    "accent": 14170666,
    "accentCss": "#d83a2a",
    "parSeconds": 270,
    "badge": {
      "id": "canopy-certified",
      "name": "Canopy Certified",
      "note": "A full inspection and a clean drill — pull, gas closed, fan running, everyone out"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Canopy Certified",
      "currency": "HOOD",
      "ranks": [
        "Porter",
        "Line Cook",
        "Fire Warden",
        "Kitchen Lead",
        "Canopy Certified"
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
    "id": "kitchen-gas-shutoff",
    "index": "106",
    "domain": "Culinary",
    "trade": "Kitchen shift lead — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "UNITE HERE Local 2 kitchen safety training; NFPA 54 / ANSI Z223.1 the National Fuel Gas Code; the California Fire Code; Cal/OSHA General Industry Safety Orders on emergency action and hazardous atmospheres; the gas utility's own reported-odor procedure",
    "name": "Kitchen Gas Shutoff",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Kitchen Gas Shutoff VR",
    "tagline": "A gas smell on the line: no spark used to search, every appliance and the emergency valve closed, the room swept at floor level, and a pilot-by-pilot relight",
    "accent": 14839868,
    "accentCss": "#e2703c",
    "parSeconds": 275,
    "badge": {
      "id": "line-secured",
      "name": "Line Secured",
      "note": "A clean shutdown, a real floor-level sweep, and a relight with nothing skipped"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Line Secured",
      "currency": "GAS",
      "ranks": [
        "Prep Cook",
        "Line Cook",
        "Shift Lead",
        "Kitchen Manager",
        "Line Secured"
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
    "id": "ultrasonic-scaling",
    "index": "122",
    "domain": "Healthcare",
    "trade": "Dental hygienist",
    "category": "Dental & Oral Health",
    "certification": "SEIU and UFCW dental and clinic staff, and the ADHA as the hygiene profession's own body; the Dental Hygiene Board of California and the state dental practice act on scope of practice and local anesthesia; the CDC's Guidelines for Infection Control in Dental Health-Care Settings, including its dental unit waterline standard of no more than 500 CFU/mL of heterotrophic bacteria; OSHA 29 CFR 1910.1030 bloodborne pathogens; NIOSH's guidance on dental ergonomics and neutral posture at the operatory",
    "name": "Ultrasonic Scaling",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Ultrasonic Scaling VR",
    "tagline": "A scaling and root planing appointment: the waterline verified and flushed, PPE and loupes on, the insert matched to the deposit, the evacuator held on the aerosol, the tip adapted and kept moving, and the operator's own wrist and shoulders held neutral through the whole appointment",
    "accent": 4176076,
    "accentCss": "#3fb8cc",
    "parSeconds": 265,
    "badge": {
      "id": "srp-clean-run",
      "name": "Clean Debridement",
      "note": "A full scaling and root planing appointment with the waterline verified, the insert adapted correctly and posture held neutral throughout"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Operatory Standard",
      "currency": "CALC",
      "ranks": [
        "Chairside Aide",
        "Registered Hygienist",
        "Perio Specialist",
        "Clinical Lead",
        "Operatory Certified"
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
    "id": "aerosol-management",
    "index": "123",
    "domain": "Healthcare",
    "trade": "Dental hygienist",
    "category": "Dental & Oral Health",
    "certification": "SEIU and UFCW dental and clinic staff, and the ADHA as the hygiene profession's own body; the CDC's Guidelines for Infection Control in Dental Health-Care Settings on pre-procedural rinses, dental dams and instrument selection for aerosol-generating procedures; OSHA 29 CFR 1910.134 respiratory protection and its user seal check requirement; the Dental Hygiene Board of California and the state dental practice act",
    "name": "Aerosol Management",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Aerosol Management VR",
    "tagline": "Turning an operatory over for an aerosol-generating procedure: the room's own air changes and a portable HEPA unit sized to them, HVE and pre-procedural rinse, an N95 seal-checked every time it goes on, the dam where it fits, and the room left to settle its own fallow time before the next patient sits down",
    "accent": 6277536,
    "accentCss": "#5fc9a0",
    "parSeconds": 270,
    "badge": {
      "id": "operatory-cleared",
      "name": "Operatory Cleared",
      "note": "A full aerosol-generating appointment set up, worked and turned over on the room's own fallow time"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Air Control",
      "currency": "CADR",
      "ranks": [
        "Room Setup Tech",
        "Registered Hygienist",
        "Infection Control Lead",
        "Clinical Lead",
        "Air Control Certified"
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
    "id": "fluoride-and-sealants",
    "index": "124",
    "domain": "Healthcare",
    "trade": "Dental hygienist",
    "category": "Dental & Oral Health",
    "certification": "SEIU and UFCW dental and clinic staff, AFSCME public-health hygienists, and the ADHA as the hygiene profession's own body; the ADA's evidence-based clinical guidelines on fluoride varnish and on pit-and-fissure sealants; the Dental Hygiene Board of California and the state dental practice act's scope rules on who may place a sealant and under what standing order; OSHA 29 CFR 1910.1030 bloodborne pathogens",
    "name": "Fluoride and Sealants",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Fluoride and Sealants VR",
    "tagline": "Preventive care on a child: a caries risk assessment, varnish dosed to the age and painted after isolation, then sealants cleaned, etched to the label's time, rinsed to the frosted look, placed and cured behind eye protection, checked for a high spot and recorded for the recall",
    "accent": 15897950,
    "accentCss": "#f2955e",
    "parSeconds": 280,
    "badge": {
      "id": "prevention-recorded",
      "name": "Prevention Recorded",
      "note": "A varnish and sealant visit completed with the dose right for the age and every sealant retained at recall"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Prevention Rounds",
      "currency": "SEAL",
      "ranks": [
        "Outreach Aide",
        "Registered Hygienist",
        "Public Health Lead",
        "Clinical Lead",
        "Prevention Certified"
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
    "id": "patient-intake-screening",
    "index": "119",
    "domain": "Dental",
    "trade": "Dental hygienist",
    "category": "Dental & Oral Health",
    "certification": "SEIU and UFCW dental and clinic support staff; the ADHA's standards for clinical dental hygiene practice; the CDC's Guidelines for Infection Control in Dental Health-Care Settings; OSHA 29 CFR 1910.1030 bloodborne pathogens; the Dental Hygiene Board of California and the state's dental practice act; the ADA's Health History form",
    "name": "Patient Intake Screening",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Patient Intake Screening VR",
    "tagline": "History reviewed and flagged, vitals read against the deferral threshold, a systematic exam, findings charted, and today's consent explained and signed",
    "accent": 6273248,
    "accentCss": "#5fb8e0",
    "parSeconds": 260,
    "badge": {
      "id": "cleared-to-treat",
      "name": "Cleared to Treat",
      "note": "History read and flagged, vitals in range, a complete exam charted, and consent signed before anything else began"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Chairside Readiness",
      "currency": "INTAKE",
      "ranks": [
        "Intake Trainee",
        "Screening Assistant",
        "Registered Hygienist",
        "Lead Hygienist",
        "Chairside Certified"
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
    "id": "radiograph-safety",
    "index": "120",
    "domain": "Dental",
    "trade": "Dental hygienist — radiographer",
    "category": "Dental & Oral Health",
    "certification": "SEIU and UFCW dental and clinic staff; the ADHA's standards for clinical dental hygiene practice; the ADA/FDA's Dental Radiographic Examinations recommendations (selection criteria); the ALARA principle and California's Title 17 radiation control regulations; the Dental Hygiene Board of California's radiography permit; OSHA 29 CFR 1910.1030 and the CDC's Guidelines for Infection Control in Dental Health-Care Settings for the sensor barrier",
    "name": "Radiograph Safety",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Radiograph Safety VR",
    "tagline": "A bitewing series under ALARA: selection criteria, shielding, positioning, the operator behind the barrier, exposure only with the room clear, and every image logged",
    "accent": 15905610,
    "accentCss": "#f2b34a",
    "parSeconds": 280,
    "badge": {
      "id": "alara-certified",
      "name": "ALARA Certified",
      "note": "A full bitewing series taken with the selection criteria checked, the patient shielded, every exposure made from behind the barrier, and the log complete"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Beam Discipline",
      "currency": "mAs",
      "ranks": [
        "Radiography Trainee",
        "Registered Operator",
        "Series Lead",
        "Radiation Safety Officer",
        "Beam Discipline Certified"
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
    "id": "periodontal-charting",
    "index": "121",
    "domain": "Dental",
    "trade": "Dental hygienist",
    "category": "Dental & Oral Health",
    "certification": "SEIU and UFCW dental and clinic staff; the ADHA's standards for clinical dental hygiene practice; the American Academy of Periodontology's 2017 classification of periodontal diseases (staging and grading); the Dental Hygiene Board of California and the state's dental practice act; OSHA 29 CFR 1910.1030 bloodborne pathogens for every bleeding site this chart records",
    "name": "Periodontal Charting",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Periodontal Charting VR",
    "tagline": "Six sites a tooth probed and walked, depths charted, bleeding and suppuration recorded, recession and attachment loss calculated, and the case staged and graded to the 2017 classification",
    "accent": 7326112,
    "accentCss": "#6fc9a0",
    "parSeconds": 300,
    "badge": {
      "id": "chart-complete",
      "name": "Chart Complete",
      "note": "A full six-site chart, correctly graded and staged, with every change from the last visit caught"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Attachment Watch",
      "currency": "SITE",
      "ranks": [
        "Charting Trainee",
        "Registered Prober",
        "Full-Mouth Charter",
        "Periodontal Lead",
        "Attachment Watch Certified"
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
    "id": "mobile-dental-outreach",
    "index": "128",
    "domain": "Public health",
    "trade": "Registered dental hygienist in alternative practice (RDHAP)",
    "category": "Dental & Oral Health",
    "certification": "The Dental Hygiene Board of California's registered dental hygienist in alternative practice (RDHAP) rules for practice in community and portable settings; the CDC's Guidelines for Infection Control in Dental Health-Care Settings and its guidance for portable and mobile dental units; OSHA 29 CFR 1910.1030 bloodborne pathogens; HIPAA for records handled in the field; SEIU and UFCW dental and clinic staff, and AFSCME public-health hygienists, as the workforce's unions; the ADHA as the profession's body",
    "name": "Mobile Dental Outreach",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Mobile Dental Outreach VR",
    "tagline": "A school screening and sealant day run off the van: site, water and sterile stock proven before the first child sits down",
    "accent": 6280385,
    "accentCss": "#5fd4c1",
    "parSeconds": 300,
    "badge": {
      "id": "outreach-clean-day",
      "name": "Clean Day",
      "note": "A full outreach day run with nothing reprocessed in the field and every child's paperwork matched before the chair"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Outreach Command",
      "currency": "SMILE",
      "ranks": [
        "Van Assistant",
        "Outreach Hygienist",
        "Site Lead",
        "Programme Coordinator",
        "RDHAP Certified"
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
    "id": "pediatric-visit",
    "index": "129",
    "domain": "Pediatric dentistry",
    "trade": "Registered dental hygienist — pediatric practice",
    "category": "Dental & Oral Health",
    "certification": "The AAPD's Guideline on Behavior Guidance for the Pediatric Dental Patient (tell-show-do and the Frankl behavior rating scale); the state dental hygiene board's scope of practice for a registered dental hygienist; the ADHA; the CDC's Guidelines for Infection Control in Dental Health-Care Settings; OSHA 29 CFR 1910.1030 bloodborne pathogens; HIPAA for the child's record",
    "name": "Pediatric Visit",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Pediatric Visit VR",
    "tagline": "A five-year-old's first dental visit: knee-to-knee, tell-show-do, and a plan that bends to the child in front of you",
    "accent": 16755021,
    "accentCss": "#ffa94d",
    "parSeconds": 260,
    "badge": {
      "id": "first-smiles",
      "name": "First Smiles",
      "note": "A first visit run without forcing the plan past what the child could actually tolerate"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "First Smiles",
      "currency": "STAR",
      "ranks": [
        "Front Desk Helper",
        "Pediatric Hygienist",
        "Behaviour Lead",
        "Clinic Mentor",
        "AAPD Practice Certified"
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
    "id": "oral-cancer-screening",
    "index": "130",
    "domain": "Preventive dentistry",
    "trade": "Registered dental hygienist",
    "category": "Dental & Oral Health",
    "certification": "The ADA's and the National Cancer Institute's oral cancer screening guidance, including the two-week persistent-lesion referral rule; the CDC's Guidelines for Infection Control in Dental Health-Care Settings; OSHA 29 CFR 1910.1030 bloodborne pathogens; HIPAA for the referral and the photographic record; the state dental hygiene board's scope of practice for referral; the ADHA",
    "name": "Oral Cancer Screening",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Oral Cancer Screening VR",
    "tagline": "The screening every adult recall should include: extraoral and intraoral in a fixed order, a finding described in terms a surgeon can act on, and the two-week rule",
    "accent": 5224649,
    "accentCss": "#4fb8c9",
    "parSeconds": 270,
    "badge": {
      "id": "early-look",
      "name": "Early Look",
      "note": "A full screening run in order with a finding fully described and referred inside the two-week rule"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Early Look",
      "currency": "SCAN",
      "ranks": [
        "Recall Assistant",
        "Screening Hygienist",
        "Lead Screener",
        "Clinic Reviewer",
        "ADA Screening Certified"
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
    "id": "bar-well-setup",
    "index": "131",
    "domain": "Culinary & Hospitality",
    "trade": "Bartender — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "California ABC Responsible Beverage Service (RBS) certification; the California Retail Food Code for ice, glassware, sanitiser and hand-washing; Cal/OSHA 8 CCR §3203 Injury and Illness Prevention Program and §5194 hazard communication for the sanitiser chemical; UNITE HERE Local 2's own opening-shift practice; the county Environmental Health department as the inspecting authority",
    "name": "Opening the Well",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ Opening the Well VR",
    "tagline": "Sanitiser mixed to strength, the ice well burned and refilled with a scoop, garnish gloved and dated, the glass washer proven, the well pour-tested and the float counted before the doors open",
    "accent": 12092971,
    "accentCss": "#b8862b",
    "parSeconds": 260,
    "badge": {
      "id": "well-opened-clean",
      "name": "Well Opened Clean",
      "note": "Every opening check passed to spec before the first guest was let in"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Bar Opening Crew",
      "currency": "POUR",
      "ranks": [
        "Barback",
        "Bartender",
        "Shift Lead",
        "Bar Manager",
        "RBS Certified Trainer"
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
    "id": "id-check-underage",
    "index": "132",
    "domain": "Culinary & Hospitality",
    "trade": "Bartender — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "California ABC Responsible Beverage Service (RBS) certification and Business and Professions Code §25658 sale to a minor; TIPS or ServSafe Alcohol training on the F.L.A.G. method; Cal/OSHA 8 CCR §3342 workplace violence prevention plan for a refusal that escalates; UNITE HERE Local 2's own practice on backing up a refusal across the shift",
    "name": "Checking ID",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ Checking ID VR",
    "tagline": "F.L.A.G., a UV check, the birth-date math against the calendar, a second form when in doubt, and a refusal that is polite, documented and handed to the rest of the bar",
    "accent": 12092971,
    "accentCss": "#b8862b",
    "parSeconds": 270,
    "badge": {
      "id": "door-held",
      "name": "Door Held",
      "note": "Every ID at the rail checked to F.L.A.G. and both underage attempts caught and documented"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Door Authority",
      "currency": "CARD",
      "ranks": [
        "Barback",
        "Bartender",
        "Shift Lead",
        "Bar Manager",
        "RBS Certified Trainer"
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
    "id": "jigger-pour-spec",
    "index": "133",
    "domain": "Culinary & Hospitality",
    "trade": "Bartender — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "California ABC Responsible Beverage Service (RBS) certification and Business and Professions Code §25602 sale to an obviously intoxicated person; the California Retail Food Code for glassware and ware-washing; Cal/OSHA 8 CCR §3203 Injury and Illness Prevention Program; California Labor Code §351 on tips; UNITE HERE Local 2's own standard for a drink built to spec rather than by feel",
    "name": "Pouring to Spec",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ Pouring to Spec VR",
    "tagline": "The standard drink measured to the jigger, a counted free pour held steady, shaken, stirred and built each worked to its own method, garnish and glass to spec, pour cost checked, and the round logged per customer",
    "accent": 12092971,
    "accentCss": "#b8862b",
    "parSeconds": 280,
    "badge": {
      "id": "rail-on-spec",
      "name": "Rail On Spec",
      "note": "Every build measured, every glass and garnish right, and the round logged clean"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Rail Standard",
      "currency": "POUR",
      "ranks": [
        "Barback",
        "Bartender",
        "Shift Lead",
        "Bar Manager",
        "RBS Certified Trainer"
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
    "id": "cutoff-overservice",
    "index": "134",
    "domain": "Culinary & Hospitality",
    "trade": "Bartender — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "The California ABC Responsible Beverage Service (RBS) Training Program Act; California Business and Professions Code §25602 — sale to an obviously intoxicated person — and the dram-shop civil liability it carries for the licence; NSF-certified ice and glassware equipment kept out of hand contact under the California Retail Food Code; OSHA 29 CFR 1910.1030 bloodborne pathogens for the glass that breaks the moment a cutoff turns physical; UNITE HERE Local 2's contract language on staffing a bar so one bartender is never alone with a cutoff",
    "name": "Cut-Off / Overservice",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ Cut-Off / Overservice VR",
    "tagline": "The RBS cues, the slower pour, the quiet cutoff, the ride home and the log entry that closes it out",
    "accent": 15901243,
    "accentCss": "#f2a23b",
    "parSeconds": 260,
    "badge": {
      "id": "clean-cutoff",
      "name": "Clean Cutoff",
      "note": "Recognised, slowed, cut off quietly, and sent home safe — nobody argued and nobody drove"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Service Standard",
      "currency": "POUR",
      "ranks": [
        "Barback",
        "Service Bartender",
        "Shift Lead",
        "Bar Manager",
        "RBS Certified Trainer"
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
    "id": "spiked-drink-response",
    "index": "135",
    "domain": "Culinary & Hospitality",
    "trade": "Bartender — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "The California ABC Responsible Beverage Service (RBS) Training Program Act's guidance on patron safety; the county Environmental Health department's food-contact standards for glassware a suspect drink is decanted into (NSF-certified, sealed, and never poured out); OSHA 29 CFR 1910.1030 bloodborne pathogens for any contact with an unconscious or vomiting patron; the local police non-emergency line and UNITE HERE Local 2's own guidance on staff never escorting a patron alone",
    "name": "Spiked Drink Response",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ Spiked Drink Response VR",
    "tagline": "Watching the rail, the safe-word scheme, and the response once a drink is actually suspect — remove it, retain it, stay with her, call it in",
    "accent": 3127459,
    "accentCss": "#2fb8a3",
    "parSeconds": 280,
    "badge": {
      "id": "never-alone",
      "name": "Never Alone",
      "note": "The drink retained, the patron never left with a stranger, and the report written before the shift ended"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Patron Safety",
      "currency": "WATCH",
      "ranks": [
        "Barback",
        "Service Bartender",
        "Shift Lead",
        "Bar Manager",
        "RBS Certified Trainer"
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
    "id": "patron-deescalation",
    "index": "136",
    "domain": "Culinary & Hospitality",
    "trade": "Bartender — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "Cal/OSHA's workplace violence prevention plan requirement, 8 CCR §3342 under SB 553, including the incident log every bar now has to keep; OSHA 29 CFR 1910.1030 bloodborne pathogens for the moment contact actually breaks skin; NFPA 101's life-safety requirement that the path to the door stays clear of exactly the kind of crowd this scenario draws; the local police non-emergency line as the standing call for a patron who will not leave; UNITE HERE Local 2's own language on never sending one bartender into a confrontation alone",
    "name": "Patron De-escalation",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ Patron De-escalation VR",
    "tagline": "Distance, the bar as a barrier, naming it once, backup, refusal — and the panic button the instant a hand crosses the bar",
    "accent": 15225903,
    "accentCss": "#e8542f",
    "parSeconds": 270,
    "badge": {
      "id": "held-the-line",
      "name": "Held the Line",
      "note": "De-escalated without raising a voice, hit the alarm the instant it went physical, and got the guest clear of the crowd"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Floor Command",
      "currency": "CALM",
      "ranks": [
        "Barback",
        "Service Bartender",
        "Shift Lead",
        "Bar Manager",
        "RBS Certified Trainer"
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
    "id": "till-drop-robbery",
    "index": "140",
    "domain": "Culinary & Hospitality",
    "trade": "Bartender — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "Cal/OSHA's workplace violence prevention plan (8 CCR §3342, enacted by SB 553) and Injury and Illness Prevention Program (8 CCR §3203); federal OSHA's recordkeeping rule (29 CFR 1904) for any work-related injury the incident causes; UNITE HERE Local 2's cash-handling and safety-committee language; California Labor Code §351 on tips; local police non-emergency reporting and the 911 protocol for an in-progress or just-occurred robbery",
    "name": "Till Drop & Robbery Response",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ Till Drop & Robbery Response VR",
    "tagline": "Count the till with a witness, drop it with an escort, and if someone demands the drawer instead: comply, don't chase, alarm after they're gone, lock up, call 911, and log it",
    "accent": 14042458,
    "accentCss": "#d6455a",
    "parSeconds": 300,
    "badge": {
      "id": "clean-drop",
      "name": "Clean Drop",
      "note": "Till counted and dropped clean, and a robbery demand answered without a single unsafe move"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Cash Control",
      "currency": "DROP",
      "ranks": [
        "Barback",
        "Closer",
        "Shift Lead",
        "Manager on Duty",
        "Cash Control Certified"
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
    "id": "allergen-cocktail",
    "index": "141",
    "domain": "Culinary & Hospitality",
    "trade": "Bartender — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "The FDA's FALCPA major food-allergen labelling under 21 CFR 101 (egg, milk, tree nuts) as it reaches bottled liqueurs and house syrups; the TTB's sulphite-disclosure requirement on wine labels; the California Retail Food Code and NSF International's equipment-sanitation standards on cross-contact and food-contact surfaces; UNITE HERE Local 2's service standards; and the venue's own written allergy protocol",
    "name": "Allergens & Honest Drinks",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ Allergens & Honest Drinks VR",
    "tagline": "Take the allergy order seriously, read the label instead of the memory, keep dedicated tools for it, and if someone starts reacting: find their auto-injector, call 911, and don't let them leave",
    "accent": 5230986,
    "accentCss": "#4fd18a",
    "parSeconds": 300,
    "badge": {
      "id": "read-the-label",
      "name": "Read the Label",
      "note": "Every allergen order answered from the label and the recipe card, clean, with the reaction chain ready if it was ever needed"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Service Standards",
      "currency": "POUR",
      "ranks": [
        "Barback",
        "Well Bartender",
        "Lead Bartender",
        "Bar Manager",
        "Service Certified"
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
    "id": "last-call-lockup",
    "index": "142",
    "domain": "Culinary & Hospitality",
    "trade": "Bartender — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "California ABC Act §25631 (hours of sale) and §25602 (sale to an obviously intoxicated person); the ABC licence's own posted hours; Cal/OSHA's workplace violence prevention plan (8 CCR §3342, SB 553), which names the closing shift and the walk to the parking lot as elevated-risk periods; federal OSHA's recordkeeping rule (29 CFR 1904) for anything the shift needs to report; UNITE HERE Local 2's closing-shift and safety-committee language",
    "name": "Last Call & Lockup",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ Last Call & Lockup VR",
    "tagline": "Last call on the clock the ABC licence sets, no sale after 2 a.m., the \"one more\" refused, rides checked, staff walked out together, the restrooms swept, and the building locked down behind you",
    "accent": 6056896,
    "accentCss": "#5c6bc0",
    "parSeconds": 320,
    "badge": {
      "id": "clean-close",
      "name": "Clean Close",
      "note": "Last call, the cutoff, the rides and the sweep all answered clean, and the building locked down behind a crew that walked out together"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Closing Shift",
      "currency": "CLOSE",
      "ranks": [
        "Barback",
        "Closer",
        "Shift Lead",
        "Manager on Duty",
        "Closing Certified"
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
    "id": "keg-cellar-co2",
    "index": "137",
    "domain": "Culinary & Hospitality",
    "trade": "Barback — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "UNITE HERE Local 2 barbacks; NIOSH guidance on carbon dioxide hazards in beverage cellars; OSHA's Hazard Communication standard (29 CFR 1910.1200), carried locally by Cal/OSHA's own §5194 and §3203 Injury and Illness Prevention Program; the ANSI-accredited California Food Handler card every barback on this line also holds; NSF-listed keg couplers and gas-line assemblies; the Compressed Gas Association's cylinder-handling practice",
    "name": "Keg Cellar CO2",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ Keg Cellar CO2 VR",
    "tagline": "A keg change in the cellar: cylinders chained, the monitor read before entry, coupler off then on, a leak checked at the gauge, the line purged, and the door left open",
    "accent": 14260814,
    "accentCss": "#d99a4e",
    "parSeconds": 265,
    "badge": {
      "id": "cellar-clean-change",
      "name": "Cellar Clean Change",
      "note": "A keg change with the monitor read, both bottles verified, no leak and the door left open — first time"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Cellar Operations",
      "currency": "PSI",
      "ranks": [
        "New Barback",
        "Cellar Hand",
        "Lead Barback",
        "Cellar Steward",
        "Cellar Operations Certified"
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
    "id": "ice-well-breakage",
    "index": "138",
    "domain": "Culinary & Hospitality",
    "trade": "Barback — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "UNITE HERE Local 2 barbacks; the California Retail Food Code (the ANSI-accredited FDA Food Code as adopted) on ice as a food and the equipment that touches it; OSHA's bloodborne pathogens standard, 29 CFR 1910.1030, for the cut and the clean-up; Cal/OSHA's Injury and Illness Prevention Program (8 CCR §3203) requiring the incident to be logged; NSF-listed ice bins and scoops",
    "name": "Ice Well Breakage",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ Ice Well Breakage VR",
    "tagline": "A glass breaks into the well: stop the well, mark it, burn the ice, sanitise and refill — and the cut it leaves you treated the same way the exposure plan requires",
    "accent": 6271177,
    "accentCss": "#5fb0c9",
    "parSeconds": 260,
    "badge": {
      "id": "well-cleared",
      "name": "Well Cleared",
      "note": "A contaminated well stopped, burned, sanitised and back on line — and a cut treated clean, first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Service Recovery",
      "currency": "POUR",
      "ranks": [
        "New Barback",
        "Well Runner",
        "Lead Barback",
        "Service Captain",
        "Service Recovery Certified"
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
    "id": "draught-line-cleaning",
    "index": "139",
    "domain": "Culinary & Hospitality",
    "trade": "Bartender — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "UNITE HERE Local 2 bartenders; Cal/OSHA 8 CCR §5194 Hazard Communication for the line cleaner's own safety data sheet and label; OSHA's eye and skin protection requirements (29 CFR 1910.133) behind the goggles-and-gloves rule; NSF/ANSI 18-listed draught dispensing equipment and tubing; the ANSI-accredited California Food Handler card every bartender on this line also holds; the Brewers Association's draught quality guidance on contact time and neutral-pH flushing",
    "name": "Draught Line Cleaning",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ Draught Line Cleaning VR",
    "tagline": "Beer lines cleaned to the SDS: goggles and gloves, taps tagged, solution pumped and given its contact time, flushed to a neutral pH, kegs back on and the first pour thrown away",
    "accent": 10471759,
    "accentCss": "#9fc94f",
    "parSeconds": 275,
    "badge": {
      "id": "neutral-and-clean",
      "name": "Neutral and Clean",
      "note": "A full line clean read neutral on the strip with every tap tagged and nobody poured from it — first time"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Draught Quality",
      "currency": "PH",
      "ranks": [
        "New Bartender",
        "Line Certified",
        "Lead Bartender",
        "Bar Manager",
        "Draught Quality Certified"
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
    "id": "tip-pool-labor",
    "index": "143",
    "domain": "Hospitality",
    "trade": "Bartender — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "California Labor Code §351 (tips are the property of the employee, no employer credit against wages, card tips paid no later than the next regular payday) and §2810.5 wage notice; IWC Wage Order 5 on meal periods, rest periods and the split-shift premium; the federal Fair Labor Standards Act's own tip-credit and tip-pooling rule at 29 CFR Part 531, the floor California's stricter statute sits on top of; the UNITE HERE Local 2 contract's tip-pooling and grievance language; the California Labor Commissioner's (DLSE) tip-pooling guidance; California ABC's mandatory RBS certification for anyone pouring on this licensed floor",
    "name": "Tip Pool & Labor",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ Tip Pool & Labor VR",
    "tagline": "Closing paperwork behind the bar: the jar counted open, a lawful pool split, breaks and split shift entered straight, and the steward standing behind the sheet",
    "accent": 15909195,
    "accentCss": "#f2c14b",
    "parSeconds": 300,
    "badge": {
      "id": "sheet-signed",
      "name": "Sheet Signed",
      "note": "A full night's tip-out, breaks and split shift closed out clean, with the steward's sign-off on it"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "House Ledger",
      "currency": "TIPS",
      "ranks": [
        "Rail Hand",
        "Tip-Out Trusted",
        "Sheet Keeper",
        "Shop Steward's Right Hand",
        "Ledger Certified"
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
    "id": "wvpp-panic-button",
    "index": "144",
    "domain": "Hospitality",
    "trade": "Bartender — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "Cal/OSHA's workplace violence prevention standard, 8 CCR §3342 (SB 553) — the written plan, hazard identification and correction, training, a violent-incident log and reporting without retaliation; Cal/OSHA's Injury and Illness Prevention Program, 8 CCR §3203; the UNITE HERE Local 2 contract's safety-committee language; Labor Code §6310 protection against retaliation for reporting a hazard; the ABC's RBS (Responsible Beverage Service) certification every alcohol server in California, this bartender included, is required to hold and keep current",
    "name": "WVPP & Panic Button",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ WVPP & Panic Button VR",
    "tagline": "The workplace violence prevention plan proven, not filed: the panic button tested, the hazard walk run, the log kept honest, and nobody closing alone unescorted",
    "accent": 15754331,
    "accentCss": "#f0645b",
    "parSeconds": 300,
    "badge": {
      "id": "plan-proven",
      "name": "Plan Proven",
      "note": "The whole workplace violence prevention plan run clean — posted, tested, walked and logged"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Floor Watch",
      "currency": "WATCH",
      "ranks": [
        "New to the Floor",
        "Hazard Spotter",
        "Button Certified",
        "Safety Committee",
        "Floor Watch Certified"
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
    "id": "rbs-service-capstone",
    "index": "145",
    "domain": "Hospitality",
    "trade": "Bartender — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "The California ABC Responsible Beverage Service Training Program Act — Business and Professions Code §25658 (sale to a minor), §25602 (sale to an obviously intoxicated person) and §25631 (hours of sale); the California Retail Food Code (CalCode) for glassware and ice; the UNITE HERE Local 2 contract's service standards; the county Environmental Health department and the local police non-emergency line as the numbers behind the bar",
    "name": "RBS Service Capstone",
    "weather": "clear",
    "indoor": "bar",
    "district": null,
    "title": "SmartCiti.X~ RBS Service Capstone VR",
    "tagline": "One pass down the rail — an ID check, a cut-off, a carry-out refused, a round poured to spec, and a drink nobody should ever hand back",
    "accent": 5224649,
    "accentCss": "#4fb8c9",
    "parSeconds": 340,
    "badge": {
      "id": "rail-certified",
      "name": "Rail Certified",
      "note": "Five customers down the rail, every call right, the round poured to spec and the count logged"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Rail Standing",
      "currency": "POUR",
      "ranks": [
        "Barback",
        "Rail Trained",
        "Service Certified",
        "Shift Lead",
        "RBS Certified"
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
    "id": "can-we-live-story",
    "index": "146",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "Community science under the foundation's own programmes with Greenaction for Health and Environmental Justice; OSHA HAZWOPER 29 CFR 1910.120 for anyone who goes inside a cleanup fence; EPA QA/QC and chain-of-custody guidance for any sample that will be relied on; informed consent under 45 CFR 46 for biomonitoring",
    "name": "Can We Live? — The Story",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Can We Live? — The Story VR",
    "tagline": "The Marie Harrison Community Foundation, the woman it is named for, and the community fight over the shipyard cleanup — a sourced briefing and knowledge check that opens the Hunters Point Edition",
    "accent": 15909195,
    "accentCss": "#f2c14b",
    "parSeconds": 320,
    "badge": {
      "id": "her-story",
      "name": "Her Story",
      "note": "The foundation, its founder and the record answered without an unsafe conclusion"
    },
    "stepCount": 10,
    "interruptCount": 0,
    "flat": true,
    "dossier": [
      {
        "title": "The organisation",
        "body": "The Marie Harrison Community Foundation, Inc. — known as \"Can We Live?\" — is a community-based 501(c)(3) in Bayview Hunters Point, San Francisco, founded and led by Executive Director Arieann Harrison in honour of her mother. Its programmes include the Community Pollution Patrol Network, the Hunters Point Biomonitoring Initiative, the Marie Harrison Community Foundation Academic Scholarship, Solutions for Women, the YES Camp youth summer camp-internship, the BaySpark youth climate event and the Bayview Hunters Point Air Monitor Project. Arieann Harrison serves on the Bay Area Air Quality Management District's Community Advisory Council.",
        "source": {
          "label": "Marie Harrison Community Foundation",
          "url": "https://www.canwelive.org/"
        },
        "source2": {
          "label": "BAAQMD Community Advisory Council — Arieann Harrison",
          "url": "https://www.baaqmd.gov/en/about-the-air-district/community-advisory-council/harrison"
        }
      },
      {
        "title": "Marie Harrison, 1948–2019",
        "body": "Marie Harrison (30 January 1948 – 5 May 2019) was called the mother of the environmental justice movement in Bayview Hunters Point. As a young woman she worked at the Hunters Point Shipyard. She lived in Hunters View beside the PG&E Hunters Point power plant, and the community campaign she was part of saw the plant shut down in 2006 and its stacks imploded on 18 June 2008. She wrote a column for the San Francisco Bay View, then worked full time for Greenaction for Health and Environmental Justice, staying on its board when her health no longer allowed her to work. A non-smoker, she lived her last years with lung damage that kept her on oxygen, and she kept testifying at hearings and protests until the end. Greenaction and her family created a youth environmental justice scholarship fund in her name.",
        "source": {
          "label": "San Francisco Bay View — Marie Harrison, mother of the movement (2019)",
          "url": "https://sfbayview.com/2019/05/marie-harrison-mother-of-the-movement-for-environmental-justice/"
        },
        "source2": {
          "label": "Greenaction — in honor and memory of Marie Harrison",
          "url": "https://greenaction.org/2020/05/06/in-honor-and-memory-of-marie-harrison-1-30-1948-5-5-2019/"
        }
      },
      {
        "title": "The air the neighbourhood measures itself",
        "body": "The Marie Harrison Bayview Air Monitoring Project, named for her after her death from lung disease, placed ten air monitors in and around Bayview Hunters Point so that residents have their own record of what they breathe. The foundation works with residents to screen them for toxins through its biomonitoring initiative and offers scholarships to students who study environmental justice. In June 2026 the foundation and Greenaction issued a joint community call to action and demands on the shipyard cleanup.",
        "source": {
          "label": "Inside Climate News — advocates have taken air monitoring into their own hands (2021)",
          "url": "https://insideclimatenews.org/news/27112021/air-pollution-bayview-hunters-point-san-francisco/"
        },
        "source2": {
          "label": "Greenaction — June 2026 community call to action and demands",
          "url": "https://greenaction.org/2026/06/06/june-2026-bayview-hunters-point-community-call-to-action-and-demands-issued-by-greenaction-and-the-marie-harrison-community-foundation-inc/"
        }
      },
      {
        "title": "The site record",
        "body": "Hunters Point Naval Shipyard has been an EPA Superfund site since 1989, with the Navy as lead agency under EPA and California oversight. Federal False Claims Act litigation over falsified radiological soil data by the Navy's contractor was settled for $57 million in 2026 without resolving the residents' own federal suit, filed by Greenaction in 2024, over whether the cleanup protects health. The Hunters Point Briefing station carries that record in full; this station is about the people beside the fence.",
        "source": {
          "label": "EPA Superfund site profile",
          "url": "https://cumulis.epa.gov/supercpad/cursites/csitinfo.cfm?id=0902722"
        },
        "source2": {
          "label": "Greenaction — Bayview Hunters Point",
          "url": "https://greenaction.org/bayview-hunters-point/"
        }
      },
      {
        "title": "What this edition is, and is not",
        "body": "The twenty-five stations that follow train the skills a community science programme and the trades beside it actually use: installing and checking air sensors, running a pollution patrol, supporting biomonitoring with consent and chain of custody, fence-line dust and haul-route observation, split soil and sediment samples, radiological literacy, the training gate into cleanup work, and turning data into public testimony. Every one is sited generically. This edition is a training aid built to be offered to the foundation and its partners; it is not the foundation's own programme and does not speak for it. The foundation's CLEAR page could not be retrieved when this station was written, so its own description of that work belongs here, in its own words, before the edition is used with learners.",
        "source": {
          "label": "OSHA 29 CFR 1910.120 — HAZWOPER",
          "url": "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.120"
        }
      }
    ],
    "game": {
      "system": "Community Science",
      "currency": "PATROL",
      "ranks": [
        "Neighbour",
        "Patrol Member",
        "Monitor Lead",
        "Data Steward",
        "Community Scientist"
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
    "id": "biomonitoring-consent",
    "index": "151",
    "domain": "Environmental",
    "trade": "Biomonitoring field coordinator",
    "category": "Community Environmental Justice",
    "certification": "45 CFR 46 informed consent for human subjects; HIPAA protections for a participant's own health information; CDC biomonitoring and specimen-handling guidance; SEIU community health worker practice standards",
    "name": "Biomonitoring Consent",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Biomonitoring Consent VR",
    "tagline": "The study explained with an interpreter offered, the consent form's rights read out loud, the signature witnessed, a participant ID assigned before any sample exists, the questionnaire, and the collection visit scheduled",
    "accent": 14721596,
    "accentCss": "#e0a23c",
    "parSeconds": 300,
    "badge": {
      "id": "consented-first",
      "name": "Consented First",
      "note": "Every right explained, the signature witnessed, and the participant ID on the record before a single sample existed"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Community Biomonitoring",
      "currency": "CONSENT",
      "ranks": [
        "Outreach Trainee",
        "Intake Coordinator",
        "Field Coordinator",
        "Lead Coordinator",
        "Consent Certified"
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
    "id": "sample-kit-shipping",
    "index": "152",
    "domain": "Environmental",
    "trade": "Biomonitoring field coordinator",
    "category": "Community Environmental Justice",
    "certification": "OSHA 29 CFR 1910.1030 bloodborne pathogens for handling human biological specimens; EPA QA/QC and chain-of-custody guidance; CDC biological substance, Category B packing and shipping guidance; 45 CFR 46 informed consent underlying every specimen in the cooler",
    "name": "Sample Kit Shipping",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Sample Kit Shipping VR",
    "tagline": "Labels matched to the manifest, the cold chain running before the lid closes, UN3373 exempt-specimen packing, the chain of custody signed at the hand-off, the courier's manifest, and the logger read one last time",
    "accent": 5222568,
    "accentCss": "#4fb0a8",
    "parSeconds": 300,
    "badge": {
      "id": "chain-unbroken",
      "name": "Chain Unbroken",
      "note": "Every label matched, the cold chain running, and the custody form signed before the courier ever touched the box"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Sample Shipping",
      "currency": "CUSTODY",
      "ranks": [
        "Packing Trainee",
        "Kit Handler",
        "Field Coordinator",
        "Lead Coordinator",
        "Custody Certified"
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
    "id": "results-return-visit",
    "index": "153",
    "domain": "Environmental",
    "trade": "Biomonitoring field coordinator",
    "category": "Community Environmental Justice",
    "certification": "45 CFR 46 informed consent, including the participant's own right to their results; HIPAA protections for a participant's health information; CDC biomonitoring reference-range and interpretation guidance; SEIU community health worker practice standards",
    "name": "Results Return Visit",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Results Return Visit VR",
    "tagline": "Identity confirmed before the file opens, the report explained against reference ranges, a flagged result referred to a clinician, questions answered without alarm or dismissal, and the visit recorded",
    "accent": 8368352,
    "accentCss": "#7fb0e0",
    "parSeconds": 300,
    "badge": {
      "id": "right-file-right-words",
      "name": "Right File, Right Words",
      "note": "The right participant's own result, explained without alarm or dismissal, and referred where it needed to be"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Results Return",
      "currency": "RETURN",
      "ranks": [
        "Return Trainee",
        "Intake Coordinator",
        "Field Coordinator",
        "Lead Coordinator",
        "Return Certified"
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
    "id": "smoke-day-outreach",
    "index": "154",
    "domain": "Environmental",
    "trade": "Community pollution patrol lead",
    "category": "Community Environmental Justice",
    "certification": "OSHA 29 CFR 1910.134 respirators and Cal/OSHA's wildfire smoke rule; NIOSH N95 selection and fit guidance; EPA Air Quality Index and DIY box-fan filter guidance; CDC guidance for people at higher risk during wildfire smoke events",
    "name": "Smoke Day Outreach",
    "weather": "smoke",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Smoke Day Outreach VR",
    "tagline": "The AQI read before the first knock, the vulnerable-resident list worked first, N95s actually fit, a box-fan filter built with the resident, windows and recirculate set, the hotline card left behind, and the patrol's own masks on when the air demands it",
    "accent": 14191178,
    "accentCss": "#d88a4a",
    "parSeconds": 320,
    "badge": {
      "id": "street-worked-right",
      "name": "Street Worked Right",
      "note": "The vulnerable households first, every mask actually fit, and the patrol's own respirators on before the air made that optional"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Smoke Day Patrol",
      "currency": "AQI",
      "ranks": [
        "Outreach Trainee",
        "Patrol Member",
        "Patrol Lead",
        "Shift Lead",
        "Smoke Day Certified"
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
    "id": "rad-meter-basics",
    "index": "163",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "Community science training modelled on EPA's MARSSIM walkover methodology; NRC 10 CFR 20 terms for the units a survey meter reports; the kind of hands-on class the Marie Harrison Community Foundation's own community science programmes run; OSHA 29 CFR 1910.120 HAZWOPER as the separate, much longer gate for anyone who goes past the fence, which this class never does",
    "name": "Rad Meter Basics",
    "weather": "overcast",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Rad Meter Basics VR",
    "tagline": "A community class on the public lot beside a fenced parcel: background counted first, the meter proven against its own check source, counts per minute against microsieverts per hour, a grid walked at a set pace and height, and what a hand-held meter cannot tell you",
    "accent": 14262316,
    "accentCss": "#d9a02c",
    "parSeconds": 290,
    "badge": {
      "id": "class-clean",
      "name": "Class Clean",
      "note": "Background counted before the source ever came out, every reading logged with its own photograph, and the check source never out of sight"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Community Science",
      "currency": "READING",
      "ranks": [
        "Newcomer",
        "Meter Reader",
        "Grid Walker",
        "Class Lead",
        "Community Science Certified"
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
    "id": "parcel-status-walk",
    "index": "164",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "The kind of parcel-status walk the Community Pollution Patrol Network trains; EPA Superfund community-involvement practice and the regulator's own current parcel map and institutional-controls registry as the only source a patrol answers from; DTSC and the Regional Water Board as the state agencies that record a parcel's cleanup status; BAAQMD's Community Advisory Council process for what a patrol reports up the chain; OSHA 29 CFR 1910.120 HAZWOPER as the separate gate for anyone who goes past a fence, which this walk never does",
    "name": "Parcel Status Walk",
    "weather": "overcast",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Parcel Status Walk VR",
    "tagline": "Walking the public sidewalk around a shipyard's fenced parcels with the regulator's own map: which parcel transferred, which is under cleanup, which is being retested, the institutional-controls signage, and the map annotated with exactly what the walk found",
    "accent": 13208107,
    "accentCss": "#c98a2b",
    "parSeconds": 300,
    "badge": {
      "id": "map-honest",
      "name": "Map Honest",
      "note": "Every parcel called from the regulator's own map, the discrepancy caught and photographed, and the resident answered honestly from the map in hand"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Patrol Record",
      "currency": "PARCEL",
      "ranks": [
        "Walker",
        "Route Reader",
        "Patrol Member",
        "Patrol Lead",
        "Community Patrol Certified"
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
    "id": "retest-witnessing",
    "index": "165",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "The kind of retest witnessing the Community Pollution Patrol Network trains; EPA QA/QC and chain-of-custody guidance (EPA QA/G-5) for what a split-sample request and a custody form actually have to show; DTSC and the Regional Water Board as the agencies whose own retest this is; BAAQMD's Community Advisory Council process for the questions a witness statement feeds; OSHA 29 CFR 1910.120 HAZWOPER as the separate gate for anyone who enters the exclusion zone, which a community witness never does",
    "name": "Retest Witnessing",
    "weather": "overcast",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Retest Witnessing VR",
    "tagline": "A community witness at a regulator's retest from the public side of the fence: the sampling grid checked against the work plan, the split sample requested in writing, the chain-of-custody form read, a photo log kept, questions routed through the community liaison, and a witness statement written the same day",
    "accent": 12092971,
    "accentCss": "#b8862b",
    "parSeconds": 300,
    "badge": {
      "id": "witness-clean",
      "name": "Witness Clean",
      "note": "The grid checked against the work plan, the split requested in writing, every form read before anything was signed, and the statement filed the same day"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Witness Record",
      "currency": "OBSERVE",
      "ranks": [
        "Observer",
        "Grid Checker",
        "Witness",
        "Lead Witness",
        "Community Patrol Certified"
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
    "id": "machine-threading-needle",
    "index": "172",
    "domain": "Garment manufacturing",
    "trade": "Industrial sewing machine operator — Workers United (SEIU)",
    "category": "Sewing & Garment Trades",
    "certification": "Workers United (SEIU) and state apprenticeship standards for industrial sewing machine operators; OSHA 29 CFR 1910.212 machine guarding for the needle guard, 1910.147 control of hazardous energy for the power switch before servicing, and NIOSH ergonomics guidance for seated repetitive bench work",
    "name": "Machine Threading and Needle",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ Machine Threading and Needle VR",
    "tagline": "Power off, the needle set with the scarf right, threaded in path, the bobbin wound and cased, tension proven on scrap, the guard down",
    "accent": 13214283,
    "accentCss": "#c9a24b",
    "parSeconds": 230,
    "badge": {
      "id": "first-seam-clean",
      "name": "First Seam Clean",
      "note": "A cold machine threaded and tensioned correctly, with the guard down before the first seam ran"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Bench Authority",
      "currency": "STITCH",
      "ranks": [
        "Floor Trainee",
        "Machine Operator",
        "Set-Up Operator",
        "Lead Operator",
        "Bench Authority Certified"
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
    "id": "lockstitch-seam-guard",
    "index": "173",
    "domain": "Garment manufacturing",
    "trade": "Industrial sewing machine operator — Workers United (SEIU)",
    "category": "Sewing & Garment Trades",
    "certification": "Workers United (SEIU) and state apprenticeship standards for industrial sewing machine operators; OSHA 29 CFR 1910.212 machine guarding for the needle guard behind which every seam runs, 1910.147 control of hazardous energy for a needle break, and NIOSH ergonomics guidance for the seated, repetitive pace a production line runs at",
    "name": "Lockstitch Seam Behind the Guard",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ Lockstitch Seam Behind the Guard VR",
    "tagline": "A straight seam at speed behind the guard, backtacked, a curve fed not pulled, chained bundle to bundle, a needle break accounted for, and the count",
    "accent": 5935062,
    "accentCss": "#5a8fd6",
    "parSeconds": 240,
    "badge": {
      "id": "bundle-clean",
      "name": "Bundle Clean",
      "note": "A full bundle chained through at speed with a needle break handled cleanly and the count reconciled"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Line Authority",
      "currency": "SEAM",
      "ranks": [
        "Floor Trainee",
        "Machine Operator",
        "Line Operator",
        "Lead Operator",
        "Line Authority Certified"
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
    "id": "serger-overlock",
    "index": "174",
    "domain": "Garment manufacturing",
    "trade": "Industrial sewing machine operator — Workers United (SEIU)",
    "category": "Sewing & Garment Trades",
    "certification": "Workers United (SEIU) and state apprenticeship standards for industrial sewing machine operators; OSHA 29 CFR 1910.212 machine guarding for the overlock's own moving knife, 1910.147 control of hazardous energy before the knife or the throat plate is ever cleared of lint, and NIOSH ergonomics guidance for seated repetitive feeding",
    "name": "Serger and Overlock",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ Serger and Overlock VR",
    "tagline": "The knife guard, four threads by colour, the cutting width set, edges finished, the chain-off, and the knife locked out for cleaning",
    "accent": 6273434,
    "accentCss": "#5fb99a",
    "parSeconds": 235,
    "badge": {
      "id": "edge-clean",
      "name": "Edge Clean",
      "note": "Four threads set by colour, an edge finished at the right width, and the knife cleaned only after lockout"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Overlock Authority",
      "currency": "LOOP",
      "ranks": [
        "Floor Trainee",
        "Machine Operator",
        "Set-Up Operator",
        "Lead Operator",
        "Overlock Authority Certified"
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
    "id": "cutting-table-rotary",
    "index": "175",
    "domain": "Garment manufacturing",
    "trade": "Industrial sewing machine operator — Workers United (SEIU)",
    "category": "Sewing & Garment Trades",
    "certification": "ANSI B11 safety requirements for cutting machines, OSHA 29 CFR 1910.212 machine guarding for the rotary and straight knives, 1910.132 hand protection for the cut-resistant glove on the guiding hand, and 1910.147 control of hazardous energy for the blade change — Workers United (SEIU) and state apprenticeship standards for industrial sewing machine operators",
    "name": "Cutting Table and Rotary Knife",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ Cutting Table and Rotary Knife VR",
    "tagline": "The spread checked, the marker weighted, the glove on, both blades guarded, the ply count right, bundled and ticketed, the blade changed locked out",
    "accent": 14056271,
    "accentCss": "#d67b4f",
    "parSeconds": 245,
    "badge": {
      "id": "cut-clean",
      "name": "Cut Clean",
      "note": "A spread cut to the marker on both blades with the glove on, the guard proven, and the count right"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Cutting Room Authority",
      "currency": "PLY",
      "ranks": [
        "Floor Trainee",
        "Cutter",
        "Lead Cutter",
        "Cutting Room Lead",
        "Cutting Room Authority Certified"
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
    "id": "sewing-ergonomics-shift",
    "index": "179",
    "domain": "Apparel manufacturing",
    "trade": "Industrial sewing machine operator — Workers United (SEIU)",
    "category": "Sewing & Garment Trades",
    "certification": "Workers United (SEIU) industrial sewing machine operator apprenticeship standards; OSHA 29 CFR 1910.212 machine guarding for the needle guard; NIOSH ergonomics guidance for seated repetitive work; the Cal/OSHA repetitive motion injury standard, 8 CCR 5110",
    "name": "Sewing Ergonomics",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ Sewing Ergonomics VR",
    "tagline": "Chair, table, pedal and light set to the operator, the bundle in reach, the micro-break taken, and a symptom reported early",
    "accent": 12086230,
    "accentCss": "#b86bd6",
    "parSeconds": 250,
    "badge": {
      "id": "shift-set-right",
      "name": "Shift Set Right",
      "note": "A bench set up to the operator, a full seam run in the posture band, the break taken, and an early symptom logged"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Line Authority",
      "currency": "STITCH",
      "ranks": [
        "Bundle Runner",
        "Machine Operator",
        "Line Operator",
        "Lead Operator",
        "Line Authority Certified"
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
    "id": "alteration-repair-ticket",
    "index": "180",
    "domain": "Apparel manufacturing",
    "trade": "Alterations tailor — Workers United",
    "category": "Sewing & Garment Trades",
    "certification": "Workers United (SEIU) alterations tailor apprenticeship standards; OSHA 29 CFR 1910.212 machine guarding for the alterations machine; 1910.1200 hazard communication for the pressing station; NIOSH ergonomics guidance for close, standing bench work at the form",
    "name": "Alteration Repair Ticket",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ Alteration Repair Ticket VR",
    "tagline": "Garment on the form, ripper away from the hand, hem re-sewn, zipper replaced, and the ticket closed against the customer's own pins",
    "accent": 14060395,
    "accentCss": "#d68b6b",
    "parSeconds": 260,
    "badge": {
      "id": "ticket-closed-right",
      "name": "Ticket Closed Right",
      "note": "A hem and a zipper both re-sewn to the customer's own pinned fit, and every pin off the bench before it closed"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Bench Authority",
      "currency": "SEAM",
      "ranks": [
        "Presser",
        "Alterations Hand",
        "Tailor",
        "Lead Tailor",
        "Bench Authority Certified"
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
    "id": "garment-inspection-finish",
    "index": "181",
    "domain": "Apparel manufacturing",
    "trade": "Industrial sewing machine operator — Workers United (SEIU)",
    "category": "Sewing & Garment Trades",
    "certification": "Workers United (SEIU) industrial sewing machine operator apprenticeship standards; OSHA 29 CFR 1910.1200 hazard communication for the spot-cleaning solvent; OSHA 29 CFR 1910.132 personal protective equipment for the gloves; NIOSH ergonomics guidance for standing inspection-table work",
    "name": "Garment Inspection & Finish",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ Garment Inspection & Finish VR",
    "tagline": "Light box, spec sheet, defects found and tagged, guarded snips, the needle detector on every piece, and solvent under the SDS",
    "accent": 7067320,
    "accentCss": "#6bd6b8",
    "parSeconds": 260,
    "badge": {
      "id": "clean-pack",
      "name": "Clean Pack",
      "note": "Every defect found and tagged, every piece swept for needles, and nothing packed that hadn't cleared both"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Finish Authority",
      "currency": "TAG",
      "ranks": [
        "Sorter",
        "Inspector",
        "Lead Inspector",
        "Finish Hand",
        "Finish Authority Certified"
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
    "id": "abatement-perimeter-awareness",
    "index": "166",
    "domain": "Environmental",
    "trade": "Hazmat and environmental laborer — LIUNA",
    "category": "Community Environmental Justice",
    "certification": "LIUNA hazmat and environmental laborer entry-level and asbestos-awareness training; OSHA 29 CFR 1926.1101 asbestos in construction (awareness-level duties and the site's competent person); 29 CFR 1910.134 respiratory protection for the entrants the standard actually covers; EPA NESHAP 40 CFR 61 Subpart M for demolition asbestos waste; the local air district's demolition and asbestos notification rules",
    "name": "Abatement Perimeter Awareness",
    "weather": "wind",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Abatement Perimeter Awareness VR",
    "tagline": "A new laborer's fence-line watch on a demolition perimeter: the postings, the negative-air units, the wet method, the waste labels, and the line between watching and calling it in",
    "accent": 15251018,
    "accentCss": "#e8b64a",
    "parSeconds": 260,
    "badge": {
      "id": "perimeter-held",
      "name": "Perimeter Held",
      "note": "The watch kept clean: nothing crossed, nothing touched, the competent person called the moment it mattered"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Perimeter Watch",
      "currency": "WATCH",
      "ranks": [
        "New Hire",
        "Perimeter Hand",
        "Fence-Line Lead",
        "Awareness Authority",
        "Perimeter Watch Certified"
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
    "id": "hazwoper-site-orientation",
    "index": "167",
    "domain": "Environmental",
    "trade": "Hazmat and environmental laborer — LIUNA",
    "category": "Community Environmental Justice",
    "certification": "LIUNA HAZWOPER-trained hazmat and environmental laborer; OSHA 29 CFR 1910.120(e) HAZWOPER 40-hour training and the site-specific orientation it requires before work begins; 29 CFR 1910.134 respiratory protection and the user seal check; NIOSH exposure guidance behind the site's action levels; Cal/OSHA's injury and illness prevention program (8 CCR 3203) for the site health and safety plan",
    "name": "HAZWOPER Site Orientation",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ HAZWOPER Site Orientation VR",
    "tagline": "A HAZWOPER-trained laborer's first-day orientation: the site plan signed, the zones on the map, today's PPE level, the action levels, the buddy system, the muster point and the card that says you're cleared",
    "accent": 6080736,
    "accentCss": "#5cc8e0",
    "parSeconds": 255,
    "badge": {
      "id": "orientation-complete",
      "name": "Orientation Complete",
      "note": "Every part of the orientation finished in order, with nothing skipped for the sake of starting sooner"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Site Clearance",
      "currency": "CLEAR",
      "ranks": [
        "Trainee",
        "Site Hand",
        "Crew Laborer",
        "Site Orientation Lead",
        "Site Clearance Certified"
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
    "id": "decon-support-laborer",
    "index": "168",
    "domain": "Environmental",
    "trade": "Hazmat and environmental laborer — LIUNA",
    "category": "Community Environmental Justice",
    "certification": "LIUNA hazmat and environmental laborer, decon-line support role; OSHA 29 CFR 1910.120 HAZWOPER decontamination procedures; 29 CFR 1910.134 respiratory and PPE selection for the decon crew's own protection; EPA hazardous-waste labeling and manifesting requirements for drummed wastewater; the Regional Water Quality Control Board's (RWQCB) discharge prohibitions on containment water leaving the corridor",
    "name": "Decon Support Laborer",
    "weather": "clear",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Decon Support Laborer VR",
    "tagline": "Working the decon corridor from the clean side: stations stocked, the pool contained, entrants washed and tools wiped in order, suits bagged, wastewater drummed and labelled, the corridor logged",
    "accent": 8377520,
    "accentCss": "#7fd4b0",
    "parSeconds": 270,
    "badge": {
      "id": "corridor-supported",
      "name": "Corridor Supported",
      "note": "The line stocked, contained and logged, with every entrant washed clean and every drum labelled before it moved"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Decon Support",
      "currency": "RINSE",
      "ranks": [
        "Ground Hand",
        "Wash Station Hand",
        "Corridor Support Lead",
        "Decon Support Authority",
        "Decon Support Certified"
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
    "id": "air-sensor-install",
    "index": "147",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "Community science under the network's own siting and QA practice, drawn from EPA's low-cost air sensor siting guidance; OSHA 29 CFR 1910.23 ladder safety and NIOSH's ladder-safety guidance for the physical install; the Bay Area Air Quality Management District's Community Advisory Council process; consent for anything logged to a resident's home modelled on the standard in 45 CFR 46",
    "name": "Neighbourhood Air Sensor",
    "weather": "wind",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Neighbourhood Air Sensor VR",
    "tagline": "A resident's own PM2.5 sensor: sited by the network's rules, mounted, wired, paired, proven against a handheld before it counts, logged with photo and GPS, and handed back to the resident who owns it",
    "accent": 7328906,
    "accentCss": "#6fd48a",
    "parSeconds": 260,
    "badge": {
      "id": "network-node-proven",
      "name": "Network Node Proven",
      "note": "A sensor sited by the rules, consented to by the resident who hosts it, and proven against a handheld before it ever reports a number"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Neighbourhood Network",
      "currency": "READING",
      "ranks": [
        "Trainee Installer",
        "Network Installer",
        "Site Steward",
        "QA Lead",
        "Neighbourhood Network Certified"
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
    "id": "sensor-colocation-check",
    "index": "148",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "AFSCME air-district technicians who run the reference monitor this co-location is checked against; EPA 40 CFR Part 58 Appendix A quality assurance and its co-location siting criteria; the Bay Area Air Quality Management District's community sensor verification practice; NIOSH guidance on humidity artifacts in optical particle counters",
    "name": "Sensor Co-Location Check",
    "weather": "fog",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Sensor Co-Location Check VR",
    "tagline": "A week beside the Air District's reference monitor: hourly comparisons, a correction factor earned honestly, a drifting sensor caught and flagged, and humidity's own bias on an optical counter told apart from a real event",
    "accent": 5223385,
    "accentCss": "#4fb3d9",
    "parSeconds": 270,
    "badge": {
      "id": "correction-earned",
      "name": "Correction Earned",
      "note": "A correction factor derived from a full week against a proven reference, with the drifting sensor caught before it shipped back to the network"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Reference Bench",
      "currency": "MICROGRAM",
      "ranks": [
        "Bench Trainee",
        "Co-Location Technician",
        "QA Lead",
        "Reference Steward",
        "Reference Bench Certified"
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
    "id": "air-network-data-qa",
    "index": "149",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "EPA 40 CFR Part 58 Appendix A data quality objectives and Air Quality Index reporting guidance; Cal/OSHA's wildfire smoke rule (8 CCR 5141.1) for telling a smoke day from a local event; the Bay Area Air Quality Management District's complaint and Community Advisory Council process; NIOSH guidance on separating regional smoke episodes from local point sources in a community monitoring network",
    "name": "Network Data Review",
    "weather": "smoke",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Network Data Review VR",
    "tagline": "A week of the ten-monitor network read honestly: a smoke day told from a local source by the pattern across the map, a stuck sensor caught, a real outlier confirmed and reported, and the public note that says what the numbers actually mean",
    "accent": 14257999,
    "accentCss": "#d98f4f",
    "parSeconds": 255,
    "badge": {
      "id": "map-read-honestly",
      "name": "Map Read Honestly",
      "note": "A smoke day and a local source told apart by the pattern, a stuck sensor caught, and the real outlier reported before the note went public"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Weekly Review",
      "currency": "DATAPOINT",
      "ranks": [
        "Review Trainee",
        "Data Reviewer",
        "QA Lead",
        "Network Steward",
        "Weekly Review Certified"
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
    "id": "odor-complaint-log",
    "index": "150",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "Community Pollution Patrol Network practice; the Bay Area Air Quality Management District's complaint and Community Advisory Council process; OSHA 29 CFR 1910.120 HAZWOPER for anyone who crosses the fence, which a patrol member never does; EPA Superfund community involvement guidance for a parcel under a federal cleanup order",
    "name": "Pollution Patrol",
    "weather": "wind",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Pollution Patrol VR",
    "tagline": "A patrol shift worked from the public side of the fence: the route in order, the wind off a handheld meter, an event logged with time, place, photo and description, and the complaint filed with the fields the Air District needs",
    "accent": 14967338,
    "accentCss": "#e4622a",
    "parSeconds": 250,
    "badge": {
      "id": "fence-line-record",
      "name": "Fence-Line Record",
      "note": "A route walked in order, an event logged completely, and a complaint filed without ever stepping past the fence"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Patrol Log",
      "currency": "OBSERVATION",
      "ranks": [
        "Patrol Trainee",
        "Patrol Member",
        "Route Lead",
        "Complaint Steward",
        "Patrol Log Certified"
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
    "id": "fenceline-dust-monitor",
    "index": "155",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "BAAQMD complaint line and Regulation 6 particulate rules; EPA 40 CFR Part 58 ambient monitor siting, zero and flow QA; the site's own Dust Control Plan and posted action level under DTSC and Regional Water Board oversight; OSHA 29 CFR 1910.120 HAZWOPER for anyone who crosses the fence — not required here, because this monitor stands on the public side of it",
    "name": "Fenceline Dust Monitor",
    "weather": "wind",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Fenceline Dust Monitor VR",
    "tagline": "Deploying a community PM10 monitor on the public side of a cleanup fence: sited by the wind, levelled and guyed, zeroed and flow-checked, alarmed to the site's own action level, logged, and an exceedance reported without ever crossing the fence",
    "accent": 14257215,
    "accentCss": "#d98c3f",
    "parSeconds": 300,
    "badge": {
      "id": "fenceline-true",
      "name": "Fenceline True",
      "note": "Sited downwind, level and guyed, proven at zero and flow, alarmed to the plan, and an exceedance reported without setting foot past the fence"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Fenceline Watch",
      "currency": "PM10",
      "ranks": [
        "Sidewalk Hand",
        "Siting Lead",
        "Zero Proven",
        "Watch Authority",
        "Fenceline Certified"
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
    "id": "haul-route-observation",
    "index": "156",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "BAAQMD complaint line and Regulation 6 track-out and dust rules; EPA RCRA hazardous-waste manifest placarding (40 CFR 262); the site's own Dust Control Plan requiring a tarped, washed load at every gate; the California Vehicle Code's posted residential speed limit; CARB's 13 CCR 2485 five-minute diesel idling limit; OSHA 29 CFR 1910.120 HAZWOPER for anyone who crosses the gate — not required here, because this patrol never does",
    "name": "Haul Route Observation",
    "weather": "overcast",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Haul Route Observation VR",
    "tagline": "Watching a cleanup parcel's gate from the public sidewalk: the tarp, the wheel wash, track-out onto the street, the manifest placard and the residential speed limit, each observation logged with a plate, a time and a photo for the Air District and the site's own complaint line",
    "accent": 6210262,
    "accentCss": "#5ec2d6",
    "parSeconds": 300,
    "badge": {
      "id": "gate-watched",
      "name": "Gate Watched",
      "note": "Every check made from the sidewalk, every observation logged with a plate, a time and a photo, and never once through the gate"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Route Watch",
      "currency": "PLATE",
      "ranks": [
        "Sidewalk Observer",
        "Log Keeper",
        "Route Lead",
        "Complaint Authority",
        "Route Watch Certified"
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
    "id": "met-station-siting",
    "index": "157",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "The community air network's own siting protocol, drawn from WMO and NOAA/NWS surface-observation siting standards; NFPA 780 lightning protection for the mast's own ground rod; OSHA 29 CFR 1926 fall protection if a tilt-up mast is ever climbed instead of lowered; EPA 40 CFR Part 58 meteorological support requirements for a network whose readings get compared against a federal cleanup order's own air data",
    "name": "Met Station Siting",
    "weather": "wind",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Met Station Siting VR",
    "tagline": "Siting the community's own weather station: exposure clear of buildings, a tilt-up mast raised and guyed, the datalogger wired and grounded, the mast turned to true north, the rain gauge levelled, and the first day's data checked against the airport's own record",
    "accent": 8370400,
    "accentCss": "#7fb8e0",
    "parSeconds": 310,
    "badge": {
      "id": "true-north-set",
      "name": "True North Set",
      "note": "Sited clear of every obstruction, aligned to true north, levelled, grounded, and the first day's data checked against the airport's before anyone trusts a wind direction off it"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Station Siting",
      "currency": "SITING",
      "ranks": [
        "Yard Hand",
        "Mast Rigger",
        "Siting Lead",
        "Network Authority",
        "Siting Certified"
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
    "id": "dust-plan-review",
    "index": "158",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "BAAQMD Regulation 6 and its public comment process on a site's own dust control plan; EPA's Superfund community involvement requirements under the National Contingency Plan (40 CFR Part 300); California DTSC and the Regional Water Board's oversight of the plan itself; OSHA 29 CFR 1910.120 HAZWOPER for anyone who inspects a fenceline monitor in person — not required for this desk review of the plan and the patrol's own record",
    "name": "Dust Plan Review",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Dust Plan Review VR",
    "tagline": "Reading a contractor's dust control plan against what the patrol actually saw: the water truck frequency, the action levels, the monitor locations on the map, the notification list, and the gaps written into a comment letter for the regulator",
    "accent": 10125270,
    "accentCss": "#9a7fd6",
    "parSeconds": 320,
    "badge": {
      "id": "gap-named",
      "name": "Gap Named",
      "note": "Every claim in the plan checked against the patrol's own record, every gap cited to a real authority, and the letter filed before the deadline moved"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Plan Review",
      "currency": "COMMENT",
      "ranks": [
        "Reader",
        "Cross-Checker",
        "Comment Drafter",
        "Review Lead",
        "Plan Review Certified"
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
    "id": "public-comment-prep",
    "index": "169",
    "domain": "Environmental",
    "trade": "Community pollution patrol lead",
    "category": "Community Environmental Justice",
    "certification": "The foundation's own patrol protocol for logging and reviewing observations; the Bay Area Air Quality Management District's (BAAQMD) complaint process and Community Advisory Council public-comment procedure; EPA quality-assurance project plan (QAPP) and chain-of-custody guidance for using monitor data as evidence; the U.S. EPA's Superfund Community Involvement Handbook on public participation in cleanup oversight",
    "name": "Public Comment Prep",
    "weather": "overcast",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Public Comment Prep VR",
    "tagline": "A month of patrol logs and monitor data turned into testimony: every claim tied to a dated record, the chart built from the network's own numbers, a three-minute statement timed and paced, a written comment filed with its exhibits, a speaker card submitted, and nothing said that cannot be sourced",
    "accent": 15909195,
    "accentCss": "#f2c14b",
    "parSeconds": 300,
    "badge": {
      "id": "record-backed",
      "name": "Record Backed",
      "note": "Every claim tied to a dated log or monitor record, the chart correct, the statement timed clean, and nothing said that the record does not back up"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Testimony Desk",
      "currency": "COMMENT",
      "ranks": [
        "New Voice",
        "Prepared Speaker",
        "Testimony Lead",
        "Data Steward",
        "Certified Public Witness"
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
    "id": "youth-patrol-training",
    "index": "170",
    "domain": "Environmental",
    "trade": "Youth patrol member",
    "category": "Community Environmental Justice",
    "certification": "The foundation's own youth patrol training protocol, run under adult supervision; BAAQMD's complaint process for what a filed observation is used for; NIOSH heat-stress guidance and the same shade-and-water trigger the state's heat-illness prevention standard sets for outdoor workers, adopted here as the patrol's own rule; EPA Air Quality Index guidance for reading a smoke or particulate reading before a shift; the patrol's own rule that members work the public side of a fence line, never inside it",
    "name": "Youth Patrol Training",
    "weather": "clear",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Youth Patrol Training VR",
    "tagline": "A youth patrol team's first shift: roles assigned, the route and the fence-line boundary walked, the buddy rule kept, sun and smoke gear staged, an observation logged the way the network can use it, the calm answer at the fence, and a debrief that closes the shift",
    "accent": 5884283,
    "accentCss": "#59c97b",
    "parSeconds": 300,
    "badge": {
      "id": "first-shift-clean",
      "name": "First Shift Clean",
      "note": "Roles held, the buddy rule never broken, the boundary respected, and a real observation logged and handed off"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Patrol Roster",
      "currency": "SHIFT",
      "ranks": [
        "Trainee Patroller",
        "Patrol Member",
        "Route Lead",
        "Team Recorder",
        "First-Shift Certified"
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
    "id": "shelter-in-place-drill",
    "index": "171",
    "domain": "Environmental",
    "trade": "Community pollution patrol lead",
    "category": "Community Environmental Justice",
    "certification": "The community centre's own shelter-in-place plan, run under the patrol lead's direction; BAAQMD's complaint and public-alert line for reporting the event that triggered the drill; EPA guidance on using a portable air cleaner's clean-air delivery rate (CADR) to actually reduce indoor particulate during a dust or smoke event; the same shade-and-smoke thresholds Cal/OSHA's wildfire-smoke rule sets for outdoor exposure, adopted here as the trigger for sheltering indoors; accommodation practice consistent with the ADA for residents with respiratory needs during an emergency",
    "name": "Shelter-in-Place Drill",
    "weather": "overcast",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Shelter-in-Place Drill VR",
    "tagline": "A community centre's shelter-in-place drill for a dust or fire event at a fenced parcel: the alert taken seriously, doors and windows closed, HVAC to recirculate, the air cleaner on high, a real headcount, the hotline and the Air District called, residents with respiratory needs checked by name, and the all-clear recorded",
    "accent": 8376777,
    "accentCss": "#7fd1c9",
    "parSeconds": 300,
    "badge": {
      "id": "building-held",
      "name": "Building Held",
      "note": "Every opening closed, the air handled correctly, every room counted, both calls made, every resident checked, and the all-clear recorded rather than assumed"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Shelter Watch",
      "currency": "COUNT",
      "ranks": [
        "Drill Trainee",
        "Floor Monitor",
        "Shelter Lead",
        "Building Steward",
        "Shelter Certified"
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
