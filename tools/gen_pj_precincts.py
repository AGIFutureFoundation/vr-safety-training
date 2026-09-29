#!/usr/bin/env python3
"""PROJECTLANDS (docs/consoles/PROJECTLANDS.md): add the project precincts to the maps that already hold a project.

Written once; the map modules are the source afterwards. Idempotent (a map that already carries a precinct site is
skipped). Every site is marked `"precinct": true`; positions were probed dry, flat and clear with tools/pj_probe.mjs.

    python3 tools/gen_pj_precincts.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def S(id, name, kind, pos, trades, progs, stations, blurb):
    return {"id": id, "name": name, "kind": kind, "position": pos, "trades": trades, "programmes": progs,
            "stations": stations, "blurb": blurb, "precinct": True}


P = {}
PORT = ("The Port of Oakland's project under the EPA's San Francisco Bay Program: four large trash capture devices collecting "
        "stormwater from port property. Where on the port property the devices stand is not stated; this site's placement is procedural.")
CP = ("The EPA Clean Ports Program award to the Port of Oakland fast-tracks the Oakland Seaport's conversion to nearly all "
      "zero-emissions cargo handling")
P["oak-west-oakland"] = [
    S("oak-port-trash-capture-outer-harbor", "Port Trash Capture Device Site, Outer Harbor (procedural placement)", "trash-capture", [100, -480], ["liuna", "teamsters"], ["bay-program-projects", "confined-space"], ["bk-street-drain-trash-capture-cleanout", "br-trash-capture-device-service", "manhole-entry-and-atmospheric-monitoring", "cs-non-entry-retrieval-and-tripod"], PORT + " The crew cleans the device out from the surface: cones, the air tested, the screen lifted from above."),
    S("oak-port-trash-capture-middle-harbor", "Port Trash Capture Device Site, Middle Harbor (procedural placement)", "trash-capture", [-450, 420], ["liuna", "teamsters", "iuoe-local3"], ["bay-program-projects", "hazmat-environmental"], ["br-trash-capture-device-service", "stormwater-outfall", "cs-ventilation-and-air-monitoring-plan", "drum-sampling-and-overpack"], "A second trash capture device site on the port property, placed procedurally: the vacuum truck positioned, the debris load-out, and the outfall checked downstream."),
    S("oak-port-charging-yard", "Seaport Charging Yard (procedural placement)", "charging", [-300, 150], ["ibew"], ["energy-transition", "electrical-first-period"], ["cp-charging-yard-connectors-and-e-stops", "et-ev-fleet-depot-charging-and-arc-flash", "charge-point", "cp-high-voltage-lockout-on-electric-cargo-equipment"], CP + "; its activities include charging infrastructure. This yard's placement is procedural: connectors inspected, the emergency stop tested, the charger locked out before service."),
    S("oak-port-battery-storage-site", "Battery Energy Storage Site (procedural placement)", "energy-storage", [250, -850], ["ibew"], ["energy-transition"], ["cp-battery-energy-storage-site-awareness", "battery-storage-container-commissioning", "battery-yard"], "The Clean Ports activities include a battery energy storage system. This site's placement is procedural: the no-go zone kept, the gas panel read from outside, nobody opening a container alone."),
    S("oak-port-drayage-staging", "Zero-Emission Drayage Staging (procedural placement)", "trucking", [-500, -450], ["teamsters"], ["transit-ramp", "port-operations"], ["cp-zero-emission-drayage-truck-pre-trip", "tdl-pretrip-inspection", "cp-hydrogen-fuel-cell-equipment-and-fuelling"], "The Clean Ports equipment includes zero-emission drayage trucks. Drivers stage here, placed procedurally: the pre-trip walk-around, the charge or hydrogen level checked, the high-voltage labels respected."),
    S("oak-port-ze-equipment-yard", "Zero-Emission Cargo Equipment Yard (procedural placement)", "port", [-250, 450], ["ilwu", "iam"], ["port-operations", "energy-transition"], ["cp-zero-emission-terminal-equipment-pre-use", "cp-high-voltage-lockout-on-electric-cargo-equipment", "straddle-carrier-ops", "po-yard-hostler-and-pedestrian-separation"], "The Clean Ports equipment includes zero-emission cargo handling equipment, electric and hydrogen. Operators check it before use and mechanics lock it out before service; this yard's placement is procedural."),
]
SJ = ("the kind of field work a green stormwater infrastructure implementation plan rests on (a procedural site; the City of "
      "San Jose's project is told at the downtown stormwater crew yard)")
P["bay-san-jose"] = [
    S("sj-gsi-street-survey", "Green Stormwater Street Survey Crew", "survey", [-600, 1100], ["ifpte", "afscme"], ["bay-program-projects", "water-and-gas-utility-crews"], ["br-drone-shoreline-survey", "ut-hydrant-flow-test-and-flushing-with-traffic-control", "ut-service-line-locate-and-hand-dig-near-gas-main"], "A survey crew walks streets and parcels with traffic control set: " + SJ + "."),
    S("sj-gsi-site-assessment", "Green Stormwater Site Assessment", "assessment", [900, 1000], ["afscme", "liuna"], ["bay-program-projects", "hazmat-environmental"], ["stormwater-outfall", "manhole-entry-and-atmospheric-monitoring", "bk-bioretention-rain-garden-excavation", "br-water-quality-sonde-calibration-and-deploy"], "Candidate spots for a rain garden or planted swale are assessed from the surface: drains, outfalls and the ground itself, " + SJ + "."),
    S("sj-gsi-planning-studio", "Green Stormwater Planning Studio", "planning", [-1300, -700], ["ifpte", "afscme"], ["bay-program-projects", "civic-leadership-and-ei"], ["br-restoration-data-qa-and-public-reporting", "public-comment-prep", "public-meeting-chair", "cv-open-meeting-law-and-agenda-notice"], "Where survey data becomes a draft plan and the public is heard on it: the data checked before it is reported, the meeting noticed and chaired fairly, " + SJ + "."),
]
SP = ("building and monitoring green stormwater infrastructure, as the City of San Pablo's project does (a procedural site; "
      "the project is told at the San Pablo stormwater crew)")
P["bay-san-pablo"] = [
    S("sp-gsi-bioretention-build", "Bioretention Build Site", "construction", [-500, -1200], ["liuna", "iuoe-local3"], ["bay-program-projects", "heavy-equipment-operators"], ["bk-bioretention-rain-garden-excavation", "trench-box", "op-excavator-trench-and-utility-locate", "ut-service-line-locate-and-hand-dig-near-gas-main"], "A bioretention cell dug into a street corner: utilities located, the trench shored, the soil placed in lifts, " + SP + "."),
    S("sp-gsi-monitoring-point", "Stormwater Monitoring Point", "monitoring", [300, -1100], ["afscme", "ifpte"], ["bay-program-projects", "hazmat-environmental"], ["stormwater-outfall", "br-water-quality-sonde-calibration-and-deploy", "br-restoration-data-qa-and-public-reporting"], "Where a crew samples runoff before and after it passes through the planted cells, by the creek, " + SP + "."),
    S("sp-gsi-underdrain-crew", "Underdrain and Piping Crew", "utility", [1500, -1500], ["ua", "liuna"], ["plumbers-and-pipefitters", "grounds-and-landscaping"], ["pl-underground-sewer-lateral-and-trench-shoring", "bioswale-build", "gk-irrigation-controller-valve-box-and-backflow-check"], "The underdrain and overflow piping under a planted cell, laid in a shored trench, " + SP + "."),
]
P["bp-strip-marsh-east"] = [
    S("sme-small-boat-landing", "Small-Boat Crew Landing", "boat-landing", [-1700, 450], ["ibu", "liuna"], ["bay-restoration-maritime-underwater", "marine-ecology-and-restoration"], ["br-vhf-and-navigation-in-a-work-zone", "br-cold-water-immersion-and-mob-recovery", "me-water-column-sampling-from-a-small-boat", "br-boom-towing-between-two-vessels"], "The small-boat crew that tends the turbidity curtain and samples the water off the new channels: float coats, the radio, the weather and the tide read first."),
    S("sme-water-control-structure", "Water-Control Structure Crew", "water-control", [1500, 400], ["liuna", "iuoe-local3"], ["bay-restoration-maritime-underwater", "bay-program-projects"], ["tide-gate", "br-fish-screen-maintenance", "br-culvert-retrofit-for-fish-passage", "br-levee-inspection-and-seepage"], "A tide gate by the slough: locked out before anyone reaches in, the fish screen cleaned, the levee beside it walked for seepage."),
    S("sme-marsh-mat-crossing", "Swamp Mat Crossing", "mat-crossing", [-300, -200], ["iuoe-local3"], ["heavy-equipment-operators", "bay-program-projects"], ["br-tidal-marsh-grading-amphibious-excavator", "op-equipment-daily-walkaround-and-fluids", "op-excavator-trench-and-utility-locate", "spill-boom-deploy"], "Where an operator walks the excavator out onto the soft marsh on mats: the walk-around, the spill kit on board, and the mats laid ahead before every move."),
]
P["bp-san-leandro-bay"] = [
    S("slb-vacuum-truck-staging", "Vacuum Truck Staging", "vacuum-truck", [1300, 300], ["teamsters", "liuna"], ["bay-program-projects", "heavy-equipment-operators"], ["bk-street-drain-trash-capture-cleanout", "op-equipment-daily-walkaround-and-fluids", "tdl-pretrip-inspection", "traffic-incident-management"], "Where the vacuum truck that serves the trash capture devices is walked around and staged, with traffic control ready for the street."),
    S("slb-debris-haul-transfer", "Debris Haul Transfer Point", "haul", [500, -800], ["teamsters"], ["hazmat-environmental", "warehouse-and-logistics-automation"], ["hz-drum-staging-and-compatibility-segregation", "soil-loadout", "tdl-pretrip-inspection"], "Trash and sediment from the capture devices are sorted, covered and hauled from here, with anything hazardous set apart."),
]
P["sf-outer-mission"] = [
    S("om-underdrain-piping-crew", "Underdrain Piping Crew", "utility", [-550, 650], ["ua", "liuna"], ["plumbers-and-pipefitters", "bay-program-projects"], ["pl-underground-sewer-lateral-and-trench-shoring", "trench-box", "bk-bioretention-rain-garden-excavation"], "The perforated underdrain beneath a planted sidewalk, laid in a shored trench and tied into the sewer."),
    S("om-gsi-monitoring-crew", "Green Infrastructure Monitoring Crew", "monitoring", [700, 600], ["afscme", "ifpte"], ["bay-program-projects", "hazmat-environmental"], ["stormwater-outfall", "br-water-quality-sonde-calibration-and-deploy", "br-restoration-data-qa-and-public-reporting"], "The crew that checks the planted filters and rain gardens after a storm: ponding, inlets and water samples, the data checked before it is reported."),
]

if __name__ == "__main__":
    for pid, sites in P.items():
        f = ROOT / "WebXR" / "shared" / f"np-data-{pid}.js"
        s = f.read_text()
        if any(f'"id":"{x["id"]}"' in s for x in sites):
            print("skip", pid)
            continue
        i = s.index("\n  sites: [")
        j = s.index("\n  ],\n  landmarks:", i)
        add = "".join("\n    " + json.dumps(x, ensure_ascii=False, separators=(",", ":")) + "," for x in sites)
        f.write_text(s[:j] + add + s[j:])
        print(pid, len(sites))
