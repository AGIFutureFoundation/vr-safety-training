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


if __name__ == "__main__":
    downtown()
    north()
