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
    "parSeconds": 225,
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
    "parSeconds": 225,
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
    "certification": "Ironworkers (IW) — OSHA 29 CFR 1926 Subpart R qualified connector; fall protection under ANSI Z359 and rigging signals per ASME B30.5",
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
    "certification": "ILWU/PMA longshore training — OSHA 29 CFR 1918 (longshoring) marine terminal safety; IMO SOLAS Chapter VI and the Cargo Securing Manual requirements approved for this ship, which is what fixes the lashing pattern for the bay; fall protection on lashing bridges",
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
    "certification": "The American Heart Association's Basic Life Support for Healthcare Providers; the ADA's guidance on the recognition and management of medical emergencies in the dental office, including the office emergency kit; the ADHA's Standards for Clinical Dental Hygiene Practice, which put recognising and responding to a medical emergency inside the hygienist's own assessment duty; NFPA 99 for the office's medical gas and emergency oxygen; the state dental board's practice act for first response before EMS arrival; OSHA 29 CFR 1910.1030 bloodborne pathogens for rescue breaths and any blood or saliva exposure",
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
    "stepCount": 15,
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
    "stepCount": 13,
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
    "certification": "The CDC's Guidelines for Infection Control in Dental Health-Care Settings (2003) and its 2016 Summary; ANSI/AAMI ST79 for steam sterilization in health care facilities; the FDA-cleared reprocessing instructions that ship with a reusable dental device; OSHA 29 CFR 1910.1030 bloodborne pathogens; the Dental Hygiene Board of California practice act",
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
  },
  {
    "id": "pattern-marking-layout",
    "index": "176",
    "domain": "Manufacturing",
    "trade": "Industrial sewing machine operator — Workers United (SEIU)",
    "category": "Sewing & Garment Trades",
    "certification": "Workers United (SEIU) garment and apparel production; the state apprenticeship standards for industrial sewing machine operators; OSHA 29 CFR 1910.132 hand protection around the awl, notcher and rotary cutter at the marking table; NIOSH ergonomics guidance for the prolonged standing, reaching and bent-over work a marking table asks for",
    "name": "Pattern Marking & Layout",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ Pattern Marking & Layout VR",
    "tagline": "Grain line to selvedge, nap held one way, notches and drill holes struck, and the marker counted back against the cut ticket",
    "accent": 13073369,
    "accentCss": "#c77bd9",
    "parSeconds": 250,
    "badge": {
      "id": "marker-true",
      "name": "Marker True",
      "note": "A layout on grain, on nap, notched, tagged and counted clean against the cut ticket"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Marker Authority",
      "currency": "YARD",
      "ranks": [
        "Bundle Runner",
        "Marker Helper",
        "Marker Maker",
        "Lead Marker Maker",
        "Marker Authority Certified"
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
    "id": "hem-and-buttonhole",
    "index": "177",
    "domain": "Manufacturing",
    "trade": "Industrial sewing machine operator — Workers United (SEIU)",
    "category": "Sewing & Garment Trades",
    "certification": "Workers United (SEIU) garment and apparel production; the state apprenticeship standards for industrial sewing machine operators; OSHA 29 CFR 1910.212 machine guarding for the buttonhole cutter and bar tack machine; OSHA 29 CFR 1910.147 lockout before clearing a jam; OSHA 1910.132 PPE; NIOSH ergonomics guidance for the seated, repetitive reach these machines ask for all shift",
    "name": "Hem & Buttonhole",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ Hem & Buttonhole VR",
    "tagline": "Blind hem, a guarded buttonhole cut and sew, buttons to spacing, bar tacks at the stress points, and a piece checked against spec",
    "accent": 10116292,
    "accentCss": "#9a5cc4",
    "parSeconds": 260,
    "badge": {
      "id": "finish-line",
      "name": "Finish Line",
      "note": "A hem, a buttonhole, buttons and bar tacks all sewn true, guard down every time, and the piece passed against spec"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Finishing Standard",
      "currency": "STITCH",
      "ranks": [
        "Trimmer",
        "Finisher",
        "Lead Finisher",
        "Bench Lead",
        "Finishing Standard Certified"
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
    "id": "industrial-press-steam",
    "index": "178",
    "domain": "Manufacturing",
    "trade": "Industrial sewing machine operator — Workers United (SEIU)",
    "category": "Sewing & Garment Trades",
    "certification": "Workers United (SEIU) garment and apparel production; the state apprenticeship standards for industrial sewing machine operators; OSHA 29 CFR 1910.212 machine guarding for the press head's two-hand control; OSHA 29 CFR 1910.147 lockout before the head is opened for cleaning; ASME Boiler and Pressure Vessel Code requirements for the boiler's safety relief valve; NFPA 70 for the press's electrical supply",
    "name": "Industrial Press & Steam",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ Industrial Press & Steam VR",
    "tagline": "Boiler pressure checked, the head run on two-hand control, steam and vacuum by fabric, a scorch caught, and the press shut down clean",
    "accent": 14250042,
    "accentCss": "#d9703a",
    "parSeconds": 270,
    "badge": {
      "id": "press-certified",
      "name": "Press Certified",
      "note": "Boiler checked, every cycle run two-handed, a scorch caught, and the press shut down to the end of a real shift"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Press Standard",
      "currency": "STEAM",
      "ranks": [
        "Press Helper",
        "Press Operator",
        "Lead Presser",
        "Finishing Supervisor",
        "Press Standard Certified"
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
    "id": "community-soil-split",
    "index": "159",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "EPA QA/QC and chain-of-custody guidance (EPA QA/G-5) for any split sample relied on in public; California DTSC and EPA Superfund community-involvement oversight of the parcel; OSHA 29 CFR 1910.120 HAZWOPER for anyone who steps inside the fence — the monitor does not; California's Environmental Laboratory Accreditation Program (ELAP), which is what makes a lab \"independent\" of the agency's own contractor mean something; the Community Pollution Patrol Network's split-sample protocol",
    "name": "Community Soil Split",
    "weather": "overcast",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Community Soil Split VR",
    "tagline": "Witnessing an agency soil sample and taking the community's own split of it: the grid point, the decontaminated trowel, one core homogenised and divided into two jars, both labelled and sealed, custody signed by both parties, and the community jar carried to an independent lab",
    "accent": 14191178,
    "accentCss": "#d88a4a",
    "parSeconds": 280,
    "badge": {
      "id": "split-clean",
      "name": "Split Clean",
      "note": "A witnessed core, decontaminated tools, both jars sealed and signed for, and the community jar on its way to an independent lab"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Split Sample",
      "currency": "CORE",
      "ranks": [
        "Witness",
        "Field Monitor",
        "Custody Holder",
        "Patrol Lead",
        "Split Sample Certified"
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
    "id": "garden-soil-screen",
    "index": "160",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "California Department of Public Health Radiologic Health Branch registration for the XRF analyser's sealed source under OSHA 29 CFR 1910.1096 ionizing radiation; NIOSH field-portable XRF guidance for lead and arsenic screening; ASTM D6288 field portable XRF method; DTSC / OEHHA California Human Health Screening Levels for lead and arsenic in residential soil; EPA guidance on gardening in urban soils; the Hunters Point Biomonitoring Initiative's community garden screening protocol",
    "name": "Garden Soil Screen",
    "weather": "clear",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Garden Soil Screen VR",
    "tagline": "Screening a community garden bed with a handheld XRF: the check standard proven first, the grid laid out, readings taken at depth, the action levels read straight, the bed that fails flagged and raised with clean fill, and a results sheet the gardeners can actually read",
    "accent": 8372074,
    "accentCss": "#7fbf6a",
    "parSeconds": 290,
    "badge": {
      "id": "bed-honest",
      "name": "Bed Honest",
      "note": "A proven instrument, a real grid, an honest action-level call, and a failed bed raised with clean fill — not planted in"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Garden Screen",
      "currency": "READING",
      "ranks": [
        "Volunteer",
        "Garden Screener",
        "Bed Lead",
        "Screening Coordinator",
        "Garden Screen Certified"
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
    "id": "shoreline-sediment-grab",
    "index": "161",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "NOAA tide table and predicted low-water window; EPA QA/QC and chain-of-custody guidance (EPA QA/G-5) for sediment samples relied on in public; U.S. Fish and Wildlife Service — Endangered Species Act protection for Ridgway's rail; San Francisco Bay Conservation and Development Commission (BCDC) shoreline access rules; the Community Pollution Patrol Network's shoreline sampling protocol",
    "name": "Shoreline Sediment Grab",
    "weather": "overcast",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Shoreline Sediment Grab VR",
    "tagline": "A shoreline sediment grab on a falling tide: the tide window read, the grab sampler used on the top two centimetres, pH and odour logged, the jar iced, custody signed, and the eelgrass and cordgrass kept off the whole time",
    "accent": 5939145,
    "accentCss": "#5a9fc9",
    "parSeconds": 280,
    "badge": {
      "id": "window-held",
      "name": "Window Held",
      "note": "A clean grab from the top two centimetres, taken and iced inside the tide window, without a boot in the eelgrass or the cordgrass"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Shoreline Grab",
      "currency": "GRAB",
      "ranks": [
        "Shoreline Watcher",
        "Field Monitor",
        "Transect Lead",
        "Patrol Coordinator",
        "Shoreline Grab Certified"
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
    "id": "discharge-photo-doc",
    "index": "162",
    "domain": "Environmental",
    "trade": "Community environmental monitor",
    "category": "Community Environmental Justice",
    "certification": "CWA (Clean Water Act) NPDES illicit-discharge reporting to the Regional Water Quality Control Board (RWQCB); the city's pollution-reporting hotline; EPA QA/QC and chain-of-custody guidance (EPA QA/G-5) for any grab sample relied on in public; OSHA 29 CFR 1910.132 general PPE for the patrol's own gear; the Community Pollution Patrol Network's discharge documentation protocol",
    "name": "Discharge Photo Doc",
    "weather": "overcast",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Discharge Photo Doc VR",
    "tagline": "Documenting a discharge from a storm drain: sheen, colour and flow noted, a grab taken from the bank in the right preserved bottle, GPS and time logged, a photo taken with a scale in frame, the Regional Water Board and the city hotline both notified — and the patrol never once in the water",
    "accent": 13792347,
    "accentCss": "#d2745b",
    "parSeconds": 270,
    "badge": {
      "id": "record-that-holds",
      "name": "Record That Holds",
      "note": "A dry-boots documentation an inspector can act on — the right bottle, a scaled photo, both hotlines called"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Patrol Record",
      "currency": "REPORT",
      "ranks": [
        "Patrol Member",
        "Documentation Lead",
        "Patrol Coordinator",
        "Complaint Steward",
        "Patrol Record Certified"
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
    "id": "motor-control-center",
    "index": "188",
    "domain": "Energy",
    "trade": "Inside wireman — IBEW",
    "category": "Energy & Power",
    "certification": "IBEW inside wireman; NFPA 70E arc-flash risk assessment and PPE category; OSHA 29 CFR 1910.147 control of hazardous energy and 1910.333 electrical safe work practices",
    "name": "Motor Control Center",
    "weather": "overcast",
    "indoor": "plant",
    "district": null,
    "title": "SmartCiti.X~ Motor Control Center VR",
    "tagline": "Racking a bucket out of a live motor control centre: label, PPE, disconnect, remote rack, proven dead, inspected, racked back in",
    "accent": 15901243,
    "accentCss": "#f2a23b",
    "parSeconds": 255,
    "badge": {
      "id": "bucket-cleared",
      "name": "Bucket Cleared",
      "note": "A bucket racked out with the remote tool, proven dead, inspected and racked back in with nothing skipped"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Panel Authority",
      "currency": "AMP",
      "ranks": [
        "Apprentice Wireman",
        "Journeyman Wireman",
        "Panel Technician",
        "Panel Lead",
        "Panel Authority Certified"
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
    "id": "arc-flash-label-study",
    "index": "189",
    "domain": "Energy",
    "trade": "Inside wireman — IBEW",
    "category": "Energy & Power",
    "certification": "IBEW inside wireman; NFPA 70E-2021 arc-flash risk assessment and hazard labeling; NFPA 70 (National Electrical Code); ANSI Z535.4 safety sign and label format; OSHA 29 CFR 1910.132/.335 for the field verification",
    "name": "Arc-Flash Label Study",
    "weather": "overcast",
    "indoor": "plant",
    "district": null,
    "title": "SmartCiti.X~ Arc-Flash Label Study VR",
    "tagline": "One-line to label: fault current, clearing time, incident energy, boundaries, printed and posted",
    "accent": 8316671,
    "accentCss": "#7ee6ff",
    "parSeconds": 260,
    "badge": {
      "id": "label-issued",
      "name": "Label Issued",
      "note": "A label built from the actual study data, printed and placed on the panel it was calculated for"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Study Authority",
      "currency": "CAL",
      "ranks": [
        "Apprentice Wireman",
        "Journeyman Wireman",
        "Field Data Tech",
        "Study Lead",
        "Study Authority Certified"
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
    "id": "temporary-site-power",
    "index": "190",
    "domain": "Energy",
    "trade": "Inside wireman — IBEW",
    "category": "Energy & Power",
    "certification": "IBEW inside wireman; OSHA 29 CFR 1926.404 (wiring design and protection) and 1926.405 (wiring methods, temporary wiring); NFPA 70 Article 590 temporary installations",
    "name": "Temporary Site Power",
    "weather": "rain",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Temporary Site Power VR",
    "tagline": "Standing up construction power: panel grounded, GFCI on every receptacle, the AEGCP schedule, cords clear of traffic and water",
    "accent": 5884283,
    "accentCss": "#59c97b",
    "parSeconds": 250,
    "badge": {
      "id": "site-power-certified",
      "name": "Site Power Certified",
      "note": "A temporary service grounded, GFCI-protected, AEGCP-current and walked clean at the end of the shift"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Site Power Authority",
      "currency": "VOLT",
      "ranks": [
        "Apprentice Wireman",
        "Journeyman Wireman",
        "Site Electrician",
        "Site Lead",
        "Site Power Authority Certified"
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
    "id": "reefer-yard-monitoring",
    "index": "182",
    "domain": "Maritime",
    "trade": "Reefer mechanic — ILWU",
    "category": "Maritime & Ports",
    "certification": "ILWU — OSHA 29 CFR 1918 marine terminal safety; OSHA 29 CFR 1910.147 lockout/tagout for isolating a faulted unit; EPA Clean Air Act Section 608 refrigerant-management and technician-certification requirements",
    "name": "Reefer Yard Monitoring",
    "weather": "fog",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Reefer Yard Monitoring VR",
    "tagline": "Night walk of the reefer rack: ground proven before the plug goes in, set point and return air read against the manifest, an alarming unit investigated, a refrigerant leak isolated, and the row kept clear of the reach stacker working it",
    "accent": 6277597,
    "accentCss": "#5fc9dd",
    "parSeconds": 300,
    "badge": {
      "id": "row-walked-clean",
      "name": "Row Walked Clean",
      "note": "Every unit proven, one alarm read before it was silenced, one leak isolated before anyone else got near it — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Reefer Row",
      "currency": "FROST",
      "ranks": [
        "Yard Hand",
        "Reefer Tech",
        "Lead Reefer Mechanic",
        "Chief Reefer Mechanic",
        "Reefer Row Certified"
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
    "id": "straddle-carrier-ops",
    "index": "183",
    "domain": "Maritime",
    "trade": "Straddle carrier operator — ILWU",
    "category": "Maritime & Ports",
    "certification": "ILWU — OSHA 29 CFR 1918 marine terminal safety for mobile cargo-handling equipment; the corner-casting and twist-lock dimensions set by ISO; the carrier manufacturer's rated capacity and wind-limit plate",
    "name": "Straddle Carrier Ops",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Straddle Carrier Ops VR",
    "tagline": "A straddle carrier shift: pre-op walk-around, seat belt and cab check, the pedestrian-exclusion call, twist-locks proven before the lift, the row run with the load carried low, the wind limit read, and the park-up",
    "accent": 14983482,
    "accentCss": "#e4a13a",
    "parSeconds": 300,
    "badge": {
      "id": "row-run-clean",
      "name": "Row Run Clean",
      "note": "Every lock proven, the load carried low the whole row, and the wind read before it mattered — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Straddle Gang",
      "currency": "SPAN",
      "ranks": [
        "Ground Hand",
        "Straddle Trainee",
        "Straddle Operator",
        "Lead Operator",
        "Straddle Gang Certified"
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
    "id": "hazmat-container-inspection",
    "index": "184",
    "domain": "Maritime",
    "trade": "Marine clerk — ILWU, with the Coast Guard's inspection standard",
    "category": "Maritime & Ports",
    "certification": "ILWU marine clerks — U.S. Coast Guard regulations for waterfront facilities handling dangerous cargo (33 CFR Part 126); IMO's International Maritime Dangerous Goods (IMDG) Code placarding and segregation rules; OSHA HAZWOPER 29 CFR 1910.120 hazard recognition",
    "name": "Hazmat Container Inspection",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Hazmat Container Inspection VR",
    "tagline": "A dangerous-goods box on the apron: placards checked against the declaration, IMDG segregation confirmed, the seal verified, a leak found through the door seam from a safe standoff, the box isolated, and the terminal and the Coast Guard notified",
    "accent": 14191162,
    "accentCss": "#d88a3a",
    "parSeconds": 300,
    "badge": {
      "id": "apron-cleared",
      "name": "Apron Cleared",
      "note": "Declaration matched, segregation held, a leak found from a safe standoff and isolated before anyone got closer — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Dangerous Goods Desk",
      "currency": "MANIFEST",
      "ranks": [
        "Checker",
        "Marine Clerk",
        "Senior Clerk",
        "Lead Clerk",
        "Dangerous Goods Certified"
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
    "id": "formwork-shoring",
    "index": "191",
    "domain": "Construction",
    "trade": "Carpenter — UBC",
    "category": "Construction & Structural Trades",
    "certification": "United Brotherhood of Carpenters shoring and forming standards; OSHA 29 CFR 1926 Subpart Q concrete and masonry construction — 1926.703 requirements for formwork and shoring; ACI 347 Guide to Formwork for Concrete; ANSI A10.9 concrete and masonry construction safety; the engineer of record's shoring and reshoring drawings",
    "name": "Formwork Shoring",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Formwork Shoring VR",
    "tagline": "Shoring a slab to the engineer's drawings: mudsills and post shores to the layout, stringers and joists, every shore plumbed and pinned, the reshoring plan read, the pour held for sign-off, and stripping in the sequence the drawing sets",
    "accent": 13214571,
    "accentCss": "#c9a36b",
    "parSeconds": 290,
    "badge": {
      "id": "deck-certified",
      "name": "Deck Certified",
      "note": "A shoring bay built to the drawing, plumbed, pinned and reshored on the engineer's own sequence — signed off before the first yard went in"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Shoring Authority",
      "currency": "PROP",
      "ranks": [
        "Apprentice",
        "Formsetter",
        "Journeyman Carpenter",
        "Shoring Foreman",
        "Shoring Authority Certified"
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
    "id": "mass-timber-panel-set",
    "index": "192",
    "domain": "Construction",
    "trade": "Carpenter — UBC, with the IUOE crane operator",
    "category": "Construction & Structural Trades",
    "certification": "UBC carpenters — mass timber erection crew; IUOE mobile crane operators, NCCCO certified; OSHA 29 CFR 1926 Subpart CC cranes and derricks — 1926.1425 keeping employees clear of suspended loads; OSHA 29 CFR 1926 Subpart M fall protection — 1926.501; ASME B30.9 slings; APA and WoodWorks mass timber erection guidance on temporary bracing before the crane releases the panel",
    "name": "Mass Timber Panel Set",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Mass Timber Panel Set VR",
    "tagline": "Setting a CLT panel: the pick plan and rigging inspected, tag lines on both ends, the panel flown and landed on its bearing, temporary bracing before the hook comes off, the connection schedule driven, and the deck kept clear under the load the whole time",
    "accent": 5220568,
    "accentCss": "#4fa8d8",
    "parSeconds": 300,
    "badge": {
      "id": "panel-set",
      "name": "Panel Set",
      "note": "A CLT panel picked, flown, landed and braced before the hook came off, with nobody ever under the load"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Panel Set Authority",
      "currency": "SPAN",
      "ranks": [
        "Apprentice",
        "Carpenter",
        "Lead Setter",
        "Panel Foreman",
        "Panel Set Authority Certified"
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
    "id": "masonry-silica-scaffold",
    "index": "193",
    "domain": "Construction",
    "trade": "Bricklayer — BAC, with the mason tender",
    "category": "Construction & Structural Trades",
    "certification": "International Union of Bricklayers and Allied Craftworkers apprenticeship standards; OSHA 29 CFR 1926.1153 respirable crystalline silica — Table 1 for stationary masonry saws; OSHA 29 CFR 1926 Subpart L scaffolds — 1926.451 platforms, guardrails and access; NIOSH silicosis prevention guidance for the masonry trades",
    "name": "Masonry Silica Scaffold",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Masonry Silica Scaffold VR",
    "tagline": "Block work off a frame scaffold under the silica rule: planks, guardrails and access inspected, the saw's water proven, block cut to Table 1, the respirator where the table calls for it, mortar mixed and the course laid to the line, cleanup without dry sweeping",
    "accent": 11684143,
    "accentCss": "#b2492f",
    "parSeconds": 295,
    "badge": {
      "id": "course-certified",
      "name": "Course Certified",
      "note": "A course laid off a scaffold that was actually checked, block cut wet to Table 1, and a cleanup that never put the dust back in the air"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Masonry Authority",
      "currency": "COURSE",
      "ranks": [
        "Tender",
        "Apprentice Mason",
        "Journeyman Bricklayer",
        "Lead Mason",
        "Masonry Authority Certified"
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
    "id": "housekeeping-room-turn",
    "index": "194",
    "domain": "Culinary & Hospitality",
    "trade": "Hotel housekeeper — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "Cal/OSHA's hotel housekeeping musculoskeletal injury prevention standard, 8 CCR 3345, and the written injury-prevention plan, long-handled tools and repetitive-task limits it requires; OSHA's bloodborne pathogens standard, 29 CFR 1910.1030, for a sharp found in a room; OSHA's hazard communication standard, 29 CFR 1910.1200, and the SDS for every bathroom chemical on the cart; the IWC's Wage Order 5, the Public Housekeeping Industry order, on room quotas, rest breaks and premium pay; UNITE HERE's hotel housekeeping contract language on room assignments and a lone attendant's right to a working panic device; the hotel-worker panic-button ordinances a number of California cities have adopted at UNITE HERE's initiative for room attendants working alone.",
    "name": "Housekeeping Room Turn",
    "weather": "clear",
    "indoor": "hotel",
    "district": null,
    "title": "SmartCiti.X~ Housekeeping Room Turn VR",
    "tagline": "A guest room turned under the hotel housekeeping injury-prevention standard: cart staged, panic device tested, knock-and-announce, the bed walked rather than reached across, chemicals to the label, and the room logged against quota",
    "accent": 11569754,
    "accentCss": "#b08a5a",
    "parSeconds": 280,
    "badge": {
      "id": "clean-turn",
      "name": "Clean Turn",
      "note": "The whole room turned on time, on technique, with nothing reached across and nothing touched bare-handed"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Room Attendant",
      "currency": "ROOMS",
      "ranks": [
        "New Hire",
        "Room Attendant",
        "Section Lead",
        "Floor Supervisor",
        "Room Attendant Certified"
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
    "id": "laundry-plant-chemicals",
    "index": "195",
    "domain": "Culinary & Hospitality",
    "trade": "Hotel laundry attendant — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "OSHA's hazard communication standard, 29 CFR 1910.1200, and the SDS for every chemical the dosing system injects; OSHA's bloodborne pathogens standard, 29 CFR 1910.1030, for linen sorted off the soiled table; Cal/OSHA's Injury and Illness Prevention Program, 8 CCR 3203, and the heat-related hazard assessment a washer, a dryer and an ironer all running together put on this floor; the IWC's Wage Order 5, the Public Housekeeping Industry order, on rest breaks in a hot workroom; UNITE HERE's hotel laundry contract language on machine loads and the folding station; NFPA 96 fire protection wherever this laundry plant shares ductwork with the hotel's kitchen block.",
    "name": "Laundry Plant Chemicals",
    "weather": "clear",
    "indoor": "hotel",
    "district": null,
    "title": "SmartCiti.X~ Laundry Plant Chemicals VR",
    "tagline": "The hotel laundry plant: dosing lines checked against the SDS, the washer loaded to the scale, the ironer's guard and pull-cord proven, soiled linen sorted under the bloodborne rule, and the floor's own heat kept in check",
    "accent": 8369097,
    "accentCss": "#7fb3c9",
    "parSeconds": 290,
    "badge": {
      "id": "clean-plant",
      "name": "Clean Plant",
      "note": "Lines checked, the washer loaded to weight, the ironer's guard proven, and nothing sorted bare-handed"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Laundry Floor",
      "currency": "LOADS",
      "ranks": [
        "Sorter",
        "Machine Operator",
        "Lead Operator",
        "Floor Trainer",
        "Laundry Plant Certified"
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
    "id": "banquet-setup-lift",
    "index": "196",
    "domain": "Culinary & Hospitality",
    "trade": "Banquet setup crew — UNITE HERE Local 2",
    "category": "Culinary & Hospitality",
    "certification": "Cal/OSHA's Injury and Illness Prevention Program, 8 CCR 3203, and its hazard assessment for manual material handling and the two-person lift a banquet round table calls for; OSHA's walking-working surfaces standard, 29 CFR 1910.22, for the aisle widths and clear paths a banquet floor plan has to hold; NFPA 101, the Life Safety Code, on egress width and the aisle accessways an assembly space like a ballroom has to keep clear during a changeover; UNITE HERE's banquet-crew contract language on the setup crew's staffing levels and its lift limits.",
    "name": "Banquet Setup Lift",
    "weather": "clear",
    "indoor": "hotel",
    "district": null,
    "title": "SmartCiti.X~ Banquet Setup Lift VR",
    "tagline": "A ballroom changeover done to the plan: tables on the dolly and set with a real two-person lift, chairs stacked to the limit, the dance floor and risers locked, cords ramped, and the exits kept clear the whole time",
    "accent": 13208138,
    "accentCss": "#c98a4a",
    "parSeconds": 300,
    "badge": {
      "id": "clean-changeover",
      "name": "Clean Changeover",
      "note": "The whole room built to the plan — nothing carried alone, nothing stacked past the limit, nothing left unlocked"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Setup Crew",
      "currency": "SETUPS",
      "ranks": [
        "New Hand",
        "Setup Crew",
        "Lead Hand",
        "Floor Captain",
        "Setup Crew Certified"
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
    "id": "bridge-cable-inspection",
    "index": "185",
    "domain": "Construction",
    "trade": "Ironworker — bridge inspection, with the owner's inspector",
    "category": "Construction & Structural Trades",
    "certification": "Ironworkers (IW) bridge inspection crew; OSHA 29 CFR 1926 Subpart M fall protection and ANSI/ASSP Z359 fall-arrest systems for 100% tie-off on a moving platform; the National Bridge Inspection Standards (23 CFR 650 Subpart C) and the AASHTO Manual for Bridge Evaluation governing suspender-rope condition rating and the wire-rope rejection criteria",
    "name": "Bridge Cable Inspection",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Bridge Cable Inspection VR",
    "tagline": "A suspender rope walked from the traveller: two lanyards live, the brakes set, the wires counted against the rejection criterion, and the finding photographed before the report is signed",
    "accent": 8366271,
    "accentCss": "#7fa8bf",
    "parSeconds": 310,
    "badge": {
      "id": "rope-cleared",
      "name": "Rope Cleared",
      "note": "A suspender rope inspected from the traveller, start to finish, with two lanyards live and the wire count against the rejection criterion"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Bridge Inspection Authority",
      "currency": "SPAN",
      "ranks": [
        "Ground Hand",
        "Cable Rider",
        "Rope Inspector",
        "Lead Inspector",
        "Bridge Inspection Authority Certified"
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
    "id": "bridge-lead-containment",
    "index": "186",
    "domain": "Construction",
    "trade": "Bridge painter — IUPAT",
    "category": "Construction & Structural Trades",
    "certification": "IUPAT bridge painters; OSHA 29 CFR 1926.62 lead in construction, including baseline and periodic blood-lead surveillance; SSPC-QP 2 certified lead-paint removal contractor and the SSPC-SP 10 near-white blast standard; OSHA 1910.134 respiratory protection and annual fit testing; 40 CFR 261 (RCRA) characteristic hazardous waste D008 for lead-paint debris",
    "name": "Bridge Lead Containment",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Bridge Lead Containment VR",
    "tagline": "A truss bay fully contained over open water: pressure proven, the respirator fit-tested against the blood-lead programme, blasted to standard, and the lead waste labelled and staged before the air sample comes off the line",
    "accent": 13602634,
    "accentCss": "#cf8f4a",
    "parSeconds": 330,
    "badge": {
      "id": "truss-contained",
      "name": "Truss Contained",
      "note": "A lead-paint containment on a truss bay held start to finish on measured numbers — fit test, negative pressure, profile and the waste manifest — with nothing reaching the water below"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Bridge Coatings Authority",
      "currency": "COAT",
      "ranks": [
        "Helper",
        "Blaster",
        "Competent Person",
        "Coatings Foreman",
        "Bridge Coatings Authority Certified"
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
    "id": "deck-joint-replacement",
    "index": "187",
    "domain": "Construction",
    "trade": "Ironworker with IUOE and LIUNA under a lane closure",
    "category": "Construction & Structural Trades",
    "certification": "Ironworkers (IW), IUOE operating engineers and LIUNA laborers; the owner's lane-closure plan built to the Manual on Uniform Traffic Control Devices (MUTCD); OSHA 29 CFR 1926.1153 respirable crystalline silica, Table 1 wet-cutting method for saws",
    "name": "Deck Joint Replacement",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Deck Joint Replacement VR",
    "tagline": "An expansion joint replaced under a lane closure: the MUTCD taper and arrow board set, the cut run wet, the new joint torqued and levelled, and the header poured before the closure comes up in reverse",
    "accent": 10134701,
    "accentCss": "#9aa4ad",
    "parSeconds": 320,
    "badge": {
      "id": "joint-set",
      "name": "Joint Set",
      "note": "An expansion joint replaced under a working lane closure — taper held, cut run wet, joint torqued and levelled, header poured true"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Deck Joint Authority",
      "currency": "SPAN",
      "ranks": [
        "Flagger",
        "Deck Hand",
        "Joint Setter",
        "Crew Lead",
        "Deck Joint Authority Certified"
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
    "id": "shelter-intake-operations",
    "index": "209",
    "domain": "Emergency Services",
    "trade": "Disaster relief worker — AFSCME / LIUNA with the Red Cross volunteer workforce",
    "category": "Emergency Services",
    "certification": "NIMS/ICS through FEMA IS-100 and IS-700, worked here as the shelter's own check-in structure; the American Red Cross's shelter operations standards for registration, cot spacing and pet co-location; Title II of the ADA for the access and functional needs of residents with disabilities; OSHA 29 CFR 1910.1030 bloodborne pathogens for any first aid contact at intake; the AFSCME and LIUNA safety language covering the disaster-relief crews who staff these shelters alongside Red Cross volunteers",
    "name": "Shelter Intake Operations",
    "weather": "overcast",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Shelter Intake Operations VR",
    "tagline": "Opening a school-gym shelter: ICS check-in, private registration, intake asked once and gently, needs flagged to health, cots at spacing, family kept together, a pet area and a quiet room, and a real handover",
    "accent": 6212000,
    "accentCss": "#5ec9a0",
    "parSeconds": 320,
    "badge": {
      "id": "shelter-open",
      "name": "Shelter Open",
      "note": "Every resident registered with dignity, every need flagged, the floor run clean, and a real count handed to the next shift"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Shelter Ops",
      "currency": "REGISTER",
      "ranks": [
        "Shelter Volunteer",
        "Registration Trained",
        "Floor Lead",
        "Shelter Manager",
        "Shelter Ops Certified"
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
    "id": "damage-assessment-team",
    "index": "210",
    "domain": "Emergency Services",
    "trade": "Disaster relief worker — AFSCME / LIUNA with the Red Cross volunteer workforce",
    "category": "Emergency Services",
    "certification": "FEMA's Preliminary Damage Assessment classification for Individual Assistance — affected, minor, major and destroyed — run here under a NIMS/ICS block assignment (FEMA IS-100/IS-700); the National Electrical Safety Code (NESC) rule, matched by OSHA 29 CFR 1926.416, that any downed conductor is treated as energized until the utility itself says otherwise; the American Red Cross's disaster-assessment team protocol pairing every assessor with a buddy and routing every visibly unsafe structure to a qualified inspector instead of a walk-through; the AFSCME and LIUNA safety language covering the disaster-relief crews who run these sweeps",
    "name": "Damage Assessment Team",
    "weather": "overcast",
    "indoor": null,
    "district": "Environmental Monitoring",
    "title": "SmartCiti.X~ Damage Assessment Team VR",
    "tagline": "A post-storm block sweep: buddied and briefed, hazards found from the street, a structure classified and photographed with a GPS point, the resident met and told the truth, an unsafe structure never entered, and the record uploaded",
    "accent": 14257999,
    "accentCss": "#d98f4f",
    "parSeconds": 320,
    "badge": {
      "id": "sweep-complete",
      "name": "Sweep Complete",
      "note": "One structure classified, photographed and logged without a hazard being touched or an unsafe building entered"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Block Sweep",
      "currency": "ASSESS",
      "ranks": [
        "Assessment Trainee",
        "Field Assessor",
        "Team Lead",
        "Sector Coordinator",
        "Damage Assessment Certified"
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
    "id": "psychological-first-aid",
    "index": "211",
    "domain": "Emergency Services",
    "trade": "Disaster relief worker — AFSCME / LIUNA with the Red Cross volunteer workforce",
    "category": "Emergency Services",
    "certification": "Psychological First Aid as WHO and the National Child Traumatic Stress Network (NCTSN) publish it — look, listen, link — run here at a family assistance centre inside a NIMS/ICS structure (FEMA IS-100/IS-700); the NASW Code of Ethics and SAMHSA's trauma-informed care principles for the boundary between peer support and therapy; Title II of the ADA for the centre's own accessibility; the HIPAA baseline for any health information shared at the desk; the American Red Cross's Disaster Mental Health program and the AFSCME, LIUNA and SEIU-represented crews who staff a centre like this alongside it",
    "name": "Psychological First Aid",
    "weather": "overcast",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Psychological First Aid VR",
    "tagline": "A family assistance centre run on look, listen, link: practical needs met first, a person's own words reflected, honest information, a child kept with their parent, a real referral, and the worker's own check-in after",
    "accent": 10467544,
    "accentCss": "#9fb8d8",
    "parSeconds": 300,
    "badge": {
      "id": "held-with-care",
      "name": "Held With Care",
      "note": "Look, listen and link run clean, practical needs met first, and the boundary between support and therapy never crossed"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Family Assistance",
      "currency": "SUPPORT",
      "ranks": [
        "Centre Volunteer",
        "PFA Trained",
        "Family Support Lead",
        "Centre Coordinator",
        "Psychological First Aid Certified"
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
    "id": "structure-fire-sizeup",
    "index": "197",
    "domain": "Emergency Services",
    "trade": "Firefighter — IAFF",
    "category": "Emergency Services",
    "certification": "IAFF — NFPA 1500 fire department occupational safety and health, NFPA 1710 organization and deployment of career fire suppression, NFPA 1001 firefighter professional qualifications for the 360 and the initial line; OSHA 29 CFR 1910.134 respiratory protection, the source of the two-in two-out rule; NIMS/ICS through FEMA IS-100 and IS-700 for the incident command structure the on-scene report is given into",
    "name": "Structure Fire Size-Up",
    "weather": "smoke",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Structure Fire Size-Up VR",
    "tagline": "First-in engine at a two-storey residential fire: the 360, the on-scene report, water before entry, the mode called with the reason, two-in two-out, the initial line, and the ten-minute PAR",
    "accent": 13783851,
    "accentCss": "#d2532b",
    "parSeconds": 300,
    "badge": {
      "id": "first-in-clean",
      "name": "First-In Clean",
      "note": "A residential structure fire sized up, reported, attacked and accounted for without an unsafe action anywhere in the job"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "First-In Company",
      "currency": "COMMAND",
      "ranks": [
        "Firefighter I",
        "Firefighter II",
        "Company Officer",
        "Incident Commander",
        "First-In Certified"
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
    "id": "firefighter-rehab-sector",
    "index": "198",
    "domain": "Emergency Services",
    "trade": "Firefighter — IAFF",
    "category": "Emergency Services",
    "certification": "IAFF — NFPA 1584 rehabilitation process for members during emergency operations, NFPA 1500 fire department occupational safety and health, OSHA 29 CFR 1910.134 respiratory protection governing SCBA cylinder rotation, and NIOSH heat-stress monitoring criteria the rehab vitals are read against",
    "name": "Firefighter Rehab Sector",
    "weather": "smoke",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Firefighter Rehab Sector VR",
    "tagline": "Rehab sector at a working fire under NFPA 1584: cylinder rotation, PPE broken down, vitals read against the release criteria, cooling and hydration, a heat-stressed member held back, and the crew's own check-in",
    "accent": 3055223,
    "accentCss": "#2e9e77",
    "parSeconds": 290,
    "badge": {
      "id": "release-earned",
      "name": "Release Earned",
      "note": "Every crew through rehab met its release criteria before going back to the line, with nobody pushed through early"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Rehab Group",
      "currency": "REHAB",
      "ranks": [
        "Rehab Support",
        "Rehab Technician",
        "Rehab Manager",
        "Medical Group Supervisor",
        "Rehab Certified"
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
    "id": "wildland-urban-interface",
    "index": "199",
    "domain": "Emergency Services",
    "trade": "Firefighter — IAFF",
    "category": "Emergency Services",
    "certification": "IAFF — NFPA 1500 fire department occupational safety and health and its LCES doctrine for wildland operations, NFPA 1140 standard for wildland fire protection in the built environment, NFPA 1977 protective ensembles for wildland fire fighting, OSHA 29 CFR 1910.156 fire brigades, NWCG wildland fire behaviour and structure triage guidance, and NIMS/ICS through FEMA IS-100 for the evacuation authority a sheriff's deputy is carrying on this road",
    "name": "Wildland-Urban Interface",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Wildland-Urban Interface VR",
    "tagline": "Structure defence at a WUI fire: LCES first, the structure triaged, ember-resistant prep, the trigger points and the pull-out call, a live wind and fire-behaviour read, and a resident who will not leave handled with respect and the sheriff's authority",
    "accent": 13208111,
    "accentCss": "#c98a2f",
    "parSeconds": 310,
    "badge": {
      "id": "structure-held",
      "name": "Structure Held",
      "note": "A defensible structure prepped against embers, the trigger point respected, and the pull-out called the instant conditions changed"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Structure Group",
      "currency": "DEFENSE",
      "ranks": [
        "Wildland Crew",
        "Engine Boss",
        "Strike Team Leader",
        "Division Supervisor",
        "WUI Certified"
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
    "id": "trauma-informed-intake",
    "index": "206",
    "domain": "Emergency response",
    "trade": "Social worker — NASW / SEIU 1021",
    "category": "Emergency Services",
    "certification": "The NASW Code of Ethics on self-determination, informed consent and confidentiality; SAMHSA's six principles of a trauma-informed approach — safety, trustworthiness and transparency, peer support, collaboration and mutuality, empowerment and choice, and cultural, historical and gender issues; Psychological First Aid as published by the National Child Traumatic Stress Network and the World Health Organization; the HIPAA Privacy Rule, and the federal confidentiality rule for substance use disorder records at 42 CFR Part 2; California's mandated-reporter duties under the Child Abuse and Neglect Reporting Act and the Elder and Dependent Adult Civil Protection Act; Cal/OSHA's workplace violence prevention in health care standard, 8 CCR §3342; SEIU 1021 social services practice standards and the local's own critical-incident and peer-support language",
    "name": "Trauma-Informed Intake",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Trauma-Informed Intake VR",
    "tagline": "A first intake done as procedure: the room set so the client can see the door, permission asked before the questions, the screening paced at their pace, the reporting limits said plainly, a safety plan in their own words, a warm handoff, and the worker's own grounding after",
    "accent": 7323552,
    "accentCss": "#6fbfa0",
    "parSeconds": 330,
    "badge": {
      "id": "first-hour-held",
      "name": "First Hour Held",
      "note": "A first intake where the room, the words and the pace all belonged to the client, and the worker checked in on themselves before the next one"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "First Contact",
      "currency": "TRUST",
      "ranks": [
        "Intake Trainee",
        "Case Aide",
        "Social Worker",
        "Lead Clinician Partner",
        "Trauma-Informed Certified"
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
    "id": "crisis-line-shift",
    "index": "207",
    "domain": "Emergency response",
    "trade": "Crisis counsellor",
    "category": "Emergency Services",
    "certification": "CIT International's crisis intervention team model for the collaboration between a crisis line and responding officers; SAMHSA's principles of a trauma-informed approach and its national guidelines for behavioral health crisis care; Psychological First Aid as published by the National Child Traumatic Stress Network and the World Health Organization; the 988 Suicide and Crisis Lifeline's own standards for risk assessment, collaborative safety planning, means safety and imminent-risk intervention; the CDC's technical package for suicide prevention, which is where means safety as a population measure comes from; the NASW Code of Ethics; the HIPAA Privacy Rule and, where substance use is part of the call, 42 CFR Part 2; Cal/OSHA's Injury and Illness Prevention Program, 8 CCR §3203, under which the centre's own fatigue and debrief rules sit; SEIU 1021 crisis-worker practice standards",
    "name": "Crisis Line Shift",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Crisis Line Shift VR",
    "tagline": "One call on a crisis line: the opening then off the script, the risk questions asked directly, reflective listening, a safety plan built with the caller, means safety and the silence after it, the dispatch decision said out loud before it happens, the record, and the consult afterwards",
    "accent": 9411304,
    "accentCss": "#8f9ae8",
    "parSeconds": 330,
    "badge": {
      "id": "stayed-on-the-line",
      "name": "Stayed On The Line",
      "note": "A hard call worked all the way through — asked directly, planned together, said out loud, written down, and taken to a supervisor afterwards"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Line Watch",
      "currency": "CALLS",
      "ranks": [
        "Line Trainee",
        "Crisis Counsellor",
        "Senior Counsellor",
        "Shift Lead",
        "Crisis Line Certified"
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
    "id": "home-visit-safety",
    "index": "208",
    "domain": "Emergency response",
    "trade": "Social worker — NASW / SEIU 1021",
    "category": "Emergency Services",
    "certification": "The NASW Code of Ethics on self-determination, informed consent and the worker's duty to their own safety; NASW's own guidance on safety in the field for social workers making unaccompanied visits; SAMHSA's trauma-informed principles applied to a family's own home, where the worker is the visitor; Psychological First Aid as published by the National Child Traumatic Stress Network and the World Health Organization; California's mandated-reporter duties under the Child Abuse and Neglect Reporting Act; the HIPAA Privacy Rule, which is what governs how much of a family's information may be said out loud in front of a neighbour, a landlord or a second adult who walks in, and the federal confidentiality rule for substance use disorder records at 42 CFR Part 2 where that is part of the file; Cal/OSHA's Injury and Illness Prevention Program, 8 CCR §3203, under which a county's lone-worker and check-in procedure sits, together with the workplace violence prevention duties added by SB 553; CIT International's crisis intervention model for the point where a visit becomes a call for help; SEIU 1021 social services practice standards, including the local's field-safety and check-in language",
    "name": "Home Visit Safety",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Home Visit Safety VR",
    "tagline": "One unaccompanied home visit: the address, the check-in times and the word for send help agreed first, the dog and the way out read on the approach, asked in rather than walked in, the child at eye level, the home observed not inspected, anger met with calm and choices, out when the plan says, and the loop closed from the car",
    "accent": 14723178,
    "accentCss": "#e0a86a",
    "parSeconds": 340,
    "badge": {
      "id": "loop-closed",
      "name": "Loop Closed",
      "note": "A visit somebody else always knew the shape of: planned, checked in, ended on the plan's terms, and closed out from the car"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Field Visit",
      "currency": "FIELD",
      "ranks": [
        "Field Trainee",
        "Case Aide",
        "Social Worker",
        "Field Supervisor",
        "Home Visit Certified"
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
    "id": "crisis-intervention-call",
    "index": "203",
    "domain": "Emergency Services",
    "trade": "Police officer — crisis intervention team",
    "category": "Emergency Services",
    "certification": "CIT International's crisis intervention team model — the forty-hour curriculum, the co-responder clinician, and a crisis stabilisation unit as a destination that is not a jail; the Americans with Disabilities Act (ADA) title II duty to accommodate a person's disability, mental illness included, during a police contact; the state's emergency psychiatric hold as the county behavioural health authority that runs the stabilisation unit administers it — named as the body rather than as a section quoted from memory; SAMHSA's trauma-informed care principles and Psychological First Aid (NCTSN and WHO) for what is actually said on the step; NIMS/ICS through FEMA IS-100 for the unified command a police and clinician co-response works inside; OSHA 29 CFR 1910.1030 for the moment any contact breaks skin; the police officers' association and FOP contract language that puts peer support after a call like this one",
    "name": "Crisis Intervention Call",
    "weather": "overcast",
    "indoor": null,
    "district": "Emergency Services",
    "title": "SmartCiti.X~ Crisis Intervention Call VR",
    "tagline": "A porch, a person in crisis and twenty minutes: the approach slowed, one voice, the gap held, time given, choices offered — and a stabilisation unit instead of a booking cell",
    "accent": 5941734,
    "accentCss": "#5aa9e6",
    "parSeconds": 360,
    "badge": {
      "id": "one-voice-held",
      "name": "One Voice",
      "note": "The whole call run at walking pace and speaking volume, with a voluntary transport at the end of it"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Slow Is Fast",
      "currency": "RAPPORT",
      "ranks": [
        "Patrol Officer",
        "CIT Trained",
        "Crisis Team Officer",
        "Co-Response Lead",
        "CIT Instructor"
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
    "id": "critical-incident-debrief",
    "index": "204",
    "domain": "Emergency Services",
    "trade": "Police officer — crisis intervention team",
    "category": "Emergency Services",
    "certification": "NFPA 1500's member assistance and behavioural-health programme requirement, applied the way a police or fire department applies it to critical-incident stress; the critical incident stress management model published by the International Critical Incident Stress Foundation — peer support as the first contact, a defusing inside the first hours, a formal debriefing a day to three days out; SAMHSA's trauma-informed care principles and Psychological First Aid (NCTSN and WHO); the Americans with Disabilities Act (ADA) rule that keeps an employer's fitness-for-duty medical inquiry separate from, and confidential from, an employee's support conversation; HIPAA for the records the employee assistance programme's clinician keeps, which the department does not get to read; OSHA's General Duty Clause as the only federal hook a department has on a psychological hazard; NIMS/ICS through FEMA IS-100 for the incident this shift has just come off; the officers' association and FOP contract language establishing the peer-support team and the chaplaincy",
    "name": "Critical Incident Debrief",
    "weather": "overcast",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Critical Incident Debrief VR",
    "tagline": "The quiet room four hours after: the signs named, the door closed, the rule said out loud, three questions in order — and the fitness-for-duty question kept out of it",
    "accent": 9418968,
    "accentCss": "#8fb8d8",
    "parSeconds": 345,
    "badge": {
      "id": "same-side-of-the-table",
      "name": "Same Side of the Table",
      "note": "A defusing run as a defusing — confidentiality stated, nothing promised that could not be kept, and a follow-up on the calendar"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Peer Contact",
      "currency": "TRUST",
      "ranks": [
        "Officer",
        "Peer Support Trained",
        "Peer Team Member",
        "Team Coordinator",
        "CISM Instructor"
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
    "id": "traffic-incident-management",
    "index": "205",
    "domain": "Emergency Services",
    "trade": "Police officer with fire and DOT under the traffic incident management plan",
    "category": "Emergency Services",
    "certification": "The MUTCD's temporary traffic control for incident management — the advance warning area, a merging taper computed from the lane width and the posted speed, and a buffer space nobody works inside; the national Traffic Incident Management responder training the Federal Highway Administration sponsors, which is where the quick-clearance and unified-command language in this station comes from; ANSI/ISEA 107 high-visibility safety apparel, worn by every responder in the right-of-way; NFPA 1500 for fire-apparatus positioning and member safety on a roadway incident; OSHA 29 CFR 1910.132 for the hazard assessment behind that vest; NIMS/ICS through FEMA IS-100 and IS-700 for the unified command police, fire, EMS and the state transportation department actually work inside; the state transportation department's own open-roads policy on clearance times",
    "name": "Traffic Incident Management",
    "weather": "rain",
    "indoor": null,
    "district": "Emergency Services",
    "title": "SmartCiti.X~ Traffic Incident Management VR",
    "tagline": "Wet shoulder, live lane: the block set upstream, the taper built for the posted speed, the engine shielding, the driver kept out of the lane — and the lane given back",
    "accent": 15901243,
    "accentCss": "#f2a23b",
    "parSeconds": 375,
    "badge": {
      "id": "lane-given-back",
      "name": "Lane Given Back",
      "note": "Blocked, tapered, shielded and cleared — nobody in the buffer, and the lane reopened on the plan's clock"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Open Roads",
      "currency": "CLEARANCE",
      "ranks": [
        "Patrol Officer",
        "TIM Trained",
        "Scene Commander",
        "Unified Command",
        "TIM Instructor"
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
    "id": "cardiac-arrest-pit-crew",
    "index": "200",
    "domain": "Emergency Services",
    "trade": "Paramedic — IAFF EMS",
    "category": "Emergency Services",
    "certification": "The American Heart Association's high-performance pit-crew CPR model and its Basic and Advanced Life Support sequence; NFPA 1584 on rehabilitation and the scheduled physical rotation it is built to protect against; the county EMS agency's medical control protocol governing drug timing and the termination-of-resuscitation call, following the National Association of EMS Physicians' position statement on the subject; OSHA 29 CFR 1910.1030 bloodborne pathogens for every hands-on contact and every used sharp; IAFF and IAEP fire-based EMS crews as the workforce; NIMS/ICS through FEMA IS-100 for the incident structure a second-arriving unit steps into.",
    "name": "Cardiac Arrest — Pit Crew",
    "weather": "clear",
    "indoor": "hotel",
    "district": null,
    "title": "SmartCiti.X~ Cardiac Arrest — Pit Crew VR",
    "tagline": "High-performance pit-crew CPR: roles on arrival, compressions that never stop, the swap called on time, and the family met at the door",
    "accent": 14701130,
    "accentCss": "#e0524a",
    "parSeconds": 300,
    "badge": {
      "id": "pit-crew-clean",
      "name": "Pit Crew Clean",
      "note": "A full arrest run with the roles held, the depth never allowed to drift uncaught, and the family met calmly at the door"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Resuscitation Command",
      "currency": "ROSC",
      "ranks": [
        "EMT Basic",
        "Paramedic Trainee",
        "Pit Crew Certified",
        "Code Commander",
        "ROSC Certified"
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
    "id": "overdose-response-naloxone",
    "index": "201",
    "domain": "Emergency Services",
    "trade": "EMT — NAGE/AFSCME EMS local",
    "category": "Emergency Services",
    "certification": "The FDA-approved naloxone product labeling for intranasal dosing, onset and repeat-dose timing; the CDC's guidance on opioid overdose response and take-home naloxone programmes; the NHTSA National EMS Scope of Practice for EMT-level naloxone administration and rescue breathing; OSHA 29 CFR 1910.1030 bloodborne pathogens for every sharps and body-fluid exposure on scene; NAGE and AFSCME EMS locals as the workforce's unions; SAMHSA's overdose-prevention and harm-reduction guidance for the referral this call closes on.",
    "name": "Overdose Response — Naloxone",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Overdose Response — Naloxone VR",
    "tagline": "An opioid overdose reversed in a restroom stall: the sharps check, rescue breaths, naloxone timed against renarcotization, and the harm-reduction handoff",
    "accent": 5941472,
    "accentCss": "#5aa8e0",
    "parSeconds": 280,
    "badge": {
      "id": "reversal-clean",
      "name": "Reversal Clean",
      "note": "A full reversal run with the sharps cleared, the second stop in breathing caught, and the referral actually handed over"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Overdose Response",
      "currency": "NARCAN",
      "ranks": [
        "EMT Basic",
        "Reversal Trained",
        "Field Certified",
        "Crew Lead",
        "Harm Reduction Certified"
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
    "id": "ambulance-scene-safety",
    "index": "202",
    "domain": "Emergency Services",
    "trade": "EMT — NAGE/AFSCME EMS local",
    "category": "Emergency Services",
    "certification": "NFPA 1500 for fire and EMS occupational safety, including its requirements for operations at roadway incidents — the apparatus placed as a block, the buffer and the advance taper — and NFPA's automotive ambulance standard for the vehicle itself; ANSI/ISEA 107 high-visibility safety apparel for responders working roadside; OSHA 29 CFR 1910.132 personal protective equipment and 29 CFR 1910.1030 bloodborne pathogens; NREMT certification at the EMT level; NAGE and AFSCME EMS locals as the workforce's unions; the department's own fatigue and duty-hour policy for the fitness-to-drive check at the end of a 24-hour shift.",
    "name": "Ambulance Scene Safety",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Ambulance Scene Safety VR",
    "tagline": "A night roadside call: the ambulance as the block, the light pattern, the cone taper, an agitated occupant approached from the protected side, and the fatigue check at the end of a 24-hour shift",
    "accent": 15909195,
    "accentCss": "#f2c14b",
    "parSeconds": 300,
    "badge": {
      "id": "shoulder-safe",
      "name": "Shoulder Safe",
      "note": "A full roadside call worked with the block, the taper and the approach all held, and the crew fit to drive home"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Scene Command",
      "currency": "BLOCK",
      "ranks": [
        "EMT Basic",
        "Field Trained",
        "Scene Safety Certified",
        "Field Training Officer",
        "Struck-By Certified"
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
    "id": "dental-careers-pathway",
    "index": "212",
    "domain": "Dental",
    "trade": "Dental careers — assistant to hygienist to dentist",
    "category": "Dental & Oral Health",
    "certification": "The state dental practice act and its allowable-duties list for assistants and hygienists; DANB's Certified Dental Assistant components — Radiation Health and Safety, Infection Control and General Chairside — and the separate state radiography permit; programmes accredited by the Commission on Dental Accreditation (CODA); the National Board Dental Hygiene Examination and a state or regional clinical examination for hygiene licensure; the Dental Admission Test, a CODA-accredited dental school and the Integrated National Board Dental Examination for the DDS or DMD; the American Dental Assistants Association (ADAA) and the American Dental Hygienists' Association (ADHA) as the professions' bodies; the ADA on the dental team; the U.S. Bureau of Labor Statistics Occupational Outlook Handbook for current pay and hours; SEIU, UFCW and AFSCME clinic and public-health staff agreements; HIPAA for anything a student sees on a shadowing day",
    "name": "Dental Careers Pathway",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Dental Careers Pathway VR",
    "tagline": "A careers evening in the staff room: the ladder from assistant to hygienist to dentist, the credential behind each rung, where the pay-and-hours facts actually come from, and how to apply this month",
    "accent": 15775854,
    "accentCss": "#f0b86e",
    "parSeconds": 330,
    "badge": {
      "id": "plan-in-hand",
      "name": "Plan In Hand",
      "note": "The ladder read off the board, the credentials matched to their rungs, and a signed plan with a real next step on it"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Career Ladder",
      "currency": "RUNG",
      "ranks": [
        "Visitor",
        "Applicant",
        "Dental Assisting Student",
        "Credentialled Assistant",
        "Career Ladder Certified"
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
    "id": "four-handed-dentistry",
    "index": "213",
    "domain": "Dental",
    "trade": "Dental assistant — chairside (DANB CDA)",
    "category": "Dental & Oral Health",
    "certification": "DANB's Certified Dental Assistant (CDA) credential and its general chairside assisting component; the American Dental Assistants Association (ADAA) as the profession's body; the state dental practice act's allowable-duties list for assistants and any separate state permit above it; the ADA's guidance on the dental team; the CDC's Guidelines for Infection Control in Dental Health-Care Settings for instrument handling at the chair; OSHA 29 CFR 1910.1030 bloodborne pathogens and NIOSH's dental ergonomics guidance; SEIU and UFCW clinic staff agreements",
    "name": "Four-Handed Dentistry",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Four-Handed Dentistry VR",
    "tagline": "Chairside assisting as a trade: clock zones, stool heights, a tray in order of use, transfers below the chin, evacuation on hard tissue and retraction that holds a field without blanching it",
    "accent": 5814240,
    "accentCss": "#58b7e0",
    "parSeconds": 300,
    "badge": {
      "id": "second-pair-of-hands",
      "name": "Second Pair Of Hands",
      "note": "A full restorative appointment assisted from the assistant's zone with every transfer made below the patient's chin"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Chairside Craft",
      "currency": "PASS",
      "ranks": [
        "Assisting Student",
        "Chairside Assistant",
        "Certified Dental Assistant",
        "Lead Assistant",
        "Chairside Craft Certified"
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
    "id": "dental-radiography-fmx",
    "index": "214",
    "domain": "Dental",
    "trade": "Dental assistant — radiographer (DANB RHS)",
    "category": "Dental & Oral Health",
    "certification": "DANB's Radiation Health and Safety (RHS) component and the separate state dental radiography permit the practice act requires above it; the ADA and FDA's patient-selection recommendations for dental radiographic examinations; the ALARA principle and the state radiation control programme's own operator rules; the CDC's Guidelines for Infection Control in Dental Health-Care Settings for receptor barriers and holder reprocessing; OSHA 29 CFR 1910.1030; the American Dental Assistants Association (ADAA) as the profession's body; SEIU and UFCW clinic staff agreements",
    "name": "Full-Mouth Radiographic Series",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Full-Mouth Radiographic Series VR",
    "tagline": "A complete series on a paralleling instrument: holder assembled, sensor sheathed and seated, factors set for this patient, tubehead square to the ring, region order worked, retakes decided by rule",
    "accent": 15245628,
    "accentCss": "#e8a13c",
    "parSeconds": 320,
    "badge": {
      "id": "series-complete",
      "name": "Series Complete",
      "note": "A full-mouth series taken with the patient shielded, the factors set for them, and every retake justified in the exposure record"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Receptor Discipline",
      "currency": "VIEW",
      "ranks": [
        "Radiography Student",
        "Permitted Operator",
        "Series Radiographer",
        "Imaging Lead",
        "Receptor Discipline Certified"
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
    "id": "sterilisation-technician-cycle",
    "index": "215",
    "domain": "Dental",
    "trade": "Sterile processing technician — dental instruments",
    "category": "Dental & Oral Health",
    "certification": "DANB's Infection Control (ICE) component and, where the office requires it, a sterile processing technician certification (CRCST / CBSPD); ANSI/AAMI ST79 for steam sterilisation and sterility assurance in health care facilities; the CDC's Guidelines for Infection Control in Dental Health-Care Settings; the FDA's reprocessing instructions that every reusable device carries; OSHA 29 CFR 1910.1030 bloodborne pathogens and 1910.1200 hazard communication; the American Dental Assistants Association (ADAA) as the profession's body; SEIU and UFCW clinic staff agreements",
    "name": "Sterilisation Centre",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Sterilisation Centre VR",
    "tagline": "The processing room as a career: one-way zones, mechanical cleaning, indicators and load numbers, a cycle chosen for the chamber, a chart read before release, a spore test with its control and a recall that can name every pack",
    "accent": 8374436,
    "accentCss": "#7fc8a4",
    "parSeconds": 310,
    "badge": {
      "id": "load-released-clean",
      "name": "Load Released Clean",
      "note": "A load carried from soiled intake to documented release with the chart read, the spore test running and the recall opened on evidence"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Sterility Assurance",
      "currency": "LOAD",
      "ranks": [
        "Processing Trainee",
        "Instrument Technician",
        "Sterile Processing Technician",
        "Processing Lead",
        "Sterility Assurance Certified"
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
    "id": "dental-lab-bench",
    "index": "216",
    "domain": "Dental",
    "trade": "Dental laboratory technician (CDT)",
    "category": "Dental & Oral Health",
    "certification": "The National Board for Certification in Dental Laboratory Technology's Certified Dental Technician (CDT) credential and the National Association of Dental Laboratories as the trade's body; the state dental practice act, which requires a written prescription from the dentist for every case a laboratory makes; the CDC's Guidelines for Infection Control in Dental Health-Care Settings for handling incoming impressions and outgoing cases; the FDA's device requirements for what a laboratory fabricates; OSHA 29 CFR 1910.1053 respirable crystalline silica, 1910.212 machine guarding, 1910.1200 hazard communication and NIOSH's dust-control guidance; SEIU and UFCW clinic and laboratory staff agreements",
    "name": "Dental Laboratory Bench",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Dental Laboratory Bench VR",
    "tagline": "The lab bench as a trade: impressions disinfected to time, stone mixed by ratio under vacuum, models poured and trimmed wet, a lathe behind its shield, pumice changed per case and a tray made to the written prescription",
    "accent": 13149920,
    "accentCss": "#c8a6e0",
    "parSeconds": 320,
    "badge": {
      "id": "case-made-right",
      "name": "Case Made Right",
      "note": "One case carried from a disinfected impression to a finished tray with the dust controlled and the prescription honoured"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Bench Craft",
      "currency": "CASE",
      "ranks": [
        "Lab Apprentice",
        "Bench Technician",
        "Certified Dental Technician",
        "Laboratory Lead",
        "Bench Craft Certified"
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
    "id": "orthodontic-assisting",
    "index": "212",
    "domain": "Dental & Oral Health",
    "trade": "Orthodontic dental assistant",
    "category": "Dental & Oral Health",
    "certification": "DANB's Certified Orthodontic Assistant (COA) credential and the infection control and radiation health and safety components behind it; the state dental practice act's allowable-duties list for orthodontic assistants, which decides whether archwires and ligatures are placed or only passed; the American Association of Orthodontists (AAO) as the specialty's body and the American Dental Assistants Association (ADAA) as the assistants'; the CDC's Guidelines for Infection Control in Dental Health-Care Settings and its 2016 Summary; OSHA 29 CFR 1910.1030 bloodborne pathogens and 1910.1200 hazard communication for the etchant and the bonding resin; HIPAA's Privacy Rule for the chart and the progress photographs; SEIU and UFCW as the unions representing clinic staff in organised practices",
    "name": "Orthodontic Assisting",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Orthodontic Assisting VR",
    "tagline": "Bracket tray, retraction and isolation, an etch held to the label's window, bracket height on the gauge, archwire and module change with the distal ends tucked",
    "accent": 10467560,
    "accentCss": "#9fb8e8",
    "parSeconds": 270,
    "badge": {
      "id": "bracket-true",
      "name": "Bracket True",
      "note": "A full bonding and adjustment visit with the etch held to its window and every wire end accounted for"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Orthodontic Chairside",
      "currency": "ARCH",
      "ranks": [
        "Ortho Trainee",
        "Orthodontic Assistant",
        "Lead Ortho Assistant",
        "Clinical Coordinator",
        "Certified Orthodontic Assistant"
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
    "id": "oral-surgery-assisting",
    "index": "213",
    "domain": "Dental & Oral Health",
    "trade": "Oral and maxillofacial surgery assistant",
    "category": "Dental & Oral Health",
    "certification": "DANB's Certified Oral and Maxillofacial Surgery Assistant (COMSA) credential, and AAOMS's Dental Anesthesia Assistant National Certification Examination (DAANCE) for the monitoring role; the American Association of Oral and Maxillofacial Surgeons' office anesthesia guidance and its office anesthesia evaluation; the state dental practice act's allowable-duties list for surgical and anesthesia assistants; the American Dental Assistants Association (ADAA) as the profession's body; the CDC's Guidelines for Infection Control in Dental Health-Care Settings and its 2016 Summary for surgical asepsis; OSHA 29 CFR 1910.1030 bloodborne pathogens, including its sharps and specimen-labelling provisions; HIPAA's Privacy Rule for the operative record; SEIU and UFCW as the unions representing clinic staff in organised practices",
    "name": "Oral Surgery Assisting",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Oral Surgery Assisting VR",
    "tagline": "Time-out, surgical asepsis and draping, suction and retraction, a sedation readback, specimen and sharps handling, and post-op instructions that survive the sedation",
    "accent": 8374710,
    "accentCss": "#7fc9b6",
    "parSeconds": 290,
    "badge": {
      "id": "field-held",
      "name": "Field Held",
      "note": "A sedated surgical extraction assisted with the field sterile, the airway watched and every sharp accounted for"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Surgical Assisting",
      "currency": "SUTURE",
      "ranks": [
        "Surgical Trainee",
        "Surgery Assistant",
        "Lead Surgical Assistant",
        "Anesthesia Assistant",
        "Certified Surgery Assistant"
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
    "id": "front-office-treatment-coordination",
    "index": "214",
    "domain": "Dental & Oral Health",
    "trade": "Dental front office treatment coordinator",
    "category": "Dental & Oral Health",
    "certification": "HIPAA's Privacy Rule and Security Rule, including the minimum-necessary standard, the requirement for reasonable safeguards at an open counter, and the right of access that sets an outer limit on answering a patient's own records request; the ADA's Code on Dental Procedures and Nomenclature (CDT) as the only source for the procedure code that goes on a claim; the state dental practice act on who may present a treatment plan and who must obtain the informed consent behind it; the American Dental Assistants Association (ADAA) for the administrative and chairside credential path; the federal Truth in Lending Act's disclosure requirements for any in-office financing agreement; OSHA 29 CFR 1910.1030 bloodborne pathogens, which covers front-office staff who handle a contaminated chart or a specimen hand-off; SEIU and UFCW as the unions representing clinic and front-office staff in organised practices",
    "name": "Front Office & Treatment Coordination",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Front Office & Treatment Coordination VR",
    "tagline": "Privacy at an open counter and on the phone, a pre-authorisation built on a real code, a plan presented behind a door, payment options without pressure, and a records request answered right",
    "accent": 14722147,
    "accentCss": "#e0a463",
    "parSeconds": 280,
    "badge": {
      "id": "desk-discipline",
      "name": "Desk Discipline",
      "note": "A morning at the desk with nothing disclosed that did not have to be and nothing coded from memory"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Front Office Practice",
      "currency": "LEDGER",
      "ranks": [
        "Front Desk Trainee",
        "Scheduling Coordinator",
        "Insurance Coordinator",
        "Treatment Coordinator",
        "Business Office Lead"
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
    "id": "infection-control-audit",
    "index": "215",
    "domain": "Dental & Oral Health",
    "trade": "Dental infection prevention coordinator",
    "category": "Dental & Oral Health",
    "certification": "The CDC's Guidelines for Infection Control in Dental Health-Care Settings (2003), its 2016 Summary, and the CDC's Infection Prevention Checklist for Dental Settings, which is the document this audit is actually walking; the CDC's recommendation that dental unit water for non-surgical procedures meet the EPA's regulatory standard for drinking water of no more than 500 CFU/mL of heterotrophic water bacteria, and that sterilisers be biologically monitored at least weekly; OSHA 29 CFR 1910.1030 bloodborne pathogens — the written exposure control plan, engineering controls, sharps containers and the sharps injury log — and 1910.1200 hazard communication for the disinfectants and waterline treatments; EPA registration of those surface disinfectants and waterline products, whose own labels set the contact and dwell times; DANB's Certified Dental Assistant infection control component; the ADA and the American Dental Assistants Association (ADAA); the state dental board, which inspects against the same guidance; SEIU and UFCW as the unions representing clinic staff in organised practices",
    "name": "Infection Control Audit",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Infection Control Audit VR",
    "tagline": "The CDC checklist walked through a whole clinic: hand hygiene, PPE, barriers, waterlines sampled and shocked, sharps, sterilisation logs, spore records and a corrective action per finding",
    "accent": 7521504,
    "accentCss": "#72c4e0",
    "parSeconds": 300,
    "badge": {
      "id": "checklist-walked",
      "name": "Checklist Walked",
      "note": "A whole-clinic audit with every finding written up and a corrective action against each one"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Infection Prevention",
      "currency": "CFU",
      "ranks": [
        "Audit Observer",
        "Assistant Auditor",
        "Infection Control Lead",
        "Prevention Coordinator",
        "Board Inspector"
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
    "id": "school-screening-outreach",
    "index": "216",
    "domain": "Dental & Oral Health",
    "trade": "Community dental health worker",
    "category": "Dental & Oral Health",
    "certification": "The state dental practice act's public-health-setting provisions — the standing order or protocol under which a community dental health worker or hygienist may screen and apply fluoride varnish away from a dental office, and the supervision level it requires; the ADA's Community Dental Health Coordinator programme as the role's own training route; the CDC's school sealant programme guidance and its oral health surveillance work; the ASTDD (Association of State and Territorial Dental Directors) Basic Screening Survey, which is the instrument state oral health programmes report against; the AAPD's caries-risk assessment guidance for the triage; FERPA for the school's education records and HIPAA's Privacy Rule for the clinical record the screening creates; OSHA 29 CFR 1910.1030 bloodborne pathogens, which applies in a gym exactly as it does in an operatory; AFSCME and SEIU as the unions representing public-health dental staff",
    "name": "School Screening Outreach",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ School Screening Outreach VR",
    "tagline": "A school screening day: consent sorted first, stations laid out private, a basic screening by light and mirror, varnish under standing order, referrals triaged and a sealant day booked",
    "accent": 9359487,
    "accentCss": "#8ed07f",
    "parSeconds": 285,
    "badge": {
      "id": "hall-run-right",
      "name": "Hall Run Right",
      "note": "A whole screening day with consent honoured, privacy held and every referral triaged and followed up"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Community Oral Health",
      "currency": "REACH",
      "ranks": [
        "Outreach Volunteer",
        "Community Health Worker",
        "Screening Lead",
        "Programme Coordinator",
        "Oral Health Programme Lead"
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
    "id": "implant-surgery-assisting",
    "index": "212",
    "domain": "Oral and maxillofacial surgery",
    "trade": "Dental assistant — surgical assisting (DANB Certified Oral and Maxillofacial Surgery Assistant), SEIU and UFCW clinic and dental staff",
    "category": "Dental & Oral Health",
    "certification": "DANB's Certified Oral and Maxillofacial Surgery Assistant credential and the general chairside and infection-control components behind it; AAOMS guidance on the office-based surgical and anaesthesia team; the state dental practice act, which sets what a surgical assistant may place, cut or record and what only the operating dentist may; SEIU and UFCW clinic and dental staff; the CDC's Guidelines for Infection Control in Dental Health-Care Settings on surgical asepsis, sterile irrigant and instrument sterilisation; OSHA 29 CFR 1910.1030 bloodborne pathogens and 29 CFR 1910.132 personal protective equipment; NFPA 99 for the medical gas and surgical vacuum this operatory runs on",
    "name": "Implant Surgery Assisting",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Implant Surgery Assisting VR",
    "tagline": "A single-fixture implant placement from the assistant's side: sterile field, kit sequence, chilled irrigation, a torque you can read, graft handled once, and a patient who leaves knowing what failure looks like",
    "accent": 5816488,
    "accentCss": "#58c0a8",
    "parSeconds": 300,
    "badge": {
      "id": "sterile-placement",
      "name": "Sterile Placement",
      "note": "A fixture placed with the field unbroken, the kit in sequence and the seating torque read off the wrench"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Surgical Field",
      "currency": "TORQ",
      "ranks": [
        "Chairside Assistant",
        "Surgical Assistant",
        "Sterile Field Lead",
        "Implant Coordinator",
        "Surgery Certified"
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
    "id": "endodontic-assisting",
    "index": "213",
    "domain": "Endodontics",
    "trade": "Dental assistant — endodontic assisting (DANB Certified Dental Assistant), SEIU and UFCW clinic and dental staff",
    "category": "Dental & Oral Health",
    "certification": "DANB's Certified Dental Assistant credential and its infection-control component; the state dental practice act, which decides which endodontic duties an assistant may carry out and which belong to the dentist alone; AGD continuing education for the general practice that does its own root canal treatment; SEIU and UFCW clinic and dental staff; the CDC's Guidelines for Infection Control in Dental Health-Care Settings; OSHA 29 CFR 1910.1030 bloodborne pathogens, 29 CFR 1910.1200 hazard communication for the sodium hypochlorite on the bracket, 29 CFR 1910.133 eye and face protection and 29 CFR 1910.151 first aid; ANSI Z358.1 for the emergency eyewash this room has to be able to reach; ISO 23908 on sharps injury protection behind the file count",
    "name": "Endodontic Assisting",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Endodontic Assisting VR",
    "tagline": "A root canal from the assistant's side: the dam on before anything opens, a working length read off the locator, files counted both ways, hypochlorite treated as caustic, and the fill proved on a radiograph",
    "accent": 11895776,
    "accentCss": "#b583e0",
    "parSeconds": 295,
    "badge": {
      "id": "sealed-canal",
      "name": "Sealed Canal",
      "note": "A canal isolated, shaped to a measured length, filled and proved on film with every file accounted for"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Canal Discipline",
      "currency": "APEX",
      "ranks": [
        "Chairside Aide",
        "Endodontic Assistant",
        "Isolation Lead",
        "Treatment Coordinator",
        "Endodontics Certified"
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
    "id": "denture-delivery-and-adjustment",
    "index": "214",
    "domain": "Removable prosthodontics",
    "trade": "Dental assistant and dental laboratory technician — removable prosthodontics (DANB Certified Dental Assistant), SEIU and UFCW clinic, dental and laboratory staff",
    "category": "Dental & Oral Health",
    "certification": "DANB's Certified Dental Assistant credential; the state dental practice act, which lists which parts of a denture delivery an assistant may carry out and which adjustments only the dentist may make; ACP guidance on removable prosthodontic care and the prosthodontic team; the laboratory prescription the practice act requires for every case; SEIU and UFCW clinic, dental and laboratory staff; the CDC's Guidelines for Infection Control in Dental Health-Care Settings on disinfecting an appliance travelling between the laboratory and the chair; OSHA 29 CFR 1910.133 eye and face protection and 29 CFR 1910.134 respiratory protection for acrylic dust; 8 CCR 5141 on controlling a harmful exposure at its source; NIOSH guidance on local exhaust at a bench",
    "name": "Denture Delivery & Adjustment",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Denture Delivery & Adjustment VR",
    "tagline": "A finished denture handed over properly: case checked against the prescription, fit proved with paste, the spot cut under a guard and under extraction, bite checked, appliance marked, and home care an older patient can follow",
    "accent": 14721611,
    "accentCss": "#e0a24b",
    "parSeconds": 310,
    "badge": {
      "id": "seated-and-marked",
      "name": "Seated & Marked",
      "note": "A denture delivered on proof rather than on hope, adjusted safely and marked with its owner's identity"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Bench & Chair",
      "currency": "FIT",
      "ranks": [
        "Laboratory Aide",
        "Prosthetic Assistant",
        "Bench Technician",
        "Delivery Lead",
        "Prosthodontics Certified"
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
    "id": "special-needs-and-geriatric-dentistry",
    "index": "215",
    "domain": "Special care and geriatric dentistry",
    "trade": "Dental assistant and hygienist — special care and geriatric dentistry (DANB Certified Dental Assistant), SEIU and UFCW clinic and dental staff",
    "category": "Dental & Oral Health",
    "certification": "DANB's Certified Dental Assistant credential and the state dental practice act on what may be delegated during a supported appointment; Title II of the Americans with Disabilities Act on making a service reachable and on reasonable accommodation; SAMHSA's principles of trauma-informed care; SEIU and UFCW clinic and dental staff; the CDC's Guidelines for Infection Control in Dental Health-Care Settings; OSHA 29 CFR 1910.1030 bloodborne pathogens; 8 CCR 5110 on repetitive motion and the lifting injuries that end clinic careers; NIOSH guidance on moving a person with equipment rather than by hand",
    "name": "Special Needs & Geriatric Dentistry",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Special Needs & Geriatric Dentistry VR",
    "tagline": "A supported appointment: the bay reachable, the transfer done with equipment, consent taken from the patient, a swallow-safe position, a pace that stops when they say stop, and a dry mouth treated seriously",
    "accent": 8369384,
    "accentCss": "#7fb4e8",
    "parSeconds": 315,
    "badge": {
      "id": "supported-visit",
      "name": "Supported Visit",
      "note": "A whole appointment completed at the patient's pace, with the transfer and the airway both handled properly"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Supported Care",
      "currency": "CARE",
      "ranks": [
        "Clinic Aide",
        "Special Care Assistant",
        "Access Lead",
        "Geriatric Care Coordinator",
        "Special Care Certified"
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
    "id": "teledentistry-and-triage",
    "index": "216",
    "domain": "Teledentistry and triage",
    "trade": "Dental assistant — teledentistry facilitator and triage (DANB Certified Dental Assistant), SEIU and UFCW clinic and dental staff",
    "category": "Dental & Oral Health",
    "certification": "DANB's Certified Dental Assistant credential; the state dental practice act and its teledentistry provisions, which set what may be done remotely, who has to be licensed where the patient physically is, and what an assistant may record rather than diagnose; ADA policy on teledentistry, and the ADA's guidance with the FDA on when a radiograph is actually justified; HIPAA's privacy and security rules, including the business associate agreement behind any platform a practice uses; SEIU and UFCW clinic and dental staff; the CDC's Guidelines for Infection Control in Dental Health-Care Settings for the intraoral camera's barrier and reprocessing; OSHA 29 CFR 1910.1030 bloodborne pathogens; FDA-cleared devices used inside their labelled indications",
    "name": "Teledentistry & Triage",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Teledentistry & Triage VR",
    "tagline": "A virtual triage session run properly: compliant platform, private room, images worth reading, emergency criteria checked, the right level of care, and the limits of a camera said out loud",
    "accent": 5228720,
    "accentCss": "#4fc8b0",
    "parSeconds": 300,
    "badge": {
      "id": "right-level",
      "name": "Right Level of Care",
      "note": "A remote triage that sent this patient to the level of care their symptoms actually called for"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Remote Triage",
      "currency": "TRIA",
      "ranks": [
        "Intake Aide",
        "Teledentistry Facilitator",
        "Triage Lead",
        "Care Navigator",
        "Teledentistry Certified"
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
    "id": "trades-lineage-briefing",
    "index": "227",
    "domain": "Workforce readiness",
    "trade": "Pre-apprentice — warehouse, Commercial Class A driving and the union construction trades",
    "category": "Community Environmental Justice",
    "certification": "None is earned by reading a briefing. The stations that follow it are cited to the standards the work is actually held to: OSHA's general industry rules in 29 CFR 1910 for the warehouse, the Teamsters' training programmes for the dock and the cab, NIOSH guidance on long hours and shift work, SAMHSA guidance for the wellness stations, and Psychological First Aid as the Red Cross and NCTSN teach it",
    "name": "Trades Lineage Briefing",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Trades Lineage Briefing VR",
    "tagline": "The trades as a lineage — what the sponsor's own text says the programmes are, the bridge that opened in 1937, an article listed as reading rather than retold, and an honest line around what is not sourced",
    "accent": 14711359,
    "accentCss": "#e07a3f",
    "parSeconds": 300,
    "badge": {
      "id": "lineage-read",
      "name": "Lineage Read",
      "note": "The sourced text, the date, the unread article and the standard all answered without an unsafe conclusion"
    },
    "stepCount": 8,
    "interruptCount": 0,
    "flat": true,
    "dossier": [
      {
        "title": "What the programmes are, in the sponsor's own words",
        "body": "The organisation is referred to here by its domain, wojrc.org. Everything this edition says about it is the text the sponsor supplied from that site, quoted without change: \"Everyone who is willing to work hard deserves an opportunity to succeed. For the past 14 years, we have been helping low-income Bay Area residents' gain the skills and confidence they need to get and keep jobs, and build financial security that support themselves and their families.\" And, under How We Help: \"We offer training for warehouse and Commercial A truck driver positions. We prepare you and help you navigate and enroll in union construction trades apprenticeship programs. We offer financial coaching to help build your credit score, reduce debt, and build savings.\" Two page titles are also sourced: \"TDL Pre-Apprenticeship Training\" and \"Wellness Resource Center\". Nothing else about the organisation could be fetched from the environment this station was written in, and nothing else is stated.",
        "source": {
          "label": "wojrc.org — text supplied by the sponsor of this edition",
          "url": "https://wojrc.org/"
        }
      },
      {
        "title": "Who runs the programmes, as far as this edition can say",
        "body": "Joyce Guy is named by the sponsor of this edition as the person who runs the programmes. That is the whole of what is sourced: no title, no biography, no quotation and no history are attached to the name here, because none was supplied and none could be fetched. A learner who wants to know more asks the programme, not this briefing.",
        "source": {
          "label": "wojrc.org — text supplied by the sponsor of this edition",
          "url": "https://wojrc.org/"
        }
      },
      {
        "title": "A lineage, not a ladder",
        "body": "The Golden Gate Bridge opened in 1937. The people who built it worked in the trades this edition prepares people for: ironwork and rigging, welding, labouring, operating, driving what had to be driven. Those trades are still taught the way they were taught then — a journey-level worker beside an apprentice, a skill handed down on the job under a written standard, a card or a licence earned rather than assumed. That is what this edition means by a lineage: not that anyone here built the bridge, but that a pre-apprentice loading a trailer, a Class A trainee doing a pre-trip inspection, and an apprentice on their first day at a union hall are standing in a line of people who did this work before them and were trained to do it safely. The bridge is the visible end of the line. The standards are the rest of it.",
        "source": {
          "label": "Golden Gate Bridge Highway and Transportation District — the bridge's own site",
          "url": "https://www.goldengate.org/"
        }
      },
      {
        "title": "Recommended reading — listed, not retold",
        "body": "The sponsor linked an article from the Golden Gate National Parks Conservancy on the construction of the Golden Gate Bridge, the welding workers on it, and Black history in San Francisco. It is recommended reading for every learner who opens this edition, at the address the sponsor supplied. It could not be fetched from the environment this briefing was written in, so it is not summarised here and it is not quoted here, and no worker it may name is named here. A briefing that retold an article it had not read would be inventing a record, which is the one thing a sourced dossier must never do. Read the article itself; then the lineage in the section above has names in it, put there by the people who did the research.",
        "source": {
          "label": "Golden Gate National Parks Conservancy — the article the sponsor linked (not fetched, not summarised here)",
          "url": "https://www.parksconservancy.org/article/golden-gate-bridge-construction-welding-workers-black-history-san-francisco"
        }
      },
      {
        "title": "What this edition trains, and what it is not",
        "body": "Four blocks follow this briefing, each a procedure with its standard: the TDL pre-apprenticeship's warehouse work (the forklift and pallet jack under OSHA's powered industrial truck standard, 29 CFR 1910.178; dock and trailer loading; picking, packing and scanning; hazmat labelling under 49 CFR 172; racking and load limits; the NIOSH lifting equation) and its Commercial Class A driving (the pre-trip, the air-brake test, coupling, backing, cargo securement under 49 CFR 393, hours of service and the electronic log under 49 CFR 395, the roadside inspection, and the entry-level driver training rule in 49 CFR 380 Subpart F); navigating and enrolling in a union construction apprenticeship; financial coaching that builds credit, reduces debt and builds savings, with the consumer bodies named and no tax advice given; and the Wellness Resource Center block — four walkable stations on sleep and shift work, a peer-support conversation, substance use and the job, and asking for help — each of which closes with the guide's check-in and names the peer-support and EAP resource. This edition is a training aid built to be offered to the programme. It is not the programme's own curriculum and it does not speak for the organisation.",
        "source": {
          "label": "OSHA 29 CFR 1910.178 — powered industrial trucks",
          "url": "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.178"
        },
        "source2": {
          "label": "SAMHSA — the wellness stations' guidance body",
          "url": "https://www.samhsa.gov/"
        }
      }
    ],
    "game": {
      "system": "Job Readiness",
      "currency": "SHIFT",
      "ranks": [
        "Applicant",
        "Pre-Apprentice",
        "Trainee",
        "Journey-Ready",
        "Job Ready"
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
    "id": "wellness-shift-work-sleep-and-stress",
    "index": "228",
    "domain": "Workforce readiness",
    "trade": "Warehouse and Class A pre-apprentice — Teamsters-bound",
    "category": "Community Environmental Justice",
    "certification": "NIOSH guidance on work schedules, long hours and shift work — the anchor-sleep, light, caffeine and nap practices this station scores; CDC and NIOSH training on shift work and long work hours; SAMHSA guidance on sleep, stress and substance use as connected risks; OSHA, which has no shift-length limit in 29 CFR 1910 and treats worker fatigue through its long-work-hours guidance; FMCSA's hours-of-service rule for property-carrying drivers, which the Class A block of this edition teaches and which the drive home is measured against here; the Teamsters' training programmes for the warehouse and the cab; the programme's own peer-support team and the employee assistance programme (EAP) line",
    "name": "Wellness — Shift Work, Sleep and Stress",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Wellness — Shift Work, Sleep and Stress VR",
    "tagline": "The week the roster flips to nights: the traps read off the roster, a stress check rated honestly, one block of anchor sleep held against the extra shift, the room darkened, the caffeine cut, a twenty-minute nap, and the drive home decided by a check instead of by pride",
    "accent": 7321558,
    "accentCss": "#6fb7d6",
    "parSeconds": 330,
    "badge": {
      "id": "anchor-held",
      "name": "Anchor Held",
      "note": "The anchor sleep block held against the extra shift, the caffeine and the keys, and the drive home decided by the check"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Wellness Resource Center",
      "currency": "REST",
      "ranks": [
        "Trainee",
        "Roster-Aware",
        "Anchor Sleeper",
        "Shift Steward",
        "Rested and Ready"
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
    "id": "wellness-peer-support-conversation",
    "index": "229",
    "domain": "Workforce readiness",
    "trade": "Pre-apprentice trained as a programme peer supporter",
    "category": "Community Environmental Justice",
    "certification": "Psychological First Aid as the NCTSN field guide and the Red Cross's psychological first aid course teach it — look, listen, link — applied by a peer rather than a clinician; SAMHSA's trauma-informed care principles and its guidance on peer support, including asking the direct question about suicide and the warm handoff to the 988 Suicide and Crisis Lifeline; the Sphere Handbook's minimum standard on mental health and psychosocial support, which this station's non-clinical scope is drawn from; HIPAA, for why the employee assistance programme's records stay with its clinician; NIOSH's work-organisation and stress guidance for the signs read at the start; the programme's own peer-support team and the EAP line its employer partners and the Teamsters and SEIU locals carry",
    "name": "Wellness — Peer Support Conversation",
    "weather": "overcast",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Wellness — Peer Support Conversation VR",
    "tagline": "A cohort-mate says he cannot keep doing this: the signs noticed first, the room made private, the rule said with its limits, their pace followed, the direct question asked when the words call for it, three real doors named, and the peer's own check-in after",
    "accent": 10465504,
    "accentCss": "#9fb0e0",
    "parSeconds": 340,
    "badge": {
      "id": "asked-directly",
      "name": "Asked Directly",
      "note": "A peer conversation run as one — nothing waved off, nothing promised that could not be kept, the direct question asked, and a follow-up on the calendar"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Wellness Resource Center",
      "currency": "TRUST",
      "ranks": [
        "Trainee",
        "Peer Trained",
        "Peer Supporter",
        "Cohort Lead",
        "Peer Team Coordinator"
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
    "id": "wellness-substance-use-and-the-job",
    "index": "230",
    "domain": "Workforce readiness",
    "trade": "Warehouse pre-apprentice — trainee crew lead, Teamsters-bound",
    "category": "Community Environmental Justice",
    "certification": "SAMHSA's guidance on substance use in the workplace and its national helpline, and its trauma-informed care principles for how the conversation is had; OSHA's anti-retaliation rule in 29 CFR 1904, which protects a worker who reports an injury or a hazard from a drug test used as punishment for reporting; the federal drug and alcohol testing programme for commercial drivers that FMCSA administers, taught in the Class A block and named here as the employer's process; the Americans with Disabilities Act, which protects a person in recovery and does not protect current illegal use; the federal confidentiality rule for substance use disorder treatment records, and HIPAA for the employee assistance programme's own file; NIOSH's guidance on shift work and stimulant use; the Teamsters' training programmes and the contract language that puts a steward beside a member in a reasonable-suspicion meeting",
    "name": "Wellness — Substance Use and the Job",
    "weather": "clear",
    "indoor": "garage",
    "district": null,
    "title": "SmartCiti.X~ Wellness — Substance Use and the Job VR",
    "tagline": "Four in the morning on the dock: the signs read, the forklift key taken before the conversation, what you saw said plainly, the conversation kept level, whose decision the test is, the doors he can take without losing the job, and the pill you did not take",
    "accent": 14197831,
    "accentCss": "#d8a447",
    "parSeconds": 335,
    "badge": {
      "id": "key-first",
      "name": "Key First",
      "note": "The forklift key taken before a word was said, the conversation kept level, and nothing taken to make the shift"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Wellness Resource Center",
      "currency": "SHIFT",
      "ranks": [
        "Trainee",
        "Crew Lead",
        "Reasonable-Suspicion Aware",
        "Shift Steward",
        "Job Ready"
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
    "id": "wellness-asking-for-help-and-resources",
    "index": "231",
    "domain": "Workforce readiness",
    "trade": "Pre-apprentice — the trainee whose week is going sideways",
    "category": "Community Environmental Justice",
    "certification": "SAMHSA's guidance on help-seeking and its national helpline, its trauma-informed care principles applied to the person asking, and the 988 Suicide and Crisis Lifeline for the door that is for a crisis; Psychological First Aid's look, listen, link, turned on yourself — practical needs first, then the link — as the Red Cross and NCTSN teach it; the Sphere Handbook's minimum standard on mental health and psychosocial support for the layered model of help this room is arranged by; OSHA's medical services and first aid rule in 29 CFR 1910.151, the floor under an employer's duty to have somebody a worker can go to; HIPAA, for what the employee assistance programme's clinician keeps and the employer never sees; NIOSH's work-organisation and stress guidance for the signs read at the start; the SEIU and AFSCME locals whose members staff wellness and benefits rooms like this one, and the Teamsters' training programmes on the warehouse side",
    "name": "Wellness — Asking for Help and Resources",
    "weather": "rain",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Wellness — Asking for Help and Resources VR",
    "tagline": "The week your own life goes sideways: the signs read on yourself, the stress rated, the plate sorted, each problem matched to its door, one call made and stayed on, the crisis line told apart from the case manager, the instructor told what you need, and the follow-up booked",
    "accent": 8373408,
    "accentCss": "#7fc4a0",
    "parSeconds": 330,
    "badge": {
      "id": "asked",
      "name": "Asked",
      "note": "Every problem matched to its door, one call made and stayed on, nothing posted, nothing borrowed at four hundred percent, and a follow-up on the calendar"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Wellness Resource Center",
      "currency": "REACH",
      "ranks": [
        "Trainee",
        "Asked Once",
        "Knows the Doors",
        "Resource Navigator",
        "Job Ready"
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
    "id": "pm-lobby-and-front-desk",
    "index": "301",
    "domain": "Property Management",
    "trade": "Front desk attendant and porter — SEIU building service members, with IUOE Local 39 stationary engineers on call and a CAM-credentialed property manager",
    "category": "Building Systems & Facilities",
    "certification": "NFPA 101 (Life Safety Code) for the exit access, the self-closing stair door and the illuminated exit signs; NFPA 72 for the fire alarm annunciator the desk watches and the records an inspector asks for; OSHA 29 CFR 1910.22 for a lobby floor kept clean, dry and free of trip edges, 29 CFR 1910.36 for exit routes kept unobstructed, 29 CFR 1910.38 for the building's emergency action plan and its announcements, and 29 CFR 1910.1200 for the floor cleaner on the porter's cart; SEIU contract language for building service staff; the state landlord-tenant statute's written notice before a unit is entered and the Fair Housing Act's rule that every resident is served the same way; the apartment association's CAM credential for the manager the desk reports to.",
    "name": "Lobby and Front Desk",
    "weather": "clear",
    "indoor": "hotel",
    "district": null,
    "title": "SmartCiti.X~ Lobby and Front Desk VR",
    "tagline": "The desk opened in order: pass-down read, cameras, callbox and annunciator proven, the door closer read, the egress path walked, the entry mopped under a sign, a notice read over the PA, a lockout handled against the roster, and the shift closed in the building log",
    "accent": 7317724,
    "accentCss": "#6fa8dc",
    "parSeconds": 270,
    "badge": {
      "id": "desk-opened",
      "name": "Desk Opened",
      "note": "A lobby opened, watched and handed over with every exit clear and every resident served the same way"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Front of House",
      "currency": "SHIFTS",
      "ranks": [
        "Relief Porter",
        "Desk Attendant",
        "Lead Attendant",
        "Lobby Supervisor",
        "Front of House Certified"
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
    "id": "pm-leasing-office-fair-housing",
    "index": "302",
    "domain": "Property Management",
    "trade": "Leasing agent and community manager — apartment association CAM credential, working alongside SEIU building service staff",
    "category": "Building Systems & Facilities",
    "certification": "The federal Fair Housing Act and its protected classes, applied through one written tenant selection standard, reasonable accommodations and modifications for residents with disabilities, and advertising free of words that steer; EPA's lead-based paint disclosure rule for target housing under 40 CFR 745, with the Lead Warning Statement and the lead pamphlet in every pre-1978 lease; the state landlord-tenant statute's notice before a unit is entered; OSHA 29 CFR 1910.38 (emergency action plans), 29 CFR 1910.36 (exit routes) and 29 CFR 1910.157 (portable extinguishers) for the office itself, with NFPA 101 for its exit; an injury and illness prevention program under 8 CCR 3203 covering a leasing agent who shows units alone; the apartment association's CAM credential; SEIU building service staff who share the building.",
    "name": "Leasing Office and Fair Housing",
    "weather": "clear",
    "indoor": "hotel",
    "district": null,
    "title": "SmartCiti.X~ Leasing Office and Fair Housing VR",
    "tagline": "One set of criteria for everyone: notices posted, an ad cleaned of steering words, income applied by the number, an accommodation routed, the lead disclosure packed, a lone-worker check-in, a tour at the prospect's pace, reasons in writing and the files locked",
    "accent": 9418858,
    "accentCss": "#8fb86a",
    "parSeconds": 260,
    "badge": {
      "id": "same-for-everyone",
      "name": "Same for Everyone",
      "note": "Every applicant and resident served by the same written standard, with nothing steered and nothing refused on the spot"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Fair Housing",
      "currency": "LEASES",
      "ranks": [
        "Leasing Trainee",
        "Leasing Consultant",
        "Assistant Manager",
        "Community Manager",
        "Fair Housing Certified"
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
    "id": "pm-unit-turnover",
    "index": "303",
    "domain": "Property Management",
    "trade": "Maintenance technician — apartment association CAMT credential, SEIU building service and IUOE Local 39 engineering staff",
    "category": "Building Systems & Facilities",
    "certification": "EPA's Renovation, Repair and Painting rule under 40 CFR 745 for work that disturbs paint in pre-1978 housing — certified renovator and firm, containment, no dry sanding or open-flame removal, HEPA cleaning and cleaning verification; the asbestos NESHAP under 40 CFR 61 and OSHA's asbestos standard, 29 CFR 1926.1101, for textured ceilings that have not been surveyed; OSHA's lead standard for construction work, 29 CFR 1926.62; ASHRAE 188 for managing the building's hot water against Legionella and scald alike; NFPA 72 for the unit's smoke alarms; the local housing code's habitability standards and the state landlord-tenant statute's move-in condition; the apartment association's CAMT credential; SEIU and IUOE Local 39 building staff.",
    "name": "Unit Turnover",
    "weather": "clear",
    "indoor": "hotel",
    "district": null,
    "title": "SmartCiti.X~ Unit Turnover VR",
    "tagline": "A pre-1978 unit made ready: defects found, lead-safe containment set, trim wet-scraped, chips bagged, the floor HEPA-cleaned and verified, the faucet swapped on an isolated line, hot water read at the tap, alarms proven and the lock re-keyed",
    "accent": 14263361,
    "accentCss": "#d9a441",
    "parSeconds": 290,
    "badge": {
      "id": "lead-safe-ready",
      "name": "Lead-Safe Ready",
      "note": "A unit turned with the paint disturbed safely, the dust verified gone and every device proven before the keys changed hands"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Make-Ready",
      "currency": "UNITS",
      "ranks": [
        "Maintenance Helper",
        "Maintenance Tech",
        "Lead Tech",
        "Maintenance Supervisor",
        "Make-Ready Certified"
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
    "id": "pm-trash-and-recycling-room",
    "index": "304",
    "domain": "Property Management",
    "trade": "Porter and building service worker — SEIU building service members, with IUOE Local 39 engineers for the compactor's electrical and hydraulic repairs",
    "category": "Building Systems & Facilities",
    "certification": "OSHA 29 CFR 1910.147 (control of hazardous energy) for any reach into the compactor, 29 CFR 1910.212 for its guarding and hold-to-run control, 29 CFR 1910.1030 for a needle found in the trash, 29 CFR 1910.1200 for the cleaning chemicals, and 29 CFR 1910.138 and 29 CFR 1910.133 for cut-resistant gloves and eye protection; NFPA 25 for the sprinkler over the chute discharge and NFPA 101 for the chute's self-closing rated door; the state and local organics and recycling rules the building's carts are sorted to; SEIU contract language for building service staff; IUOE Local 39 for the engineers who repair the compactor.",
    "name": "Trash and Recycling Room",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Trash and Recycling Room VR",
    "tagline": "The room under the chute: schedule read, gloves and glasses on, fire faults found, the compactor read and run hold-to-run, a needle taken with tongs, the compactor locked out before the jam is cleared, the carts sorted, and power restored by the lock's owner",
    "accent": 6270602,
    "accentCss": "#5fae8a",
    "parSeconds": 280,
    "badge": {
      "id": "chute-room-clear",
      "name": "Chute Room Clear",
      "note": "A trash room run with no hand inside a live compactor, no needle touched and no fire door propped"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Chute Room",
      "currency": "BINS",
      "ranks": [
        "Relief Porter",
        "Porter",
        "Lead Porter",
        "Day Porter Lead",
        "Chute Room Certified"
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
    "id": "pm-fire-alarm-panel-room",
    "index": "305",
    "domain": "Property Management",
    "trade": "Building engineer — IUOE Local 39 stationary engineers, working with the licensed fire alarm contractor and SEIU front desk staff",
    "category": "Building Systems & Facilities",
    "certification": "NFPA 72 (National Fire Alarm and Signaling Code) for inspection and testing, notification of the supervising station and occupants before a test, standby battery checks, a marked and protected branch circuit, and record documentation kept at the control unit; NFPA 101 for the rated walls a penetration must not breach; NFPA 70 for the panel's branch circuit; OSHA 29 CFR 1910.38 for the building's emergency action plan and alarm notification, 29 CFR 1910.333 for work near the battery terminals, and 29 CFR 1910.23 for keeping a pole on the floor instead of a ladder; the state fire code's permit rule for work on fire alarm systems; IUOE Local 39 and SEIU building staff.",
    "name": "Fire Alarm Panel Room",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Fire Alarm Panel Room VR",
    "tagline": "A routine fire alarm test done in order: history read, monitoring and residents told, faults found, batteries read, a lamp check, a detector seated and smoke-tested, the panel reset and taken off test, and the controls locked",
    "accent": 14701130,
    "accentCss": "#e0524a",
    "parSeconds": 280,
    "badge": {
      "id": "system-normal",
      "name": "System Normal",
      "note": "A fire alarm tested, restored and back on line with the monitoring station, with nothing silenced, disabled or switched off along the way"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Panel Authority",
      "currency": "SIGNALS",
      "ranks": [
        "Engineer Trainee",
        "Building Engineer",
        "Chief's Assistant",
        "Chief Engineer",
        "Panel Authority Certified"
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
    "id": "pm-sprinkler-riser-room",
    "index": "306",
    "domain": "Property Management",
    "trade": "Building engineer — IUOE Local 39 stationary engineers, with the sprinkler contractor's inspector and an SEIU porter on fire watch",
    "category": "Building Systems & Facilities",
    "certification": "NFPA 25 (inspection, testing and maintenance of water-based fire protection systems) for control valve inspections, gauges, spare sprinklers, main drain tests, inspector's test flows and the impairment procedure — tag, notify, fire watch, restore; NFPA 72 for the waterflow and valve tamper signals the riser sends to the fire alarm; OSHA 29 CFR 1910.157 for the extinguisher a fire watch carries and 29 CFR 1910.22 for a floor kept dry around a drain test; the state fire code's impairment notice to the fire department; IUOE Local 39 building engineers and SEIU porters.",
    "name": "Sprinkler Riser Room",
    "weather": "clear",
    "indoor": "plant",
    "district": null,
    "title": "SmartCiti.X~ Sprinkler Riser Room VR",
    "tagline": "The riser inspected under NFPA 25: a closed floor valve found, the impairment tagged, notified and watched, the valve reopened and chained, pressure read, a main drain flowed, the waterflow alarm proven and the impairment ended",
    "accent": 14174778,
    "accentCss": "#d84a3a",
    "parSeconds": 270,
    "badge": {
      "id": "valves-open",
      "name": "Valves Open",
      "note": "Every control valve found, reopened, proven and signed off with the impairment handled by the book"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Riser Watch",
      "currency": "PSI",
      "ranks": [
        "Engineer Trainee",
        "Building Engineer",
        "Fire Systems Engineer",
        "Chief Engineer",
        "Riser Watch Certified"
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
    "id": "pm-elevator-machine-room",
    "index": "307",
    "domain": "Property Management",
    "trade": "Building engineer — IUOE Local 39 stationary engineers, alongside the elevator contractor's licensed mechanic",
    "category": "Building Systems & Facilities",
    "certification": "ASME A17.1 (Safety Code for Elevators and Escalators) and the state elevator code for a machine room kept locked, self-closing, clear of storage, within the equipment's temperature range and holding the maintenance control program and its records, with two-way emergency communication in every car; OSHA 29 CFR 1910.147 for the mainline disconnect that only the mechanic locks out, 29 CFR 1910.212 for guards over sheaves and ropes, and 29 CFR 1910.157 for the machine room's portable extinguisher; NFPA 72 for the smoke detection that recalls the cars in a fire; IUOE Local 39 building engineers working alongside the elevator contractor's licensed mechanics.",
    "name": "Elevator Machine Room",
    "weather": "clear",
    "indoor": "plant",
    "district": null,
    "title": "SmartCiti.X~ Elevator Machine Room VR",
    "tagline": "A monthly machine room round: the maintenance program read, the door proven, temperature read, oil, guards and extinguisher checked, storage carried out, defects handed to the mechanic, the car phone tested, the room ventilated and left as found",
    "accent": 9076694,
    "accentCss": "#8a7fd6",
    "parSeconds": 260,
    "badge": {
      "id": "room-as-found",
      "name": "Room as Found",
      "note": "A machine room checked, cleared and left locked with the controller and the mainline left to the mechanic"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Machine Room",
      "currency": "ROUNDS",
      "ranks": [
        "Engineer Trainee",
        "Building Engineer",
        "Senior Engineer",
        "Chief Engineer",
        "Machine Room Certified"
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
    "id": "pm-parking-garage",
    "index": "308",
    "domain": "Property Management",
    "trade": "Porter and garage patrol — SEIU building service members, with IUOE Local 39 engineers for the ventilation and CO detection system",
    "category": "Building Systems & Facilities",
    "certification": "OSHA's permissible exposure limit for carbon monoxide under 29 CFR 1910.1000, with the lower NIOSH recommended limit as the level a careful crew works to; 29 CFR 1910.22 for a garage floor kept free of oil and trip hazards and 29 CFR 1910.157 for portable extinguishers kept charged and in their cabinets; NFPA 70 for EV charging equipment and its emergency shut-off; NFPA 101 for the stair doors and exit signs of the garage's means of egress; the local building code's enclosed-garage ventilation and CO detection requirements and the storm water rules that keep oil out of the drains; SEIU building service staff and IUOE Local 39 engineers.",
    "name": "Parking Garage",
    "weather": "clear",
    "indoor": "garage",
    "district": null,
    "title": "SmartCiti.X~ Parking Garage VR",
    "tagline": "An enclosed garage patrolled and cleaned: CO read before an engine runs, fans to purge, the level walked, oil absorbed, a lane coned, the sweeper run at a walking pace, the callbox tested, the fans back to auto and the stairs checked",
    "accent": 15245882,
    "accentCss": "#e8a23a",
    "parSeconds": 280,
    "badge": {
      "id": "clean-air-level",
      "name": "Clean Air Level",
      "note": "A garage level patrolled and swept with the air read, the alarms answered and nothing ignored"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Garage Patrol",
      "currency": "LEVELS",
      "ranks": [
        "Relief Porter",
        "Garage Porter",
        "Patrol Lead",
        "Garage Supervisor",
        "Garage Patrol Certified"
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
    "id": "pm-roof-and-drains",
    "index": "309",
    "domain": "Property Management",
    "trade": "Building engineer — IUOE Local 39 stationary engineers, with SEIU porters on the ground and the roofing contractor under permit",
    "category": "Building Systems & Facilities",
    "certification": "OSHA 29 CFR 1910.28 for fall protection on a low-slope roof — guardrail, travel restraint or personal fall arrest near the edge, a designated area behind a warning line further back, and covers or screens over skylights and hatches; 29 CFR 1910.23 for a fixed ladder climbed with hands free; ANSI Z359 for the anchor, harness and lanyard used in restraint; 29 CFR 1910.147 for locking out a rooftop fan before its housing is opened; NFPA 51B and 29 CFR 1910.252 for torch work on a roof under a hot work permit with a fire watch; the local building code's roof drainage and overflow requirements; IUOE Local 39 building engineers and SEIU porters.",
    "name": "Roof and Drains",
    "weather": "wind",
    "indoor": null,
    "district": "Building Systems & Facilities",
    "title": "SmartCiti.X~ Roof and Drains VR",
    "tagline": "The roof walked before a storm: access logged, the hatch climbed and guarded, wind read, the route walked in restraint, drains and scuppers cleared, a slow drain augered, a fan locked out for a belt check and restored",
    "accent": 5222598,
    "accentCss": "#4fb0c6",
    "parSeconds": 290,
    "badge": {
      "id": "drains-clear",
      "name": "Drains Clear",
      "note": "A roof walked, drained and checked with nobody past the warning line and nothing opened live"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Roof Round",
      "currency": "DRAINS",
      "ranks": [
        "Engineer Trainee",
        "Building Engineer",
        "Senior Engineer",
        "Chief Engineer",
        "Roof Round Certified"
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
    "id": "pm-electrical-room",
    "index": "310",
    "domain": "Property Management",
    "trade": "Building engineer — IUOE Local 39 stationary engineers, working with a licensed electrician",
    "category": "Building Systems & Facilities",
    "certification": "NFPA 70E (Standard for Electrical Safety in the Workplace) for the arc flash label, approach boundaries, arc-rated PPE, the electrically safe work condition and absence-of-voltage testing; NFPA 70 for the working space kept clear in front of electrical equipment and for panel directories and filler plates; OSHA 29 CFR 1910.147 for lockout and tagout and 29 CFR 1910.333 for de-energising before work and keeping clear of live parts; IEC 61010 for the measurement category rating of the tester; NFPA 72 for the fire alarm equipment a feeder outage can drop into trouble; the local housing code's duty to restore essential services promptly; IUOE Local 39 building engineers and the licensed electrician they work alongside.",
    "name": "Electrical Room",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Electrical Room VR",
    "tagline": "A failed breaker replaced dead, never live: the arc flash label read, the working space cleared, the gear scanned, arc-rated PPE on, the feeder locked out, absence of voltage proven, the lug torqued, and power restored from the side",
    "accent": 15905594,
    "accentCss": "#f2b33a",
    "parSeconds": 290,
    "badge": {
      "id": "worked-dead",
      "name": "Worked Dead",
      "note": "A panel repaired in an electrically safe work condition, proven dead and restored by the person whose lock it was"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Switchroom",
      "currency": "AMPS",
      "ranks": [
        "Engineer Trainee",
        "Building Engineer",
        "Qualified Person",
        "Chief Engineer",
        "Switchroom Certified"
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
    "id": "civic-principles-briefing",
    "index": "226",
    "domain": "Civic",
    "trade": "Civic leader — councillor, commissioner, organiser or public servant",
    "category": "Community Environmental Justice",
    "certification": "The Ralph M. Brown Act (California Government Code section 54950 and following) for open meetings; the Political Reform Act and the Fair Political Practices Commission (FPPC) for disclosure, disqualification and gifts; the municipal ethics code, named generically; Robert's Rules of Order as a practice a body adopts, not a law; SAMHSA's trauma-informed care principles; NIMS and ICS for crisis communication; Title II of the ADA for access. The eight leadership principles are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
    "name": "Civic Principles Briefing",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Civic Principles Briefing VR",
    "tagline": "Eight principles of public leadership, a six-step decision framework, and the law under every public meeting — a briefing and knowledge check that opens the civic leadership programme, with every source stated and every gap marked not sourced",
    "accent": 13214538,
    "accentCss": "#c9a34a",
    "parSeconds": 320,
    "badge": {
      "id": "principles-held",
      "name": "Principles Held",
      "note": "The eight principles, the framework and the law answered without an unsafe conclusion"
    },
    "stepCount": 10,
    "interruptCount": 0,
    "flat": true,
    "dossier": [
      {
        "title": "What this programme is, and what it is not",
        "body": "The Civic Leadership and Emotional Intelligence programme was asked to draw on the principles taught by a civic-leadership foundation. That foundation's own curriculum could not be retrieved from the environment this briefing was written in, and nothing about it exists in this repository, so this briefing does not describe the foundation, does not quote it, and does not speak for it or for anybody connected with it. The eight principles that follow are stated generically: they are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository. Before the programme is used with learners, the foundation's own words belong here, in its own voice.",
        "source": {
          "label": "Not sourced — the foundation's own curriculum is not in this repository"
        }
      },
      {
        "title": "The eight principles",
        "body": "1. Listen first — hear the whole thing before you answer any of it. 2. Know the interest behind the position — ask why before you argue with what. 3. Count the votes before the vote — and count them honestly, in public, never by carrying positions between members in private. 4. Keep your word — promise only what you can deliver, then deliver it. 5. Spend public money in the open — the public sees the same numbers, at the same time, as the people deciding. 6. Take the hard call and own it — say \"we chose\", say why, say when you will look again. 7. Bring people in rather than shut them out — notice who is missing and go and get them. 8. Mentor the next person — the job is not done until somebody else can do it without you.",
        "source": {
          "label": "Not sourced — principles commonly taught in civic-leadership programmes, stated generically"
        }
      },
      {
        "title": "A decision framework: hear, name, count, decide, own, report",
        "body": "Hear: every affected voice, the quiet ones included, before anything is proposed. Name: the interest behind each position, said back in the speaker's own words. Count: honest support, in the open — a maybe is not a yes. Decide: in the noticed meeting, on the posted item, with any personal interest disclosed and stepped away from. Own: the decision in the first person, with the reason and a date to revisit it. Report: the decision, the reasoning, the dissent and each vote, back to the people it affects. The nine stations of this programme each practise part of this sequence under pressure.",
        "source": {
          "label": "Not sourced — a framework written for this programme, not taken from any organisation"
        }
      },
      {
        "title": "The open-meeting law under every public meeting",
        "body": "California's Ralph M. Brown Act governs meetings of local legislative bodies: city councils, county boards, and the commissions and committees they create. A regular meeting's agenda is posted in public seventy-two hours ahead; the public may address the body; the body acts only on what was noticed, with narrow exceptions; a majority may not discuss, deliberate or decide the body's business outside a noticed meeting, including through a chain of one-to-one contacts or an intermediary; documents given to a majority are public at the same time; and a majority may attend a community meeting open to the public so long as they do not discuss the body's business among themselves there.",
        "source": {
          "label": "California Legislative Information — Government Code section 54950 and following (official site; page not retrieved at build time)",
          "url": "https://leginfo.legislature.ca.gov/"
        }
      },
      {
        "title": "Money, gifts and conflicts of interest",
        "body": "The Political Reform Act of 1974, administered by the Fair Political Practices Commission, requires public officials to disclose their economic interests on the Statement of Economic Interests (Form 700), bars an official from making or influencing a decision in which they have a financial interest, and limits and requires reporting of gifts. Gift limits are adjusted over time, so no figure is quoted here. A city's or county's own ethics code adds its rules on gifts from interested parties, lobbyist contact, misuse of position and the revolving door; they differ by jurisdiction and are named here only generically.",
        "source": {
          "label": "Fair Political Practices Commission (official site; page not retrieved at build time)",
          "url": "https://www.fppc.ca.gov/"
        }
      },
      {
        "title": "Procedure is a practice, not a law",
        "body": "Robert's Rules of Order is a parliamentary authority: a body adopts it, or a simplified version, or its own rules of procedure, and is bound by it only to the extent it has chosen to be. It supplies the ordinary shape of a meeting — a motion, a second, debate on something specific, a vote — and the chair's job of recognising speakers and keeping order. The open-meeting law sits underneath it and cannot be waived by any rule of procedure.",
        "source": {
          "label": "Robert's Rules of Order Newly Revised — official site (page not retrieved at build time)",
          "url": "https://robertsrules.com/"
        }
      },
      {
        "title": "People, crisis and access",
        "body": "SAMHSA's six principles of a trauma-informed approach — safety; trustworthiness and transparency; peer support; collaboration and mutuality; empowerment, voice and choice; and cultural, historical and gender issues — shape how a leader listens to a neighbourhood that has been hurt before. In an emergency, NIMS places the public information officer on the incident's command staff and uses a joint information centre so every agency speaks with one voice. Title II of the ADA requires public entities to make their programmes, meetings and communications accessible, including interpreters and captions on request.",
        "source": {
          "label": "SAMHSA (official site; page not retrieved at build time)",
          "url": "https://www.samhsa.gov/"
        },
        "source2": {
          "label": "FEMA — National Incident Management System (official site; page not retrieved at build time)",
          "url": "https://www.fema.gov/emergency-managers/nims"
        }
      }
    ],
    "game": {
      "system": "Public Trust",
      "currency": "TRUST",
      "ranks": [
        "Resident",
        "Volunteer",
        "Organiser",
        "Public Servant",
        "Civic Leader"
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
    "id": "public-meeting-chair",
    "index": "217",
    "domain": "Civic",
    "trade": "Presiding officer — council or commission chair",
    "category": "Community Environmental Justice",
    "certification": "The Ralph M. Brown Act (California Government Code section 54950 and following) for the posted agenda, public comment and the bar on serial meetings; Robert's Rules of Order as the parliamentary authority the body adopts in its own rules — a practice, not a law; Title II of the ADA for interpreters, captions and an accessible room; the Political Reform Act and the city ethics code for a gift from anyone with business before the body; SAMHSA's trauma-informed care principles for residents who testify about harm; SEIU and AFSCME for the clerks and staff who run the room. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
    "name": "Public Meeting Chair",
    "weather": "overcast",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Public Meeting Chair VR",
    "tagline": "Chair a public meeting people trust: notice checked, the room live, every speaker heard to the bell, a late item sent to the next agenda, order kept without a heavy gavel — and every vote stated out loud",
    "accent": 13214538,
    "accentCss": "#c9a34a",
    "parSeconds": 330,
    "badge": {
      "id": "gavel-held-lightly",
      "name": "Gavel Held Lightly",
      "note": "A whole meeting chaired in the open: every speaker heard, nothing acted on that was not noticed, and each vote announced"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Open Chamber",
      "currency": "TRUST",
      "ranks": [
        "Member",
        "Vice Chair",
        "Chair",
        "Presiding Officer",
        "Mentor Chair"
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
    "id": "constituent-service-desk",
    "index": "218",
    "domain": "Civic",
    "trade": "District office caseworker",
    "category": "Community Environmental Justice",
    "certification": "Title II of the ADA for an accessible counter and effective communication, including a language or sign interpreter on request; SAMHSA's trauma-informed care principles and Psychological First Aid (NCTSN) for a resident who arrives exhausted and angry; the Political Reform Act and the city ethics code for a gift from a party to a complaint and for favouring a donor's case; SEIU and AFSCME for the public-service staff who work the desk. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
    "name": "Constituent Service Desk",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Constituent Service Desk VR",
    "tagline": "A tenant with no heat, two unreturned calls and a queue behind her: hear it all, route it right, promise only a date you can keep, own the office's miss — and send her away with a name, a number and a day",
    "accent": 6271905,
    "accentCss": "#5fb3a1",
    "parSeconds": 330,
    "badge": {
      "id": "word-kept",
      "name": "Word Kept",
      "note": "Every commitment made at the desk was one the office could keep, and the resident left with it in writing"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Casework",
      "currency": "FOLLOW-THROUGH",
      "ranks": [
        "Intake Aide",
        "Caseworker",
        "Senior Caseworker",
        "District Director",
        "Casework Mentor"
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
    "id": "coalition-building-table",
    "index": "219",
    "domain": "Civic",
    "trade": "Community organiser — coalition convenor",
    "category": "Community Environmental Justice",
    "certification": "The Ralph M. Brown Act (California Government Code section 54950 and following) and its bar on serial meetings, which a coalition breaks when it carries positions between members of a legislative body; the Political Reform Act, administered by the FPPC, and the municipal ethics code for gifts to officials and for paid advocacy; Robert's Rules of Order, or whatever decision rule the coalition adopts for itself, as a practice rather than a law; SAMHSA's trauma-informed principles of collaboration and mutuality and of voice and choice; SEIU and AFSCME as the labour partners at many such tables. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
    "name": "Coalition Building Table",
    "weather": "clear",
    "indoor": "hotel",
    "district": null,
    "title": "SmartCiti.X~ Coalition Building Table VR",
    "tagline": "Five organisations, one proposal and a room that could split: find who is missing, hear every partner, turn positions into interests, size the ask, keep the opposition at the table — and count your support honestly",
    "accent": 13666894,
    "accentCss": "#d08a4e",
    "parSeconds": 330,
    "badge": {
      "id": "table-held",
      "name": "Table Held",
      "note": "Every partner heard, the opposition kept in the room, and a support count nobody had to inflate"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Common Ground",
      "currency": "ALLIES",
      "ranks": [
        "Volunteer",
        "Convenor",
        "Coalition Lead",
        "Campaign Director",
        "Organiser Mentor"
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
    "id": "budget-tradeoff-hearing",
    "index": "220",
    "domain": "Civic",
    "trade": "Budget committee chair",
    "category": "Community Environmental Justice",
    "certification": "The Ralph M. Brown Act (California Government Code section 54950 and following) for a budget hearing held in public and for documents given to a majority of the body being available to the public at the same time; the Political Reform Act, administered by the FPPC, and the municipal ethics code for a member's financial interest in a funded project and for gifts from a bidder; Robert's Rules of Order as the body's adopted practice for amendments; Title II of the ADA for budget documents in accessible formats; SEIU and AFSCME for the public-service workers whose jobs a cut touches, and the state's public-sector labour relations law for consulting them. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
    "name": "Budget Tradeoff Hearing",
    "weather": "rain",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Budget Tradeoff Hearing VR",
    "tagline": "A gap to close in front of the people it lands on: the packet public, the options costed, testimony heard, one-time money kept off ongoing costs, the reserve held, your own interest disclosed — and the cut owned out loud",
    "accent": 8366040,
    "accentCss": "#7fa7d8",
    "parSeconds": 340,
    "badge": {
      "id": "money-in-the-open",
      "name": "Money in the Open",
      "note": "Every dollar decided where the public could see it, with the reasoning published and the hard call owned"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Open Ledger",
      "currency": "LEDGER",
      "ranks": [
        "Committee Member",
        "Vice Chair",
        "Budget Chair",
        "Finance Lead",
        "Budget Mentor"
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
    "id": "ethics-and-conflict-of-interest",
    "index": "221",
    "domain": "Civic",
    "trade": "Appointed commissioner — ethics and disclosure",
    "category": "Community Environmental Justice",
    "certification": "The Political Reform Act of 1974, administered by the Fair Political Practices Commission (FPPC): the Statement of Economic Interests (Form 700), disqualification from any decision an official has a financial interest in, and gift limits and gift reporting — no dollar limit is quoted here because it is adjusted over time; the municipal ethics code for lobbyist contact, misuse of position and the revolving door; the Ralph M. Brown Act (California Government Code section 54950 and following) for a recusal announced in the open meeting; Robert's Rules of Order as the body's adopted practice, where an abstention is not a recusal; SAMHSA's trauma-informed principles of safety and of trustworthiness and transparency for receiving a staff member's report; SEIU and AFSCME for the staff who raise concerns. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
    "name": "Ethics and Conflict of Interest",
    "weather": "overcast",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Ethics and Conflict of Interest VR",
    "tagline": "Your first month in office in one room: interests disclosed, a gift valued and reported, a recusal done in public and sat out in full, a lobbyist logged, a job offer disclosed — and a staff member's concern heard rather than waved away",
    "accent": 10193622,
    "accentCss": "#9b8ad6",
    "parSeconds": 330,
    "badge": {
      "id": "clean-hands",
      "name": "Clean Hands",
      "note": "Every interest disclosed, every gift reported and every recusal done in the open, without being asked"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Clear Conscience",
      "currency": "INTEGRITY",
      "ranks": [
        "New Appointee",
        "Commissioner",
        "Vice Chair",
        "Chair",
        "Ethics Mentor"
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
    "id": "crisis-communication-podium",
    "index": "222",
    "domain": "Civic",
    "trade": "Public information officer — city spokesperson",
    "category": "Community Environmental Justice",
    "certification": "NIMS and ICS, through FEMA IS-100 and IS-700, for the public information officer's place on the command staff and for the joint information centre that makes many agencies speak with one voice; the CDC's Crisis and Emergency Risk Communication principles — be first, be right, be credible, express empathy, promote action, show respect; Title II of the ADA for a sign-language interpreter in frame, captions and alerts residents can actually receive; SAMHSA's trauma-informed care principles and Psychological First Aid (NCTSN) for speaking to a frightened public. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
    "name": "Crisis Communication Podium",
    "weather": "smoke",
    "indoor": null,
    "district": "Community Environmental Justice",
    "title": "SmartCiti.X~ Crisis Communication Podium VR",
    "tagline": "Smoke over three neighbourhoods and a camera in your face: confirm before you speak, one voice for every agency, what to do and when you'll be back, the interpreter in frame, a rumour checked not repeated — and the morning's mistake owned on the record",
    "accent": 14721610,
    "accentCss": "#e0a24a",
    "parSeconds": 330,
    "badge": {
      "id": "first-right-credible",
      "name": "First, Right, Credible",
      "note": "A whole briefing given on confirmed facts, in every format residents need, with the earlier error corrected by name"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "One Voice",
      "currency": "CREDIBILITY",
      "ranks": [
        "Press Aide",
        "Deputy PIO",
        "Public Information Officer",
        "JIC Lead",
        "Communications Mentor"
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
    "id": "community-listening-session",
    "index": "223",
    "domain": "Civic",
    "trade": "Community engagement facilitator",
    "category": "Community Environmental Justice",
    "certification": "SAMHSA's six principles of a trauma-informed approach — safety, trustworthiness and transparency, peer support, collaboration and mutuality, empowerment, voice and choice, and cultural, historical and gender issues — for a neighbourhood with a long memory of broken promises; Psychological First Aid (NCTSN) for a resident overwhelmed in the room; Title II of the ADA for interpretation, an accessible hall and assistive listening; the Ralph M. Brown Act's rule that a majority of a legislative body attending a community meeting must not discuss the body's business among themselves there; SEIU and AFSCME for the city staff who facilitate and record. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
    "name": "Community Listening Session",
    "weather": "rain",
    "indoor": "hotel",
    "district": null,
    "title": "SmartCiti.X~ Community Listening Session VR",
    "tagline": "A circle, not a stage: access set up before the doors open, what the session is for said plainly, every voice reflected back, the quiet tables reached, a resident in distress cared for — and a date when people will hear what was done with what they said",
    "accent": 7323507,
    "accentCss": "#6fbf73",
    "parSeconds": 330,
    "badge": {
      "id": "heard-back",
      "name": "Heard Back",
      "note": "A whole session run as listening: nothing defended, nobody left out, and a record the room would sign"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Open Circle",
      "currency": "VOICES",
      "ranks": [
        "Note Taker",
        "Co-Facilitator",
        "Facilitator",
        "Engagement Lead",
        "Facilitation Mentor"
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
    "id": "conflict-mediation-room",
    "index": "224",
    "domain": "Civic",
    "trade": "Community mediator",
    "category": "Community Environmental Justice",
    "certification": "SAMHSA's trauma-informed care principles of safety, trustworthiness and transparency, and empowerment, voice and choice, for two parties who each feel unheard; Psychological First Aid (NCTSN) for a party who is overwhelmed mid-session; Title II of the ADA for an interpreter and any accommodation a party asks for in a city-run programme; the municipal ethics code for a mediator's duty to disclose a connection to a party and to refuse gifts; SEIU and AFSCME for the public-service staff who run community mediation programmes. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
    "name": "Conflict Mediation Room",
    "weather": "overcast",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Conflict Mediation Room VR",
    "tagline": "A garden, a food truck and two neighbours who stopped talking months ago: your own connection disclosed, the rules said out loud, each side heard whole, the blame taken out of the complaint, the power kept level — and an agreement written in their words, not yours",
    "accent": 7319752,
    "accentCss": "#6fb0c8",
    "parSeconds": 330,
    "badge": {
      "id": "both-heard",
      "name": "Both Heard",
      "note": "A whole mediation run level: neither side favoured, nothing promised, and an agreement both parties wrote"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Level Table",
      "currency": "ACCORD",
      "ranks": [
        "Observer",
        "Co-Mediator",
        "Mediator",
        "Lead Mediator",
        "Mediation Mentor"
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
    "id": "mentorship-and-succession",
    "index": "225",
    "domain": "Civic",
    "trade": "Outgoing commission chair — mentor",
    "category": "Community Environmental Justice",
    "certification": "The Ralph M. Brown Act (California Government Code section 54950 and following) as the first thing a new member must know; the Political Reform Act, administered by the FPPC, for the assuming-office Statement of Economic Interests (Form 700) and gift rules; the municipal ethics code and the state's required ethics training for local officials, named generically; Robert's Rules of Order as the commission's adopted practice for running a meeting; SAMHSA's trauma-informed principle of peer support, applied to mentoring; SEIU and AFSCME for the commission staff a new chair relies on. The leadership principles practised here are principles commonly taught in civic-leadership programmes; the foundation's own curriculum is not sourced in this repository",
    "name": "Mentorship and Succession",
    "weather": "clear",
    "indoor": "hotel",
    "district": null,
    "title": "SmartCiti.X~ Mentorship and Succession VR",
    "tagline": "Hand the seat on properly: the binder that matters, their goals before yours, a practice meeting you sit back from, the gavel passed, your relationships shared, a freeze coached quietly — and feedback honest enough to use",
    "accent": 13208240,
    "accentCss": "#c98ab0",
    "parSeconds": 330,
    "badge": {
      "id": "seat-handed-on",
      "name": "Seat Handed On",
      "note": "A successor left able to lead without you: prepared, introduced, trusted with the gavel and told the truth"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Pass It On",
      "currency": "LEGACY",
      "ranks": [
        "Member",
        "Chair",
        "Mentor",
        "Senior Mentor",
        "Leadership Elder"
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
    "id": "pm-domestic-water-and-backflow",
    "index": "227",
    "domain": "Building Systems & Facilities",
    "trade": "Building stationary engineer — IUOE Local 39, with SEIU building staff and a CAMT-credentialed maintenance technician",
    "category": "Building Systems & Facilities",
    "certification": "ANSI/ASSE 1013 reduced-pressure principle assemblies and the ASSE 5110 tester qualification behind the annual field test; ASSE 1020 for the courtyard irrigation vacuum breaker; AWWA M14 cross-connection control as the water purveyor enforces it; NSF/ANSI 61 for anything wetted by drinking water; ASHRAE 188 and CDC Legionella guidance for the hot-water loop; OSHA 29 CFR 1910.147 lockout and 29 CFR 1910.1200 hazard communication in the water room; IUOE stationary engineer training, the apartment association's CAMT credential and the local housing code's hot-water requirement at every tap",
    "name": "Domestic Water & Backflow",
    "weather": "clear",
    "indoor": "plant",
    "district": null,
    "title": "SmartCiti.X~ Domestic Water & Backflow VR",
    "tagline": "The building's water room: the RP assembly tested to its numbers, cross-connections walked, the booster brought back gently, the hot loop held hot and delivered safe, and the test on the purveyor's form",
    "accent": 5218264,
    "accentCss": "#4f9fd8",
    "parSeconds": 300,
    "badge": {
      "id": "clean-service",
      "name": "Clean Service",
      "note": "The assembly passed on real numbers, every cross-connection found, and the hot loop left hot at the heater and safe at the tap"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Water Room",
      "currency": "PSID",
      "ranks": [
        "Helper",
        "Maintenance Tech",
        "Building Engineer",
        "Chief Engineer",
        "Water Room Certified"
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
    "id": "pm-laundry-room",
    "index": "228",
    "domain": "Building Systems & Facilities",
    "trade": "Building porter and maintenance technician — SEIU building staff with a CAMT-credentialed technician, and IUOE Local 39 engineers for the gas dryers' venting",
    "category": "Building Systems & Facilities",
    "certification": "OSHA 29 CFR 1910.147 lockout on a coin-op washer before any hand reaches the drum or the drain pump; 29 CFR 1910.212 guarding on the belt side; 29 CFR 1910.1200 hazard communication for the chemicals residents leave behind; 29 CFR 1910.36 exit routes kept clear of carts and baskets; NFPA 54 for gas dryer venting and makeup air and NFPA 72 for the room's smoke detection; SEIU building-staff training, IUOE stationary engineer practice and the apartment association's CAMT credential; the local housing code for the laundry the lease promises",
    "name": "Laundry Room",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Laundry Room VR",
    "tagline": "The residents' laundry: washer three locked out and drained into a bucket, the trap cleared, the dryer exhaust read for back pressure, and the room walked for what residents leave behind",
    "accent": 7321768,
    "accentCss": "#6fb8a8",
    "parSeconds": 280,
    "badge": {
      "id": "dry-floor",
      "name": "Dry Floor",
      "note": "Machine locked out, drained into a bucket, exhaust read, and nothing left on the floor for a resident to slip on"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Laundry Room",
      "currency": "QUARTERS",
      "ranks": [
        "Porter",
        "Maintenance Tech",
        "Lead Tech",
        "Building Super",
        "Laundry Room Certified"
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
    "id": "pm-pool-and-spa-chemistry",
    "index": "229",
    "domain": "Building Systems & Facilities",
    "trade": "Pool operator and building engineer — IUOE Local 39 stationary engineers and SEIU building staff, UNITE HERE residential amenity staff on deck, and the apartment association's CAM and CAMT credentials",
    "category": "Building Systems & Facilities",
    "certification": "The state pool code's disinfectant, pH and water-temperature limits and the rescue equipment a residential pool keeps on deck; the Virginia Graeme Baker Pool and Spa Safety Act's anti-entrapment drain covers; CDC guidance on recreational water illness and pool chemical storage; OSHA 29 CFR 1910.1200 hazard communication, 29 CFR 1910.133 eye protection and ANSI Z358.1 eyewash in the chemical room; 29 CFR 1910.147 lockout on the recirculation pump; IUOE stationary engineer training for the pool plant, UNITE HERE for the amenity staff on deck, and the apartment association's CAM and CAMT credentials",
    "name": "Pool & Spa Chemistry",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Pool & Spa Chemistry VR",
    "tagline": "The courtyard pool and spa: water tested and dosed to code, the pump locked out for its strainer, the filter backwashed to its gauge, the chemicals stored apart, and the spa held under its ceiling",
    "accent": 4175576,
    "accentCss": "#3fb6d8",
    "parSeconds": 300,
    "badge": {
      "id": "clear-water",
      "name": "Clear Water",
      "note": "Tested to code, dosed by the feeder, two oxidisers kept apart, and the gate latched behind every child"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Pool Deck",
      "currency": "PPM",
      "ranks": [
        "Deck Attendant",
        "Pool Tech",
        "Pool Operator",
        "Aquatics Lead",
        "Pool Plant Certified"
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
    "id": "pm-fitness-room-and-gym",
    "index": "230",
    "domain": "Building Systems & Facilities",
    "trade": "Amenity attendant and maintenance technician — UNITE HERE residential hospitality staff, SEIU building staff and the apartment association's CAMT credential",
    "category": "Building Systems & Facilities",
    "certification": "OSHA 29 CFR 1910.147 lockout on the treadmill before its motor hood comes off; 29 CFR 1910.1030 bloodborne pathogens for blood on the equipment; 29 CFR 1910.151 first aid and the AED in the room; 29 CFR 1910.1200 hazard communication for the disinfectant's label and contact time; 29 CFR 1910.305 for the cords and outlets that feed the machines; the Fair Housing Act for a resident's assistance animal; UNITE HERE residential hospitality training, SEIU building-staff practice and the apartment association's CAMT credential",
    "name": "Fitness Room & Gym",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Fitness Room & Gym VR",
    "tagline": "The residents' gym: a slipping treadmill and a frayed cable repaired under lockout, disinfectant held to its label, an assistance-animal question routed right, and the AED reached when a resident goes down",
    "accent": 14717274,
    "accentCss": "#e0915a",
    "parSeconds": 290,
    "badge": {
      "id": "safe-reps",
      "name": "Safe Reps",
      "note": "Both machines repaired under lockout, the disinfectant given its full contact time, and the AED on its way inside the window"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Residents' Gym",
      "currency": "REPS",
      "ranks": [
        "Attendant",
        "Amenity Tech",
        "Lead Tech",
        "Amenity Manager",
        "Fitness Room Certified"
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
    "id": "pm-community-room-and-events",
    "index": "231",
    "domain": "Building Systems & Facilities",
    "trade": "Residential events and hospitality staff — UNITE HERE, with SEIU building staff setting the room and the apartment association's CAM-credentialed manager signing off",
    "category": "Building Systems & Facilities",
    "certification": "NFPA 101 occupant load, aisle widths and panic hardware for an assembly room; NFPA 72 for the detectors and notification appliances decorations must never cover; OSHA 29 CFR 1910.36 exit routes and 29 CFR 1910.38 the building's emergency action plan; 29 CFR 1910.157 portable extinguishers; 29 CFR 1910.305 and the NEC for temporary cords at a DJ table; the Fair Housing Act for equal access to the community room; UNITE HERE residential hospitality training, SEIU building staff and the apartment association's CAM credential",
    "name": "Community Room & Events",
    "weather": "clear",
    "indoor": "hotel",
    "district": null,
    "title": "SmartCiti.X~ Community Room & Events VR",
    "tagline": "A Saturday party for sixty: the room set to its posted load, aisles and exits clear, detectors and strobes left uncovered, the host briefed, and the door counted as guests arrive",
    "accent": 12094168,
    "accentCss": "#b88ad8",
    "parSeconds": 290,
    "badge": {
      "id": "full-house",
      "name": "Full House, Clear Exits",
      "note": "Set to the posted load, every exit and detector clear, and the count held under the sign all night"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Community Room",
      "currency": "GUESTS",
      "ranks": [
        "Houseman",
        "Setup Lead",
        "Events Captain",
        "Events Manager",
        "Community Room Certified"
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
    "id": "pm-mail-and-package-room",
    "index": "232",
    "domain": "Building Systems & Facilities",
    "trade": "Front desk and package room staff — SEIU building staff and UNITE HERE residential hospitality staff, with the apartment association's CAM-credentialed manager",
    "category": "Building Systems & Facilities",
    "certification": "OSHA 29 CFR 1910.36 exit routes and 29 CFR 1910.22 walking-working surfaces with parcels on the floor; NFPA 101 for the corridor the overflow must never fill; 29 CFR 1910.1200 hazard communication for a leaking parcel and 29 CFR 1910.1030 for a crushed sharps mailer; NIOSH lifting guidance for the heavy box; the Fair Housing Act for a resident's accommodation request; SEIU building-staff and UNITE HERE front-desk training, and the apartment association's CAM credential",
    "name": "Mail & Package Room",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Mail & Package Room VR",
    "tagline": "The Monday after a holiday: heavy boxes weighed and carted, a leaking parcel held and read, lithium and sharps picked out, the overflow kept out of the exit corridor, and packages released only to their owners",
    "accent": 14200911,
    "accentCss": "#d8b04f",
    "parSeconds": 290,
    "badge": {
      "id": "clear-corridor",
      "name": "Clear Corridor",
      "note": "Every box weighed, sorted and shelved, the corridor kept clear, and nothing handed to the wrong person"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Package Room",
      "currency": "PARCELS",
      "ranks": [
        "Desk Clerk",
        "Package Lead",
        "Front Desk Lead",
        "Resident Services Manager",
        "Package Room Certified"
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
    "id": "pm-loading-dock-and-moves",
    "index": "233",
    "domain": "Building Systems & Facilities",
    "trade": "Building porter and dock attendant — SEIU building staff, with IUOE Local 39 engineers for the garage ventilation and the apartment association's CAM-credentialed manager scheduling the move",
    "category": "Building Systems & Facilities",
    "certification": "OSHA 29 CFR 1910.178 and ANSI B56.1 for the mover's powered pallet jack; 29 CFR 1910.22 and 29 CFR 1910.28 for the dock edge and walking surfaces; 29 CFR 1910.1000 and the ACGIH TLV for carbon monoxide in the garage, with NIOSH guidance on engine exhaust in enclosed spaces; ASME A17.1 for the freight elevator's independent service; NFPA 101 for the stair doors a move must never prop; SEIU building staff, IUOE Local 39 engineers for the garage ventilation and the apartment association's CAM credential; the building's move rules under the local housing code",
    "name": "Loading Dock & Moves",
    "weather": "clear",
    "indoor": "garage",
    "district": null,
    "title": "SmartCiti.X~ Loading Dock & Moves VR",
    "tagline": "Move-in Saturday: the freight elevator keyed and padded, the truck chocked and the dock plate pinned, the garage air read, the pallet jack spotted across the plate, and the move path walked",
    "accent": 14725178,
    "accentCss": "#e0b03a",
    "parSeconds": 300,
    "badge": {
      "id": "pinned-plate",
      "name": "Pinned Plate",
      "note": "Truck chocked, plate pinned, garage air clean, and every resident kept out of the jack's path"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Loading Dock",
      "currency": "PALLETS",
      "ranks": [
        "Porter",
        "Dock Attendant",
        "Dock Lead",
        "Building Super",
        "Loading Dock Certified"
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
    "id": "pm-landscaping-and-irrigation",
    "index": "234",
    "domain": "Building Systems & Facilities",
    "trade": "Grounds and irrigation technician — SEIU building staff, with IUOE Local 39 engineers on the backflow and the apartment association's CAMT credential",
    "category": "Building Systems & Facilities",
    "certification": "ASSE 1020 for the irrigation pressure vacuum breaker and the ASSE 5110 tester who certifies it each year; AWWA M14 cross-connection control; OSHA 29 CFR 1910.95 hearing conservation for the mower and blower, 29 CFR 1910.133 eye protection and 29 CFR 1910.132 PPE for trimming; 29 CFR 1910.147 lockout on the mower blade; 29 CFR 1910.1200 hazard communication for fertiliser and fuel; NIOSH heat guidance for grounds crews; the local water agency's watering-day rules; SEIU building staff, IUOE Local 39 engineers on the backflow and the apartment association's CAMT credential",
    "name": "Landscaping & Irrigation",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Landscaping & Irrigation VR",
    "tagline": "The front lawn in a dry summer: the controller set to the season instead of reset, the vacuum breaker walked, the mower serviced under lockout, a sheared head shut at its valve, and the shed walked",
    "accent": 8046682,
    "accentCss": "#7ac85a",
    "parSeconds": 290,
    "badge": {
      "id": "green-and-safe",
      "name": "Green and Safe",
      "note": "Program kept, heads fixed, blade serviced under lockout, and a geyser shut off at its own valve"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Grounds Crew",
      "currency": "GALLONS",
      "ranks": [
        "Grounds Helper",
        "Irrigation Tech",
        "Grounds Lead",
        "Grounds Supervisor",
        "Irrigation Certified"
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
    "id": "pm-playground-and-courtyard",
    "index": "235",
    "domain": "Building Systems & Facilities",
    "trade": "Grounds and amenity staff — SEIU building staff and UNITE HERE residential hospitality staff, with the apartment association's CAM and CAMT credentials",
    "category": "Building Systems & Facilities",
    "certification": "The federal public playground safety handbook, with ASTM F1487 for the equipment and ASTM F1292 for the surfacing under it; EPA 40 CFR 745 lead-safe work practices before old paint on a pre-1978 property is disturbed; OSHA 29 CFR 1910.1030 for needles found in the sand, 29 CFR 1910.132 PPE, 29 CFR 1910.23 ladders for the shade sail and 29 CFR 1910.22 for the courtyard's walking surfaces; the Fair Housing Act's protection for families with children; SEIU building staff, UNITE HERE amenity staff and the apartment association's CAM and CAMT credentials",
    "name": "Playground & Courtyard",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Playground & Courtyard VR",
    "tagline": "The monthly courtyard round: swings, bolts and mulch inspected to the handbook, the sand swept with tongs, old paint tested before it is touched, a toddler kept inside the gate, and a rule against children refused",
    "accent": 15245386,
    "accentCss": "#e8a04a",
    "parSeconds": 290,
    "badge": {
      "id": "safe-to-play",
      "name": "Safe to Play",
      "note": "Equipment inspected, surfacing at depth, sand swept with tongs, old paint left for testing, and every child still welcome"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Courtyard Round",
      "currency": "INCHES",
      "ranks": [
        "Grounds Helper",
        "Amenity Tech",
        "Grounds Lead",
        "Community Manager",
        "Playground Certified"
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
    "id": "pm-storage-and-bike-room",
    "index": "236",
    "domain": "Building Systems & Facilities",
    "trade": "Building porter and maintenance technician — SEIU building staff, IUOE Local 39 engineers for the sprinkler and the pipe lagging, and the apartment association's CAMT credential",
    "category": "Building Systems & Facilities",
    "certification": "NFPA 25 for sprinkler obstructions and the inspector's test, and NFPA 72 for the waterflow alarm and its monitoring; EPA's asbestos rules at 40 CFR 61 and OSHA 29 CFR 1926.1101 for the old pipe lagging; 29 CFR 1910.157 portable extinguishers, 29 CFR 1910.36 exit routes and 29 CFR 1910.23 ladders for the upper bike rack; the local fire and housing codes on basement storage, battery charging and abandoned property; SEIU building staff, IUOE Local 39 engineers for the sprinkler and the lagging, and the apartment association's CAMT credential",
    "name": "Storage & Bike Room",
    "weather": "clear",
    "indoor": "garage",
    "district": null,
    "title": "SmartCiti.X~ Storage & Bike Room VR",
    "tagline": "The basement audit: fuel out of the cages, boxes below the sprinklers, the inspector's test run with the monitoring company told, the e-bike chargers audited, and the old lagging left for the licensed crew",
    "accent": 5945544,
    "accentCss": "#5ab8c8",
    "parSeconds": 300,
    "badge": {
      "id": "clear-heads",
      "name": "Clear Heads",
      "note": "Every sprinkler head clear, no fuel in a cage, the flow alarm proven, and the lagging left untouched"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Basement Audit",
      "currency": "CAGES",
      "ranks": [
        "Porter",
        "Maintenance Tech",
        "Lead Tech",
        "Building Engineer",
        "Storage Audit Certified"
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
    "id": "who-surveillance-and-case-definition",
    "index": "217",
    "domain": "Emergency Services",
    "trade": "Surveillance officer — SEIU and AFSCME public-health staff, NNU/CNA nurses, and the humanitarian workforce deployed under IASC clusters",
    "category": "Emergency Services",
    "certification": "WHO surveillance practice as the national programme adopts it — a written case definition with suspected, probable and confirmed tiers, a line list, zero reporting and notification up the chain; WHO infection prevention and control guidance and CDC isolation precautions for the specimen and anyone who handles it; OSHA 29 CFR 1910.1030 for the blood specimen and 29 CFR 1910.134 for the respirator a field collection needs; WHO outbreak communication guidance for what leaves this desk and what does not; the Sphere Handbook's health standards and IASC cluster coordination for the Health Cluster partners the line list is shared with; worked by SEIU and AFSCME public-health staff alongside NNU/CNA nurses",
    "name": "Surveillance and Case Definition",
    "weather": "overcast",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Surveillance and Case Definition VR",
    "tagline": "District surveillance desk: the case definition read first, a signal verified, a report filed at the tier the evidence supports, a clean line list, a triple-packaged specimen, zero reports chased and the next level told",
    "accent": 5222560,
    "accentCss": "#4fb0a0",
    "parSeconds": 300,
    "badge": {
      "id": "signal-verified",
      "name": "Signal Verified",
      "note": "Every report tiered on the evidence, the line list clean, the specimen packed right and the silent site chased before anyone assumed zero"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Signal Desk",
      "currency": "SIGNAL",
      "ranks": [
        "Data Clerk",
        "Surveillance Assistant",
        "Surveillance Officer",
        "District Epidemiologist",
        "Signal Desk Certified"
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
    "id": "who-ppe-donning-and-doffing",
    "index": "218",
    "domain": "Emergency Services",
    "trade": "Isolation-area nurse and IPC focal person — NNU/CNA nurses, SEIU and AFSCME public-health staff, and the humanitarian workforce deployed under IASC clusters",
    "category": "Emergency Services",
    "certification": "WHO infection prevention and control guidance on personal protective equipment, hand hygiene and the trained observer; CDC isolation precautions and the CDC donning and doffing sequence for gown, respirator, eye protection and gloves; OSHA 29 CFR 1910.134 for the respirator programme, its fit test and the user seal check every time it goes on; OSHA 29 CFR 1910.1030 for the gloves, the gown and the waste stream; WHO outbreak communication guidance for what staff say at the door; the Sphere Handbook's health standards and IASC cluster coordination for the Health Cluster partners who staff an isolation area together; worked by NNU/CNA nurses alongside SEIU and AFSCME public-health staff",
    "name": "PPE Donning and Doffing",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ PPE Donning and Doffing VR",
    "tagline": "The isolation anteroom: kit inspected, the bin staged, hand hygiene in full, the donning order, a seal check every time, a buddy at the door, and the doffing order that keeps the respirator on until last",
    "accent": 6273225,
    "accentCss": "#5fb8c9",
    "parSeconds": 300,
    "badge": {
      "id": "off-in-order",
      "name": "Off in Order",
      "note": "On in the right order, sealed, buddy-checked, and off again with the respirator last and clean hands at the end"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Barrier Discipline",
      "currency": "BARRIER",
      "ranks": [
        "Trainee",
        "PPE Trained",
        "Buddy Observer",
        "IPC Focal Person",
        "Barrier Discipline Certified"
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
    "id": "who-isolation-ward-setup",
    "index": "219",
    "domain": "Emergency Services",
    "trade": "Ward nurse and IPC lead — NNU/CNA nurses, SEIU and AFSCME public-health staff, and the humanitarian workforce deployed under IASC clusters",
    "category": "Emergency Services",
    "certification": "WHO infection prevention and control guidance for isolation areas — one-way flow, separation of suspected and confirmed patients, hand hygiene at the point of care; CDC isolation precautions for standard and transmission-based precautions, door signage, dedicated patient equipment and the negative-pressure room; OSHA 29 CFR 1910.1030 for sharps and infectious waste and 29 CFR 1910.134 for the respirators worn in the single room; WHO outbreak communication guidance for the families at the ward door; the Sphere Handbook's health standards and IASC cluster coordination for the partners who share the ward; worked by NNU/CNA nurses with SEIU and AFSCME public-health staff",
    "name": "Isolation Ward Setup",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Isolation Ward Setup VR",
    "tagline": "An ordinary ward turned into an isolation area: one-way flow, suspected and confirmed kept apart, beds at spacing, a negative-pressure room, hand hygiene at every bed, three waste streams and a door that stays shut",
    "accent": 7324584,
    "accentCss": "#6fc3a8",
    "parSeconds": 320,
    "badge": {
      "id": "ward-ready",
      "name": "Ward Ready",
      "note": "A ward that keeps suspected and confirmed apart, runs one way, holds its pressure and puts hand hygiene within reach of every bed"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Ward Command",
      "currency": "BARRIER",
      "ranks": [
        "Ward Aide",
        "Ward Nurse",
        "Isolation Nurse",
        "IPC Lead",
        "Ward Command Certified"
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
    "id": "who-contact-tracing-visit",
    "index": "220",
    "domain": "Emergency Services",
    "trade": "Contact tracer — SEIU and AFSCME public-health staff, NNU/CNA nurses, and the humanitarian workforce deployed under IASC clusters",
    "category": "Emergency Services",
    "certification": "WHO contact-tracing practice as the national response adopts it — contacts listed, visited and followed up daily for the period the case definition sets; WHO infection prevention and control guidance and CDC isolation precautions for distance, hand hygiene and a non-contact temperature check; OSHA 29 CFR 1910.134 for the respirator the team carries and 29 CFR 1910.1030 for anything that could carry blood; WHO outbreak communication guidance for consent, confidentiality and rumours at the gate; the Sphere Handbook's protection principles and IASC cluster coordination for the Health Cluster partners the team reports to; worked by SEIU and AFSCME public-health staff with NNU/CNA nurses",
    "name": "Contact Tracing Visit",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Contact Tracing Visit VR",
    "tagline": "A household follow-up visit: the list and the follow-up period read first, the focal person met at the gate, an outdoor interview at distance, consent asked, every contact found, a symptomatic contact referred and the day logged",
    "accent": 14723146,
    "accentCss": "#e0a84a",
    "parSeconds": 300,
    "badge": {
      "id": "every-contact",
      "name": "Every Contact",
      "note": "Every household contact found, checked without touching and logged, the case's name kept private and the sick contact referred, not driven"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Trace Team",
      "currency": "TRACE",
      "ranks": [
        "Volunteer Tracer",
        "Contact Tracer",
        "Team Lead",
        "Tracing Supervisor",
        "Trace Team Certified"
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
    "id": "who-treatment-centre-triage",
    "index": "221",
    "domain": "Emergency Services",
    "trade": "Screening and triage nurse — NNU/CNA nurses, SEIU and AFSCME public-health staff, and the humanitarian workforce deployed under IASC clusters",
    "category": "Emergency Services",
    "certification": "WHO infection prevention and control guidance for screening and triage at the entrance of a treatment centre — a posted case definition, distance at the screening point, hand hygiene for every arrival and a separate path for suspected cases; CDC isolation precautions for the screener's precautions and the separation of suspected patients; OSHA 29 CFR 1910.1030 and 29 CFR 1910.134 for the screener's gloves, gown and respirator; WHO outbreak communication guidance for what is said to a frightened family at the gate; the Sphere Handbook's health standards and IASC cluster coordination for the Health Cluster partners who run a centre's gate together; worked by NNU/CNA nurses with SEIU and AFSCME public-health staff",
    "name": "Treatment Centre Triage",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Treatment Centre Triage VR",
    "tagline": "The screening point at a treatment centre's gate: the case definition posted, a table at distance, hand washing for every arrival, a touch-free scan, questions in order, suspected cases sent by their own path, the red zone called ahead",
    "accent": 14252122,
    "accentCss": "#d9785a",
    "parSeconds": 300,
    "badge": {
      "id": "gate-held",
      "name": "Gate Held",
      "note": "Every arrival screened at distance, every suspected case sent by its own path, and nobody walked through the waiting area who should not have been"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Gate Screening",
      "currency": "SCREEN",
      "ranks": [
        "Gate Volunteer",
        "Screener",
        "Triage Nurse",
        "Gate Lead",
        "Gate Screening Certified"
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
    "id": "who-water-sanitation-and-hygiene",
    "index": "222",
    "domain": "Emergency Services",
    "trade": "WASH officer and hygiene promoter — SEIU and AFSCME public-health staff, NNU/CNA nurses, and the humanitarian workforce deployed under IASC clusters",
    "category": "Emergency Services",
    "certification": "The Sphere Handbook's water supply, sanitation and hygiene promotion standards as the WASH cluster applies them under IASC cluster coordination — treated water with a chlorine residual at the point of delivery, latrines sited away from and downhill of water sources, hand washing at every latrine, clean covered household containers; WHO infection prevention and control guidance for chlorine solutions and hand hygiene in an outbreak; CDC isolation precautions for the health facility the water point also serves; OSHA 29 CFR 1910.134 for the respirator worn when handling chlorine concentrate and 29 CFR 1910.1030 for faecal and body-fluid spills; WHO outbreak communication guidance for the hygiene promoter's conversations; worked by SEIU and AFSCME public-health staff with NNU/CNA nurses",
    "name": "Water, Sanitation and Hygiene",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Water, Sanitation and Hygiene VR",
    "tagline": "A camp water point in an outbreak: treated in order, dosed from the jar test, contact time kept, a residual read at the tap, latrines downhill with hand washing at every one, clean covered containers and a hygiene promoter who listens",
    "accent": 5218256,
    "accentCss": "#4f9fd0",
    "parSeconds": 320,
    "badge": {
      "id": "safe-at-tap",
      "name": "Safe at the Tap",
      "note": "Water treated, dosed, held and proven at the tap, latrines sited right with a basin at every one, and nobody drinking from the bypass"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Water Point",
      "currency": "LITRE",
      "ranks": [
        "WASH Volunteer",
        "Water Operator",
        "WASH Officer",
        "WASH Coordinator",
        "Water Point Certified"
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
    "id": "who-vaccination-line",
    "index": "223",
    "domain": "Emergency Services",
    "trade": "Vaccinator — NNU/CNA nurses, SEIU and AFSCME public-health staff, and the humanitarian workforce deployed under IASC clusters",
    "category": "Emergency Services",
    "certification": "WHO immunization practice as the national programme adopts it for an outbreak response — the cold chain, the vaccine vial monitor, auto-disable syringes, safety boxes, screening and consent, and observation for adverse events following immunization; WHO infection prevention and control guidance for injection safety and hand hygiene; OSHA 29 CFR 1910.1030 for sharps, the prohibition on recapping a used needle by hand and the post-exposure pathway, and 29 CFR 1910.134 where the session's risk assessment calls for respirators; CDC isolation precautions for anyone who arrives unwell; WHO outbreak communication guidance for answering hesitant questions at the table; the Sphere Handbook's health standards and IASC cluster coordination for the Health Cluster partners who run a campaign together; worked by NNU/CNA nurses with SEIU and AFSCME public-health staff",
    "name": "Vaccination Line",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Vaccination Line VR",
    "tagline": "An outbreak vaccination session: the plan read, the cold chain proven, vials checked, each person screened and consenting, an auto-disable syringe straight into the safety box, the card kept and the observation area watched",
    "accent": 9084896,
    "accentCss": "#8a9fe0",
    "parSeconds": 300,
    "badge": {
      "id": "cold-and-capped",
      "name": "Cold and Uncapped",
      "note": "The cold chain proven, every vial checked, every syringe straight into the box uncapped, and every person watched before they went home"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Vaccine Table",
      "currency": "DOSE",
      "ranks": [
        "Recorder",
        "Vaccinator",
        "Team Lead",
        "Session Supervisor",
        "Vaccine Table Certified"
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
    "id": "who-risk-communication-and-community-engagement",
    "index": "224",
    "domain": "Emergency Services",
    "trade": "Risk communication and community engagement officer — SEIU and AFSCME public-health staff, NNU/CNA nurses, and the humanitarian workforce deployed under IASC clusters",
    "category": "Emergency Services",
    "certification": "WHO outbreak communication guidance — trust, announcing early, transparency, listening to the public and planning — as the risk communication and community engagement working group applies it; WHO infection prevention and control guidance for the practical advice given at the meeting; CDC isolation precautions for what families are told about a relative in isolation; OSHA 29 CFR 1910.1030 and 29 CFR 1910.134 for the health staff who attend; the Sphere Handbook's core humanitarian standard commitments on communication, participation and feedback, and IASC cluster coordination for sharing the rumour log across partners; worked by SEIU and AFSCME public-health staff with NNU/CNA nurses",
    "name": "Risk Communication and Community Engagement",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Risk Communication and Community Engagement VR",
    "tagline": "A community meeting in an outbreak: the rumour log read first, what is known and what is not, trusted voices at the front, the community's language, listening before answering, rumours logged not repeated, and the feedback loop closed",
    "accent": 13208280,
    "accentCss": "#c98ad8",
    "parSeconds": 320,
    "badge": {
      "id": "loop-closed",
      "name": "Loop Closed",
      "note": "A message that said what is known and what is not, trusted voices heard, every rumour logged and none repeated, and last week's questions answered in public"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Community Voice",
      "currency": "TRUST",
      "ranks": [
        "Community Mobiliser",
        "RCCE Officer",
        "Engagement Lead",
        "RCCE Coordinator",
        "Community Voice Certified"
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
    "id": "who-safe-and-dignified-burial",
    "index": "225",
    "domain": "Emergency Services",
    "trade": "Burial team member — SEIU and AFSCME public-health staff, NNU/CNA nurses, and the humanitarian workforce deployed under IASC clusters",
    "category": "Emergency Services",
    "certification": "WHO safe and dignified burial practice as the national response adopts it — a trained team with assigned roles, the family engaged with a community or religious representative before anything is done, and dignity treated as part of safety; WHO infection prevention and control guidance for the team's PPE, chlorine solutions and handling of the body; CDC isolation precautions for the transmission-based precautions the team works under; OSHA 29 CFR 1910.1030 for body fluids and 29 CFR 1910.134 for the respirators worn; WHO outbreak communication guidance for what is said to the family and the neighbours; the Sphere Handbook's minimum standards and IASC cluster coordination for the partners who field burial teams; worked by SEIU and AFSCME public-health staff with NNU/CNA nurses",
    "name": "Safe and Dignified Burial",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Safe and Dignified Burial VR",
    "tagline": "A burial team's visit: roles assigned, the family met with their community representative, PPE, the sprayer mixed to protocol, the family's items found, the body carried by the whole team, the grave marked, a pause for prayer, a supervised doff",
    "accent": 12103840,
    "accentCss": "#b8b0a0",
    "parSeconds": 330,
    "badge": {
      "id": "safe-and-dignified",
      "name": "Safe and Dignified",
      "note": "The family heard first, the body carried by the whole team, the grave marked for the family to find, and every team member doffed under supervision"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Burial Team",
      "currency": "RESPECT",
      "ranks": [
        "Team Trainee",
        "Burial Team Member",
        "Sprayer",
        "Team Leader",
        "Burial Team Certified"
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
    "id": "who-after-action-review",
    "index": "226",
    "domain": "Emergency Services",
    "trade": "AAR facilitator — SEIU and AFSCME public-health staff, NNU/CNA nurses, and the humanitarian workforce deployed under IASC clusters",
    "category": "Emergency Services",
    "certification": "WHO after-action review practice — a facilitated, no-blame review of what was planned, what actually happened, what went well and what should change, with actions owned and dated — as the national authority runs it after an outbreak; WHO infection prevention and control guidance and CDC isolation precautions as the benchmarks the clinical findings are read against; OSHA 29 CFR 1910.1030 and 29 CFR 1910.134 for the worker-safety findings; WHO outbreak communication guidance for the community-engagement findings and for how the report is shared; the Sphere Handbook's core commitments on learning and improvement and IASC cluster coordination for sharing it with the Health Cluster; worked by SEIU and AFSCME public-health staff with NNU/CNA nurses",
    "name": "After-Action Review",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ After-Action Review VR",
    "tagline": "The review once the outbreak is over: the right people in the room, no blame and no rank, a timeline from the record, planned against actual, the frontline heard first, every action with an owner and a date, and the report shared",
    "accent": 10142826,
    "accentCss": "#9ac46a",
    "parSeconds": 320,
    "badge": {
      "id": "lessons-owned",
      "name": "Lessons Owned",
      "note": "The frontline heard first, nobody blamed by name, and every lesson turned into an action with an owner and a date"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Review Room",
      "currency": "LESSON",
      "ranks": [
        "Note-taker",
        "Co-facilitator",
        "Facilitator",
        "Lead Facilitator",
        "Review Room Certified"
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
    "id": "apprenticeship-standards-reading",
    "index": "256",
    "domain": "Apprenticeship navigation",
    "trade": "Apprenticeship navigation — reading the standard",
    "category": "Community Environmental Justice",
    "certification": "Registered apprenticeship standards as a category — the written standards a sponsor registers with the U.S. Department of Labor or a State Apprenticeship Agency, setting the term and work processes, related instruction, the progressive wage schedule, the ratio, the probationary period, the selection procedure and the equal-opportunity pledge; OSHA 10 through the OSHA Outreach Training Program; OSHA 29 CFR 1926.21 on the employer's duty to train each employee for the site; the building-trades training funds that sponsor such programmes, LIUNA and IUOE among them",
    "name": "Reading an Apprenticeship Standard",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Reading an Apprenticeship Standard VR",
    "tagline": "How to read a registered apprenticeship standard, the ladder from pre-apprentice to journey level, what the aptitude test covers, the tool list, and where OSHA 10 fits — a sourced briefing and knowledge check",
    "accent": 14725194,
    "accentCss": "#e0b04a",
    "parSeconds": 300,
    "badge": {
      "id": "standard-read",
      "name": "Standard Read",
      "note": "The standard, the ladder, the test and the first morning answered without an unsafe conclusion"
    },
    "stepCount": 10,
    "interruptCount": 0,
    "flat": true,
    "dossier": [
      {
        "title": "What an apprenticeship standard is",
        "body": "A registered apprenticeship programme runs under written standards that its sponsor — often a joint committee of a union and contractors — registers with the U.S. Department of Labor's Office of Apprenticeship or with a State Apprenticeship Agency; in California that agency is the Division of Apprenticeship Standards. The standard is the document to read before applying. It states the occupation; the term, as hours of on-the-job learning broken down by work process; the related technical instruction; the progressive wage schedule, as a share of the journey-level rate for each period; the ratio of apprentices to journey-level workers; the probationary period; the selection procedure; and the equal-opportunity pledge. Not sourced here: any particular programme's figures — its hours, its rates, its ratio. Read those in that programme's own standard.",
        "source": {
          "label": "U.S. Department of Labor — Apprenticeship.gov",
          "url": "https://www.apprenticeship.gov/"
        },
        "source2": {
          "label": "California DIR — Division of Apprenticeship Standards",
          "url": "https://www.dir.ca.gov/das/"
        }
      },
      {
        "title": "The ladder, from pre-apprentice to journey level",
        "body": "Pre-apprenticeship prepares people to enter a registered programme's selection process — many building-trades pre-apprenticeship programmes teach North America's Building Trades Unions' Multi-Craft Core Curriculum — but it does not by itself place anyone in a programme. An applicant then goes through the programme's selection procedure. Once indentured, an apprentice serves the probationary period the standard sets, then advances period by period as on-the-job hours, related instruction and evaluations are completed, with a raise at each step of the wage schedule. Completing the term leads to journey-level status and a certificate of completion from the registration agency. Not sourced here: how long any trade's ladder takes, or how many applicants any programme accepts.",
        "source": {
          "label": "U.S. Department of Labor — Apprenticeship.gov",
          "url": "https://www.apprenticeship.gov/"
        },
        "source2": {
          "label": "North America's Building Trades Unions",
          "url": "https://nabtu.org/"
        }
      },
      {
        "title": "What the aptitude test usually covers",
        "body": "Many construction programmes include an aptitude test in their selection procedure. Across trades the common sections are arithmetic and measurement — fractions, decimals, reading a tape measure — and reading comprehension, with mechanical reasoning or spatial questions on some trades' tests and not others. Minimum qualifications commonly include an age at indenture, a diploma or equivalency, and sometimes a driver's licence. Not sourced here: any specific trade's test, its sections, its time limits or its passing score. The programme's own recruitment notice and outline are the only place to read those, and nobody outside the programme can sell a place on its list.",
        "source": {
          "label": "U.S. Department of Labor — Apprenticeship.gov",
          "url": "https://www.apprenticeship.gov/"
        }
      },
      {
        "title": "The tool list and the PPE",
        "body": "Programmes publish the basic hand tools a first-period apprentice is expected to bring. The sensible rule is to buy what is on the list and nothing more until a journey-level worker tells you what the work needs. Personal protective equipment is different: OSHA's rules generally require the employer to pay for the PPE a job requires, with exceptions such as ordinary safety-toe boots and prescription safety glasses. Not sourced here: any programme's actual tool list, or what a particular employer provides.",
        "source": {
          "label": "OSHA — Personal protective equipment",
          "url": "https://www.osha.gov/personal-protective-equipment"
        }
      },
      {
        "title": "OSHA 10 and the site's own training",
        "body": "OSHA 10 is the ten-hour construction course of the OSHA Outreach Training Program, taught by an authorized trainer. It is voluntary awareness training — some states and many contractors require it — and it is not a licence and not a certification. It does not replace the employer's own duty under 29 CFR 1926.21 to instruct each employee in recognising and avoiding the unsafe conditions of the job, which is what the site-specific orientation on the first morning is for.",
        "source": {
          "label": "OSHA Outreach Training Program",
          "url": "https://www.osha.gov/training/outreach"
        },
        "source2": {
          "label": "OSHA 29 CFR 1926.21 — Safety training and education",
          "url": "https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.21"
        }
      },
      {
        "title": "What this edition is, and what is not sourced",
        "body": "The Job Readiness Edition is built from the programmes wojrc.org describes. On apprenticeship, its own words are: \"We prepare you and help you navigate and enroll in union construction trades apprenticeship programs.\" Nothing else about the organisation's navigation service — how it works, who runs it, its partners or its results — could be retrieved when this station was written, so none of it is stated here. The stations that follow train the steps any applicant takes, sited generically.",
        "source": {
          "label": "wojrc.org — text supplied by the sponsor of this edition",
          "url": "https://wojrc.org/"
        }
      }
    ],
    "game": {
      "system": "Standard Reader",
      "currency": "CLAUSE",
      "ranks": [
        "Curious",
        "Reader",
        "Applicant-Ready",
        "Ladder-Wise",
        "Standard Reader Certified"
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
    "id": "apprenticeship-application-and-test",
    "index": "257",
    "domain": "Apprenticeship navigation",
    "trade": "Apprenticeship applicant — the application and the aptitude test",
    "category": "Community Environmental Justice",
    "certification": "The selection procedure in the programme's registered apprenticeship standard — the recruitment window, the minimum qualifications, the aptitude test and the ranking — registered with the U.S. Department of Labor or a State Apprenticeship Agency, and the equal-opportunity pledge every registered programme carries; the Americans with Disabilities Act, under which an applicant with a disability may ask for a reasonable accommodation on the test; OSHA 10 through the OSHA Outreach Training Program, which some programmes ask for and many pre-apprenticeship courses give; the training funds of the building-trades unions that sponsor such programmes, LIUNA and IUOE among them; SAMHSA's National Helpline for anyone for whom a pre-indenture drug screen is a worry",
    "name": "Apprenticeship Application & Test",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Apprenticeship Application & Test VR",
    "tagline": "Read the recruitment notice, gather the documents, read the application before signing it, hand it in on time, ask for an accommodation early, and sit the aptitude test at a steady pace — past a caller after your Social Security number",
    "accent": 15777882,
    "accentCss": "#f0c05a",
    "parSeconds": 290,
    "badge": {
      "id": "application-in-on-time",
      "name": "In On Time",
      "note": "The application read, signed and handed in before the window closed, and the test sat without a shortcut"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Applicant File",
      "currency": "RANK",
      "ranks": [
        "Interested",
        "Applicant",
        "Tested",
        "Ranked",
        "Application Certified"
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
    "id": "jobsite-orientation-and-osha-10",
    "index": "258",
    "domain": "Apprenticeship navigation",
    "trade": "First-period construction apprentice — the first day on site",
    "category": "Community Environmental Justice",
    "certification": "OSHA 29 CFR 1926.21 — the employer's duty to instruct each employee in recognising and avoiding the unsafe conditions of the site; OSHA 10 through the OSHA Outreach Training Program, a voluntary ten-hour awareness course taught by an authorized trainer that some states and many contractors require; OSHA 29 CFR 1926.501 and 29 CFR 1926.502 for fall protection from six feet and the personal fall arrest system; OSHA 29 CFR 1926.416 on worn or damaged cords; OSHA 29 CFR 1926.1153 for wet cutting under the silica standard; the ladder rules in 29 CFR 1926; the apprenticeship standard's requirement that an apprentice works under a journey-level worker; LIUNA's training fund as one of the building-trades programmes that trains first-period apprentices for exactly this morning",
    "name": "Jobsite Orientation & OSHA 10",
    "weather": "clear",
    "indoor": null,
    "district": "Construction & Structural Trades",
    "title": "SmartCiti.X~ Jobsite Orientation & OSHA 10 VR",
    "tagline": "The first morning on site: the OSHA 10 card shown and understood, the site orientation the employer owes you, hazards found, a ladder set, a harness on and tied off, water on the saw — while a foreman tries to skip it all",
    "accent": 15901754,
    "accentCss": "#f2a43a",
    "parSeconds": 300,
    "badge": {
      "id": "oriented-not-rushed",
      "name": "Oriented, Not Rushed",
      "note": "The whole orientation done before the first task, with nobody talked into skipping any of it"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Site Ready",
      "currency": "TAG",
      "ranks": [
        "New Face",
        "Signed In",
        "Oriented",
        "Tied Off",
        "Site Ready Certified"
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
    "id": "union-hall-and-dispatch",
    "index": "259",
    "domain": "Apprenticeship navigation",
    "trade": "Construction apprentice — the union hall and the dispatch",
    "category": "Community Environmental Justice",
    "certification": "The local's own referral rules as posted in the hall, and the apprenticeship standard the apprentice is indentured under — registered with the U.S. Department of Labor or a State Apprenticeship Agency — which sets the work processes an apprentice trains in, the supervision by journey-level workers and the ratio; the building-trades training funds that run such programmes, LIUNA and IUOE among them; OSHA 10 through the OSHA Outreach Training Program, which many contractors ask to see on the first morning; IRS guidance that all income, including cash, is reportable; SAMHSA's National Helpline and 988 for the stress of the weeks between jobs",
    "name": "Union Hall & Dispatch",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Union Hall & Dispatch VR",
    "tagline": "Sign the book in your own name, bring the cards, read the rules, take the slip and read it, plan the morning back from the report time, and stay reachable — while a dispatch you should not take and a cash job both come calling",
    "accent": 7317724,
    "accentCss": "#6fa8dc",
    "parSeconds": 290,
    "badge": {
      "id": "dispatched-right",
      "name": "Dispatched Right",
      "note": "On the book in your own name, dispatched to work inside your apprenticeship, and there on time with the right tools"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Referral Book",
      "currency": "SLIP",
      "ranks": [
        "Walk-In",
        "On The Book",
        "Dispatched",
        "Reported",
        "Dispatch Certified"
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
    "id": "first-period-evaluation",
    "index": "260",
    "domain": "Apprenticeship navigation",
    "trade": "Construction apprentice — the first-period evaluation",
    "category": "Community Environmental Justice",
    "certification": "The apprenticeship standard the apprentice is indentured under — registered with the U.S. Department of Labor or a State Apprenticeship Agency — which sets the on-the-job hours by work process, the related instruction, the periodic evaluation, the supervision of apprentices by journey-level workers and the progressive wage schedule; OSHA 29 CFR 1926.21 on the employer's duty to train, and the guarding and tool rules of 29 CFR 1926; OSHA 10 through the OSHA Outreach Training Program as the awareness base the demonstration builds on; NIOSH guidance on hearing loss prevention; SAMHSA's National Helpline and 988 for the stress an evaluation carries",
    "name": "First-Period Evaluation",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ First-Period Evaluation VR",
    "tagline": "The end of the first period: the logbook checked, a guarded skills demonstration, the signed pages in, the evaluation read before it is signed, and the next rate read off the schedule — while a foreman tries to send you up a lift alone",
    "accent": 13209434,
    "accentCss": "#c98f5a",
    "parSeconds": 300,
    "badge": {
      "id": "period-one-passed",
      "name": "Period One Passed",
      "note": "A clean logbook, a guarded demonstration and an evaluation read before it was signed"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Period Card",
      "currency": "HOUR",
      "ranks": [
        "First Period",
        "Logbook Kept",
        "Demonstrated",
        "Evaluated",
        "Period Advancement Certified"
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
    "id": "credit-report-reading",
    "index": "251",
    "domain": "Financial coaching",
    "trade": "Financial coaching — reading and correcting a credit report",
    "category": "Community Environmental Justice",
    "certification": "The Fair Credit Reporting Act (FCRA) as the Consumer Financial Protection Bureau (CFPB) states it — free credit reports from each nationwide credit reporting company through AnnualCreditReport.com, the right to dispute inaccurate or incomplete information with the company that reports it and the company that furnished it, and an investigation usually completed within 30 days; the CFPB's guidance on security freezes, fraud alerts and debt collection; the Truth in Lending Act's APR disclosure as the CFPB describes it, for the card accounts listed on the report; the IRS's published statement that it does not start contact by text or email to ask for personal or financial information; SAMHSA's National Helpline and 988 for the stress money problems carry",
    "name": "Credit Report Reading",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Credit Report Reading VR",
    "tagline": "Pull the free report, read every line, find what is wrong, and send the dispute to both companies with a date for the answer — while a caller and a text both try to get your Social Security number",
    "accent": 7324336,
    "accentCss": "#6fc2b0",
    "parSeconds": 290,
    "badge": {
      "id": "report-read-right",
      "name": "Report Read Right",
      "note": "Every line read, every error disputed with both companies, and nothing given to a caller you could not verify"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Credit File",
      "currency": "LINE",
      "ranks": [
        "First Look",
        "Line Reader",
        "Dispute Writer",
        "File Keeper",
        "Credit Report Certified"
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
    "id": "debt-reduction-plan",
    "index": "252",
    "domain": "Financial coaching",
    "trade": "Financial coaching — building a debt reduction plan",
    "category": "Community Environmental Justice",
    "certification": "The Consumer Financial Protection Bureau (CFPB) guidance on debt collection — asking a collector for validation information in writing, disputing a debt, and what a collector may not threaten — and its budgeting and debt tools; the Truth in Lending Act as the CFPB describes it, including the APR and the minimum-payment warning printed on every card statement; the Fair Credit Reporting Act (FCRA) as the CFPB states it, under which accurate negative information can stay on a report for years; IRS guidance that a canceled or forgiven debt may count as income and is reported on Form 1099-C; SAMHSA's National Helpline and 988 for the stress debt carries",
    "name": "Debt Reduction Plan",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Debt Reduction Plan VR",
    "tagline": "Every debt on the table with its rate and minimum, sorted highest rate first, a monthly amount you can keep, and a plan with a finish date — past a threatening collector, a settlement contract and a consolidation text",
    "accent": 14723162,
    "accentCss": "#e0a85a",
    "parSeconds": 290,
    "badge": {
      "id": "plan-with-a-date",
      "name": "Plan With A Date",
      "note": "Every debt listed, sorted by rate, and a plan with a finish date that nobody talked you out of"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Payoff Ledger",
      "currency": "PAYDOWN",
      "ranks": [
        "Statement Pile",
        "Debt Lister",
        "Plan Builder",
        "Plan Keeper",
        "Debt Plan Certified"
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
    "id": "pay-stub-and-withholding",
    "index": "253",
    "domain": "Financial coaching",
    "trade": "Financial coaching — reading a pay stub and checking withholding",
    "category": "Community Environmental Justice",
    "certification": "IRS guidance for workers — Form W-4 and when to review it, the IRS Tax Withholding Estimator, who may claim exemption from withholding, free tax help through the IRS's Volunteer Income Tax Assistance programme, the rule that all income including cash is reportable, and the IRS's own statement of how it contacts taxpayers; the progressive wage schedule in the apprenticeship standard the apprentice was indentured under, registered with the U.S. Department of Labor or a State Apprenticeship Agency; LIUNA's dues and benefit deductions as the local's agreement sets them; the CFPB's budgeting guidance, which starts from take-home pay; SAMHSA's National Helpline and 988 for the stress money problems carry",
    "name": "Pay Stub & Withholding",
    "weather": "clear",
    "indoor": "service",
    "district": null,
    "title": "SmartCiti.X~ Pay Stub & Withholding VR",
    "tagline": "Read the first stub properly: rate against the wage schedule, hours against your own log, every deduction named, the W-4 read before signing and checked with the IRS's own estimator — past a caller using the IRS's name",
    "accent": 9418984,
    "accentCss": "#8fb8e8",
    "parSeconds": 300,
    "badge": {
      "id": "stub-read-right",
      "name": "Stub Read Right",
      "note": "Rate, hours and deductions all checked, the error raised in writing, and nothing given to a caller using the IRS's name"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Payday Check",
      "currency": "STUB",
      "ranks": [
        "New Hire",
        "Stub Reader",
        "Hours Keeper",
        "Withholding Checked",
        "Payday Certified"
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
    "id": "budget-with-irregular-income",
    "index": "254",
    "domain": "Financial coaching",
    "trade": "Financial coaching — budgeting on irregular construction income",
    "category": "Community Environmental Justice",
    "certification": "The Consumer Financial Protection Bureau (CFPB) budgeting guidance — tracking income and spending, putting housing, utilities, food and getting to work first when money is tight — and its warnings on payday loans, car title loans and buy-now-pay-later plans; the Truth in Lending Act as the CFPB describes it, under which a lender discloses the APR and finance charge before you sign; IRS guidance that self-employment income, including side work paid on a 1099, may require estimated tax payments during the year; the apprenticeship standard's wage schedule, which sets the rate but not the number of hours a season brings; SAMHSA's National Helpline and 988 for the stress an uneven income carries",
    "name": "Budget With Irregular Income",
    "weather": "clear",
    "indoor": "hotel",
    "district": null,
    "title": "SmartCiti.X~ Budget With Irregular Income VR",
    "tagline": "A year of uneven construction pay turned into a budget that holds: built on the lean month, essentials first, the good months feeding a buffer, tax set aside, bills lined up with paydays — and tested by a car repair",
    "accent": 10142826,
    "accentCss": "#9ac46a",
    "parSeconds": 290,
    "badge": {
      "id": "lean-month-ready",
      "name": "Lean Month Ready",
      "note": "A budget built on the lean month that paid a car repair from its own buffer without a payday loan"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Season Budget",
      "currency": "BUFFER",
      "ranks": [
        "Paycheck To Paycheck",
        "Income Tracker",
        "Budget Builder",
        "Buffer Keeper",
        "Season Budget Certified"
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
    "id": "emergency-savings-and-predatory-lending",
    "index": "255",
    "domain": "Financial coaching",
    "trade": "Financial coaching — emergency savings and avoiding predatory loans",
    "category": "Community Environmental Justice",
    "certification": "The Consumer Financial Protection Bureau (CFPB) guidance on building an emergency fund, on payday and small-dollar loans — including its worked example that a fifteen-dollar fee per hundred borrowed for two weeks is an APR of almost 400 percent — and on overdraft coverage for debit purchases, which a bank needs your opt-in to provide; the Truth in Lending Act as the CFPB describes it, under which the APR, finance charge and total of payments are disclosed in writing before you sign; the Fair Credit Reporting Act (FCRA) as the CFPB states it, under which a loan sent to collection can stay on a report for years; IRS guidance that a refund can be split by direct deposit into more than one account; SAMHSA's National Helpline and 988 for the stress money emergencies carry",
    "name": "Emergency Savings & Predatory Lending",
    "weather": "clear",
    "indoor": "clinic",
    "district": null,
    "title": "SmartCiti.X~ Emergency Savings & Predatory Lending VR",
    "tagline": "Build the fund that pays for the car repair — automatic, separate, fed by the refund — and read any loan offer by its APR, finance charge and total before signing, past a lender who wants your Social Security number now",
    "accent": 14191288,
    "accentCss": "#d88ab8",
    "parSeconds": 290,
    "badge": {
      "id": "fund-before-loan",
      "name": "Fund Before Loan",
      "note": "The repair paid from savings, every loan read by its APR and total, and nothing signed or said on a lender's deadline"
    },
    "stepCount": 12,
    "interruptCount": 2,
    "game": {
      "system": "Rainy Day",
      "currency": "SAVED",
      "ranks": [
        "Paycheck Zero",
        "First Deposit",
        "Steady Saver",
        "Offer Reader",
        "Rainy Day Certified"
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
    "id": "tdl-pallet-jack-and-racking",
    "index": "217",
    "domain": "Warehouse & Distribution",
    "trade": "Warehouse associate, TDL pre-apprenticeship — Teamsters warehouse work: pallet jack and racking, ahead of the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F) for those going on to Class A",
    "category": "Mobility & Transit",
    "certification": "OSHA 29 CFR 1910.178 powered industrial trucks, which covers motorized hand trucks and requires operator training and evaluation under paragraph (l) with a re-evaluation at least every three years; ANSI B56.1 for low-lift trucks; 29 CFR 1910.22 walking-working surfaces for aisles kept clear; 29 CFR 1910.157 for fire extinguishers kept reachable; the Revised NIOSH Lifting Equation for the hand work around the pallet; Teamsters warehouse locals' powered-truck programmes",
    "name": "Pallet Jack and Racking",
    "weather": "clear",
    "indoor": "garage",
    "district": null,
    "title": "SmartCiti.X~ Pallet Jack and Racking VR",
    "tagline": "A walkie pallet jack and a run of selective racking: pre-use inspection, controls tested, the pallet against the rating and the plaque, raised just clear, walking pace with the horn at the aisle end, a floor location set square, the rack walk and the park",
    "accent": 15769914,
    "accentCss": "#f0a13a",
    "parSeconds": 260,
    "badge": {
      "id": "square-and-clear",
      "name": "Square and Clear",
      "note": "A putaway with the truck inspected, the load inside both ratings, the aisle warned and the rack damage reported — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Floor Operations",
      "currency": "PALLET",
      "ranks": [
        "New Associate",
        "Jack Operator",
        "Aisle Lead",
        "Putaway Lead",
        "Floor Operations Certified"
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
    "id": "tdl-pick-pack-and-scan",
    "index": "218",
    "domain": "Warehouse & Distribution",
    "trade": "Order picker and packer, TDL pre-apprenticeship — Teamsters warehouse work: pick, pack and scan, ahead of the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F) for those going on to Class A",
    "category": "Mobility & Transit",
    "certification": "OSHA 29 CFR 1910.147 control of hazardous energy for conveyor jam clearing; 29 CFR 1910.178 for the forklift traffic the pick aisles share; 29 CFR 1910.22 walking-working surfaces; the Revised NIOSH Lifting Equation for repetitive picking; PHMSA 49 CFR 172 hazard communication marks, including the limited-quantity mark, on packages that pass through a pick face; Teamsters warehouse locals' safety committees and training",
    "name": "Pick, Pack and Scan",
    "weather": "clear",
    "indoor": "garage",
    "district": null,
    "title": "SmartCiti.X~ Pick, Pack and Scan VR",
    "tagline": "One pick wave: scanner and tote, a slot that does not match its label, a cart in a forklift aisle, the right compartment, a jammed conveyor stopped, isolated and locked, a carton weighed against the order and a label read before it ships",
    "accent": 5224649,
    "accentCss": "#4fb8c9",
    "parSeconds": 250,
    "badge": {
      "id": "zero-touch-jam",
      "name": "Zero-Touch Jam",
      "note": "A wave picked and packed with the conveyor locked out before the jam was touched, the forklift yielded to and the mis-pick caught on the scale — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Order Fulfilment",
      "currency": "SCAN",
      "ranks": [
        "New Picker",
        "Picker",
        "Packer",
        "Wave Lead",
        "Fulfilment Certified"
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
    "id": "tdl-trailer-loading-and-dock-plate",
    "index": "219",
    "domain": "Warehouse & Distribution",
    "trade": "Dock loader, TDL pre-apprenticeship — Teamsters warehouse and dock work: trailer loading and dock plate, ahead of the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F) for those going on to Class A",
    "category": "Mobility & Transit",
    "certification": "OSHA 29 CFR 1910.178 powered industrial trucks, including trailer brakes set, wheel chocks under the rear wheels and fixed jacks under an uncoupled semitrailer while it is boarded by a truck; ANSI B56.1 for the counterbalanced truck; 29 CFR 1910.22 walking-working surfaces and OSHA's dockboard requirements for plates secured against sliding; FMCSA 49 CFR 393 Subpart I, which the carrier's driver answers for at the roadside and the loader builds for at the dock; Teamsters warehouse and freight locals' dock training",
    "name": "Trailer Loading and Dock Plate",
    "weather": "clear",
    "indoor": "garage",
    "district": null,
    "title": "SmartCiti.X~ Trailer Loading and Dock Plate VR",
    "tagline": "A dropped van at a plate door: load plan, trailer walk, chock and nose jack, restraint held till it grips, a plate rated for truck plus load and seated, the load built tight, a load bar across the last row, and a release that never leaves a plate on a trailer that can move",
    "accent": 14857020,
    "accentCss": "#e2b33c",
    "parSeconds": 270,
    "badge": {
      "id": "tight-and-sealed",
      "name": "Tight and Sealed",
      "note": "A trailer chocked and jacked before the plate, loaded tight with a load bar across the last row and released in order — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Dock Loading",
      "currency": "LOAD",
      "ranks": [
        "Dock Trainee",
        "Loader",
        "Lead Loader",
        "Dock Lead",
        "Dock Loading Certified"
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
    "id": "tdl-hazmat-labeling-and-segregation",
    "index": "220",
    "domain": "Warehouse & Distribution",
    "trade": "Hazmat shipping associate, TDL pre-apprenticeship — Teamsters warehouse and freight work: hazmat labelling and segregation, ahead of the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F) for those going on to Class A",
    "category": "Mobility & Transit",
    "certification": "PHMSA 49 CFR 172 — the hazardous materials table, shipping papers and the shipper's certification, package marking and labels, placarding, emergency response information, and the hazmat employee training every person who handles or prepares a shipment must have, refreshed at least every three years; 49 CFR 177 for loading and segregation on the vehicle; OSHA 29 CFR 1910.1200 hazard communication and the safety data sheet; 29 CFR 1910.132 personal protective equipment; ANSI Z358.1 for the eyewash; 29 CFR 1910.178 for the truck that loads the trailer; Teamsters freight and warehouse locals' hazmat training",
    "name": "Hazmat Labeling and Segregation",
    "weather": "clear",
    "indoor": "garage",
    "district": null,
    "title": "SmartCiti.X~ Hazmat Labeling and Segregation VR",
    "tagline": "A hazmat staging cage at an outbound door: the paper read, PPE and eyewash, labels, marks and arrows audited, a drum weighed and its bung checked, staged away from what it must never meet, emergency information attached, placards walked on every side, and the paper signed to the driver",
    "accent": 14706234,
    "accentCss": "#e0663a",
    "parSeconds": 280,
    "badge": {
      "id": "segregated",
      "name": "Segregated",
      "note": "A hazmat shipment staged away from its incompatibles, with every label, mark and placard right and the paper signed — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Hazmat Shipping",
      "currency": "PAPER",
      "ranks": [
        "Hazmat Trainee",
        "Hazmat Employee",
        "Hazmat Shipper",
        "Hazmat Lead",
        "Hazmat Shipping Certified"
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
    "id": "tdl-lifting-and-ergonomics",
    "index": "221",
    "domain": "Warehouse & Distribution",
    "trade": "Warehouse associate, TDL pre-apprenticeship — Teamsters warehouse work: manual lifting and ergonomics, ahead of the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F) for those going on to Class A",
    "category": "Mobility & Transit",
    "certification": "The Revised NIOSH Lifting Equation and its Applications Manual — recommended weight limit and lifting index for two-handed lifts; NIOSH ergonomics research on repetitive manual handling; OSHA 29 CFR 1904 recording and reporting of work-related injuries, including a worker's right to report without retaliation; 29 CFR 1910.22 walking-working surfaces; 29 CFR 1910.178 and ANSI B56.1 for the pallet trucks that share the floor; Teamsters (IBT) warehouse locals' safety committees and ergonomics programmes",
    "name": "Lifting and Ergonomics",
    "weather": "clear",
    "indoor": "garage",
    "district": null,
    "title": "SmartCiti.X~ Lifting and Ergonomics VR",
    "tagline": "A case-picking station: the job card, each lift sized up and scored the way the NIOSH Lifting Equation scores it, the pallet raised and turned instead of reached across, a carry held close, the power-zone shelf, a team lift on a count, a partner who hurts his back, and a discomfort report made early",
    "accent": 9421914,
    "accentCss": "#8fc45a",
    "parSeconds": 250,
    "badge": {
      "id": "power-zone",
      "name": "Power Zone",
      "note": "A shift of lifts with the station changed to fit the worker, the team lift called and the discomfort reported early — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Manual Handling",
      "currency": "LIFT",
      "ranks": [
        "New Associate",
        "Case Picker",
        "Station Lead",
        "Ergonomics Rep",
        "Manual Handling Certified"
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
    "id": "tdl-pretrip-inspection",
    "index": "222",
    "domain": "Commercial Driving",
    "trade": "Class A driver trainee, TDL pre-apprenticeship — Teamsters freight driving: pre-trip inspection under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
    "category": "Mobility & Transit",
    "certification": "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose Class A theory and range curriculum includes vehicle inspection, delivered by a provider on the Training Provider Registry; 49 CFR 396 inspection, repair and maintenance, including reviewing the last driver vehicle inspection report and writing your own; 49 CFR 393 parts and accessories, including tread depth and the emergency equipment a truck carries; 49 CFR 395 hours of service, which logs inspection time as on duty; the CVSA North American Standard Out-of-Service Criteria a roadside inspector applies; Teamsters (IBT) freight locals' driver training",
    "name": "Pre-Trip Inspection",
    "weather": "overcast",
    "indoor": null,
    "district": "Mobility & Transit",
    "title": "SmartCiti.X~ Pre-Trip Inspection VR",
    "tagline": "A tractor-trailer before the first dispatch: the last report read, the rig secured, the engine bay walked cold, tread measured, lamps and lights walked, brake lights held, mirrors set, triangles stowed, the engine started and watched, tires and air lines walked, and the defects written down",
    "accent": 5809896,
    "accentCss": "#58a6e8",
    "parSeconds": 300,
    "badge": {
      "id": "written-up",
      "name": "Written Up",
      "note": "A full pre-trip with every defect found, the engine shut down on the overheat and the report written honestly — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Vehicle Inspection",
      "currency": "CHECK",
      "ranks": [
        "Permit Holder",
        "Driver Trainee",
        "Class A Driver",
        "Lead Driver",
        "Inspection Certified"
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
    "id": "tdl-air-brake-test",
    "index": "223",
    "domain": "Commercial Driving",
    "trade": "Class A driver trainee, TDL pre-apprenticeship — Teamsters freight driving: the air brake check under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
    "category": "Mobility & Transit",
    "certification": "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose Class A curriculum covers air brakes and the in-cab brake check, delivered by a provider on the Training Provider Registry; 49 CFR 393 brake system requirements, including the low-pressure warning; 49 CFR 396 inspection and the driver vehicle inspection report; the CVSA North American Standard Out-of-Service Criteria for brakes, air loss and adjustment that a roadside inspector applies; the state commercial driver manual's air brake section, which sets the figures a skills examiner checks; Teamsters (IBT) freight locals' driver training",
    "name": "Air Brake Test",
    "weather": "clear",
    "indoor": null,
    "district": "Mobility & Transit",
    "title": "SmartCiti.X~ Air Brake Test VR",
    "tagline": "The in-cab air brake check: chock, build and time the air, read the governor, release and watch the static leak, hold the applied leak, fan down to the warning and the pop-out, drain the tanks, feel the service brakes, find the leaks and write the numbers down",
    "accent": 15909195,
    "accentCss": "#f2c14b",
    "parSeconds": 300,
    "badge": {
      "id": "holds-air",
      "name": "Holds Air",
      "note": "A full in-cab brake check with every leak rate inside the manual's figure, the blown line caught and the numbers in the report — first time"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Air Brakes",
      "currency": "PSI",
      "ranks": [
        "Permit Holder",
        "Air Brake Trainee",
        "Class A Driver",
        "Lead Driver",
        "Air Brake Certified"
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
    "id": "tdl-coupling-and-uncoupling",
    "index": "224",
    "domain": "Commercial Driving",
    "trade": "Class A driver trainee, TDL pre-apprenticeship — Teamsters freight driving: coupling and uncoupling under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
    "category": "Mobility & Transit",
    "certification": "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose Class A theory and range curriculum covers coupling and uncoupling, delivered by a provider on the Training Provider Registry; 49 CFR 393 parts and accessories, including coupling devices and the air and electrical connections between tractor and trailer; 49 CFR 396 inspection and the driver vehicle inspection report; the CVSA North American Standard Out-of-Service Criteria for fifth wheels and coupling devices; ANSI/ISEA 107 high-visibility apparel for anyone on foot in the yard; Teamsters (IBT) freight locals' driver training",
    "name": "Coupling and Uncoupling",
    "weather": "overcast",
    "indoor": null,
    "district": "Mobility & Transit",
    "title": "SmartCiti.X~ Coupling and Uncoupling VR",
    "tagline": "Hook and drop a trailer the manual's way: right trailer, fifth wheel open and greased, chocked, height checked, lines on and trailer brakes set, backed under slowly, tugged, looked at, legs up, chocks out — and then legs down, lines off, release pulled and written up",
    "accent": 7327924,
    "accentCss": "#6fd0b4",
    "parSeconds": 300,
    "badge": {
      "id": "tugged-and-looked",
      "name": "Tugged and Looked",
      "note": "A coupling tugged, looked at and written up, and a drop with the legs down before the jaws opened — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Coupling",
      "currency": "PIN",
      "ranks": [
        "Permit Holder",
        "Driver Trainee",
        "Class A Driver",
        "Yard Lead",
        "Coupling Certified"
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
    "id": "tdl-backing-and-docking",
    "index": "225",
    "domain": "Commercial Driving",
    "trade": "Class A driver trainee, TDL pre-apprenticeship — Teamsters freight driving: backing and docking under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
    "category": "Mobility & Transit",
    "certification": "FMCSA 49 CFR 380 Subpart F entry-level driver training, whose Class A range curriculum includes straight-line, offset and alley-dock backing, delivered by a provider on the Training Provider Registry; 49 CFR 393 for the mirrors and lamps backing depends on; 49 CFR 395 hours of service and the electronic logging device's duty status at the dock; OSHA 29 CFR 1910.178 for the trailer brakes and wheel chocks a warehouse needs before its forklifts board; ANSI/ISEA 107 high-visibility apparel for the spotter; Teamsters (IBT) freight locals' driver training",
    "name": "Backing and Docking",
    "weather": "clear",
    "indoor": null,
    "district": "Mobility & Transit",
    "title": "SmartCiti.X~ Backing and Docking VR",
    "tagline": "An alley dock between two trailers: the door read, window down and flashers on, get out and look, a sight-side set-up, the wheel turned the trailer's way, dead slow with a spotter in the mirror, look again, feather onto the bumpers, brakes, chock, hand over and change the log",
    "accent": 12094704,
    "accentCss": "#b88cf0",
    "parSeconds": 280,
    "badge": {
      "id": "sight-side",
      "name": "Sight Side",
      "note": "A sight-side alley dock with two looks, the spotter always in view and the trailer chocked at the door — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Backing",
      "currency": "FOOT",
      "ranks": [
        "Permit Holder",
        "Driver Trainee",
        "Class A Driver",
        "Yard Lead",
        "Backing Certified"
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
    "id": "tdl-cargo-securement-and-hours",
    "index": "226",
    "domain": "Commercial Driving",
    "trade": "Class A driver trainee, TDL pre-apprenticeship — Teamsters freight driving: cargo securement and hours of service under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
    "category": "Mobility & Transit",
    "certification": "FMCSA 49 CFR 393 Subpart I protection against shifting and falling cargo — working load limits, the minimum number of tie-downs by article length and weight, tie-down condition and edge protection; 49 CFR 395 hours of service and the electronic logging device; 49 CFR 396 inspection and the driver vehicle inspection report; 49 CFR 380 Subpart F entry-level driver training, whose Class A theory curriculum covers cargo securement and hours of service; the CVSA North American Standard Out-of-Service Criteria for cargo securement and hours a roadside inspector applies; Teamsters (IBT) freight locals' driver training",
    "name": "Cargo Securement and Hours",
    "weather": "clear",
    "indoor": null,
    "district": "Mobility & Transit",
    "title": "SmartCiti.X~ Cargo Securement and Hours VR",
    "tagline": "A flatbed with two crated machines: the bill of lading, working load limits against half the weight, straps inspected, tie-downs thrown and winched, edge protection, the first miles and the re-check, the shoulder, the log read for what it will force, a legal trip plan and a certified day",
    "accent": 6210262,
    "accentCss": "#5ec2d6",
    "parSeconds": 300,
    "badge": {
      "id": "legal-load-legal-day",
      "name": "Legal Load, Legal Day",
      "note": "Tie-downs enough by count and by limit, the slack strap caught, the shoulder protected and the day planned inside the hours — first time"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Securement and Hours",
      "currency": "WLL",
      "ranks": [
        "Permit Holder",
        "Driver Trainee",
        "Flatbed Driver",
        "Lead Driver",
        "Securement Certified"
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
    "id": "sm-shop-layout-and-shear",
    "index": "217",
    "domain": "Manufacturing & Automation",
    "trade": "Sheet metal worker — SMART, trained through its International Training Institute shop curriculum",
    "category": "Manufacturing & Automation",
    "certification": "SMART and its International Training Institute sheet metal apprenticeship (shop fabrication year); OSHA 29 CFR 1910.212 machine guarding, with the point-of-operation guarding logic of 1910.217 applied to a hydraulic squaring shear; 29 CFR 1910.147 lockout/tagout for blade-gap and knife work; 29 CFR 1910.138 hand protection against sheared edges; ANSI B11 machine safety series; SMACNA HVAC Duct Construction Standards for the gauges and pressure classes a cut list is written to",
    "name": "Shop Layout and Shear",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ Shop Layout and Shear VR",
    "tagline": "Cut list to scribed blank, back gauge and blade gap set, guards walked, a full treadle stroke with hands behind the finger guard, drops hooked off the back, edges checked and logged",
    "accent": 14191162,
    "accentCss": "#d88a3a",
    "parSeconds": 270,
    "badge": {
      "id": "blade-line-clear",
      "name": "Blade Line Clear",
      "note": "A whole cut list sheared with nothing but steel under the blade — hands behind the guard, drops hooked, edges checked"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Shear Line",
      "currency": "STRIP",
      "ranks": [
        "Pre-apprentice",
        "Shop Apprentice",
        "Shear Operator",
        "Layout Lead",
        "Shear Line Certified"
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
    "id": "sm-duct-fabrication-and-seams",
    "index": "218",
    "domain": "Manufacturing & Automation",
    "trade": "Sheet metal fabricator — SMART, International Training Institute duct construction curriculum",
    "category": "Manufacturing & Automation",
    "certification": "SMART and its International Training Institute duct fabrication curriculum; SMACNA HVAC Duct Construction Standards — Metal and Flexible for pressure class, seam type, transverse joint and seal class; OSHA 29 CFR 1910.212 point-of-operation guarding on the lock former, notcher and coil line, 29 CFR 1910.147 lockout/tagout on the coil line, 29 CFR 1910.138 hand protection for raw edges; ANSI B11 machine safety series",
    "name": "Duct Fabrication and Seams",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ Duct Fabrication and Seams VR",
    "tagline": "Pressure class off the drawing, corners notched, a Pittsburgh lock rolled and closed, sides braked to angle, the flange rolled and cornered, seams sealed to class, the section stencilled and logged",
    "accent": 7317704,
    "accentCss": "#6fa8c8",
    "parSeconds": 280,
    "badge": {
      "id": "seam-to-class",
      "name": "Seam To Class",
      "note": "A section built to the drawing's pressure and seal class, with nothing fed past the infeed guard"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Fab Shop",
      "currency": "SEAM",
      "ranks": [
        "Pre-apprentice",
        "Fab Apprentice",
        "Lock Former",
        "Fab Lead",
        "Fab Shop Certified"
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
    "id": "sm-plasma-table-and-fume",
    "index": "219",
    "domain": "Manufacturing & Automation",
    "trade": "Sheet metal worker, CNC plasma — SMART, International Training Institute cutting and fume-control curriculum",
    "category": "Manufacturing & Automation",
    "certification": "SMART and its International Training Institute plasma cutting and welding-fume curriculum; OSHA 29 CFR 1910.252 welding, cutting and brazing (ventilation and fire prevention), 29 CFR 1910.134 respiratory protection where the extractor cannot hold the exposure, 29 CFR 1910.1000 air contaminants and ACGIH threshold limit values for metal fume, NIOSH guidance on plasma cutting fume, 29 CFR 1910.212 guarding of the table's cutting zone; NFPA 51B fire prevention during hot work",
    "name": "Plasma Table and Fume",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ Plasma Table and Fume VR",
    "tagline": "Nest read, downdraft zone opened and static proven on the manometer, plate landed on the slats, zone cleared, the cut held at speed, cooled and hooked off, the extractor walked before the next plate",
    "accent": 14711356,
    "accentCss": "#e07a3c",
    "parSeconds": 275,
    "badge": {
      "id": "fume-down-the-bed",
      "name": "Fume Down The Bed",
      "note": "A nest cut with the extractor proven before the arc and the zone clear through the whole run"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Cut Bay",
      "currency": "PIERCE",
      "ranks": [
        "Pre-apprentice",
        "Table Helper",
        "Plasma Operator",
        "Cut Lead",
        "Cut Bay Certified"
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
    "id": "sm-tig-and-spot-welding",
    "index": "220",
    "domain": "Manufacturing & Automation",
    "trade": "Sheet metal welder — SMART, International Training Institute welding curriculum to AWS D9.1",
    "category": "Manufacturing & Automation",
    "certification": "SMART and its International Training Institute welding curriculum; AWS D9.1 Sheet Metal Welding Code for the weld procedure, visual acceptance and welder qualification on sheet; OSHA 29 CFR 1910.252 welding, cutting and brazing, 29 CFR 1910.1026 hexavalent chromium for stainless fume, 29 CFR 1910.134 respiratory protection; ANSI Z49.1 safety in welding, cutting and allied processes; NFPA 51B fire watch during hot work",
    "name": "TIG and Spot Welding",
    "weather": "clear",
    "indoor": "shop",
    "district": null,
    "title": "SmartCiti.X~ TIG and Spot Welding VR",
    "tagline": "The weld procedure read, argon on and the flow set, work lead clamped and the seam fitted, the fume arm at the arc, a bead run at travel speed, a flange spot-welded, the weld read against the code and the booth walked",
    "accent": 10466504,
    "accentCss": "#9fb4c8",
    "parSeconds": 285,
    "badge": {
      "id": "code-bead",
      "name": "Code Bead",
      "note": "A stainless seam run to the procedure with the fume arm on the arc and a fire watch behind the screen the whole way"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Weld Booth",
      "currency": "BEAD",
      "ranks": [
        "Pre-apprentice",
        "Tack Welder",
        "Sheet Welder",
        "Code Welder",
        "Weld Booth Certified"
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
    "id": "sm-duct-hanging-and-seismic-bracing",
    "index": "221",
    "domain": "Manufacturing & Automation",
    "trade": "Sheet metal installer — SMART, International Training Institute field installation curriculum",
    "category": "Manufacturing & Automation",
    "certification": "SMART and its International Training Institute field installation curriculum; SMACNA HVAC Duct Construction Standards for hanger type and spacing by duct size and the SMACNA Seismic Restraint Manual for transverse and longitudinal bracing; OSHA 29 CFR 1926.451 scaffold requirements as applied to a scissor lift, 29 CFR 1926.501 fall protection at the platform, 29 CFR 1926.453 where a boom lift is used; the anchor manufacturer's cure schedule and the engineer's seismic drawing",
    "name": "Duct Hanging and Seismic Bracing",
    "weather": "clear",
    "indoor": "plant",
    "district": null,
    "title": "SmartCiti.X~ Duct Hanging and Seismic Bracing VR",
    "tagline": "Hanger schedule and seismic drawing read, the lift inspected, the anchor's cure card checked before a load, trapeze hung and locked, the section raised and levelled, braces set to angle, the run walked and logged",
    "accent": 9421946,
    "accentCss": "#8fc47a",
    "parSeconds": 290,
    "badge": {
      "id": "cured-and-braced",
      "name": "Cured And Braced",
      "note": "A run hung on anchors that had cured, on hangers that were locked, with the braces the drawing asked for"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Ceiling Crew",
      "currency": "HANGER",
      "ranks": [
        "Pre-apprentice",
        "Ground Hand",
        "Duct Installer",
        "Run Lead",
        "Ceiling Crew Certified"
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
    "id": "sm-architectural-panels-at-height",
    "index": "222",
    "domain": "Manufacturing & Automation",
    "trade": "Architectural sheet metal worker — SMART, International Training Institute architectural curriculum",
    "category": "Manufacturing & Automation",
    "certification": "SMART and its International Training Institute architectural sheet metal curriculum; SMACNA Architectural Sheet Metal Manual for panel systems, copings, flashings and expansion; OSHA 29 CFR 1926.453 aerial lifts (boom-supported platforms), 29 CFR 1926.501 duty to have fall protection and 29 CFR 1926.502 fall protection systems criteria including the personal fall arrest system on the platform; the lift maker's wind rating and the panel maker's installation instructions",
    "name": "Architectural Panels at Height",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Architectural Panels at Height VR",
    "tagline": "Tailboard and wind reading, harness inspected and tied off, the panel carried to the clip rail and clipped, held on the cups while it is fixed, the joint sealed at a steady bead, the platform walked for edges and dropped objects, logged",
    "accent": 13218426,
    "accentCss": "#c9b27a",
    "parSeconds": 290,
    "badge": {
      "id": "clipped-and-tied",
      "name": "Clipped And Tied",
      "note": "A panel run set at height with the wind read, the harness on the anchor and nothing loose on the rail"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Facade Crew",
      "currency": "PANEL",
      "ranks": [
        "Pre-apprentice",
        "Ground Hand",
        "Panel Installer",
        "Facade Lead",
        "Facade Crew Certified"
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
    "id": "sm-air-balancing-and-testing",
    "index": "223",
    "domain": "Manufacturing & Automation",
    "trade": "Testing, adjusting and balancing technician — SMART, International Training Institute TAB curriculum",
    "category": "Manufacturing & Automation",
    "certification": "SMART and its International Training Institute testing, adjusting and balancing curriculum; ASHRAE 111 measurement, testing, adjusting and balancing of building HVAC systems and the NEBB procedural standard for TAB, with NEBB technician certification; SMACNA HVAC Duct Construction Standards and duct leakage test procedures; OSHA 29 CFR 1910.212 machine guarding on belt-driven fans, 29 CFR 1910.147 lockout/tagout at the fan disconnect, 29 CFR 1910.23 ladders and 29 CFR 1910.28 fall protection above a ceiling",
    "name": "Air Balancing and Testing",
    "weather": "clear",
    "indoor": "plant",
    "district": null,
    "title": "SmartCiti.X~ Air Balancing and Testing VR",
    "tagline": "Design airflows off the TAB report, instruments proven, hood on the diffuser, static on the manometer, the branch damper trimmed and locked, the fan held at speed through a traverse, the duct walked for the leaks that explain the numbers",
    "accent": 7325368,
    "accentCss": "#6fc6b8",
    "parSeconds": 285,
    "badge": {
      "id": "numbers-that-agree",
      "name": "Numbers That Agree",
      "note": "A branch balanced to design with every reading taken off a proven instrument on a system nobody was inside"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Balance Crew",
      "currency": "CFM",
      "ranks": [
        "Pre-apprentice",
        "Instrument Hand",
        "TAB Technician",
        "Balance Lead",
        "Balance Crew Certified"
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
    "id": "sm-kitchen-exhaust-and-fire-wrap",
    "index": "224",
    "domain": "Manufacturing & Automation",
    "trade": "Sheet metal worker, kitchen ventilation — SMART, International Training Institute commercial kitchen exhaust curriculum",
    "category": "Manufacturing & Automation",
    "certification": "SMART and its International Training Institute commercial kitchen exhaust curriculum; NFPA 96 ventilation control and fire protection of commercial cooking operations for liquid-tight grease duct construction, access, clearance to combustibles and listed enclosure; AWS D9.1 Sheet Metal Welding Code for the continuous liquid-tight joint weld; OSHA 29 CFR 1910.252 welding, cutting and brazing and NFPA 51B fire watch for hot work above a cooking line; 29 CFR 1910.134 respiratory protection for the wrap fibre; the wrap and access door listings",
    "name": "Kitchen Exhaust and Fire Wrap",
    "weather": "clear",
    "indoor": "kitchen",
    "district": null,
    "title": "SmartCiti.X~ Kitchen Exhaust and Fire Wrap VR",
    "tagline": "The listing read against NFPA 96, the section hung, the joint welded liquid-tight and light-tested, a listed door with listed sealant, clearance measured, the wrap put on layer by layer, the cleanout labelled and the run logged",
    "accent": 14051914,
    "accentCss": "#d66a4a",
    "parSeconds": 290,
    "badge": {
      "id": "liquid-tight",
      "name": "Liquid Tight",
      "note": "A grease duct joint welded continuous, light-tested and wrapped to its listing, with the fire watch on post through the arc"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Hood Line",
      "currency": "JOINT",
      "ranks": [
        "Pre-apprentice",
        "Hood Hand",
        "Grease Duct Installer",
        "Kitchen Vent Lead",
        "Hood Line Certified"
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
    "id": "pt-spreader-and-twistlock-inspection",
    "index": "217",
    "domain": "Maritime & Ports",
    "trade": "ILWU maintenance and repair mechanic — spreader shop, PMA training programme, with IUOE crane maintenance",
    "category": "Maritime & Ports",
    "certification": "ILWU maintenance and repair with the PMA training programme; IUOE crane maintenance; OSHA 29 CFR 1917 marine terminals; 29 CFR 1910.147 control of hazardous energy; ASME B30.20 below-the-hook lifting devices; ASME B30.2 for the shop's overhead crane",
    "name": "Spreader & Twist-lock Inspection",
    "weather": "overcast",
    "indoor": null,
    "district": "Maritime & Ports",
    "title": "SmartCiti.X~ Spreader & Twist-lock Inspection VR",
    "tagline": "A spreader on its stands: supply isolated and locked, stands proven under a live boom, every hose walked, a twist-lock cycled and measured, flippers checked, the telescope run on test power beside a hustler lane, an indicator caught lying, a new twist-lock fitted and torqued, and the spreader signed back to the crane",
    "accent": 4171721,
    "accentCss": "#3fa7c9",
    "parSeconds": 270,
    "badge": {
      "id": "spreader-signed-back",
      "name": "Spreader Signed Back",
      "note": "Every corner proven, the indicator caught, the lane and the boom both answered, and the spreader handed back to the crane clean"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Spreader Shop",
      "currency": "CONE",
      "ranks": [
        "Shop Hand",
        "M&R Mechanic",
        "Spreader Tech",
        "Lead Mechanic",
        "Spreader Certified"
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
    "id": "pt-crane-boom-hoist-brake-service",
    "index": "218",
    "domain": "Maritime & Ports",
    "trade": "IUOE crane maintenance mechanic with the ILWU maintenance and repair crew, PMA training programme",
    "category": "Maritime & Ports",
    "certification": "IUOE crane maintenance; ILWU maintenance and repair with the PMA training programme; OSHA 29 CFR 1917 marine terminals; 29 CFR 1910.147 control of hazardous energy; ASME B30.2 overhead and gantry cranes for the brake, drum and limit requirements; ASME B30.20 for the headblock and spreader below the hook",
    "name": "Crane Boom Hoist Brake Service",
    "weather": "wind",
    "indoor": null,
    "district": "Maritime & Ports",
    "title": "SmartCiti.X~ Crane Boom Hoist Brake Service VR",
    "tagline": "Machinery house, boom at stow: the latch proven before the drive is isolated and locked, the lining found glazed, the gap measured and set, a new lining fitted, the release pressure held under test while a storm cell and a gantrying neighbour both call for attention, the stroke watched through three cycles, and the brake logged back",
    "accent": 14258234,
    "accentCss": "#d9903a",
    "parSeconds": 280,
    "badge": {
      "id": "brake-set-true",
      "name": "Brake Set True",
      "note": "Latch proven, drive locked, the gap a measured number, the release pressure held, and both calls from outside the house answered"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Machinery House",
      "currency": "GAP",
      "ranks": [
        "Oiler",
        "Crane Mechanic",
        "Brake Technician",
        "Lead Mechanic",
        "Boom Hoist Certified"
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
    "id": "pt-straddle-carrier-hydraulics",
    "index": "219",
    "domain": "Maritime & Ports",
    "trade": "ILWU maintenance and repair mechanic — heavy equipment shop, PMA training programme, with IUOE heavy equipment maintenance",
    "category": "Maritime & Ports",
    "certification": "ILWU maintenance and repair with the PMA training programme; IUOE heavy equipment and crane maintenance; OSHA 29 CFR 1917 marine terminals; 29 CFR 1910.147 control of hazardous energy, including stored hydraulic energy; ASME B30.2 for the shop's bridge crane; 29 CFR 1910.132 for the face shield and gloves at an open line",
    "name": "Straddle Carrier Hydraulics",
    "weather": "clear",
    "indoor": null,
    "district": "Maritime & Ports",
    "title": "SmartCiti.X~ Straddle Carrier Hydraulics VR",
    "tagline": "A straddle carrier with a creeping hoist: chocked, isolated and locked, the accumulators bled to zero and proven, the weeping fitting found with dye and not a hand, a new hose fitted and torqued, the carriage pinned on its locks, the system pressure held under test beside a live lane and under a live bridge crane, the relief set by the number, and the machine logged back to its operator",
    "accent": 7320410,
    "accentCss": "#6fb35a",
    "parSeconds": 280,
    "badge": {
      "id": "zero-then-open",
      "name": "Zero, Then Open",
      "note": "Every line opened at zero pressure, every leak found with dye, and the lane and the bridge crane both answered"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Heavy Equipment Shop",
      "currency": "BAR",
      "ranks": [
        "Shop Hand",
        "Hydraulics Mechanic",
        "Straddle Tech",
        "Lead Mechanic",
        "Straddle Certified"
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
    "id": "pt-reefer-plug-and-power-panel",
    "index": "220",
    "domain": "Maritime & Ports",
    "trade": "ILWU maintenance and repair electrician — reefer power, PMA training programme, with IUOE stationary engineers on the row's distribution",
    "category": "Maritime & Ports",
    "certification": "ILWU maintenance and repair with the PMA training programme; IUOE stationary engineers for the row's distribution; NFPA 70E electrical safety in the workplace; OSHA 29 CFR 1917 marine terminals; 29 CFR 1910.147 control of hazardous energy; 29 CFR 1910.132 for the arc-rated face shield and gloves",
    "name": "Reefer Plug & Power Panel",
    "weather": "fog",
    "indoor": null,
    "district": "Maritime & Ports",
    "title": "SmartCiti.X~ Reefer Plug & Power Panel VR",
    "tagline": "An arcing reefer receptacle: the circuit identified at the panel, arc-rated PPE on, the unit shut down at its own controller before the breaker opens and locks, the plug collar turned and withdrawn dead, absence of voltage proven while a neighbouring reefer throws a fault, the burned contact found, a new receptacle fitted and its terminals torqued, ground proven, the breaker restored and the load current watched settle beside a live lane",
    "accent": 5227478,
    "accentCss": "#4fc3d6",
    "parSeconds": 270,
    "badge": {
      "id": "dead-before-open",
      "name": "Dead Before Open",
      "note": "The unit off, the breaker locked, the plug out dead and absence of voltage proven before a contact was touched"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Reefer Row",
      "currency": "AMP",
      "ranks": [
        "Reefer Hand",
        "M&R Electrician",
        "Row Electrician",
        "Lead Electrician",
        "Reefer Power Certified"
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
    "id": "pt-dock-fender-and-bollard-inspection",
    "index": "221",
    "domain": "Maritime & Ports",
    "trade": "ILWU maintenance and repair — wharf structures crew, PMA training programme, with the IUOE operator on the crane truck",
    "category": "Maritime & Ports",
    "certification": "ILWU maintenance and repair with the PMA training programme; IUOE crane truck operation; OSHA 29 CFR 1917 marine terminals, including work over water and the fender and bollard provisions; ASME B30.5 for the crane truck; ASME B30.9 for the slings on the pad; 29 CFR 1910.132 for the flotation vest and the edge lanyard",
    "name": "Dock Fender & Bollard Inspection",
    "weather": "wind",
    "indoor": null,
    "district": "Maritime & Ports",
    "title": "SmartCiti.X~ Dock Fender & Bollard Inspection VR",
    "tagline": "The wharf edge in a berth window: vest and lanyard on before the cope, the fender frame walked for cracks, the chains checked while a ship's jib swings over the apron, the pad measured and a new one slung in and bolted, the bollard's base checked and its anchors tensioned by the number while a storm cell comes over the water, the load plate read, the edge and the ladder proven, and the wharf logged",
    "accent": 3116957,
    "accentCss": "#2f8f9d",
    "parSeconds": 270,
    "badge": {
      "id": "edge-worked-clean",
      "name": "Edge Worked Clean",
      "note": "Never at the cope without the vest, never under the slung pad, the jib and the storm both answered, and every anchor tensioned by the number"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Wharf Structures",
      "currency": "TONNE",
      "ranks": [
        "Wharf Hand",
        "Structures Mechanic",
        "Fender Tech",
        "Lead Mechanic",
        "Wharf Structures Certified"
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
    "id": "pt-terminal-lighting-mast-service",
    "index": "222",
    "domain": "Maritime & Ports",
    "trade": "ILWU maintenance and repair electrician — yard high-mast lighting, PMA training programme, with the IUOE operator on the aerial lift",
    "category": "Maritime & Ports",
    "certification": "ILWU maintenance and repair with the PMA training programme; IUOE aerial lift operation; OSHA 29 CFR 1917 marine terminals, including the yard's lighting provisions; 29 CFR 1910.147 control of hazardous energy; NFPA 70E for the handhole and the mast circuit; ANSI A92 for the aerial lift; ANSI Z359 for the harness and the tie-off",
    "name": "Terminal Lighting Mast Service",
    "weather": "clear",
    "indoor": null,
    "district": "Maritime & Ports",
    "title": "SmartCiti.X~ Terminal Lighting Mast Service VR",
    "tagline": "A yard high-mast with a luminaire out: the outage scheduled, the mast isolated, locked and tested dead at the handhole, harness and lift inspected, outriggers levelled while a hustler enters the lane, tied off before the platform leaves the ground, the ascent held steady through a wind call, the failed driver found, a new luminaire fitted and aimed, the mast wiring meggered, the strike watched, and the outage logged back",
    "accent": 15253835,
    "accentCss": "#e8c14b",
    "parSeconds": 280,
    "badge": {
      "id": "mast-lit-clean",
      "name": "Mast Lit Clean",
      "note": "Isolated, locked and tested before the handhole, tied off before the platform rose, the lane and the wind both answered, and the mast back on at the strike"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Yard Lighting",
      "currency": "LUX",
      "ranks": [
        "Yard Hand",
        "M&R Electrician",
        "Lighting Tech",
        "Lead Electrician",
        "High-Mast Certified"
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
    "id": "pt-stormwater-at-the-terminal",
    "index": "223",
    "domain": "Maritime & Ports",
    "trade": "ILWU maintenance and repair — terminal stormwater crew, PMA training programme, with the IUOE operator on the vacuum truck",
    "category": "Maritime & Ports",
    "certification": "ILWU maintenance and repair with the PMA training programme; IUOE vacuum truck operation; EPA 40 CFR 122.26 storm water discharges under the terminal's industrial permit; 40 CFR 136 test procedures for the discharge samples; OSHA 29 CFR 1917 marine terminals; 29 CFR 1910.132 for the gloves, goggles and hi-vis at the basin",
    "name": "Stormwater at the Terminal",
    "weather": "rain",
    "indoor": null,
    "district": "Maritime & Ports",
    "title": "SmartCiti.X~ Stormwater at the Terminal VR",
    "tagline": "A sheen in the separator: the permit's plan read, gloves and goggles on, the lane coned before the grate comes up on the hook, the sheen watched while a hustler turns into the lane, a new basin insert set, the leak traced to a parked stacker, the oil layer measured, the separator valved off and pumped down while a storm cell closes on the outfall, the discharge sampled to the method, the empty spill kit found, and the log closed",
    "accent": 4169610,
    "accentCss": "#3f9f8a",
    "parSeconds": 270,
    "badge": {
      "id": "outfall-held",
      "name": "Outfall Held",
      "note": "The sheen kept out of the bay: source found, separator pumped, outfall gated before the storm, and the sample taken to the method"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Stormwater Crew",
      "currency": "LITRE",
      "ranks": [
        "Yard Hand",
        "Drainage Mechanic",
        "Stormwater Tech",
        "Lead Mechanic",
        "Stormwater Certified"
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
    "id": "pt-chassis-and-genset-yard",
    "index": "224",
    "domain": "Maritime & Ports",
    "trade": "ILWU maintenance and repair mechanic — chassis and genset yard, PMA training programme, with IUOE stationary engineers on the gensets",
    "category": "Maritime & Ports",
    "certification": "ILWU maintenance and repair with the PMA training programme; IUOE stationary engineers for the generator sets; OSHA 29 CFR 1917 marine terminals, including the chassis and intermodal equipment provisions; 29 CFR 1910.147 control of hazardous energy for the genset; NFPA 70E for the genset's output and the reefer pigtail; 29 CFR 1910.132 for the eye protection at the grinder",
    "name": "Chassis & Genset Yard",
    "weather": "overcast",
    "indoor": null,
    "district": "Maritime & Ports",
    "title": "SmartCiti.X~ Chassis & Genset Yard VR",
    "tagline": "A chassis in the repair bay with its genset: chocked, landing gear down and the air bled before anything else, the frame walked for a crack, tyres gauged, the slack adjuster set, the brakes held and listened to while a hustler turns in, the genset checked, its battery isolated and locked, a new fuel filter fitted, the run test held in band while the reefer next door throws a code, the damaged pigtail found, and the chassis logged roadable",
    "accent": 13134396,
    "accentCss": "#c86a3c",
    "parSeconds": 270,
    "badge": {
      "id": "roadable-clean",
      "name": "Roadable Clean",
      "note": "Chocked before a hand went under, the genset isolated before a wrench went on, the lane and the reefer both answered, and the chassis signed roadable"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Chassis Yard",
      "currency": "AXLE",
      "ranks": [
        "Yard Hand",
        "Chassis Mechanic",
        "Genset Tech",
        "Lead Mechanic",
        "Chassis Yard Certified"
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
    "id": "gg-tower-climb-and-tie-off",
    "index": "225",
    "domain": "Construction",
    "trade": "Ironworkers — bridge ironworker on the tower, trained through the Ironworkers' IMPACT programme, with the crew's rescue attendant on the deck",
    "category": "Construction & Structural Trades",
    "certification": "Ironworkers and IMPACT bridge crew training; OSHA 29 CFR 1926 Subpart M fall protection, including 29 CFR 1926.501 and 29 CFR 1926.502 for the anchorage, the lanyard and the rope grab; ANSI/ASSP Z359 for the harness, the twin-leg lanyard and the vertical lifeline; 29 CFR 1926 Subpart R where the tower work is ironwork; 29 CFR 1926.106 for work over water; the owner's climbing and rescue plan",
    "name": "Tower Climb & Tie-Off",
    "weather": "clear",
    "indoor": null,
    "district": "golden-gate-deck",
    "title": "SmartCiti.X~ Tower Climb & Tie-Off VR",
    "tagline": "Up a tower leg on a rope grab and across to the platform on a twin-leg lanyard: the permit and the rescue plan read, the wind taken, the climb held steady through a gust, one leg always clipped at the transfer, the tools hauled up in a tethered bucket while the fog comes in, a beam clamp set for the next crew, and the climb logged",
    "accent": 14706222,
    "accentCss": "#e0662e",
    "parSeconds": 300,
    "badge": {
      "id": "always-on-something",
      "name": "Always On Something",
      "note": "Up the ladder, across the transfer and onto the platform without a moment when neither lanyard leg was on a rated anchor"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Tower Crew",
      "currency": "RIVET",
      "ranks": [
        "Deck Hand",
        "Tower Climber",
        "Transfer Qualified",
        "Lead Climber",
        "Tower Crew Certified"
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
    "id": "gg-main-cable-band-inspection",
    "index": "226",
    "domain": "Construction",
    "trade": "Ironworkers — main cable crew, trained through the Ironworkers' IMPACT programme, working with the owner's bridge engineer",
    "category": "Construction & Structural Trades",
    "certification": "Ironworkers and IMPACT bridge crew training; the National Bridge Inspection Standards (23 CFR 650) and the AASHTO Manual for Bridge Element Inspection for the band and cable condition; the owner's band-bolt tension procedure and sequence chart; OSHA 29 CFR 1926.502 and ANSI/ASSP Z359 for the hand-rope tie-off; 29 CFR 1926.106 for work over water",
    "name": "Main Cable Band Inspection",
    "weather": "clear",
    "indoor": null,
    "district": "golden-gate-deck",
    "title": "SmartCiti.X~ Main Cable Band Inspection VR",
    "tagline": "A cable band checked from the traveller: tied to the hand rope and the brake set, the seam and caulking walked, the band read against its witness mark, the tensioner seated while a gust hits, the band bolts brought to tension in the charted sequence and held there while a boat passes under, the end joint recaulked, the pump bled before a hose is touched, and the band logged",
    "accent": 14243626,
    "accentCss": "#d9572a",
    "parSeconds": 320,
    "badge": {
      "id": "band-held",
      "name": "Band Held",
      "note": "Every band bolt brought to tension in the charted order, none slackened out of turn, and the pump bled to zero before a coupling was opened"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Cable Crew",
      "currency": "BAND",
      "ranks": [
        "Catwalk Hand",
        "Band Checker",
        "Tensioner Tech",
        "Cable Lead",
        "Cable Crew Certified"
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
    "id": "gg-suspender-rope-replacement",
    "index": "227",
    "domain": "Construction",
    "trade": "Ironworkers and IMPACT — suspender rope replacement crew, with the owner's engineer witnessing the tension",
    "category": "Construction & Structural Trades",
    "certification": "Ironworkers and IMPACT bridge crew training; the owner's engineered replacement procedure and load-transfer sequence; AASHTO Maintenance Manual practice for suspension-bridge ropes; ASME B30.9 and ASME B30.26 for the slings and rigging hardware on the tugger; OSHA 29 CFR 1926.502 and ANSI/ASSP Z359 for tie-off at the deck edge; 29 CFR 1926.106 for work over water; MUTCD for the closure the crew works inside",
    "name": "Suspender Rope Replacement",
    "weather": "clear",
    "indoor": null,
    "district": "golden-gate-deck",
    "title": "SmartCiti.X~ Suspender Rope Replacement VR",
    "tagline": "A suspender changed under load: the plan read, tied off and the drop zone barricaded, the wind taken, the new rope's sockets checked, the temporary jacks loaded while a cyclist rides into the closure, the old socket backed off only once they carry, the new rope rigged and tensioned to the figure through a gust, pinned and cottered, the tension confirmed, the jacks bled down and the rope logged",
    "accent": 14906426,
    "accentCss": "#e3743a",
    "parSeconds": 330,
    "badge": {
      "id": "load-always-held",
      "name": "Load Always Held",
      "note": "The deck carried by the old rope, the temporary jacks or the new rope at every moment of the change"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Rope Gang",
      "currency": "STRAND",
      "ranks": [
        "Deck Rigger",
        "Jack Hand",
        "Rope Setter",
        "Rope Foreman",
        "Rope Gang Certified"
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
    "id": "gg-deck-lane-closure-and-traveller",
    "index": "228",
    "domain": "Construction",
    "trade": "Ironworkers and IMPACT — traveller crew setting their own lane closure, with a flagger on the closure and the traveller operator",
    "category": "Construction & Structural Trades",
    "certification": "Ironworkers and IMPACT bridge crew training; MUTCD Part 6 temporary traffic control for the advance warning, the arrow board, the taper and the buffer; ANSI/ASSP A10.47 work zone safety for highway construction; ANSI/ISEA 107 high-visibility apparel; OSHA 29 CFR 1926 and 29 CFR 1926.502 for the traveller's fall protection; 29 CFR 1926.106 for work over water; the owner's traveller operating procedure",
    "name": "Deck Lane Closure & Traveller",
    "weather": "overcast",
    "indoor": null,
    "district": "golden-gate-deck",
    "title": "SmartCiti.X~ Deck Lane Closure & Traveller VR",
    "tagline": "The lanes closed before the cable is worked: the traffic control plan read, the advance sign, arrow board and taper set with the traffic, the taper measured, the buffer marked, the truck spotted in while a cyclist rides into the closure, the closure walked, the traveller released and run while a fog bank rolls in, parked and chocked, and the closure taken down in reverse",
    "accent": 15764004,
    "accentCss": "#f08a24",
    "parSeconds": 300,
    "badge": {
      "id": "taper-to-the-plan",
      "name": "Taper To The Plan",
      "note": "A closure set with the traffic, a taper measured to the plan's length, and a traveller run and parked without a correction"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Closure Crew",
      "currency": "CONE",
      "ranks": [
        "Cone Setter",
        "Flagger",
        "Closure Lead",
        "Traveller Operator",
        "Closure Crew Certified"
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
    "id": "gg-paint-containment-on-the-deck",
    "index": "229",
    "domain": "Construction",
    "trade": "IUPAT bridge painters — containment and lead removal crew, trained through the Finishing Trades Institute (FTI), with the containment competent person",
    "category": "Construction & Structural Trades",
    "certification": "IUPAT and the Finishing Trades Institute bridge painter and lead abatement training; OSHA 29 CFR 1926.62 lead in construction, including the written compliance programme, exposure monitoring, hygiene and decontamination; 29 CFR 1910.134 respiratory protection and fit testing; SSPC Guide 6 for containing surface preparation debris; an SSPC-QP 2 qualified contractor for hazardous coating removal; ANSI/ASSP A10.34 protection of the public beside the work; BCDC and the permit's conditions for work over the bay",
    "name": "Paint Containment on the Deck",
    "weather": "clear",
    "indoor": null,
    "district": "golden-gate-deck",
    "title": "SmartCiti.X~ Paint Containment on the Deck VR",
    "tagline": "Old coatings taken off inside a sealed enclosure the water never sees: the lead compliance plan read, suited and fit-checked, the strait-side tarp hung and sealed, the enclosure walked for leaks, the collector set and the negative pressure read, the seams smoke-tested while a boat passes under, the steel cleaned under the shroud through a gust, the floor HEPA-vacuumed, the drums closed and labelled, washed out and logged",
    "accent": 4171721,
    "accentCss": "#3fa7c9",
    "parSeconds": 330,
    "badge": {
      "id": "nothing-to-the-water",
      "name": "Nothing To The Water",
      "note": "An enclosure sealed, held negative and smoke-proven before removal, never breached toward the strait, and nothing swept dry"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Containment Crew",
      "currency": "SEAL",
      "ranks": [
        "Tarp Hand",
        "Containment Painter",
        "Smoke Tester",
        "Containment Lead",
        "Containment Crew Certified"
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
    "id": "gg-international-orange-recoat",
    "index": "230",
    "domain": "Construction",
    "trade": "IUPAT bridge painters — coating crew on the paint programme, trained through the Finishing Trades Institute (FTI)",
    "category": "Construction & Structural Trades",
    "certification": "IUPAT and the Finishing Trades Institute industrial and bridge painter training; the owner's coating specification, with the blasted surface prepared to SSPC-SP 10 and an SSPC-QP 1 qualified contractor for field application; 29 CFR 1910.134 respiratory protection for solvent-borne coatings; 29 CFR 1910.1200 hazard communication for the coating's safety data sheets; OSHA 29 CFR 1926.502 and ANSI/ASSP Z359 for tie-off at the railing; the coating maker's product data for mixing, pot life and recoat windows",
    "name": "International Orange Recoat",
    "weather": "clear",
    "indoor": null,
    "district": "golden-gate-deck",
    "title": "SmartCiti.X~ International Orange Recoat VR",
    "tagline": "A blasted patch of railing brought back to International Orange: the specification read, tied off with the right cartridges in, the steel's margin over the dew point taken, the prep checked and the profile read while the fog comes in, the coating mixed, edges and rivets striped, the coat sprayed at a steady film through a gust, the film combed, the pump relieved and locked, the wet paint signed and the batch logged",
    "accent": 15225886,
    "accentCss": "#e8541e",
    "parSeconds": 320,
    "badge": {
      "id": "on-spec-orange",
      "name": "On-Spec Orange",
      "note": "A recoat applied inside the weather window, at the specified film, with the airless pump relieved before its tip was touched"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Paint Programme",
      "currency": "COAT",
      "ranks": [
        "Paint Hand",
        "Brush Painter",
        "Spray Painter",
        "Coating Lead",
        "Paint Programme Certified"
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
    "id": "gg-fog-and-wind-work-stop",
    "index": "231",
    "domain": "Construction",
    "trade": "Ironworkers and IMPACT with IUPAT bridge painters (FTI) — the deck foreman running the fog and wind work stop for every crew on the span",
    "category": "Construction & Structural Trades",
    "certification": "Ironworkers and IMPACT bridge crew training with IUPAT and Finishing Trades Institute crews on the same span; the owner's weather and work-stop procedure; OSHA 29 CFR 1926, with 29 CFR 1926.21 safety training for every crew on the span; 29 CFR 1926.502 for the crews aloft; 29 CFR 1926.106 for work over water; MUTCD Part 6 for the closure in low visibility; ANSI/ISEA 107 for being seen in fog",
    "name": "Fog & Wind Work Stop",
    "weather": "fog",
    "indoor": null,
    "district": "golden-gate-deck",
    "title": "SmartCiti.X~ Fog & Wind Work Stop VR",
    "tagline": "The foreman's call when the weather turns: the procedure read, the wind taken against the limit, every crew aloft called down in order of exposure, the deck walked for what the wind takes first, visibility held until the fog closes in, the tarps tied down and the hoist stowed, the traveller brought home through a gust, the headcount matched, the hoist locked out, the restart held on the trend, and the stop logged",
    "accent": 9417668,
    "accentCss": "#8fb3c4",
    "parSeconds": 310,
    "badge": {
      "id": "called-it-early",
      "name": "Called It Early",
      "note": "Everyone aloft down in order of exposure, nothing left loose for the wind, and the restart held until the trend said so"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Deck Foreman",
      "currency": "CALL",
      "ranks": [
        "Crew Hand",
        "Lead Hand",
        "Weather Watch",
        "Deck Foreman",
        "Deck Foreman Certified"
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
    "id": "gg-pile-driver-fender-repair",
    "index": "232",
    "domain": "Construction",
    "trade": "Pile Drivers of the Carpenters (UBC) — fender repair crew, trained through the Carpenters International Training Fund, with the barge crew below and the davit operator",
    "category": "Construction & Structural Trades",
    "certification": "Pile Drivers of the Carpenters and the Carpenters International Training Fund; OSHA 29 CFR 1926.106 for work over water, flotation and the rescue skiff; ASME B30.9 slings and ASME B30.26 rigging hardware on the lift; ASME B30.5 practice for the davit crane and its signals; OSHA 29 CFR 1926.502 for the tie-off at the railing; BCDC and the permit's conditions for work in the bay; the owner's lift plan and fender drawing",
    "name": "Pile Driver Fender Repair",
    "weather": "clear",
    "indoor": null,
    "district": "golden-gate-deck",
    "title": "SmartCiti.X~ Pile Driver Fender Repair VR",
    "tagline": "The deck side of a pier fender repair: the lift plan read, vest and lanyard on at the rail, the old wale read for borers and wasted bolts, the wind taken, the new panel's through-bolts torqued, the sling shackled, the test lift held while a boat comes under, the panel lowered on the tag line into the fog, handed to the barge's signal, the hook recovered, the deck checked and the lift logged",
    "accent": 4168810,
    "accentCss": "#3f9c6a",
    "parSeconds": 320,
    "badge": {
      "id": "over-the-side-clean",
      "name": "Over The Side Clean",
      "note": "A fender panel lowered to the barge on the tag line, never with anyone under it, and the water below held clear"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Pile Butt Crew",
      "currency": "WALE",
      "ranks": [
        "Deck Hand",
        "Pile Driver Apprentice",
        "Rigger",
        "Fender Foreman",
        "Pile Butt Crew Certified"
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
    "id": "mw-ferry-deckhand-and-passenger-safety",
    "index": "230",
    "domain": "Maritime & Ports",
    "trade": "Inlandboatmen's Union of the ILWU deckhand on a Bay passenger ferry, with the MEBA licensed engineer below and SIU-trained ratings in the relief crew",
    "category": "Maritime & Ports",
    "certification": "Inlandboatmen's Union of the ILWU deck department practice; MEBA engineering watch; SIU Paul Hall Center unlicensed training for relief ratings; IMO STCW basic safety training and crowd management for passenger-ship crew; IMO SOLAS muster, station bill and life-saving appliance requirements as the vessel's own certificate of inspection applies them; IMO MARPOL for anything that goes over the side",
    "name": "Ferry Deckhand & Passenger Safety",
    "weather": "wind",
    "indoor": null,
    "district": "Maritime & Ports",
    "title": "SmartCiti.X~ Ferry Deckhand & Passenger Safety VR",
    "tagline": "A passenger ferry at the float: the station bill read, vest and radio on, the deck walked before boarding, the gangway landed, the count held against the certificate while a passenger goes in between the float and the hull, the lines let go, the life-saving gear walked, the bow line tended on the capstan through a current shift, the passengers landed in order and the run logged",
    "accent": 3122116,
    "accentCss": "#2fa3c4",
    "parSeconds": 280,
    "badge": {
      "id": "every-soul-counted",
      "name": "Every Soul Counted",
      "note": "The count held against the certificate, the passenger overboard answered with the ring, and the gangway never crossed before it was landed"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Ferry Deck",
      "currency": "SOUL",
      "ranks": [
        "Ordinary Deckhand",
        "Deckhand",
        "Lead Deckhand",
        "Bosun",
        "Ferry Deck Certified"
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
    "id": "mw-workboat-towing-and-line-handling",
    "index": "231",
    "domain": "Maritime & Ports",
    "trade": "Inlandboatmen's Union of the ILWU deckhand on a harbour towing vessel, with the MEBA licensed engineer on watch and an SIU-trained AB in the relief crew",
    "category": "Maritime & Ports",
    "certification": "Inlandboatmen's Union of the ILWU deck practice on towing vessels; MEBA engineering watch; SIU Paul Hall Center unlicensed deck training; USCG 46 CFR Subchapter M towing vessel inspection, including the vessel's towing safety management and its towing gear; IMO STCW basic safety training; IMO MARPOL for the fuel and the bilge on deck",
    "name": "Workboat Towing & Line Handling",
    "weather": "overcast",
    "indoor": null,
    "district": "Maritime & Ports",
    "title": "SmartCiti.X~ Workboat Towing & Line Handling VR",
    "tagline": "Making up to a barge astern: the voyage plan read, vest and knife on, the hawser and bridle walked, the winch brake set, the heaving line tended to the barge through a current shift, the eye passed to the barge's bitt, the load read, the gob and roller walked, the hawser paid out to the master's length through a lost-comms call, the afterdeck chained off, the gear stowed and the tow logged",
    "accent": 14714682,
    "accentCss": "#e0873a",
    "parSeconds": 280,
    "badge": {
      "id": "clear-of-the-hawser",
      "name": "Clear Of The Hawser",
      "note": "Never over a working hawser, never a hand on the drum, never a line near the screw, and both the set and the silent radio answered"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Tow Deck",
      "currency": "FATHOM",
      "ranks": [
        "Ordinary",
        "Deckhand",
        "Lead Deckhand",
        "Tow Mate",
        "Tow Deck Certified"
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
    "id": "mw-oil-transfer-watch-and-boom",
    "index": "232",
    "domain": "Maritime & Ports",
    "trade": "MEBA licensed engineer as the barge's person in charge of the oil transfer, with an Inlandboatmen's Union of the ILWU deckhand on the boom boat and an SIU-trained tankerman on the pump",
    "category": "Maritime & Ports",
    "certification": "MEBA Calhoon School engineering; SIU Paul Hall Center tankerman training; Inlandboatmen's Union of the ILWU deck practice on the boom boat; USCG 33 CFR 155.710 person in charge of an oil transfer; USCG 33 CFR 156.150 declaration of inspection; IMO MARPOL oil pollution prevention; the facility's and the vessel's own transfer procedures and boom plan",
    "name": "Oil Transfer Watch & Boom",
    "weather": "overcast",
    "indoor": null,
    "district": "Maritime & Ports",
    "title": "SmartCiti.X~ Oil Transfer Watch & Boom VR",
    "tagline": "A barge discharging ashore: the transfer procedures read and the declaration of inspection signed, the current read against the boom plan, the boom streamed from upcurrent, the hose and flange walked, the manifold opened, a slow start watched at the flange while a sheen shows outside the boom, the pump held at the agreed rate through a current shift, the deck walked, the pressure read against the hose, the line stopped, drained and blanked, and the transfer logged",
    "accent": 4175242,
    "accentCss": "#3fb58a",
    "parSeconds": 290,
    "badge": {
      "id": "nothing-past-the-boom",
      "name": "Nothing Past The Boom",
      "note": "The boom streamed from upcurrent, the pump never ahead of the declaration, the sheen stopped at the source and never dispersed"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Transfer Watch",
      "currency": "BARREL",
      "ranks": [
        "Watchstander",
        "Tankerman",
        "Person In Charge",
        "Senior PIC",
        "Transfer Watch Certified"
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
    "id": "mw-dive-supervisor-and-dive-plan",
    "index": "233",
    "domain": "Maritime & Ports",
    "trade": "Pile Drivers of the Carpenters commercial diver as dive supervisor on a surface-supplied air dive, with the tender, the standby diver and an Inlandboatmen's Union of the ILWU deckhand on the dive boat",
    "category": "Maritime & Ports",
    "certification": "Pile Drivers of the Carpenters commercial diver apprenticeship and the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — the safe practices manual, the dive team, pre-dive, during-dive and post-dive procedures and the dive record; ADCI consensus standards for commercial diving; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel under Coast Guard jurisdiction; Inlandboatmen's Union of the ILWU deck practice on the dive boat",
    "name": "Dive Supervisor & Dive Plan",
    "weather": "overcast",
    "indoor": null,
    "district": "Maritime & Ports",
    "title": "SmartCiti.X~ Dive Supervisor & Dive Plan VR",
    "tagline": "The dive station at the surface: the plan briefed, the screw locked out and the flag up, the umbilical walked, the air lined up and the supply read against the plan, the station checked, the tools on the stage, the comms check held through a dead line, the stage lowered while a launch comes in with its screw turning, the pneumo read, the decompression obligation read from the tables the supervisor holds, and the dive logged",
    "accent": 15905597,
    "accentCss": "#f2b33d",
    "parSeconds": 290,
    "badge": {
      "id": "by-the-tables",
      "name": "By The Tables",
      "note": "The standby dressed, the panel never left, the umbilical never paid out foul, and the obligation read from the tables the supervisor holds"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Dive Station",
      "currency": "FATHOM",
      "ranks": [
        "Tender",
        "Diver",
        "Lead Diver",
        "Dive Supervisor",
        "Dive Station Certified"
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
    "id": "mw-pier-pile-inspection-dive",
    "index": "234",
    "domain": "Maritime & Ports",
    "trade": "Pile Drivers of the Carpenters commercial diver on a surface-supplied pier inspection dive, with the dive supervisor, the tender and the standby diver at the surface",
    "category": "Maritime & Ports",
    "certification": "Pile Drivers of the Carpenters commercial diver apprenticeship and the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations; ADCI consensus standards for commercial diving and underwater inspection; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; depth, gas and decompression per the dive plan and the tables the supervisor holds",
    "name": "Pier Pile Inspection Dive",
    "weather": "clear",
    "indoor": null,
    "district": "bay-underwater",
    "title": "SmartCiti.X~ Pier Pile Inspection Dive VR",
    "tagline": "On the bottom under the pier: on-bottom report to the supervisor, the umbilical checked hand over hand while the comms go dead, the scraper passed off the stage, the first pile's spall and section loss found, the pneumo read, the faceplate cleared, the section measured, the second pile's band cleaned at a breathing pace the supply can hold through a current shift, the jacket and anode lead found, the defects photographed against a scale, the tools sent up and the findings read up for the dive log",
    "accent": 6279360,
    "accentCss": "#5fd0c0",
    "parSeconds": 290,
    "badge": {
      "id": "every-pile-read",
      "name": "Every Pile Read",
      "note": "Both piles inspected, every defect photographed against a scale, the umbilical never fouled and never a free ascent"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Pile Inspection",
      "currency": "BENT",
      "ranks": [
        "Diver Trainee",
        "Diver",
        "Inspection Diver",
        "Lead Inspection Diver",
        "Pile Inspection Certified"
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
    "id": "mw-hull-inspection-and-cleaning-dive",
    "index": "235",
    "domain": "Maritime & Ports",
    "trade": "Pile Drivers of the Carpenters commercial diver on a hull inspection and cleaning dive, with the ship's MEBA licensed engineer holding the shaft and sea-suction lockouts and the dive supervisor on the comms",
    "category": "Maritime & Ports",
    "certification": "Pile Drivers of the Carpenters commercial diver apprenticeship and the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations, including the vessel's own hazards to the diver; ADCI consensus standards for commercial diving and ships' husbandry; USCG 46 CFR 197 Subpart B for a dive worked from or under a vessel; MEBA engineering practice for the ship's shaft and sea-suction lockouts; depth, gas and decompression per the dive plan and the tables the supervisor holds",
    "name": "Hull Inspection & Cleaning Dive",
    "weather": "clear",
    "indoor": null,
    "district": "bay-underwater",
    "title": "SmartCiti.X~ Hull Inspection & Cleaning Dive VR",
    "tagline": "Under a ship's stern quarter: the ship's lockouts confirmed on comms, the umbilical checked while a tug's screw turns at the next berth, the anodes and coating inspected, the pneumo read, the brush brought off the stage and opened only on the plate, a strake cleaned at a breathing pace while the sea suction starts to draw, the running gear walked, the sea chest cleaned only behind its tag, the plate gauged, the tools sent up and the findings read up for the dive log",
    "accent": 7324648,
    "accentCss": "#6fc3e8",
    "parSeconds": 290,
    "badge": {
      "id": "locked-out-below",
      "name": "Locked Out Below",
      "note": "Nothing touched until the ship's lockouts were confirmed, never a hand between blade and hull, never a lift bag without its dump, never under the keel"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Ship's Husbandry",
      "currency": "STRAKE",
      "ranks": [
        "Diver Trainee",
        "Diver",
        "Husbandry Diver",
        "Lead Husbandry Diver",
        "Ship's Husbandry Certified"
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
    "id": "mw-underwater-welding-and-cutting",
    "index": "236",
    "domain": "Maritime & Ports",
    "trade": "Pile Drivers of the Carpenters commercial diver-welder cutting and wet-welding a steel pile, with the tender on the surface switch and the dive supervisor on the comms",
    "category": "Maritime & Ports",
    "certification": "Pile Drivers of the Carpenters commercial diver apprenticeship and the UBC International Training Fund; AWS D3.6 underwater welding code for the qualified procedure and the welder's qualification; OSHA 29 CFR 1910 Subpart T commercial diving operations, including electrical safety for underwater welding and cutting; ADCI consensus standards for underwater burning and welding; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; depth, gas and decompression per the dive plan and the tables the supervisor holds",
    "name": "Underwater Welding & Cutting",
    "weather": "clear",
    "indoor": null,
    "district": "bay-underwater",
    "title": "SmartCiti.X~ Underwater Welding & Cutting VR",
    "tagline": "A steel pile cut back and patched: the job and the switch plan agreed on comms, the umbilical checked, the torch taken off the stage, the sealed void and the painted ground spot found, the ground on clean steel before 'make it hot', the pneumo read, the cut run at a steady oxygen flow while the comms drop, 'make it cold' before the rod change, the oxygen closed, the patch seated, the pass run through a current shift, the weld inspected and the dive logged",
    "accent": 15769675,
    "accentCss": "#f0a04b",
    "parSeconds": 300,
    "badge": {
      "id": "ground-then-hot",
      "name": "Ground Then Hot",
      "note": "The ground on clean steel before every 'make it hot', never a rod changed hot, never between the ground and the work, never a lift bag run away"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Wet Weld",
      "currency": "ROD",
      "ranks": [
        "Burner's Helper",
        "Burner",
        "Diver-Welder",
        "Lead Diver-Welder",
        "Wet Weld Certified"
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
    "id": "mw-diver-emergency-and-recovery",
    "index": "237",
    "domain": "Maritime & Ports",
    "trade": "Pile Drivers of the Carpenters commercial diver as the standby diver recovering a fouled working diver, with the dive supervisor, the tenders and an Inlandboatmen's Union of the ILWU deckhand on the dive boat at the surface",
    "category": "Maritime & Ports",
    "certification": "Pile Drivers of the Carpenters commercial diver apprenticeship and the UBC International Training Fund; OSHA 29 CFR 1910 Subpart T commercial diving operations — the standby diver, the emergency procedures in the safe practices manual and the dive record; ADCI consensus standards for commercial diving, standby and emergency response; USCG 46 CFR 197 Subpart B where the dive is worked from a vessel; Inlandboatmen's Union of the ILWU deck practice on the dive boat; ascent and treatment per the dive plan and the tables the supervisor holds",
    "name": "Diver Emergency & Recovery",
    "weather": "clear",
    "indoor": null,
    "district": "bay-underwater",
    "title": "SmartCiti.X~ Diver Emergency & Recovery VR",
    "tagline": "The standby goes in: on the bottom on the working diver's umbilical, followed hand over hand while a vessel's screw turns overhead, the diver checked through his faceplate, his bailout opened, the pneumo read, the wire and the monofilament found, the cutter passed down the stage, his free-flow held steady while your own comms go, his gear checked, brought to the stage, clipped on before the call up, and the emergency read up for the dive log",
    "accent": 15230554,
    "accentCss": "#e8665a",
    "parSeconds": 300,
    "badge": {
      "id": "brought-him-home",
      "name": "Brought Him Home",
      "note": "His gas first, the snag cut and never his umbilical, never flown up on a bag, never his helmet off, and your own umbilical kept clear"
    },
    "stepCount": 13,
    "interruptCount": 2,
    "game": {
      "system": "Standby Diver",
      "currency": "BREATH",
      "ranks": [
        "Standby Trainee",
        "Standby Diver",
        "Rescue Diver",
        "Lead Standby",
        "Standby Diver Certified"
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
    "id": "manhole-entry-and-atmospheric-monitoring",
    "index": "311",
    "domain": "Water & Environmental",
    "trade": "Sewer collection maintenance worker — AFSCME or LIUNA public-works crew, entrant with an attendant at the winch",
    "category": "Water & Environmental",
    "certification": "OSHA 29 CFR 1910.146 permit-required confined spaces, with the ANSI Z117.1 confined-space practice standard and the NIOSH confined-space criteria behind the testing order; ACGIH exposure values for hydrogen sulphide on the permit; MUTCD temporary traffic control for the lane closure and ANSI/ISEA 107 high-visibility garments for the crew; AFSCME and LIUNA public-works training",
    "name": "Manhole Entry & Atmospheric Monitoring",
    "weather": "rain",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Manhole Entry & Atmospheric Monitoring VR",
    "tagline": "A sewer manhole in a live lane on a wet morning: the lane closed to the traffic manual, the permit read, the four-gas monitor bumped, the cover walked off with the lifter, the shaft tested top to bottom while a car noses into the taper, the blower set upwind, the rungs looked at, the winch brake proven, the harness on and the line clipped, the climb down on a snug line while the upstream lift station starts, the invert checked, and the entry closed out and logged",
    "accent": 4175561,
    "accentCss": "#3fb6c9",
    "parSeconds": 300,
    "badge": {
      "id": "tested-before-trusted",
      "name": "Tested Before Trusted",
      "note": "Every level of the shaft read before a boot went in, the line never slack, the taper and the lift station both answered, and the permit closed with the readings on it"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Collection Entry",
      "currency": "PPM",
      "ranks": [
        "Collection Hand",
        "Entrant",
        "Gas Tester",
        "Lead Entrant",
        "Confined Space Qualified"
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
    "id": "vessel-gangway-and-hatch-cover-safety",
    "index": "312",
    "domain": "Maritime & Ports",
    "trade": "ILWU longshore — hatch gang going aboard to open the hold, PMA training programme, with the ship's deck officer on the hydraulics",
    "category": "Maritime & Ports",
    "certification": "ILWU longshore with the PMA training programme; OSHA 29 CFR 1918 longshoring for the means of access, the hatch covers and the hold, and 29 CFR 1917 marine terminals for the quay; IMO SOLAS for the ship's gangway and IMO STCW for the watch that tends it; NIOSH guidance on oxygen-depleted cargo holds; ANSI/ISEA 107 high-visibility garments on deck",
    "name": "Vessel Gangway & Hatch Cover Safety",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Vessel Gangway & Hatch Cover Safety VR",
    "tagline": "Aboard before the cargo moves: the gangway looked over, the net under it and the ring buoy at its head, its angle read against the tide, the climb with both hands while the ship ranges on her lines, the hatch plan agreed with the mate, the cover's path chained off and its cleats knocked back, a weeping hydraulic hose found, the cover opened on the lever while a lasher wanders into its fold, the panels pinned, the hold ladder and lights proven, the hold's air read, and the hatch logged",
    "accent": 3121104,
    "accentCss": "#2f9fd0",
    "parSeconds": 290,
    "badge": {
      "id": "aboard-and-open-clean",
      "name": "Aboard and Open Clean",
      "note": "Both hands on the gangway, nobody in the fold, the ranging ship and the lasher both answered, and the hold's air read before a foot went down the ladder"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Hatch Gang",
      "currency": "LIFT",
      "ranks": [
        "Casual",
        "Hatch Hand",
        "Gangway Checker",
        "Hatch Boss",
        "Hatch Gang Certified"
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
    "id": "stage-load-in-and-truss-rigging",
    "index": "313",
    "domain": "Entertainment & Live Events",
    "trade": "IATSE stagehand — ground rigger at an arena load-in, working to the head rigger in the steel",
    "category": "Entertainment & Live Events",
    "certification": "IATSE training trust with ETCP Certified Rigger — Arena practice; ANSI E1.6 powered entertainment hoists for the chain motors; ASME B30.16 for the hoists themselves, ASME B30.26 for the shackles and ASME B30.9 for the slings and steel secondaries",
    "name": "Stage Load-In & Truss Rigging",
    "weather": "clear",
    "indoor": "theatre",
    "district": null,
    "title": "SmartCiti.X~ Stage Load-In & Truss Rigging VR",
    "tagline": "An arena load-in from the deck: the rigging plot read, hard hat and gloves on, a dented truss chord found, the sections spliced and the couplers bolted, the bridle angle read, a twisted motor chain caught, the tag line held while a stagehand pushes a cart under the load, the motors bumped up level until one falls out of step, trim checked, the load cells read, the steel secondaries rigged and the shackles moused, and the points logged",
    "accent": 12946687,
    "accentCss": "#c58cff",
    "parSeconds": 285,
    "badge": {
      "id": "flown-level-and-dead-hung",
      "name": "Flown Level and Dead-Hung",
      "note": "Nobody under the load, the out-of-step motor stopped on the E-stop, every point inside its plot load, and every point on its steel"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Ground Rigging",
      "currency": "POINT",
      "ranks": [
        "Deck Hand",
        "Truss Builder",
        "Ground Rigger",
        "Lead Ground Rigger",
        "Arena Rigging Certified"
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
    "id": "leading-edge-and-horizontal-lifeline",
    "index": "314",
    "domain": "Construction & Structural Trades",
    "trade": "Ironworker or carpenter laying metal deck at a leading edge, on a horizontal lifeline rigged to a qualified person's design",
    "category": "Construction & Structural Trades",
    "certification": "Ironworkers IMPACT and Carpenters training; OSHA 29 CFR 1926.501 duty to have fall protection at a leading edge and 29 CFR 1926.502 fall-protection systems, including the horizontal lifeline's design by a qualified person; ANSI Z359 personal fall-arrest equipment, including leading-edge-rated self-retracting lifelines; ASME B30.5 for the crane landing the deck bundles",
    "name": "Leading Edge & Horizontal Lifeline",
    "weather": "wind",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Leading Edge & Horizontal Lifeline VR",
    "tagline": "Deck at the leading edge: the fall-protection plan read, the harness on and the leading-edge SRL clipped, a cut lanyard found, the beam clamps torqued, the lifeline run and tensioned while a welder starts cutting above it, the sag measured, the clearance checked, the traveller clipped while the crane swings a bundle overhead, a knife-edge flange found and padded, the rescue kit confirmed, a sheet laid and fastened, and the edge logged",
    "accent": 15909195,
    "accentCss": "#f2c14b",
    "parSeconds": 300,
    "badge": {
      "id": "tied-off-at-the-edge",
      "name": "Tied Off At The Edge",
      "note": "Never untied past the line, the lifeline tensioned to the design, the sparks and the bundle both answered, and the edge padded before the first sheet"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Leading Edge",
      "currency": "SHEET",
      "ranks": [
        "Apprentice",
        "Decker",
        "Lifeline Rigger",
        "Lead Decker",
        "Leading Edge Qualified"
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
    "id": "drum-sampling-and-overpack",
    "index": "315",
    "domain": "Environmental Monitoring",
    "trade": "LIUNA hazmat laborer or environmental technician — drum sampling and overpacking in Level B, with a buddy and the site safety officer at decon",
    "category": "Environmental Monitoring",
    "certification": "OSHA 29 CFR 1910.120 HAZWOPER, including its drum and container handling provisions, and 29 CFR 1910.134 for the SCBA; EPA RCRA 40 CFR 261 waste identification and 40 CFR 262 generator marking for the overpack; PHMSA 49 CFR 172 hazard communication for the shipment; EPA QA/G-5 sampling quality practice and chain of custody; NIOSH guidance on chemical protective clothing; LIUNA Training hazardous waste worker courses",
    "name": "Drum Sampling & Overpack",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Drum Sampling & Overpack VR",
    "tagline": "Abandoned drums in the exclusion zone: the site safety plan read, Level B on in order, a bulging drum found and left shut, the vapour read, a good drum bonded and its bung cracked with a brass wrench, a full-depth sample drawn while the wind swings round, the jar sealed, a weeping chime found and bermed, the leaker lifted into a salvage drum while a buddy's low-air bell rings, the lid ring torqued, the overpack marked, and the custody form signed",
    "accent": 7915680,
    "accentCss": "#78c8a0",
    "parSeconds": 300,
    "badge": {
      "id": "sampled-and-contained",
      "name": "Sampled and Contained",
      "note": "The bulging drum left for remote opening, the sample drawn full depth and sealed, the wind and the low-air bell both answered, and the leaker overpacked and marked"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Drum Crew",
      "currency": "DRUM",
      "ranks": [
        "Site Laborer",
        "Drum Handler",
        "Sampler",
        "Drum Crew Lead",
        "Hazardous Waste Worker Certified"
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
    "id": "bus-yard-fuelling-and-brake-check",
    "index": "316",
    "domain": "Mobility & Transit",
    "trade": "ATU or IAM coach yard service worker — fuel lane and air brake check, with the yard hostler moving coaches behind",
    "category": "Mobility & Transit",
    "certification": "ATU, IAM and TWU bus maintenance training; FMCSA 49 CFR 393 brake and warning-device requirements and 49 CFR 396 inspection, repair and the driver vehicle inspection report for a carrier under FMCSA rules; CVSA out-of-service criteria for brake adjustment and air-line condition; OSHA 29 CFR 1910.1200 hazard communication for diesel and DEF at the island; ANSI/ISEA 107 high-visibility garments in the yard",
    "name": "Bus Yard Fuelling & Brake Check",
    "weather": "overcast",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Bus Yard Fuelling & Brake Check VR",
    "tagline": "The fuel lane at the end of the day: the lane board read, the brake set and the engine off, the coach chocked, the tank filled with a hand on the nozzle while a hose lets go at the next island, the DEF into its own filler, the cap on to the click, a coolant leak found, air built to cut-out, the applied leak held while a hostler backs a coach into the lane, the low-air warning proven, a pushrod stroke measured, a chafed air line found, the coach tagged out, and the report written",
    "accent": 6534640,
    "accentCss": "#63b5f0",
    "parSeconds": 300,
    "badge": {
      "id": "fuelled-checked-written-up",
      "name": "Fuelled, Checked, Written Up",
      "note": "Engine off and a hand on the nozzle, the spill and the hostler both answered, the brake check done by the numbers, and the chafed line kept off the road"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Fuel Lane",
      "currency": "PSI",
      "ranks": [
        "Yard Hand",
        "Fueller",
        "Service Worker",
        "Lead Service Worker",
        "Fuel Lane Certified"
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
    "id": "battery-storage-container-commissioning",
    "index": "317",
    "domain": "Energy & Power",
    "trade": "IBEW inside wireman on a battery storage commissioning crew, with the commissioning agent on the radio",
    "category": "Energy & Power",
    "certification": "IBEW/NECA JATC training; NFPA 855 stationary energy storage systems, including commissioning, gas detection and explosion control, with NFPA 69 for the exhaust interlock; NFPA 70 (NEC) for the energy storage wiring; NFPA 70E for DC shock and arc-flash work practices; NETA acceptance testing for the insulation and torque checks; OSHA 29 CFR 1910.147 lockout and 29 CFR 1910.333 verification of de-energisation",
    "name": "Battery Storage Container Commissioning",
    "weather": "clear",
    "indoor": null,
    "district": null,
    "title": "SmartCiti.X~ Battery Storage Container Commissioning VR",
    "tagline": "A battery container from delivered to first charge: the commissioning plan read, a swollen module found on the walkdown, the gas detection and exhaust interlock proven, gloves air-tested and the hood on, the DC disconnect locked out, zero volts proven while the off-gas detector alarms, the bus links torqued, the insulation tested, a missing finger-safe cover found, the HVAC and BMS confirmed, the first charge ramped while a cell group runs hot, the connections scanned, and the container logged",
    "accent": 10475599,
    "accentCss": "#9fd84f",
    "parSeconds": 300,
    "badge": {
      "id": "commissioned-by-the-plan",
      "name": "Commissioned By The Plan",
      "note": "Never inside in alarm, zero volts proven before a tool touched the bus, the off-gas and the hot cell both answered, and every connection scanned under load"
    },
    "stepCount": 15,
    "interruptCount": 2,
    "game": {
      "system": "Storage Commissioning",
      "currency": "KWH",
      "ranks": [
        "Apprentice",
        "Wireman",
        "Commissioning Tech",
        "Lead Commissioning Tech",
        "Storage Commissioning Certified"
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
    "id": "bb-warmup-injury-prevention-and-hydration",
    "index": "331",
    "domain": "Youth Sports",
    "trade": "Youth basketball coach",
    "category": "Youth Sports & Coaching",
    "certification": "USA Basketball youth development guidelines for age-appropriate practice length, warm-up and rest; NFHS sports medicine guidance on heat, hydration and a written emergency action plan for school sport; CDC Heads Up for the coach's duty to recognise and remove; the U.S. Center for SafeSport for observable, interruptible practices with two adults present; the American Red Cross first aid course for check, call and care until the athletic trainer or emergency services take over",
    "name": "Warm-Up, Injury Prevention and Hydration",
    "weather": "clear",
    "indoor": null,
    "district": "gym-court",
    "title": "SmartCiti.X~ Warm-Up, Injury Prevention and Hydration VR",
    "tagline": "The first fifteen minutes of practice: the floor walked dry and clear, the emergency plan read, a health check-in at the door, water at the bench, a dynamic warm-up in order, shoes and jewellery checked and a water break called by the clock",
    "accent": 5223423,
    "accentCss": "#4fb3ff",
    "parSeconds": 330,
    "badge": {
      "id": "ready-to-play",
      "name": "Ready to Play",
      "note": "The floor, the players and the water all ready before the first drill, and nobody pushed past what their body said"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Practice Plan",
      "currency": "REPS",
      "ranks": [
        "Volunteer Helper",
        "Assistant Coach",
        "Head Coach",
        "Programme Lead",
        "Coach Educator"
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
    "id": "bb-stance-and-ball-handling",
    "index": "332",
    "domain": "Youth Sports",
    "trade": "Youth basketball coach",
    "category": "Youth Sports & Coaching",
    "certification": "USA Basketball youth development guidelines on age-appropriate ball size, skill progression and work-to-rest balance; NFHS basketball rules for the dribble and a school-sport standard of safe equipment; CDC Heads Up for recognising a knock to the head in a crowded drill; the U.S. Center for SafeSport for calm, observable correction of young players; the American Red Cross first aid course for the sprains and jammed fingers ball-handling drills produce",
    "name": "Stance and Ball Handling",
    "weather": "clear",
    "indoor": null,
    "district": "gym-court",
    "title": "SmartCiti.X~ Stance and Ball Handling VR",
    "tagline": "Balls checked before they are handed out, lanes spaced wide, the triple-threat stance built from the feet up, a pound dribble with the eyes up, work and rest on a timer, and every loose ball racked",
    "accent": 15899448,
    "accentCss": "#f29b38",
    "parSeconds": 320,
    "badge": {
      "id": "eyes-up",
      "name": "Eyes Up",
      "note": "A whole ball-handling block run with the heads up, the lanes clear and nobody pushed past their rest"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Handle Series",
      "currency": "TOUCHES",
      "ranks": [
        "Ball Boy or Girl",
        "Drill Helper",
        "Skills Coach",
        "Head Coach",
        "Skills Director"
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
    "id": "bb-footwork-pivots-and-jump-stops",
    "index": "333",
    "domain": "Youth Sports",
    "trade": "Youth basketball coach",
    "category": "Youth Sports & Coaching",
    "certification": "USA Basketball youth development guidelines on landing mechanics, jump volume and rest for growing players; NFHS basketball rules on the pivot foot and travelling; CDC Heads Up for the head knocks a fall on a landing can bring; the U.S. Center for SafeSport for verified pick-up and two adults present; the American Red Cross first aid course for rest, ice, support and elevation of a sprained ankle",
    "name": "Footwork: Pivots and Jump Stops",
    "weather": "clear",
    "indoor": null,
    "district": "gym-court",
    "title": "SmartCiti.X~ Footwork: Pivots and Jump Stops VR",
    "tagline": "The floor felt for sticky and slick patches, the pivot-foot rule explained, a jump stop landed soft and balanced, a half-turn pivot on the ball of the foot, a steady agility ladder, a jump count kept, and a rolled ankle cared for properly",
    "accent": 10189823,
    "accentCss": "#9b7bff",
    "parSeconds": 320,
    "badge": {
      "id": "soft-landings",
      "name": "Soft Landings",
      "note": "Every landing balanced and every knee over its toes, with the jump count kept and nobody walking off a sore ankle"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Footwork Ladder",
      "currency": "STEPS",
      "ranks": [
        "Floor Helper",
        "Footwork Coach",
        "Assistant Coach",
        "Head Coach",
        "Movement Mentor"
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
    "id": "bb-passing-and-catching",
    "index": "334",
    "domain": "Youth Sports",
    "trade": "Youth basketball coach",
    "category": "Youth Sports & Coaching",
    "certification": "USA Basketball youth development guidelines on age-appropriate ball size, partner distance and skill progression; NFHS guidance on a safe playing area and hydration in school sport; CDC Heads Up for a ball to the head — recognise, remove, refer; the U.S. Center for SafeSport for correcting a young player calmly and in view; the American Red Cross first aid course for cold on a jammed finger and never pulling it",
    "name": "Passing and Catching",
    "weather": "clear",
    "indoor": null,
    "district": "gym-court",
    "title": "SmartCiti.X~ Passing and Catching VR",
    "tagline": "Every receiver's background checked, names called before passes, a chest pass built in order, target hands up, speed matched to the catcher, the bounce spot set, and any ball to the face taken seriously",
    "accent": 4182184,
    "accentCss": "#3fd0a8",
    "parSeconds": 320,
    "badge": {
      "id": "soft-hands",
      "name": "Soft Hands",
      "note": "Every pass seen, every catch made with the fingers up, and no knock to the head shrugged off"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Pass Chain",
      "currency": "ASSISTS",
      "ranks": [
        "Rebound Helper",
        "Drill Coach",
        "Assistant Coach",
        "Head Coach",
        "Offence Educator"
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
    "id": "bb-shooting-form-and-arc",
    "index": "335",
    "domain": "Youth Sports",
    "trade": "Youth basketball coach",
    "category": "Youth Sports & Coaching",
    "certification": "USA Basketball youth development guidelines on ball size and rim height scaled to age, shooting progressions and managing repetition with rest; NFHS guidance on equipment in safe condition and padded goal supports; CDC Heads Up for a knock to the head under a crowded rim; the U.S. Center for SafeSport for observable, encouraging correction; the American Red Cross first aid course for a player down under the basket",
    "name": "Shooting Form and Arc",
    "weather": "clear",
    "indoor": null,
    "district": "gym-court",
    "title": "SmartCiti.X~ Shooting Form and Arc VR",
    "tagline": "A practice hoop inspected and set to the right height, the ball sized to the hands, the shot built from balance up, the arc held in a band that drops, the release timed at the top, the lane clear and a shot count with rest",
    "accent": 16742971,
    "accentCss": "#ff7a3b",
    "parSeconds": 330,
    "badge": {
      "id": "nothing-but-arc",
      "name": "Nothing but Arc",
      "note": "The shot built right, the arc and release in band, and nobody under the rim or shooting on empty"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Shot Chart",
      "currency": "MAKES",
      "ranks": [
        "Rebounder",
        "Shooting Helper",
        "Assistant Coach",
        "Shooting Coach",
        "Skills Director"
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
    "id": "bb-free-throw-routine",
    "index": "336",
    "domain": "Youth Sports",
    "trade": "Youth basketball coach",
    "category": "Youth Sports & Coaching",
    "certification": "USA Basketball youth development guidelines on building routines, managing fatigue and rest between efforts; NFHS basketball rules on free-throw lane positions and when lane players may move; CDC Heads Up for the knocks a crowded lane can bring; the U.S. Center for SafeSport for parents kept welcome but outside the drill and every conversation in view; the American Red Cross first aid course for heat and dehydration signs",
    "name": "Free Throw Routine",
    "weather": "clear",
    "indoor": null,
    "district": "gym-court",
    "title": "SmartCiti.X~ Free Throw Routine VR",
    "tagline": "The line and lane checked, the lane rules explained, the same routine every time, the shooting foot lined up, a steady tempo, composure held on tired legs, water between rounds and shooters rotated to rest",
    "accent": 14730058,
    "accentCss": "#e0c34a",
    "parSeconds": 320,
    "badge": {
      "id": "same-every-time",
      "name": "Same Every Time",
      "note": "One routine, held the same way through fatigue and pressure, with water, rest and a clear lane"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Line Routine",
      "currency": "SWISHES",
      "ranks": [
        "Rebound Helper",
        "Line Coach",
        "Assistant Coach",
        "Head Coach",
        "Routine Mentor"
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
    "id": "bb-defensive-stance-and-closeouts",
    "index": "337",
    "domain": "Youth Sports",
    "trade": "Youth basketball coach",
    "category": "Youth Sports & Coaching",
    "certification": "USA Basketball youth development guidelines on defensive fundamentals, work-to-rest ratios and never using conditioning as punishment; NFHS basketball rules protecting an airborne shooter's landing space and on legal guarding position; CDC Heads Up for the collisions a closeout can cause; the U.S. Center for SafeSport for de-escalating a heated moment calmly and in view; the American Red Cross first aid course for a player down with a rolled ankle",
    "name": "Defensive Stance and Closeouts",
    "weather": "clear",
    "indoor": null,
    "district": "gym-court",
    "title": "SmartCiti.X~ Defensive Stance and Closeouts VR",
    "tagline": "Room to slide checked, active hands instead of reaching, a stance built and held, slides without crossing the feet, closeouts chopped under control and never into a shooter's landing, hips opened to run, and rest between reps",
    "accent": 5951610,
    "accentCss": "#5ad07a",
    "parSeconds": 330,
    "badge": {
      "id": "under-control",
      "name": "Under Control",
      "note": "Every closeout chopped, every shooter's landing respected and every heated moment cooled without a scene"
    },
    "stepCount": 14,
    "interruptCount": 2,
    "game": {
      "system": "Stops",
      "currency": "STOPS",
      "ranks": [
        "Drill Helper",
        "Defensive Coach",
        "Assistant Coach",
        "Head Coach",
        "Defence Educator"
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
