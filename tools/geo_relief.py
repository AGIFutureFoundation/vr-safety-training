"""GEO (docs/geo.md §4) and BACKDROPS-2: real relief from USGS 3DEP, baked as a height grid in the map's scene frame.

Reads the USGS 3DEP 1/3 arc-second DEM (public domain; AWS prd-tnm, cloud-optimised GeoTIFF) over the map's lon/lat box
and samples it on a GRID x GRID lattice over the field through the map's affine fit (row = scene z, column = scene x,
corners included), written as integer decimetres to WebXR/assets/geo/<map>.relief.json.

Wired into the engine (BACKDROPS-2), opt-in per map: a map whose data says relief: "3dep" gets its committed grid through
WebXR/shared/bd2-relief-data.js (written by --module from the committed grids), np-parishes.js attaches it as
`reliefGrid`, and np-parish.js (npDemSampler) scales it into the map's schematic range the way RELIEF's Mapbox relief is
(pads terraced, water level). No figure is ever quoted from it.

Usage:
  python3 tools/geo_relief.py maps.json <map-id> [--out WebXR/assets/geo] [--grid 65]   # bake one map's grid
  python3 tools/geo_relief.py maps.json --module                                        # rewrite bd2-relief-data.js
"""
import argparse, json, math, os, sys
import numpy as np

TNM = "https://prd-tnm.s3.amazonaws.com/StagedProducts/Elevation/13/TIFF/current/{tile}/USGS_13_{tile}.tif"
CREDIT = "Heights: USGS 3D Elevation Program, 1/3 arc-second (public domain)"


def tiles_for(w, s, e, n):
    """The 1x1 degree 3DEP tiles over the box; a tile is named by its north-west corner (n31w092 covers 30-31 N, 91-92 W)."""
    out = []
    for lat in range(math.floor(s), math.floor(n) + 1):
        for lon in range(math.floor(w), math.floor(e) + 1):
            out.append((f"n{lat + 1:02d}w{-lon:03d}", lon, lat))
    return out


MODULE = "WebXR/shared/bd2-relief-data.js"


def write_module(maps_path, geo_dir, out=MODULE):
    """BACKDROPS-2: the engine's copy of the committed grids, for every map whose data says relief: "3dep"."""
    ids = sorted(m["id"] for m in json.load(open(maps_path)) if m.get("relief") == "3dep")
    grids = {}
    for i in ids:
        r = json.load(open(os.path.join(geo_dir, f"{i}.relief.json")))
        grids[i] = {"grid": r["grid"], "heights": r["heights"], "tiles": r["tiles"], "credit": r["credit"]}
    head = ("// BACKDROPS-2 (docs/geo.md §4): the committed USGS 3DEP height grids for the maps whose data says relief: \"3dep\".\n"
            "// Written by `python3 tools/geo_relief.py --module maps.json` from WebXR/assets/geo/<id>.relief.json (do not edit by hand;\n"
            "// check_geo proves the two match). Integer decimetres, row = scene z, column = scene x, corners included, over the whole\n"
            "// field. np-parishes.js attaches each grid to its map as `reliefGrid`; np-parish.js scales it into the schematic range.\n"
            "// Heights: USGS 3D Elevation Program, 1/3 arc-second (public domain). No figure is ever quoted from them. Pure data.\n")
    body = "export const BD2_RELIEF = {\n" + "".join(f"  {json.dumps(k)}: {json.dumps(v, separators=(',', ':'))},\n" for k, v in grids.items()) + "};\n"
    with open(out, "w") as fh: fh.write(head + body)
    print(f"[geo-relief] {out}: {', '.join(ids)} ({os.path.getsize(out) // 1024} KB)")
    return 0


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("maps"); ap.add_argument("map", nargs="?"); ap.add_argument("--out", default="WebXR/assets/geo"); ap.add_argument("--grid", type=int, default=65)
    ap.add_argument("--module", action="store_true", help="write WebXR/shared/bd2-relief-data.js from the committed grids")
    a = ap.parse_args()
    if a.module: return write_module(a.maps, a.out)
    import rasterio
    from rasterio.windows import from_bounds
    mp = next(m for m in json.load(open(a.maps)) if m["id"] == a.map)
    w, s, e, n = mp["bounds"]; size = mp["size"]; G = a.grid
    c = np.linspace(-size / 2, size / 2, G)
    X, Z = np.meshgrid(c, c)
    lon = mp["lon"][0] * X + mp["lon"][1] * Z + mp["lon"][2]; lat = mp["lat"][0] * X + mp["lat"][1] * Z + mp["lat"][2]
    H = np.full((G, G), np.nan)
    used = []
    for tile, tlon, tlat in tiles_for(w, s, e, n):
        with rasterio.open(TNM.format(tile=tile)) as ds:
            bw, bs, be, bn = max(w, tlon), max(s, tlat), min(e, tlon + 1), min(n, tlat + 1)
            if bw >= be or bs >= bn: continue
            px = 4 * G
            win = from_bounds(bw, bs, be, bn, ds.transform)
            arr = ds.read(1, window=win, out_shape=(px, px)).astype(np.float64)
            nod = ds.nodata
            if nod is not None: arr[arr == nod] = np.nan
            m = (lon >= bw) & (lon <= be) & (lat >= bs) & (lat <= bn)
            col = np.clip(((lon - bw) / (be - bw) * px).astype(int), 0, px - 1); row = np.clip(((bn - lat) / (bn - bs) * px).astype(int), 0, px - 1)
            H[m] = arr[row[m], col[m]]
            used.append(tile)
    if np.isnan(H).all(): print("[geo-relief] no heights", file=sys.stderr); return 1
    H = np.where(np.isnan(H), np.nanmin(H), H)
    out = {"map": a.map, "grid": G, "frame": "scene: row = z, column = x, corners included, over the whole field",
           "units": "decimetres", "heights": [int(round(v * 10)) for v in H.ravel()], "tiles": used,
           "source": "USGS 3DEP 1/3 arc-second DEM, AWS prd-tnm", "credit": CREDIT,
           "note": "shapes the schematic ground only; no figure is quoted from it"}
    os.makedirs(a.out, exist_ok=True)
    path = os.path.join(a.out, f"{a.map}.relief.json")
    with open(path, "w") as fh: json.dump(out, fh, separators=(",", ":")); fh.write("\n")
    print(f"[geo-relief] {a.map}: {G}x{G} grid from {', '.join(used)} -> {path} ({os.path.getsize(path) // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
