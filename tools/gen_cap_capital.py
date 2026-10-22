#!/usr/bin/env python3
"""CAPITAL (console cap): Baton Rouge at district scale, written once as pure-literal parish modules.

    python3 tools/gen_cap_capital.py

Each map is laid out from approximate public lon/lat (three decimals, `approximate: true`) through one north-up uniform
scale (x east, +z south). The river, streets and places are real *as places*; every site layout is the platform's
illustration (procedural). No figures about any place are stated. The modules are the source of truth afterwards.
"""
import json, math, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SHARED = ROOT / "WebXR" / "shared"
M_LAT = 111320.0


class Frame:
    def __init__(self, lon0, lat0, scale):
        self.lon0, self.lat0, self.s = lon0, lat0, scale
        self.m_lon = M_LAT * math.cos(math.radians(lat0))

    def xz(self, lon, lat):
        x = (lon - self.lon0) * self.m_lon / self.s
        z = -(lat - self.lat0) * M_LAT / self.s
        clamp = lambda v: max(-2048, min(2048, round(v)))
        return [clamp(x), clamp(z)]

    def pts(self, lls):
        return [self.xz(*p) for p in lls]


def J(o):
    return json.dumps(o, ensure_ascii=False, separators=(",", ":"))


def site(sid, name, kind, pos, trades, programmes, stations, blurb):
    return {"id": sid, "name": name, "kind": kind, "position": pos, "trades": trades, "programmes": programmes,
            "stations": stations, "blurb": blurb}


def write(mod, const, header, m):
    lines = [f"// {l}" for l in header] + [f"export const {const} = {{"]
    for k in ("id", "name", "region", "size", "scale", "blurb", "start"):
        lines.append(f"  {k}: {J(m[k])},")
    for k in ("anchors", "hills", "water", "levees", "roads", "districts", "sites", "landmarks", "connectors", "fieldLessons", "gated"):
        if k not in m:
            continue
        lines.append(f"  {k}: [")
        for item in m[k]:
            lines.append(f"    {J(item)},")
        lines.append("  ],")
    lines.append("};")
    (SHARED / mod).write_text("\n".join(lines) + "\n")
    print("wrote", mod, len(m["sites"]), "sites")


DT_F = Frame(-91.185, 30.450, 1.5)
NI_F = Frame(-91.175, 30.5054, 1.5)
ILLUSTRATIVE = "The site layouts are illustrative (procedural); the river, streets and places are real."

# ---------------------------------------------------------------- downtown Baton Rouge and the riverfront
def downtown():
    F = DT_F
    river = [(-91.2008, 30.4776), (-91.2017, 30.465), (-91.2022, 30.450), (-91.2031, 30.4363), (-91.2031, 30.4224),
             (-91.1948, 30.4224), (-91.1930, 30.4363), (-91.1910, 30.450), (-91.1916, 30.465), (-91.1925, 30.4776)]
    m = {
        "id": "br-downtown-riverfront", "name": "Baton Rouge — Downtown & Riverfront", "region": "louisiana-cities",
        "size": 4096, "scale": 1.5,
        "blurb": "Downtown Baton Rouge at street scale: the State Capitol and its grounds, the Old State Capitol, the Mississippi riverfront and its levee path, the interstate bridge to the west bank at Port Allen, and the streets of the downtown grid. Trades sites for high-rise steel, streetscape and utility crews, bridge painting and riverfront crane work. " + ILLUSTRATIVE,
        "start": "brd-workforce-centre",
    }
    m["anchors"] = [
        {"xz": F.xz(-91.187, 30.457), "lonlat": [-91.187, 30.457], "approximate": True, "name": "the Louisiana State Capitol"},
        {"xz": F.xz(-91.189, 30.447), "lonlat": [-91.189, 30.447], "approximate": True, "name": "the Old State Capitol"},
        {"xz": F.xz(-91.197, 30.450), "lonlat": [-91.197, 30.450], "approximate": True, "name": "the Mississippi River at downtown"},
        {"xz": F.xz(-91.198, 30.438), "lonlat": [-91.198, 30.438], "approximate": True, "name": "the interstate bridge over the Mississippi"},
        {"xz": F.xz(-91.211, 30.445), "lonlat": [-91.211, 30.445], "approximate": True, "name": "Port Allen on the west bank"},
        {"xz": F.xz(-91.180, 30.462), "lonlat": [-91.180, 30.462], "approximate": True, "name": "Spanish Town"},
        {"xz": F.xz(-91.185, 30.442), "lonlat": [-91.185, 30.442], "approximate": True, "name": "Beauregard Town"},
        {"xz": F.xz(-91.165, 30.435), "lonlat": [-91.165, 30.435], "approximate": True, "name": "the interstate south-east of downtown"},
    ]
    m["water"] = [
        {"id": "mississippi-river", "name": "Mississippi River", "kind": "river", "poly": F.pts(river)},
        {"id": "capitol-lake", "name": "Capitol Lake", "kind": "lake", "poly": F.pts([(-91.1860, 30.4665), (-91.1835, 30.4665), (-91.1830, 30.4600), (-91.1855, 30.4595)])},
        {"id": "downtown-drainage-canal", "name": "a drainage canal (procedural)", "kind": "canal", "width": 10, "poly": F.pts([(-91.153, 30.4330), (-91.1600, 30.4320), (-91.1680, 30.4290)])},
    ]
    m["levees"] = [
        {"id": "east-bank-levee", "name": "the east bank levee and riverfront path", "height": 4.5,
         "pts": F.pts([(-91.1913, 30.4776), (-91.1904, 30.465), (-91.1898, 30.450), (-91.1918, 30.4363), (-91.1936, 30.4224)])},
        {"id": "west-bank-levee", "name": "the west bank levee at Port Allen", "height": 4.5,
         "pts": F.pts([(-91.2020, 30.4776), (-91.2029, 30.465), (-91.2034, 30.450), (-91.2043, 30.4363), (-91.2043, 30.4224)])},
    ]
    m["roads"] = [
        {"id": "interstate-ten", "name": "Interstate Ten and the river bridge", "kind": "bridge",
         "pts": F.pts([(-91.217, 30.4365), (-91.2027, 30.4375), (-91.190, 30.4375), (-91.180, 30.4365), (-91.177, 30.430), (-91.170, 30.4238), (-91.168, 30.4224)])},
        {"id": "interstate-one-ten", "name": "Interstate One-Ten", "kind": "interstate",
         "pts": F.pts([(-91.180, 30.4365), (-91.1805, 30.4555), (-91.178, 30.4585), (-91.1671, 30.4596), (-91.1663, 30.4706), (-91.1662, 30.4776)])},
        {"id": "river-road", "name": "River Road", "kind": "riverroad",
         "pts": F.pts([(-91.1900, 30.4776), (-91.1891, 30.465), (-91.1885, 30.450), (-91.1905, 30.4363), (-91.1923, 30.4224)])},
        {"id": "north-boulevard", "name": "North Boulevard", "kind": "avenue", "pts": F.pts([(-91.1875, 30.449), (-91.175, 30.449), (-91.153, 30.449)])},
        {"id": "florida-street", "name": "Florida Street", "kind": "avenue", "pts": F.pts([(-91.1875, 30.4525), (-91.170, 30.4525), (-91.153, 30.4525)])},
        {"id": "government-street", "name": "Government Street", "kind": "avenue", "pts": F.pts([(-91.1885, 30.4445), (-91.170, 30.4445), (-91.153, 30.4445)])},
        {"id": "third-street", "name": "Third Street", "kind": "street", "pts": F.pts([(-91.1865, 30.455), (-91.1865, 30.449), (-91.1865, 30.441)])},
        {"id": "nicholson-drive", "name": "Nicholson Drive", "kind": "avenue", "pts": F.pts([(-91.1865, 30.441), (-91.1875, 30.432), (-91.1885, 30.4224)])},
        {"id": "port-allen-highway", "name": "Highway One on the west bank", "kind": "avenue", "pts": F.pts([(-91.211, 30.4776), (-91.212, 30.450), (-91.213, 30.4224)])},
    ]
    m["districts"] = [
        {"id": "downtown-core", "name": "Downtown", "character": "downtown", "poly": F.pts([(-91.1885, 30.4535), (-91.179, 30.4535), (-91.179, 30.4445), (-91.1895, 30.4445)])},
        {"id": "capitol-grounds", "name": "the State Capitol grounds", "character": "park", "poly": F.pts([(-91.1880, 30.4610), (-91.1810, 30.4610), (-91.1810, 30.4540), (-91.1885, 30.4540)])},
        {"id": "spanish-town", "name": "Spanish Town", "character": "quarter", "poly": F.pts([(-91.1810, 30.4660), (-91.1740, 30.4660), (-91.1740, 30.4540), (-91.1810, 30.4540)])},
        {"id": "beauregard-town", "name": "Beauregard Town", "character": "quarter", "poly": F.pts([(-91.1895, 30.4440), (-91.1790, 30.4440), (-91.1790, 30.4390), (-91.1900, 30.4390)])},
        {"id": "riverfront", "name": "the riverfront", "character": "park", "poly": F.pts([(-91.1890, 30.4700), (-91.1880, 30.4700), (-91.1900, 30.4300), (-91.1910, 30.4300)])},
        {"id": "north-of-capitol", "name": "the neighbourhoods north of the Capitol", "character": "suburb", "poly": F.pts([(-91.1875, 30.4776), (-91.153, 30.4776), (-91.153, 30.4660), (-91.1880, 30.4660)])},
        {"id": "mid-city-edge", "name": "the Mid City edge", "character": "suburb", "poly": F.pts([(-91.174, 30.4660), (-91.153, 30.4660), (-91.153, 30.440), (-91.174, 30.440)])},
        {"id": "south-downtown", "name": "the Nicholson corridor south of downtown", "character": "garden", "poly": F.pts([(-91.1905, 30.4380), (-91.153, 30.4380), (-91.153, 30.4224), (-91.1915, 30.4224)])},
        {"id": "port-allen", "name": "Port Allen (west bank)", "character": "industrial", "poly": F.pts([(-91.217, 30.4776), (-91.2040, 30.4776), (-91.2070, 30.4224), (-91.217, 30.4224)])},
    ]
    P = F.xz
    m["sites"] = [
        site("brd-workforce-centre", "Downtown Workforce Centre", "union-hall", P(-91.1835, 30.4505), ["ibew", "carpenters", "liuna", "ironworkers"], ["builders-trades", "job-readiness-edition"], ["jobsite-orientation-and-osha-10", "apprenticeship-application-and-test", "union-hall-and-dispatch"], "A procedural workforce centre off North Boulevard where a new hand starts: site orientation, the apprenticeship application and the dispatch board. Trade reference only; no employer's programme is delivered here. " + ILLUSTRATIVE),
        site("brd-riverfront-crane-work", "Riverfront Crane Work", "construction", P(-91.1875, 30.4475), ["iuoe", "ironworkers"], ["rigging-lifting", "heavy-equipment-operators"], ["op-crawler-crane-assembly-and-load-chart", "steel-erector", "gg-fog-and-wind-work-stop"], "A crawler crane set up inside the levee line: the load chart read for the radius, the swing zone barricaded from the riverfront path and the lift stopped when the wind picks up."),
        site("brd-high-rise-steel", "High-Rise Steel Erection", "construction", P(-91.1840, 30.4480), ["ironworkers", "iuoe"], ["bridge-and-structural", "fall-protection"], ["steel-erector", "leading-edge-and-horizontal-lifeline", "bs-structural-bolting-and-torque"], "A procedural downtown tower going up in steel: connectors tied off at the leading edge, bolts torqued in sequence, nothing dropped over the street below."),
        site("brd-streetscape-crew", "Third Street Streetscape Crew", "construction", P(-91.1855, 30.4460), ["liuna", "opcmia"], ["builders-trades", "cement-masons-and-plasterers"], ["concrete-pour", "traffic-incident-management", "gk-hardscape-paver-base-and-compaction"], "New sidewalks and curbs on a downtown block: the work zone taped and signed, the pour placed and finished, pedestrians walked around it safely."),
        site("brd-water-main-replacement", "Water Main Replacement", "utility", P(-91.1810, 30.4430), ["liuna", "uwua", "iuoe"], ["water-and-gas-utility-crews", "heavy-equipment-operators"], ["ut-water-main-break-emergency-shutdown-and-excavation", "trench-box", "op-excavator-trench-and-utility-locate"], "An old main replaced under a downtown street: utilities located first, the trench boxed before anyone climbs in, the valves shut and tagged."),
        site("brd-capitol-grounds-crew", "Capitol Grounds Crew", "park", P(-91.1830, 30.4590), ["afscme", "liuna"], ["grounds-and-landscaping"], ["gk-ride-on-mower-pre-start-and-slope-work", "gk-tree-work-pole-saw-and-drop-zone", "gk-string-trimmer-and-blower-ppe-and-bystander-zone"], "The grounds crew on the Capitol lawns and gardens: mowers checked before the slope, a drop zone under the pole saw and visitors kept clear of the trimmer."),
        site("brd-levee-path-crew", "Levee Path Crew", "levee", P(-91.1890, 30.4600), ["liuna", "afscme"], ["bay-restoration-maritime-underwater", "heavy-equipment-operators"], ["br-levee-inspection-and-seepage", "op-compactor-lift-thickness-and-edge", "br-cold-water-immersion-and-mob-recovery"], "The crew on the east bank levee and riverfront path: seepage looked for on the land side, the compactor kept back from the crown's edge, a throw line near the water."),
        site("brd-bridge-painting", "River Bridge Painting Crew", "bridge", P(-91.1870, 30.4395), ["iupat", "ironworkers"], ["bridge-and-structural", "hazmat-environmental"], ["bridge-lead-containment", "bridge-cable-inspection", "leading-edge-and-horizontal-lifeline"], "The east approach of the interstate bridge: old coatings contained before they are blasted, lifelines rigged on the steel and the traffic below protected."),
        site("brd-parking-deck-concrete", "Parking Deck Concrete", "construction", P(-91.1800, 30.4510), ["opcmia", "carpenters", "liuna"], ["cement-masons-and-plasterers", "builders-trades"], ["formwork-shoring", "concrete-pour", "bt-rebar-tying-and-impalement-protection"], "A procedural parking deck: shoring checked before the pour, rebar capped against impalement, the pump truck's boom kept clear of the lines."),
        site("brd-hospital-mep-fitout", "Hospital MEP Fit-Out", "hospital", P(-91.1720, 30.4640), ["ibew", "ua", "smart"], ["plumbers-and-pipefitters", "electrical-first-period"], ["pl-medical-gas-brazing-and-purge", "pm-electrical-room", "ib-firestop-and-fire-wrap-installation"], "A procedural hospital wing being fitted out: medical gas brazed with a purge, the electrical room locked out and every penetration firestopped."),
        site("brd-substation", "Downtown Substation", "substation", P(-91.1760, 30.4470), ["ibew"], ["electrical-first-period", "energy-transition"], ["substation-switching", "arc-flash-label-study", "transformer-vault"], "A procedural substation feeding the downtown grid: switching orders read back, arc flash boundaries marked, vaults entered only with the air tested."),
        site("brd-storm-drain-crew", "Storm Drain Crew", "stormwater", P(-91.1795, 30.4400), ["liuna", "afscme"], ["water-and-gas-utility-crews", "confined-space"], ["manhole-entry-and-atmospheric-monitoring", "stormwater-outfall", "cs-permit-entry-and-attendant-duties"], "A crew clearing the drains in Beauregard Town: the manhole air tested, the permit signed and the attendant at the top."),
        site("brd-fire-station", "Downtown Fire Station", "fire-station", P(-91.1750, 30.4540), ["iaff"], ["first-responders"], ["structure-fire-sizeup", "aerial-ladder", "firefighter-rehab-sector"], "A procedural downtown engine house: the high-rise size-up, the aerial set on firm ground and the rehab sector after a long shift."),
        site("brd-transit-stop-build", "Transit Stop Build", "transit", P(-91.1690, 30.4520), ["atu", "liuna", "ibew"], ["transit-ramp", "builders-trades"], ["bus-yard-fuelling-and-brake-check", "tr-wheelchair-lift-and-securement-on-a-bus", "traffic-incident-management"], "A new shelter and boarding pad on Florida Street: the lane closed and signed while it is built, then the ramp and lift checks the drivers make every day."),
        site("brd-roofing-crew", "Spanish Town Roofing Crew", "construction", P(-91.1775, 30.4630), ["liuna", "carpenters"], ["roofers-and-waterproofers", "fall-protection"], ["rf-roof-tear-off-and-debris-chute", "rf-skylight-and-hatch-guarding", "rf-torch-applied-membrane-and-fire-watch"], "A roof replaced on an older building: the debris chute to a closed skip, skylights guarded and a fire watch after the torch."),
        site("brd-traffic-signal-crew", "Traffic Signal Crew", "utility", P(-91.1710, 30.4445), ["ibew", "afscme"], ["electrical-first-period"], ["signal-cabinet", "line-truck", "traffic-incident-management"], "A signal rebuilt at a Government Street crossing: the bucket truck set up inside the work zone, the cabinet locked out and the intersection flagged."),
        site("brd-port-allen-landing", "Port Allen Riverbank Landing", "landing", P(-91.2095, 30.4520), ["ibu", "iuoe"], ["port-operations", "ports-maritime-ecology"], ["mooring-line", "br-vhf-and-navigation-in-a-work-zone", "br-workboat-crane-lift-from-water"], "A procedural workboat landing on the west bank: mooring lines handled out of the snap-back zone, the radio checked and lifts from the water planned."),
        site("brd-school-campus", "Downtown School Renovation", "school", P(-91.1640, 30.4600), ["carpenters", "ibew", "afscme"], ["education-support-staff", "builders-trades"], ["ed-boiler-room-filter-change-lockout", "ed-playground-equipment-inspection", "ed-crossing-guard-intersection-control"], "A procedural school renovated over the summer: the boiler room locked out, the playground inspected and the crossing staffed when classes return."),
    ]
    m["landmarks"] = [
        {"id": "state-capitol", "name": "the Louisiana State Capitol", "position": P(-91.187, 30.457), "kind": "civic"},
        {"id": "old-state-capitol", "name": "the Old State Capitol", "position": P(-91.189, 30.4475), "kind": "civic"},
        {"id": "downtown-riverfront", "name": "the Mississippi riverfront at downtown", "position": P(-91.1895, 30.4520), "kind": "shore"},
        {"id": "interstate-bridge", "name": "the interstate bridge's east landing", "position": P(-91.1885, 30.4382), "kind": "bridge"},
        {"id": "spanish-town-place", "name": "Spanish Town", "position": P(-91.1780, 30.4600), "kind": "neighbourhood"},
        {"id": "beauregard-town-place", "name": "Beauregard Town", "position": P(-91.1840, 30.4415), "kind": "neighbourhood"},
        {"id": "port-allen-place", "name": "Port Allen", "position": P(-91.2130, 30.4450), "kind": "neighbourhood"},
        {"id": "illustrative-sign", "name": "a sign: the site layouts are illustrative; the river, streets and places are real", "position": P(-91.1830, 30.4520), "kind": "point"},
    ]
    m["connectors"] = [
        {"id": "cap-bd-interstate-one-ten-north", "kind": "road", "name": "Interstate One-Ten north to the river industry corridor", "from": {"parish": "br-downtown-riverfront", "position": P(-91.1662, 30.4770)}, "to": {"parish": "br-north-industrial", "position": NI_F.xz(-91.1662, 30.4784), "lonlat": [-91.1662, 30.4784]}, "lonlat": [-91.1662, 30.4777], "approximate": True},
        {"id": "cap-bd-river-road-north", "kind": "road", "name": "River Road north along the levee", "from": {"parish": "br-downtown-riverfront", "position": P(-91.1900, 30.4770)}, "to": {"parish": "br-north-industrial", "position": NI_F.xz(-91.1900, 30.4784), "lonlat": [-91.1900, 30.4784]}, "lonlat": [-91.1900, 30.4777], "approximate": True},
    ]
    header = [
        "Baton Rouge — Downtown & Riverfront (console CAPITAL, docs/consoles/CAPITAL.md, docs/parishes.md). A stylised 4096 m map",
        "at district scale (about 1.5 real metres per map metre), not a survey: every coordinate is approximate (three decimals,",
        "`approximate: true`). One north-up uniform scale, x east, +z south. The river, the levees, the named streets and the",
        "places are real as places; every site layout is the platform's illustration (procedural). No figure about any place is",
        "stated. Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).",
        "Written once by tools/gen_cap_capital.py; this module is the source afterwards. Pure data, no imports.",
    ]

    m["fieldLessons"] = [
        {"id": "cap-bd-fl-a-levee-holds-the-river", "title": "How a Levee Holds the River Back", "site": "brd-levee-path-crew", "landmark": "downtown-riverfront", "k12": "k12-by-how-a-levee-holds-water-back", "station": "br-levee-inspection-and-seepage", "trade": "Levee crews", "tradeLine": "A levee crew walks the land side of the levee looking for seepage, because water finds the weakest place first.", "minutes": 3, "steps": ["Stand on the riverfront path and look at the river on one side and the city on the other.", "The levee is a long, wide bank of packed earth that keeps high water in the river's channel.", "Crews walk it in high water and look for water seeping through on the dry side."], "check": {"q": "Why do crews look at the dry side of the levee in high water?", "options": ["Seepage on the dry side can warn that water is getting through", "To count the boats", "To find a place to swim"], "answer": 0, "why": "Water seeping out on the land side is an early warning a crew can report and fix."}},
        {"id": "cap-bd-fl-simple-machines-at-a-crane", "title": "Simple Machines at a Crane", "site": "brd-riverfront-crane-work", "k12": "k12-simple-machines-at-a-crane", "station": "op-crawler-crane-assembly-and-load-chart", "trade": "Crane operators", "tradeLine": "A crane operator reads the load chart before every lift, because the farther the load reaches out, the less the crane can safely hold.", "minutes": 3, "steps": ["Find the crane working inside the levee line.", "Its hook block uses pulleys, and its boom works like a long lever.", "The operator checks a chart: the farther out the load, the lighter it must be."], "check": {"q": "Why does a crane lift less when the load is far out on the boom?", "options": ["A longer lever arm makes the load pull harder on the crane", "The hook gets tired", "The load gets heavier in the air"], "answer": 0, "why": "Like a lever, a load farther from the pivot has more turning force, so the safe weight goes down."}},
        {"id": "cap-bd-fl-circuits-downtown", "title": "Circuits Under the City", "site": "brd-substation", "k12": "k12-circuits-at-the-electrical-bench", "station": "substation-switching", "trade": "Electricians", "tradeLine": "An electrician reads back every switching order before opening or closing a circuit that feeds the city.", "minutes": 3, "steps": ["Look through the fence at the substation.", "Power reaches downtown through circuits that must make a complete loop.", "Before switching, the crew reads the order back so nobody opens the wrong circuit."], "check": {"q": "Why does a crew read a switching order back before acting?", "options": ["So everyone is sure the right circuit is being switched", "To practise reading aloud", "Because the lights are off"], "answer": 0, "why": "Reading back catches mistakes before anyone opens or closes the wrong circuit."}},
    ]
    m["gated"] = [
        {"id": "cap-bd-gated-riverfront-lift", "kind": "side-quest", "title": "Plan the Riverfront Lift", "world": "parishes", "parish": "br-downtown-riverfront", "site": "brd-riverfront-crane-work", "siteName": "Riverfront Crane Work", "summary": "Plan a crane lift inside the levee line: the load chart, the swing zone and the wind stop.", "gate": {"stations": ["op-crawler-crane-assembly-and-load-chart", "gg-fog-and-wind-work-stop"], "note": "Finish the crawler crane load chart and wind work-stop stations first"}},
        {"id": "cap-bd-gated-high-rise-connector", "kind": "side-quest", "title": "Tie Off at the Leading Edge", "world": "parishes", "parish": "br-downtown-riverfront", "site": "brd-high-rise-steel", "siteName": "High-Rise Steel Erection", "summary": "Work as a connector on the downtown tower, tied off at every step.", "gate": {"stations": ["steel-erector", "leading-edge-and-horizontal-lifeline"], "note": "Finish the steel erector and leading edge stations first"}},
    ]
    write("np-data-br-downtown-riverfront.js", "NP_BR_DOWNTOWN_RIVERFRONT", header, m)


# ---------------------------------------------------------------- the river industry corridor north of downtown
def north():
    F = NI_F
    river = [(-91.207, 30.531), (-91.2005, 30.527), (-91.1965, 30.5225), (-91.1955, 30.515), (-91.1930, 30.505), (-91.1925, 30.490),
             (-91.1925, 30.4775), (-91.2008, 30.4775), (-91.2012, 30.490), (-91.2017, 30.505), (-91.2025, 30.515), (-91.207, 30.5185)]
    m = {
        "id": "br-north-industrial", "name": "Baton Rouge — North River Industry Corridor", "region": "louisiana-cities",
        "size": 4096, "scale": 1.5,
        "blurb": "The river industry corridor north of downtown Baton Rouge at street scale: the Mississippi and its east bank levee, River Road, Scenic Highway, Interstate One-Ten, a rail line and a procedural stretch of river terminals, fabrication shops and turnaround yards. No private plant is named or part of any lesson: the sites teach turnaround staging, pipe fabrication, scaffolding, insulation, rail and river work as trade references. " + ILLUSTRATIVE,
        "start": "brn-workforce-trailer",
    }
    m["anchors"] = [
        {"xz": F.xz(-91.199, 30.500), "lonlat": [-91.199, 30.500], "approximate": True, "name": "the Mississippi River north of downtown"},
        {"xz": F.xz(-91.190, 30.4800), "lonlat": [-91.190, 30.480], "approximate": True, "name": "River Road north of downtown"},
        {"xz": F.xz(-91.166, 30.4800), "lonlat": [-91.166, 30.480], "approximate": True, "name": "Interstate One-Ten north of downtown"},
        {"xz": F.xz(-91.152, 30.520), "lonlat": [-91.152, 30.520], "approximate": True, "name": "Interstate One-Ten to the north"},
        {"xz": F.xz(-91.177, 30.495), "lonlat": [-91.177, 30.495], "approximate": True, "name": "Scenic Highway"},
        {"xz": F.xz(-91.150, 30.500), "lonlat": [-91.150, 30.500], "approximate": True, "name": "the neighbourhoods east of the corridor"},
        {"xz": F.xz(-91.193, 30.508), "lonlat": [-91.193, 30.508], "approximate": True, "name": "the Huey P. Long Bridge's east landing"},
    ]
    m["water"] = [
        {"id": "mississippi-river", "name": "Mississippi River", "kind": "river", "poly": F.pts(river)},
        {"id": "corridor-drainage-canal", "name": "a drainage canal (procedural)", "kind": "canal", "width": 10, "poly": F.pts([(-91.143, 30.5000), (-91.1520, 30.5010), (-91.1600, 30.5030)])},
        {"id": "corridor-retention-pond", "name": "a stormwater pond (procedural)", "kind": "lake", "poly": F.pts([(-91.1560, 30.5240), (-91.1530, 30.5240), (-91.1530, 30.5220), (-91.1560, 30.5220)])},
    ]
    m["levees"] = [
        {"id": "east-bank-levee", "name": "the east bank levee", "height": 4.5,
         "pts": F.pts([(-91.207, 30.5325), (-91.1995, 30.5290), (-91.1953, 30.5235), (-91.1943, 30.515), (-91.1918, 30.505), (-91.1913, 30.490), (-91.1913, 30.4775)])},
        {"id": "west-bank-levee", "name": "the west bank levee", "height": 4.5,
         "pts": F.pts([(-91.2020, 30.4775), (-91.2025, 30.490), (-91.2030, 30.505), (-91.2037, 30.5150), (-91.207, 30.5172)])},
    ]
    m["roads"] = [
        {"id": "river-road", "name": "River Road", "kind": "riverroad", "pts": F.pts([(-91.1900, 30.4775), (-91.1900, 30.490), (-91.1905, 30.505), (-91.1930, 30.515), (-91.1940, 30.5225), (-91.1985, 30.5285), (-91.2050, 30.5325)])},
        {"id": "scenic-highway", "name": "Scenic Highway", "kind": "avenue", "pts": F.pts([(-91.1770, 30.4775), (-91.1770, 30.505), (-91.1770, 30.5325)])},
        {"id": "interstate-one-ten", "name": "Interstate One-Ten", "kind": "interstate", "pts": F.pts([(-91.1662, 30.4775), (-91.1647, 30.4913), (-91.1583, 30.5078), (-91.1520, 30.5200), (-91.1460, 30.5325)])},
        {"id": "highway-one-ninety-bridge", "name": "Highway One-Ninety and the Huey P. Long Bridge", "kind": "bridge", "pts": F.pts([(-91.207, 30.5075), (-91.1930, 30.5075), (-91.1770, 30.5070), (-91.1600, 30.5065), (-91.143, 30.5060)])},
        {"id": "corridor-rail-line", "name": "the corridor rail line (procedural)", "kind": "street", "pts": F.pts([(-91.1840, 30.4775), (-91.1850, 30.505), (-91.1860, 30.5325)])},
        {"id": "plank-road", "name": "Plank Road", "kind": "avenue", "pts": F.pts([(-91.1640, 30.4775), (-91.1560, 30.4950), (-91.1480, 30.5150), (-91.1430, 30.5260)])},
        {"id": "cross-street-south", "name": "a cross street to the river (procedural)", "kind": "street", "pts": F.pts([(-91.1885, 30.4925), (-91.1430, 30.4925)])},
        {"id": "cross-street-north", "name": "a second cross street to the river (procedural)", "kind": "street", "pts": F.pts([(-91.1905, 30.5150), (-91.1430, 30.5150)])},
    ]
    m["districts"] = [
        {"id": "river-terminals", "name": "the river terminals (procedural)", "character": "port", "poly": F.pts([(-91.1935, 30.5200), (-91.1890, 30.5200), (-91.1880, 30.4775), (-91.1895, 30.4775)])},
        {"id": "industry-corridor", "name": "the river industry corridor (procedural)", "character": "refinery", "poly": F.pts([(-91.1880, 30.5200), (-91.1775, 30.5200), (-91.1775, 30.4775), (-91.1880, 30.4775)])},
        {"id": "fab-and-yards", "name": "the fabrication shops and yards (procedural)", "character": "industrial", "poly": F.pts([(-91.1765, 30.5325), (-91.1650, 30.5325), (-91.1660, 30.4775), (-91.1765, 30.4775)])},
        {"id": "north-bend", "name": "the neighbourhoods at the river's bend", "character": "suburb", "poly": F.pts([(-91.1985, 30.5325), (-91.1775, 30.5325), (-91.1775, 30.5210), (-91.1945, 30.5210)])},
        {"id": "east-neighbourhoods", "name": "the neighbourhoods east of the corridor", "character": "suburb", "poly": F.pts([(-91.1640, 30.5325), (-91.143, 30.5325), (-91.143, 30.4775), (-91.1650, 30.4775)])},
    ]
    P = F.xz
    m["sites"] = [
        site("brn-workforce-trailer", "Corridor Workforce Trailer", "office", P(-91.1690, 30.4850), ["liuna", "ua", "iuoe"], ["job-readiness-edition", "builders-trades"], ["jobsite-orientation-and-osha-10", "apprenticeship-application-and-test", "union-hall-and-dispatch"], "A procedural trailer where crews for the corridor's shops and yards sign in: orientation, the day's job briefing and the dispatch board. Trade reference only. " + ILLUSTRATIVE),
        site("brn-turnaround-staging", "Turnaround Staging Yard", "staging", P(-91.1830, 30.5000), ["ua", "insulators", "ibb"], ["insulators-and-boilermakers", "plumbers-and-pipefitters"], ["ib-pressure-vessel-confined-entry-and-hot-work", "scaffold-erection", "hz-drum-staging-and-compatibility-segregation"], "A procedural staging yard for a planned shutdown: vessels opened only on a permit, scaffold tagged before use, drums segregated by what they hold. No private plant is part of this lesson."),
        site("brn-pipe-fab-shop", "Pipe Fabrication Shop", "workshop", P(-91.1770, 30.4960), ["ua", "iuoe"], ["plumbers-and-pipefitters", "rigging-lifting"], ["welding", "pl-natural-gas-pressure-test-and-leak-check", "forklift-dock"], "A procedural shop where spools are cut, fitted and welded: fume extraction on, the test done behind a barricade, forklifts kept out of the walkway."),
        site("brn-scaffold-yard", "Scaffold Yard", "yard", P(-91.1775, 30.5080), ["carpenters", "liuna"], ["fall-protection", "builders-trades"], ["scaffold-erection", "leading-edge-and-horizontal-lifeline", "tdl-trailer-loading-and-dock-plate"], "Scaffold stock sorted, inspected and loaded out: damaged tube tagged, loads strapped and the builder tied off on the rising deck."),
        site("brn-rail-yard", "Corridor Rail Yard", "rail", P(-91.1845, 30.5200), ["smart-td", "bmwed", "brs"], ["railroad-crafts"], ["ra-blue-flag-protection-in-the-yard", "ra-switch-inspection-and-lubrication", "ra-roadway-worker-protection-and-job-briefing"], "A procedural rail yard serving the corridor: blue flags before anyone goes between cars, switches inspected and a job briefing before the track."),
        site("brn-river-terminal", "River Terminal Dock", "port", P(-91.1895, 30.5120), ["ila", "ibu", "iuoe"], ["port-operations", "ports-maritime-ecology"], ["mooring-line", "dock-crane", "spill-boom-deploy"], "A procedural river terminal on the east bank: lines handled out of the snap-back zone, the dock crane's load kept over the deck and a spill boom ready."),
        site("brn-tank-farm-maintenance", "Tank Farm Maintenance Crew", "chemical", P(-91.1840, 30.4880), ["usw", "ua"], ["confined-space", "hazmat-environmental"], ["tank-lining", "cs-ventilation-and-air-monitoring-plan", "confined-rescue"], "A procedural tank out of service for its lining: ventilation running, the air tested and a rescue plan in place before entry."),
        site("brn-insulation-shop", "Insulation Shop", "workshop", P(-91.1735, 30.5180), ["insulators"], ["insulators-and-boilermakers"], ["ib-asbestos-glovebag-removal-on-a-pipe", "ib-firestop-and-fire-wrap-installation", "ib-refractory-and-castable-installation"], "Where insulators prepare jackets and fire wrap: old lagging treated as suspect until tested, and removed only in a glovebag."),
        site("brn-crane-yard", "Crane Yard", "yard", P(-91.1760, 30.5260), ["iuoe"], ["heavy-equipment-operators", "rigging-lifting"], ["op-crawler-crane-assembly-and-load-chart", "op-equipment-daily-walkaround-and-fluids", "gg-fog-and-wind-work-stop"], "A procedural crane yard: booms assembled on firm mats, the walkaround done every morning and the lift stopped when the wind rises."),
        site("brn-substation", "Corridor Substation", "substation", P(-91.1720, 30.4990), ["ibew"], ["electrical-first-period", "energy-transition"], ["substation-switching", "arc-flash-label-study", "motor-control-center"], "A procedural substation feeding the yards: switching orders read back and the motor control centre locked out before service."),
        site("brn-levee-patrol", "Levee Patrol Point", "levee", P(-91.1893, 30.4960), ["liuna", "afscme"], ["bay-restoration-maritime-underwater"], ["br-levee-inspection-and-seepage", "br-cold-water-immersion-and-mob-recovery", "tide-gate"], "The east bank levee walked in high water: seepage and sand boils looked for on the land side, a throw line kept near the river."),
        site("brn-truck-gate", "Truck Gate", "trucking", P(-91.1715, 30.5100), ["teamsters"], ["warehouse-and-logistics-automation"], ["tdl-pretrip-inspection", "po-yard-hostler-and-pedestrian-separation", "tdl-air-brake-test"], "A procedural truck gate: the pre-trip walkaround, the air brakes tested and pedestrians kept on their own marked path."),
        site("brn-hydrotest-crew", "Hydrotest Crew", "utility", P(-91.1810, 30.5140), ["ua", "iuoe"], ["plumbers-and-pipefitters"], ["pl-natural-gas-pressure-test-and-leak-check", "valve-vault", "hz-drum-staging-and-compatibility-segregation"], "A new line filled and pressure tested: the test area barricaded, the gauge read from outside the line of fire and the water disposed of as the permit says."),
        site("brn-welding-school", "Welding Training Bay", "workshop", P(-91.1640, 30.5000), ["ua", "ironworkers"], ["plumbers-and-pipefitters", "bridge-and-structural"], ["welding", "sm-tig-and-spot-welding", "shipyard-hotwork"], "A procedural training bay where new welders learn: screens up, fume extraction on, and a fire watch that stays after the arc goes out."),
        site("brn-fire-training-ground", "Fire Training Ground", "fire", P(-91.1600, 30.5230), ["iaff"], ["first-responders", "hazmat-environmental"], ["structure-fire-sizeup", "hazmat-container-inspection", "firefighter-rehab-sector"], "A procedural training ground for industrial fire and hazmat response: the size-up, reading a container's markings from upwind and rehab after the drill."),
        site("brn-storm-drain-crew", "Storm Drain Crew", "stormwater", P(-91.1560, 30.4880), ["liuna", "afscme"], ["water-and-gas-utility-crews", "confined-space"], ["manhole-entry-and-atmospheric-monitoring", "stormwater-outfall", "cs-non-entry-retrieval-and-tripod"], "Drains cleared in the neighbourhoods east of the corridor: air tested at the manhole and a tripod set before anyone goes down."),
    ]
    m["landmarks"] = [
        {"id": "river-north-of-downtown", "name": "the Mississippi north of downtown", "position": P(-91.1905, 30.5040), "kind": "shore"},
        {"id": "scenic-highway-place", "name": "Scenic Highway", "position": P(-91.1795, 30.4930), "kind": "neighbourhood"},
        {"id": "corridor-rail-place", "name": "the corridor rail line (procedural)", "position": P(-91.1852, 30.5100), "kind": "point"},
        {"id": "east-neighbourhoods-place", "name": "the neighbourhoods east of the corridor", "position": P(-91.1550, 30.5100), "kind": "neighbourhood"},
        {"id": "no-plant-named-sign", "name": "a sign: the site layouts are illustrative and no private plant is named; the river and roads are real", "position": P(-91.1700, 30.4800), "kind": "point"},
        {"id": "levee-crown", "name": "the east bank levee", "position": P(-91.1905, 30.5200), "kind": "levee"},
    ]
    m["connectors"] = [
        {"id": "cap-bn-interstate-one-ten-south", "kind": "road", "name": "Interstate One-Ten south to downtown", "from": {"parish": "br-north-industrial", "position": P(-91.1662, 30.4786)}, "to": {"parish": "br-downtown-riverfront", "position": DT_F.xz(-91.1662, 30.4770), "lonlat": [-91.1662, 30.4770]}, "lonlat": [-91.1662, 30.4777], "approximate": True},
        {"id": "cap-bn-river-road-south", "kind": "road", "name": "River Road south to the downtown riverfront", "from": {"parish": "br-north-industrial", "position": P(-91.1900, 30.4786)}, "to": {"parish": "br-downtown-riverfront", "position": DT_F.xz(-91.1900, 30.4770), "lonlat": [-91.1900, 30.4770]}, "lonlat": [-91.1900, 30.4777], "approximate": True},
    ]
    header = [
        "Baton Rouge — North River Industry Corridor (console CAPITAL, docs/consoles/CAPITAL.md, docs/parishes.md). A stylised",
        "4096 m map at district scale (about 1.5 real metres per map metre), north of and sharing an edge with",
        "br-downtown-riverfront. Only public roads, the river and the levee are named; the terminals, shops, yards and every",
        "site layout are procedural, and no private plant is named or part of any lesson. Every coordinate is approximate.",
        "Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).",
        "Written once by tools/gen_cap_capital.py; this module is the source afterwards. Pure data, no imports.",
    ]

    m["fieldLessons"] = [
        {"id": "cap-bn-fl-the-rivers-current", "title": "The River's Current and the Deck Crew", "site": "brn-river-terminal", "landmark": "river-north-of-downtown", "k12": "k12-by-the-rivers-current-and-a-pilots-job", "station": "mooring-line", "trade": "Deckhands", "tradeLine": "A deckhand handles mooring lines from outside the snap-back zone, because the river's current keeps a line under strain.", "minutes": 3, "steps": ["Look out at the river from the terminal.", "The current pushes every barge and boat downstream, so lines hold them against the dock.", "Deckhands stand clear of the snap-back zone in case a line parts."], "check": {"q": "Why do deckhands stand out of the snap-back zone?", "options": ["A line under strain can whip back if it breaks", "It is the warmest spot", "To see the fish"], "answer": 0, "why": "A parted line can snap back hard, so crews stand where it cannot reach."}},
        {"id": "cap-bn-fl-reading-the-labels", "title": "Reading the Labels on the Drums", "site": "brn-turnaround-staging", "k12": "k12-reading-instructions-and-safety-labels", "station": "hz-drum-staging-and-compatibility-segregation", "trade": "Pipefitters", "tradeLine": "A pipefitter reads a drum's label before moving it, and keeps drums that must not mix apart.", "minutes": 3, "steps": ["Find the rows of drums in the staging yard.", "Each label says what is inside and what it must be kept away from.", "Crews read the label first and store drums that must not mix in separate rows."], "check": {"q": "What should a worker do before moving a drum?", "options": ["Read its label", "Shake it", "Guess from its colour"], "answer": 0, "why": "The label says what is inside and how to handle and store it safely."}},
        {"id": "cap-bn-fl-who-does-this-work", "title": "Who Does This Work?", "site": "brn-welding-school", "k12": "k12-es-who-does-this-work", "station": "welding", "trade": "Welders", "tradeLine": "A welder joins steel with an arc behind a screen, with fresh air pulled past the helmet and a fire watch after the work.", "minutes": 3, "steps": ["Look into the training bay where new welders learn.", "Welders join metal pieces so pipes and frames hold together.", "They work behind screens, wear helmets and keep a fire watch after the arc goes out."], "check": {"q": "Why does a fire watch stay after the welding stops?", "options": ["Hot sparks can start a fire after the arc goes out", "To lock the door", "To count the welds"], "answer": 0, "why": "Sparks and hot metal can smoulder, so someone watches the area after the work."}},
    ]
    m["gated"] = [
        {"id": "cap-bn-gated-turnaround-permit", "kind": "side-quest", "title": "Open a Vessel on a Permit", "world": "parishes", "parish": "br-north-industrial", "site": "brn-turnaround-staging", "siteName": "Turnaround Staging Yard", "summary": "Stage a procedural vessel entry for a planned shutdown: the permit, the air test and the hot work watch.", "gate": {"stations": ["ib-pressure-vessel-confined-entry-and-hot-work", "cs-permit-entry-and-attendant-duties"], "note": "Finish the pressure vessel entry and permit entry stations first"}},
        {"id": "cap-bn-gated-blue-flag", "kind": "side-quest", "title": "Blue Flag the Yard Track", "world": "parishes", "parish": "br-north-industrial", "site": "brn-rail-yard", "siteName": "Corridor Rail Yard", "summary": "Protect a crew working between cars with blue flags and a job briefing.", "gate": {"stations": ["ra-blue-flag-protection-in-the-yard", "ra-roadway-worker-protection-and-job-briefing"], "note": "Finish the blue flag and roadway worker protection stations first"}},
    ]
    write("np-data-br-north-industrial.js", "NP_BR_NORTH_INDUSTRIAL", header, m)


# ---------------------------------------------------------------- RiverPlex MegaPark, Ascension Parish west bank
RP_F = Frame(-91.020, 30.1305, 3.5)


def px(x, y):
    """A pixel of the Sentinel-2 view of the RiverPlex box (800 px, lon -91.095 … -90.945, lat 30.195 … 30.066)."""
    return (round(-91.095 + x * 0.15 / 800, 3), round(30.195 - y * 0.129 / 800, 3))


def riverplex():
    F = RP_F
    P = F.xz
    Q = lambda x, y: F.xz(*px(x, y))
    outer = [(365, 0), (400, 100), (460, 200), (470, 280), (420, 340), (340, 400), (312, 450), (330, 495), (400, 522), (500, 542), (600, 552), (700, 562), (800, 578)]
    inner = [(800, 370), (772, 420), (748, 490), (700, 505), (600, 492), (500, 478), (420, 468), (372, 452), (392, 418), (462, 368), (512, 318), (532, 250), (522, 170), (472, 80), (432, 0)]
    m = {
        "id": "br-riverplex-ascension", "name": "RiverPlex MegaPark — Ascension Parish West Bank", "region": "louisiana-sites",
        "size": 4096, "scale": 3.5,
        "blurb": "The RiverPlex MegaPark site on the Mississippi's west bank in Ascension Parish, in the Baton Rouge metro: a site of about 17,000 acres with 10 miles of river frontage (businessreport.com; ascensionedc.com). The project layout is illustrative; the parish, waterways and towns are real. Walk the river bend, the west bank levee and River Road, cane fields, Donaldsonville and Bayou Lafourche, and the site-readiness work a megasite needs: clearing, a rail spur, a river dock, access roads, utilities and drainage.",
        "start": "brr-workforce-trailer",
    }
    m["anchors"] = [
        {"xz": Q(430, 250), "lonlat": list(px(430, 250)), "approximate": True, "name": "the RiverPlex site area on the west bank (illustrative)"},
        {"xz": Q(500, 150), "lonlat": list(px(500, 150)), "approximate": True, "name": "the Mississippi River above the bend"},
        {"xz": Q(550, 520), "lonlat": list(px(550, 520)), "approximate": True, "name": "the Mississippi River at Donaldsonville"},
        {"xz": Q(500, 590), "lonlat": list(px(500, 590)), "approximate": True, "name": "Donaldsonville"},
        {"xz": Q(362, 700), "lonlat": list(px(362, 700)), "approximate": True, "name": "Bayou Lafourche"},
        {"xz": Q(150, 400), "lonlat": list(px(150, 400)), "approximate": True, "name": "Highway One towards Donaldsonville"},
        {"xz": Q(650, 300), "lonlat": list(px(650, 300)), "approximate": True, "name": "the east bank inside the bend"},
        {"xz": Q(150, 100), "lonlat": list(px(150, 100)), "approximate": True, "name": "the cane fields north-west of the site"},
    ]
    m["water"] = [
        {"id": "mississippi-river", "name": "Mississippi River", "kind": "river", "poly": [Q(*p) for p in outer + inner]},
        {"id": "bayou-lafourche", "name": "Bayou Lafourche", "kind": "bayou", "width": 14, "poly": [Q(372, 575), Q(362, 640), Q(350, 720), Q(368, 800)]},
        {"id": "site-drainage-canal", "name": "a site drainage canal (procedural)", "kind": "canal", "width": 10, "poly": [Q(40, 180), Q(160, 230), Q(280, 300), Q(318, 380)]},
        {"id": "field-drainage-canal", "name": "a field drainage canal (procedural)", "kind": "canal", "width": 8, "poly": [Q(120, 560), Q(230, 600), Q(330, 640)]},
    ]
    m["levees"] = [
        {"id": "west-bank-levee", "name": "the west bank levee", "height": 4.5, "pts": [Q(348, 0), Q(384, 100), Q(442, 200), Q(452, 276), Q(406, 328), Q(326, 390), Q(296, 450), Q(318, 510), Q(396, 538), Q(500, 558), Q(600, 568), Q(700, 578), Q(800, 594)]},
        {"id": "east-bank-levee", "name": "the east bank levee", "height": 4.5, "pts": [Q(450, 0), Q(490, 80), Q(542, 170), Q(550, 250), Q(530, 322), Q(480, 372), Q(420, 440), Q(500, 462), Q(600, 476), Q(700, 490), Q(735, 478), Q(760, 412), Q(790, 360)]},
    ]
    m["roads"] = [
        {"id": "west-bank-river-road", "name": "River Road on the west bank", "kind": "riverroad", "pts": [Q(330, 0), Q(368, 100), Q(425, 200), Q(435, 272), Q(392, 318), Q(312, 380), Q(280, 450), Q(305, 525), Q(395, 552), Q(500, 572), Q(600, 582), Q(700, 592), Q(800, 608)]},
        {"id": "highway-one", "name": "Highway One", "kind": "avenue", "pts": [Q(0, 320), Q(150, 400), Q(300, 490), Q(420, 590), Q(520, 640), Q(620, 700), Q(760, 800)]},
        {"id": "highway-seventy", "name": "Highway Seventy towards the Sunshine Bridge", "kind": "avenue", "pts": [Q(520, 640), Q(650, 620), Q(800, 640)]},
        {"id": "east-bank-river-road", "name": "River Road on the east bank", "kind": "riverroad", "pts": [Q(468, 0), Q(508, 80), Q(560, 170), Q(568, 250), Q(548, 330), Q(500, 380), Q(450, 430)]},
        {"id": "site-access-road", "name": "the site access road (illustrative)", "kind": "street", "pts": [Q(150, 400), Q(220, 300), Q(300, 200), Q(360, 120)]},
        {"id": "rail-spur", "name": "the rail spur (illustrative)", "kind": "street", "pts": [Q(60, 360), Q(180, 270), Q(290, 170), Q(370, 60)]},
        {"id": "donaldsonville-street", "name": "Railroad Avenue, Donaldsonville", "kind": "street", "pts": [Q(420, 590), Q(480, 575), Q(560, 580), Q(620, 600)]},
    ]
    m["districts"] = [
        {"id": "riverplex-site", "name": "the RiverPlex site area (layout illustrative)", "character": "industrial", "poly": [Q(200, 0), Q(360, 0), Q(420, 190), Q(420, 280), Q(300, 380), Q(200, 330)]},
        {"id": "west-cane-fields", "name": "the cane fields west of the site", "character": "park", "poly": [Q(0, 0), Q(200, 0), Q(200, 330), Q(0, 310)]},
        {"id": "south-cane-fields", "name": "the cane fields towards Donaldsonville", "character": "park", "poly": [Q(0, 310), Q(290, 420), Q(300, 560), Q(0, 560)]},
        {"id": "donaldsonville", "name": "Donaldsonville", "character": "quarter", "poly": [Q(400, 560), Q(640, 580), Q(640, 650), Q(400, 650)]},
        {"id": "bayou-lafourche-fields", "name": "the fields along Bayou Lafourche", "character": "suburb", "poly": [Q(0, 560), Q(400, 560), Q(420, 800), Q(0, 800)]},
        {"id": "south-east-fields", "name": "the fields south-east of town", "character": "park", "poly": [Q(420, 650), Q(800, 650), Q(800, 800), Q(420, 800)]},
        {"id": "east-bank-inside-the-bend", "name": "the east bank inside the bend", "character": "wetland", "poly": [Q(560, 120), Q(800, 120), Q(800, 360), Q(740, 470), Q(460, 450), Q(560, 300)]},
        {"id": "east-bank-industry", "name": "river industry on the east bank (procedural)", "character": "refinery", "poly": [Q(480, 0), Q(800, 0), Q(800, 120), Q(560, 120)]},
    ]
    T = "The project layout is illustrative; the parish, waterways and towns are real."
    m["sites"] = [
        site("brr-workforce-trailer", "RiverPlex Workforce Trailer", "office", Q(170, 380), ["iuoe", "liuna", "teamsters"], ["heavy-equipment-operators", "job-readiness-edition"], ["jobsite-orientation-and-osha-10", "apprenticeship-application-and-test", "union-hall-and-dispatch"], "The trailer where site crews sign in: orientation, the day's job briefing and the dispatch board. RiverPlex MegaPark is a large river-frontage site in Ascension Parish; this is a trade reference, no employer's programme. " + T),
        site("brr-site-clearing", "Site Clearing Crew", "excavation", Q(290, 150), ["iuoe", "liuna"], ["heavy-equipment-operators", "grounds-and-landscaping"], ["op-dozer-slope-work-and-rollover-protection", "gk-chainsaw-start-and-limbing-on-the-ground", "op-equipment-daily-walkaround-and-fluids"], "Clearing a field edge for site readiness: the dozer's rollover protection and seat belt, a drop zone for every felled tree and the walkaround before start-up."),
        site("brr-rail-spur", "Rail Spur Build", "rail", Q(230, 225), ["bmwed", "iuoe", "liuna"], ["railroad-crafts"], ["ra-tie-and-rail-replacement-with-track-machines", "ra-roadway-worker-protection-and-job-briefing", "track-access"], "An illustrative spur laid towards the river: track machines worked with a job briefing, roadway worker protection and nobody on the track without it."),
        site("brr-river-dock", "River Dock Build", "port", Q(360, 140), ["ila", "iuoe", "carpenters"], ["port-operations", "rigging-lifting"], ["cd-pier-piling-inspection-and-wrap-repair", "mooring-line", "br-workboat-crane-lift-from-water"], "An illustrative dock at the river's edge, reached across the levee: piling inspected, mooring lines handled out of the snap-back zone and crane lifts from the water planned."),
        site("brr-site-access-road", "Site Access Road Crew", "construction", Q(250, 330), ["iuoe", "liuna", "teamsters"], ["heavy-equipment-operators"], ["op-compactor-lift-thickness-and-edge", "op-loader-truck-loading-and-blind-spots", "traffic-incident-management"], "Building the access road from Highway One: lifts compacted to thickness, the loader's blind spots kept clear and the highway entrance flagged."),
        site("brr-levee-crossing", "Levee Crossing Crew", "levee", Q(395, 245), ["iuoe", "liuna"], ["heavy-equipment-operators", "bay-restoration-maritime-underwater"], ["br-levee-inspection-and-seepage", "op-excavator-trench-and-utility-locate", "op-compactor-lift-thickness-and-edge"], "Where a road or pipe must cross the levee: seepage looked for, utilities located and every lift compacted so the levee stays whole."),
        site("brr-utility-corridor", "Utility Corridor Crew", "utility", Q(130, 250), ["ibew", "liuna", "ua"], ["water-and-gas-utility-crews", "electrical-first-period"], ["ut-service-line-locate-and-hand-dig-near-gas-main", "trench-box", "valve-vault"], "Utilities brought into the site: lines located and hand-dug near existing pipe, the trench boxed and vaults entered with the air tested."),
        site("brr-substation-build", "Substation Build", "substation", Q(90, 140), ["ibew"], ["electrical-first-period", "energy-transition"], ["substation-switching", "arc-flash-label-study", "temporary-site-power"], "An illustrative substation for the site: temporary power first, arc flash boundaries marked and switching orders read back."),
        site("brr-laydown-yard", "Laydown Yard", "staging", Q(160, 60), ["teamsters", "iuoe"], ["warehouse-and-logistics-automation", "rigging-lifting"], ["forklift-dock", "tdl-trailer-loading-and-dock-plate", "tdl-pretrip-inspection"], "Where materials arrive and are sorted: forklifts kept apart from people on foot, loads strapped and trucks walked around before they leave."),
        site("brr-drainage-canal", "Drainage Canal Crew", "stormwater", Q(215, 290), ["liuna", "iuoe"], ["heavy-equipment-operators", "water-and-gas-utility-crews"], ["op-excavator-trench-and-utility-locate", "br-culvert-retrofit-for-fish-passage", "stormwater-outfall"], "Cleaning and reshaping a drainage canal across the site: the excavator kept back from the soft edge, culverts set and the outfall kept clear."),
        site("brr-environmental-survey", "Environmental Survey Crew", "survey", Q(60, 40), ["liuna", "ifpte"], ["marine-ecology-and-restoration", "hazmat-environmental"], ["marsh-transect-survey", "br-bird-nesting-buffer-and-work-window", "sampling-well"], "Surveying the site before work begins: transects walked, nesting buffers respected and groundwater sampled by the book."),
        site("brr-crane-pad", "Crane Pad", "construction", Q(340, 60), ["iuoe", "ironworkers"], ["rigging-lifting", "heavy-equipment-operators"], ["op-crawler-crane-assembly-and-load-chart", "gg-fog-and-wind-work-stop", "steel-erector"], "A crane pad built on firm, level ground: the crane assembled on mats, the load chart read and lifts stopped when the wind rises."),
        site("brr-water-intake", "River Water Intake Crew", "pump", Q(395, 270), ["ua", "iuoe"], ["plumbers-and-pipefitters", "stationary-engineer"], ["fire-pump", "lift-station", "br-cold-water-immersion-and-mob-recovery"], "An illustrative intake by the river: pumps locked out before service, and float coats and a throw line whenever anyone works over the water."),
        site("brr-geotech-drilling", "Geotechnical Drilling Crew", "assessment", Q(110, 320), ["iuoe", "liuna"], ["heavy-equipment-operators"], ["op-equipment-daily-walkaround-and-fluids", "ut-service-line-locate-and-hand-dig-near-gas-main", "sampling-well"], "A drill rig testing the ground: utilities located before the auger turns, the rig walked around each morning and the cores logged."),
        site("brr-fire-water-station", "Fire Water Station", "fire", Q(30, 250), ["iaff", "ua"], ["first-responders", "plumbers-and-pipefitters"], ["fire-pump", "structure-fire-sizeup", "ut-hydrant-flow-test-and-flushing-with-traffic-control"], "An illustrative fire water station for the site: the fire pump tested, hydrants flowed and a size-up drill for the crews who respond."),
        site("brr-donaldsonville-main-street", "Donaldsonville Main Street Crew", "construction", Q(520, 610), ["liuna", "opcmia", "carpenters"], ["builders-trades", "cement-masons-and-plasterers"], ["concrete-pour", "traffic-incident-management", "gk-hardscape-paver-base-and-compaction"], "A procedural streetscape job in Donaldsonville's downtown: the work zone signed, the pour placed and finished and pedestrians guided round it."),
    ]
    m["landmarks"] = [
        {"id": "river-bend", "name": "the Mississippi's bend at the site", "position": Q(430, 330), "kind": "shore"},
        {"id": "donaldsonville-place", "name": "Donaldsonville", "position": Q(480, 610), "kind": "neighbourhood"},
        {"id": "bayou-lafourche-head", "name": "the head of Bayou Lafourche", "position": Q(385, 585), "kind": "canal"},
        {"id": "west-bank-levee-crown", "name": "the west bank levee", "position": Q(452, 215), "kind": "levee"},
        {"id": "cane-fields-place", "name": "the cane fields", "position": Q(80, 200), "kind": "point"},
        {"id": "illustrative-sign", "name": "a sign: the project layout is illustrative; the parish, waterways and towns are real", "position": Q(190, 360), "kind": "point"},
    ]
    m["connectors"] = [
        {"id": "cap-br-highway-one-north-west", "kind": "road", "name": "Highway One north-west towards Plaquemine", "from": {"parish": "br-riverplex-ascension", "position": Q(8, 325)}, "to": {"parish": "iberville-west-bank", "position": None, "lonlat": list(px(0, 320))}, "lonlat": list(px(0, 320)), "approximate": True},
        {"id": "cap-br-highway-seventy-east", "kind": "road", "name": "Highway Seventy east towards the Sunshine Bridge", "from": {"parish": "br-riverplex-ascension", "position": Q(792, 639)}, "to": {"parish": "ascension-east-bank", "position": None, "lonlat": list(px(800, 640))}, "lonlat": list(px(800, 640)), "approximate": True},
    ]
    m["fieldLessons"] = [
        {"id": "cap-br-fl-how-a-levee-holds", "title": "Crossing a Levee Safely", "site": "brr-levee-crossing", "landmark": "west-bank-levee-crown", "k12": "k12-by-how-a-levee-holds-water-back", "station": "br-levee-inspection-and-seepage", "trade": "Equipment operators", "tradeLine": "An operator building a crossing compacts every lift so the levee stays strong against the river.", "minutes": 3, "steps": ["Stand at the foot of the west bank levee.", "The levee keeps high water in the river and away from the fields and the town.", "Anything that crosses it must be built so the packed earth stays whole."], "check": {"q": "Why must a levee crossing be built so carefully?", "options": ["A weak spot could let high water through", "So trucks can go faster", "To make the levee taller for the view"], "answer": 0, "why": "A levee protects the land behind it only if every part of it is strong."}},
        {"id": "cap-br-fl-reading-the-map", "title": "Reading a Site Map", "site": "brr-workforce-trailer", "k12": "k12-map-literacy-across-eras", "station": "jobsite-orientation-and-osha-10", "trade": "Site crews", "tradeLine": "Every new crew member finds the muster point, the first aid station and the exits on the site map at orientation.", "minutes": 3, "steps": ["Find the site map on the trailer wall.", "It shows the river, the levee, the roads and where each crew works.", "At orientation every worker finds the muster point and the first aid station."], "check": {"q": "What should a new worker find first on a site map?", "options": ["The muster point and first aid station", "The lunch menu", "The fastest road home"], "answer": 0, "why": "Knowing where to gather and where help is keeps everyone safe in an emergency."}},
        {"id": "cap-br-fl-simple-machines", "title": "Levers and Pulleys at the Crane Pad", "site": "brr-crane-pad", "k12": "k12-simple-machines-at-a-crane", "station": "op-crawler-crane-assembly-and-load-chart", "trade": "Crane operators", "tradeLine": "A crane operator reads the load chart for every lift and sets the crane on firm, level ground.", "minutes": 3, "steps": ["Look at the crane standing on its pad.", "Its boom works like a lever and its hook uses pulleys.", "The pad must be firm and level or the crane could tip."], "check": {"q": "Why is a crane set up on a firm, level pad?", "options": ["Soft or sloping ground could let it tip", "So it looks tidy", "Because cranes are heavy to paint"], "answer": 0, "why": "A crane's stability depends on solid, level ground under it."}},
    ]
    m["gated"] = [
        {"id": "cap-br-gated-clear-the-site", "kind": "side-quest", "title": "Clear the Field Edge", "world": "parishes", "parish": "br-riverplex-ascension", "site": "brr-site-clearing", "siteName": "Site Clearing Crew", "summary": "Run a clearing crew safely: the dozer check, the drop zone and the walkaround.", "gate": {"stations": ["op-dozer-slope-work-and-rollover-protection", "op-equipment-daily-walkaround-and-fluids"], "note": "Finish the dozer slope work and daily walkaround stations first"}},
        {"id": "cap-br-gated-lay-the-spur", "kind": "side-quest", "title": "Lay the Rail Spur", "world": "parishes", "parish": "br-riverplex-ascension", "site": "brr-rail-spur", "siteName": "Rail Spur Build", "summary": "Lay an illustrative spur with track machines under roadway worker protection.", "gate": {"stations": ["ra-tie-and-rail-replacement-with-track-machines", "ra-roadway-worker-protection-and-job-briefing"], "note": "Finish the track machine and roadway worker protection stations first"}},
    ]
    header = [
        "RiverPlex MegaPark — Ascension Parish West Bank (console CAPITAL, docs/consoles/CAPITAL.md, docs/parishes.md). A",
        "stylised 4096 m map (about 3.5 real metres per map metre), not a survey: every coordinate is approximate (three",
        "decimals for anchors, `approximate: true`). The facts are only the facts file's: a ~17,000-acre site with 10 miles of river frontage",
        "on the Mississippi's west bank in Ascension Parish (businessreport.com; ascensionedc.com). The project layout is",
        "illustrative; the parish, waterways and towns are real. No investor, plant or employer is part of any lesson.",
        "Water and road layout checked against Copernicus Sentinel-2 imagery (Contains modified Copernicus Sentinel data 2026).",
        "Written once by tools/gen_cap_capital.py; this module is the source afterwards. Pure data, no imports.",
    ]
    write("np-data-br-riverplex-ascension.js", "NP_BR_RIVERPLEX_ASCENSION", header, m)


# ---------------------------------------------------------------- Hammond, Tangipahoa Parish
HA_F = Frame(-90.455, 30.500, 2.0)


def hammond():
    F = HA_F
    P = F.xz
    m = {
        "id": "hammond-downtown", "name": "Hammond — Downtown & the Interstates", "region": "louisiana-cities",
        "size": 4096, "scale": 2.0,
        "blurb": "Hammond in Tangipahoa Parish at street scale: where Interstate Fifty-Five and Interstate Twelve cross, the downtown along the rail line, the university district to the north and the regional airport to the east. Trades sites for interchange work, rail crossings, downtown restoration, the airport apron and hangar, utilities and public buildings. Hammond is named as a place only. " + ILLUSTRATIVE,
        "start": "ham-workforce-centre",
    }
    m["anchors"] = [
        {"xz": P(-90.462, 30.505), "lonlat": [-90.462, 30.505], "approximate": True, "name": "downtown Hammond"},
        {"xz": P(-90.479, 30.478), "lonlat": [-90.479, 30.478], "approximate": True, "name": "the Interstate Fifty-Five and Twelve interchange"},
        {"xz": P(-90.419, 30.521), "lonlat": [-90.419, 30.521], "approximate": True, "name": "Hammond Northshore Regional Airport"},
        {"xz": P(-90.467, 30.516), "lonlat": [-90.467, 30.516], "approximate": True, "name": "the university district"},
        {"xz": P(-90.479, 30.525), "lonlat": [-90.479, 30.525], "approximate": True, "name": "Interstate Fifty-Five north"},
        {"xz": P(-90.430, 30.478), "lonlat": [-90.430, 30.478], "approximate": True, "name": "Interstate Twelve east"},
        {"xz": P(-90.462, 30.470), "lonlat": [-90.462, 30.470], "approximate": True, "name": "the rail line south of town"},
    ]
    m["water"] = [
        {"id": "west-creek", "name": "a creek west of town (procedural)", "kind": "canal", "width": 12, "poly": [P(-90.4960, 30.5360), P(-90.4920, 30.5100), P(-90.4900, 30.4850), P(-90.4930, 30.4640)]},
        {"id": "east-drainage-canal", "name": "a drainage canal east of town (procedural)", "kind": "canal", "width": 10, "poly": [P(-90.4400, 30.5360), P(-90.4420, 30.5100), P(-90.4450, 30.4900), P(-90.4430, 30.4640)]},
        {"id": "stormwater-pond", "name": "a stormwater pond (procedural)", "kind": "lake", "poly": [P(-90.4380, 30.4760), P(-90.4340, 30.4760), P(-90.4340, 30.4730), P(-90.4380, 30.4730)]},
    ]
    m["levees"] = [
        {"id": "west-creek-bank", "name": "the creek's raised bank (procedural)", "height": 3.2, "pts": [P(-90.4940, 30.5360), P(-90.4900, 30.5100), P(-90.4880, 30.4850), P(-90.4910, 30.4640)]},
        {"id": "east-canal-bank", "name": "the canal's raised bank (procedural)", "height": 3.2, "pts": [P(-90.4380, 30.5360), P(-90.4400, 30.5100), P(-90.4430, 30.4900), P(-90.4410, 30.4640)]},
    ]
    m["roads"] = [
        {"id": "interstate-fifty-five", "name": "Interstate Fifty-Five", "kind": "interstate", "pts": [P(-90.4790, 30.4632), P(-90.4790, 30.4780), P(-90.4795, 30.5000), P(-90.4800, 30.5368)]},
        {"id": "interstate-twelve", "name": "Interstate Twelve", "kind": "interstate", "pts": [P(-90.4977, 30.4790), P(-90.4790, 30.4780), P(-90.4500, 30.4775), P(-90.4123, 30.4770)]},
        {"id": "us-fifty-one", "name": "Highway Fifty-One (Morrison Boulevard)", "kind": "avenue", "pts": [P(-90.4690, 30.4632), P(-90.4680, 30.4850), P(-90.4665, 30.5100), P(-90.4660, 30.5368)]},
        {"id": "thomas-street", "name": "Thomas Street (Highway One-Ninety)", "kind": "avenue", "pts": [P(-90.4977, 30.5050), P(-90.4800, 30.5050), P(-90.4620, 30.5045), P(-90.4400, 30.5040), P(-90.4123, 30.5035)]},
        {"id": "rail-line", "name": "the rail line through downtown", "kind": "street", "pts": [P(-90.4620, 30.4632), P(-90.4620, 30.5000), P(-90.4620, 30.5368)]},
        {"id": "railroad-avenue", "name": "Railroad Avenue", "kind": "street", "pts": [P(-90.4605, 30.4960), P(-90.4605, 30.5100)]},
        {"id": "airport-road", "name": "the airport road", "kind": "street", "pts": [P(-90.4400, 30.5040), P(-90.4300, 30.5120), P(-90.4230, 30.5180)]},
        {"id": "university-avenue", "name": "University Avenue", "kind": "street", "pts": [P(-90.4800, 30.5150), P(-90.4665, 30.5150), P(-90.4500, 30.5150)]},
    ]
    m["districts"] = [
        {"id": "downtown-hammond", "name": "Downtown Hammond", "character": "downtown", "poly": [P(-90.4660, 30.5100), P(-90.4570, 30.5100), P(-90.4570, 30.4980), P(-90.4660, 30.4980)]},
        {"id": "historic-blocks", "name": "the historic blocks by the rail line", "character": "quarter", "poly": [P(-90.4570, 30.5100), P(-90.4500, 30.5100), P(-90.4500, 30.4980), P(-90.4570, 30.4980)]},
        {"id": "university-district", "name": "the university district", "character": "campus", "poly": [P(-90.4760, 30.5250), P(-90.4600, 30.5250), P(-90.4600, 30.5110), P(-90.4760, 30.5110)]},
        {"id": "airport-district", "name": "the airport", "character": "industrial", "poly": [P(-90.4300, 30.5300), P(-90.4123, 30.5300), P(-90.4123, 30.5120), P(-90.4300, 30.5120)]},
        {"id": "interchange-commerce", "name": "the interchange's commercial strip", "character": "industrial", "poly": [P(-90.4960, 30.4900), P(-90.4700, 30.4900), P(-90.4700, 30.4700), P(-90.4960, 30.4700)]},
        {"id": "north-neighbourhoods", "name": "the neighbourhoods north of downtown", "character": "suburb", "poly": [P(-90.4600, 30.5368), P(-90.4310, 30.5368), P(-90.4310, 30.5100), P(-90.4600, 30.5100)]},
        {"id": "south-neighbourhoods", "name": "the neighbourhoods south of downtown", "character": "garden", "poly": [P(-90.4690, 30.4980), P(-90.4400, 30.4980), P(-90.4400, 30.4800), P(-90.4690, 30.4800)]},
        {"id": "west-neighbourhoods", "name": "the neighbourhoods west of the interstate", "character": "suburb", "poly": [P(-90.4977, 30.5368), P(-90.4810, 30.5368), P(-90.4810, 30.4920), P(-90.4977, 30.4920)]},
        {"id": "south-woods", "name": "the pine woods south of the interstate", "character": "park", "poly": [P(-90.4977, 30.4690), P(-90.4123, 30.4690), P(-90.4123, 30.4632), P(-90.4977, 30.4632)]},
    ]
    m["sites"] = [
        site("ham-workforce-centre", "Hammond Workforce Centre", "union-hall", P(-90.4590, 30.5065), ["ibew", "carpenters", "liuna", "ua"], ["builders-trades", "job-readiness-edition"], ["jobsite-orientation-and-osha-10", "apprenticeship-application-and-test", "union-hall-and-dispatch"], "A procedural workforce centre downtown where a new hand starts: orientation, the apprenticeship application and the dispatch board. Trade reference only; Hammond is named as a place, with no figures about it. " + ILLUSTRATIVE),
        site("ham-interchange-work", "Interchange Work Zone", "bridge", P(-90.4750, 30.4745), ["iuoe", "liuna", "ironworkers"], ["heavy-equipment-operators", "bridge-and-structural"], ["traffic-incident-management", "deck-joint-replacement", "op-compactor-lift-thickness-and-edge"], "A procedural ramp rebuild by the interstate interchange: the work zone set up behind a buffer, deck joints replaced and the fill compacted in lifts."),
        site("ham-rail-crossing", "Rail Crossing Crew", "rail", P(-90.4635, 30.4880), ["bmwed", "brs"], ["railroad-crafts"], ["ra-crossing-signal-maintenance-and-flagging", "ra-roadway-worker-protection-and-job-briefing", "track-access"], "A grade crossing rebuilt on the rail line: the signal maintained, the road flagged and nobody on the track without protection."),
        site("ham-downtown-facade", "Downtown Facade Restoration", "construction", P(-90.4540, 30.5030), ["bac", "carpenters", "iupat"], ["builders-trades", "fall-protection"], ["scaffold-erection", "leading-edge-and-horizontal-lifeline", "gl-swing-stage-glazing-and-sealant"], "An older storefront restored: scaffold tagged before use, lifelines on the upper floors and the sidewalk protected below."),
        site("ham-airport-apron", "Airport Apron Work", "airport", P(-90.4200, 30.5160), ["iuoe", "liuna", "iam"], ["aviation-maintenance-and-ground", "heavy-equipment-operators"], ["av-marshalling-and-wingwalker-signals", "op-equipment-daily-walkaround-and-fluids", "traffic-incident-management"], "Apron paving beside the ramp: marshalling signals for every aircraft move, the work zone kept outside the taxi lines and equipment checked each morning."),
        site("ham-hangar-build", "Hangar Build", "construction", P(-90.4250, 30.5250), ["ironworkers", "iuoe", "ibew"], ["bridge-and-structural", "rigging-lifting"], ["steel-erector", "op-crawler-crane-assembly-and-load-chart", "temporary-site-power"], "A procedural hangar going up in steel: connectors tied off, the crane's load chart read and temporary power set up safely."),
        site("ham-water-tower", "Water Tower Repaint", "utility", P(-90.4520, 30.5200), ["iupat", "uwua"], ["water-and-gas-utility-crews", "fall-protection"], ["leading-edge-and-horizontal-lifeline", "bridge-lead-containment", "cs-permit-entry-and-attendant-duties"], "A water tower repainted: climbers tied off all the way, old coatings contained and the tank entered only on a permit."),
        site("ham-university-mep-fitout", "University MEP Fit-Out", "campus", P(-90.4700, 30.5190), ["ibew", "ua", "smart"], ["electrical-first-period", "plumbers-and-pipefitters"], ["pm-electrical-room", "pl-copper-press-and-solder-rough-in", "ib-firestop-and-fire-wrap-installation"], "A procedural campus building being fitted out: the electrical room locked out, copper pressed or soldered with a fire watch, and every penetration firestopped."),
        site("ham-hospital-expansion", "Hospital Expansion", "hospital", P(-90.4480, 30.5250), ["ibew", "ua", "carpenters"], ["healthcare-support", "plumbers-and-pipefitters"], ["pl-medical-gas-brazing-and-purge", "infection-control-audit", "pm-fire-alarm-panel-room"], "A procedural hospital wing: medical gas brazed with a purge, dust kept away from patients and the fire alarm panel tested before handover."),
        site("ham-warehouse-steel", "Warehouse Steel", "warehouse", P(-90.4880, 30.4800), ["ironworkers", "iuoe"], ["bridge-and-structural", "warehouse-and-logistics-automation"], ["steel-erector", "bs-structural-bolting-and-torque", "tw-dock-leveler-and-trailer-restraint-check"], "A procedural distribution warehouse by the interchange: steel bolted and torqued, then the docks' levellers and trailer restraints checked."),
        site("ham-streetscape-crew", "Thomas Street Streetscape Crew", "construction", P(-90.4700, 30.5025), ["liuna", "opcmia"], ["cement-masons-and-plasterers", "builders-trades"], ["concrete-pour", "traffic-incident-management", "gk-hardscape-paver-base-and-compaction"], "New sidewalks on Thomas Street: the lane closed and signed, the pour placed and finished and pedestrians guided round it."),
        site("ham-substation", "Hammond Substation", "substation", P(-90.4540, 30.4880), ["ibew"], ["electrical-first-period", "energy-transition"], ["substation-switching", "arc-flash-label-study", "line-truck"], "A procedural substation: switching orders read back, arc flash boundaries marked and the line truck set up inside its zone."),
        site("ham-fire-station", "Downtown Fire Station", "fire-station", P(-90.4640, 30.5120), ["iaff"], ["first-responders"], ["structure-fire-sizeup", "aerial-ladder", "ambulance-scene-safety"], "A procedural engine house: the size-up, the aerial set on firm ground and scene safety on the interstate."),
        site("ham-school-renovation", "School Renovation", "school", P(-90.4480, 30.4900), ["carpenters", "ibew", "afscme"], ["education-support-staff", "builders-trades"], ["ed-boiler-room-filter-change-lockout", "ed-playground-equipment-inspection", "ed-crossing-guard-intersection-control"], "A procedural school renovated over the summer: the boiler room locked out, the playground inspected and the crossing staffed when classes return."),
        site("ham-drainage-canal", "Drainage Canal Crew", "stormwater", P(-90.4470, 30.5000), ["liuna", "iuoe"], ["water-and-gas-utility-crews", "heavy-equipment-operators"], ["op-excavator-trench-and-utility-locate", "stormwater-outfall", "br-cold-water-immersion-and-mob-recovery"], "Reshaping the drainage canal east of town: the excavator kept back from the soft edge, the outfall cleared and a throw line near the water."),
        site("ham-truck-yard", "Interstate Truck Yard", "trucking", P(-90.4880, 30.4860), ["teamsters"], ["warehouse-and-logistics-automation"], ["tdl-pretrip-inspection", "tdl-air-brake-test", "po-yard-hostler-and-pedestrian-separation"], "A procedural truck yard by the interchange: the pre-trip walkaround, the air brakes tested and people on foot kept to their own path."),
    ]
    m["landmarks"] = [
        {"id": "downtown-hammond-place", "name": "downtown Hammond", "position": P(-90.4600, 30.5040), "kind": "neighbourhood"},
        {"id": "interstate-interchange", "name": "the interchange of Interstate Fifty-Five and Interstate Twelve", "position": P(-90.4760, 30.4810), "kind": "point"},
        {"id": "regional-airport", "name": "Hammond Northshore Regional Airport", "position": P(-90.4200, 30.5220), "kind": "point"},
        {"id": "university-place", "name": "the university district", "position": P(-90.4680, 30.5230), "kind": "neighbourhood"},
        {"id": "rail-line-place", "name": "the rail line through downtown", "position": P(-90.4605, 30.5000), "kind": "point"},
        {"id": "illustrative-sign", "name": "a sign: the site layouts are illustrative; the streets and places are real", "position": P(-90.4580, 30.5030), "kind": "point"},
    ]
    m["connectors"] = [
        {"id": "cap-ha-interstate-twelve-west", "kind": "road", "name": "Interstate Twelve west towards Baton Rouge", "from": {"parish": "hammond-downtown", "position": P(-90.4972, 30.4790)}, "to": {"parish": "livingston-interstate-twelve", "position": None, "lonlat": [-90.498, 30.479]}, "lonlat": [-90.498, 30.479], "approximate": True},
        {"id": "cap-ha-interstate-fifty-five-south", "kind": "road", "name": "Interstate Fifty-Five south towards Ponchatoula and New Orleans", "from": {"parish": "hammond-downtown", "position": P(-90.4790, 30.4637)}, "to": {"parish": "tangipahoa-south", "position": None, "lonlat": [-90.479, 30.463]}, "lonlat": [-90.479, 30.463], "approximate": True},
    ]
    m["fieldLessons"] = [
        {"id": "cap-ha-fl-where-roads-cross", "title": "Where Two Highways Cross", "site": "ham-interchange-work", "landmark": "interstate-interchange", "k12": "k12-reading-a-map-scale-in-bay-world", "station": "traffic-incident-management", "trade": "Highway crews", "tradeLine": "A highway crew sets up a buffer and signs well before the work so drivers slow down in time.", "minutes": 3, "steps": ["Find the place on the map where the two interstates cross.", "Ramps let drivers move from one highway to the other without stopping.", "Crews working here set signs and a buffer far ahead so traffic slows before it reaches them."], "check": {"q": "Why do highway crews put signs far ahead of the work?", "options": ["So drivers have time to slow down", "To advertise the job", "Because the signs are heavy"], "answer": 0, "why": "Drivers need distance to see the warning and slow before they reach the workers."}},
        {"id": "cap-ha-fl-crossing-signals", "title": "Why the Crossing Gates Come Down", "site": "ham-rail-crossing", "landmark": "rail-line-place", "k12": "k12-reading-instructions-and-safety-labels", "station": "ra-crossing-signal-maintenance-and-flagging", "trade": "Signal maintainers", "tradeLine": "A signal maintainer tests the lights, bells and gates, and flags the road while the crossing is being worked on.", "minutes": 3, "steps": ["Look at the crossing on the rail line through downtown.", "Lights, bells and gates warn drivers and walkers that a train is coming.", "Maintainers test them and flag traffic by hand while they work."], "check": {"q": "What should you do when the crossing lights flash?", "options": ["Stop and wait behind the gate", "Hurry across", "Walk around the gate"], "answer": 0, "why": "A train cannot stop quickly, so everyone waits until the gates rise."}},
        {"id": "cap-ha-fl-who-works-at-the-airport", "title": "Who Works at the Airport?", "site": "ham-airport-apron", "landmark": "regional-airport", "k12": "k12-es-who-does-this-work", "station": "av-marshalling-and-wingwalker-signals", "trade": "Ramp crews", "tradeLine": "A ramp worker uses clear hand signals to guide an aircraft, and a wing walker watches the wingtips.", "minutes": 3, "steps": ["Look across the airport apron.", "Mechanics, fuelers, paving crews and ramp workers all work near moving aircraft.", "They use hand signals and walk beside the wings so nothing is hit."], "check": {"q": "Why does a wing walker walk beside a moving aircraft?", "options": ["To make sure the wingtips clear everything", "To race the plane", "To wave at the passengers"], "answer": 0, "why": "The pilot cannot see the wingtips well, so a wing walker watches them."}},
    ]
    m["gated"] = [
        {"id": "cap-ha-gated-interchange-zone", "kind": "side-quest", "title": "Set Up the Interchange Work Zone", "world": "parishes", "parish": "hammond-downtown", "site": "ham-interchange-work", "siteName": "Interchange Work Zone", "summary": "Set up a ramp work zone by the interchange with its buffer and signs.", "gate": {"stations": ["traffic-incident-management", "deck-joint-replacement"], "note": "Finish the traffic incident management and deck joint stations first"}},
        {"id": "cap-ha-gated-hangar-steel", "kind": "side-quest", "title": "Raise the Hangar Steel", "world": "parishes", "parish": "hammond-downtown", "site": "ham-hangar-build", "siteName": "Hangar Build", "summary": "Raise the hangar frame with the crane's load chart and tie-off at every step.", "gate": {"stations": ["steel-erector", "op-crawler-crane-assembly-and-load-chart"], "note": "Finish the steel erector and crawler crane stations first"}},
    ]
    header = [
        "Hammond — Downtown & the Interstates (console CAPITAL, docs/consoles/CAPITAL.md, docs/parishes.md). A stylised 4096 m",
        "map at district scale (about 2 real metres per map metre), not a survey: every coordinate is approximate (three",
        "decimals for anchors, `approximate: true`). Hammond is named as a place only, with no growth or other figures. The interstates, the",
        "highways, the rail line, the university district and the airport are real as places; creeks, canals and every site",
        "layout are procedural. The Sentinel-2 view of this box returned no scene this round, so the layout is from general",
        "geography only. Written once by tools/gen_cap_capital.py; this module is the source afterwards. Pure data, no imports.",
    ]
    write("np-data-hammond-downtown.js", "NP_HAMMOND_DOWNTOWN", header, m)


if __name__ == "__main__":
    downtown()
    north()
    riverplex()
    hammond()
