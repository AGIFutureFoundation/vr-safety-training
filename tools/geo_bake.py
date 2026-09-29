"""GEO (docs/geo.md): bake one real Sentinel-2 true-colour backdrop per map, at build time.

For each map's lon/lat box (npBounds in WebXR/shared/np-geo.js, printed by tools/geo_maps.mjs) this picks the
least-cloudy recent Sentinel-2 L2A scene per MGRS tile from the Copernicus open data on AWS (sentinel-cogs), mosaics
the tiles in lon/lat, then resamples the mosaic into the MAP'S OWN SCENE FRAME through the map's affine fit:
column = scene x, row = scene z, both over the whole field (-size/2 .. +size/2). So the picture lines up with the
parish canvas map (npMapXY) and with the ground's uv (np-world.js) with no further transform.

Writes WebXR/assets/geo/<map>.jpg (512 px, JPEG quality <= 80, <= 90 KB) and <map>.json (scenes, dates, cloud cover,
coverage, attribution). Credit wherever the image appears: "Contains modified Copernicus Sentinel data 2026".
The imagery shows real geography only: no figure (area, length, capacity) is ever read off it.

Usage:
  node tools/geo_maps.mjs > maps.json
  python3 tools/geo_bake.py maps.json [--out WebXR/assets/geo] [--regions a,b] [--only id,id] [--skip-existing]
Needs numpy, rasterio, mgrs and Pillow, and outbound HTTPS to sentinel-cogs.s3.us-west-2.amazonaws.com.
"""
import argparse, io, json, os, re, sys, time, urllib.request
import numpy as np

B = "https://sentinel-cogs.s3.us-west-2.amazonaws.com"
ATTRIBUTION = "Contains modified Copernicus Sentinel data 2026"
LOUISIANA = "louisiana-sites,louisiana-cities,new-orleans-districts"
PX = 512            # output side, pixels
MAX_BYTES = 90_000  # per image
MAX_Q = 80          # JPEG quality ceiling
TRY = 5             # scenes previewed per tile for local cloud


def scenes_for(tile, months):
    z, band, sq = tile[:2], tile[2], tile[3:5]
    out = []
    for ym in months:
        y, mo = ym.split("-")
        pre = f"sentinel-s2-l2a-cogs/{int(z)}/{band}/{sq}/{y}/{int(mo)}/"
        xml = urllib.request.urlopen(f"{B}/?list-type=2&prefix={pre}&delimiter=/", timeout=30).read().decode()
        out += re.findall(r"<Prefix>(" + re.escape(pre) + r"[^<]+_L2A/)</Prefix>", xml)
    return out


def geo_mosaic(w, s, e, n, gpx, months):
    """The lon/lat mosaic of the box (north-up), shape (3, gpx, gpx), plus the scenes used."""
    import mgrs, rasterio
    from rasterio.vrt import WarpedVRT
    from rasterio.enums import Resampling
    from rasterio.transform import from_bounds
    m = mgrs.MGRS()
    tiles = {m.toMGRS(s + (n - s) * fy, w + (e - w) * fx, MGRSPrecision=0) for fx in np.linspace(0, 1, 5) for fy in np.linspace(0, 1, 5)}
    acc = np.zeros((3, gpx, gpx), np.float32); cnt = np.zeros((gpx, gpx), np.float32); used = []
    def read(sp, px):
        with rasterio.open(f"{B}/{sp}TCI.tif") as ds, WarpedVRT(ds, crs="EPSG:4326", transform=from_bounds(w, s, e, n, px, px), width=px, height=px, nodata=0, resampling=Resampling.bilinear) as v:
            return v.read().astype(np.float32)

    def local_cloud(arr):
        """Over THIS box, not the whole 110 km tile: the share of bright-white (cloud) pixels, plus half the no-data share."""
        valid = arr.sum(0) > 0
        if not valid.any(): return 2.0, 0.0
        white = (arr.min(0) > 170) & valid
        return float(white.sum() / valid.sum()) + 0.5 * float(1 - valid.mean()), float(white.sum() / valid.sum())

    for t in sorted(tiles):
        cands = []
        for sp in scenes_for(t, months):
            name = sp.rstrip("/").split("/")[-1]
            try: meta = json.load(urllib.request.urlopen(f"{B}/{sp}{name}.json", timeout=30))
            except Exception: continue
            bb = meta["bbox"]
            if bb[2] < w or bb[0] > e or bb[3] < s or bb[1] > n: continue
            p = meta["properties"]
            score = p.get("eo:cloud_cover", 100) + 0.5 * p.get("s2:nodata_pixel_percentage", 0)
            cands.append((score, sp, name, p.get("datetime"), p.get("eo:cloud_cover")))
        if not cands: continue
        # The tile's cloud figure says little about a small box: preview the best few scenes over the box itself.
        cands.sort(key=lambda c: c[0])
        ranked = []
        for c in cands[:TRY]:
            try: sc, lc = local_cloud(read(c[1], max(48, gpx // 8)))
            except Exception: continue
            ranked.append((sc, lc, c))
        if not ranked: continue
        ranked.sort(key=lambda r: r[0])
        _, lc, (_, sp, name, dt, cc) = ranked[0]
        arr = read(sp, gpx)
        valid = arr.sum(0) > 0
        acc[:, valid] += arr[:, valid]; cnt[valid] += 1
        used.append({"tile": t, "scene": name, "datetime": dt, "cloud_cover": cc, "local_cloud": round(lc, 3)})
    return acc / np.maximum(cnt, 1), cnt > 0, used


def to_scene_frame(mosaic, valid, mp, px=PX):
    """Resample the north-up lon/lat mosaic into the map's scene frame (column = x, row = z) through its fit."""
    w, s, e, n = mp["bounds"]; size = mp["size"]; gpx = mosaic.shape[1]
    c = (np.arange(px) + 0.5) / px * size - size / 2
    X, Z = np.meshgrid(c, c)                  # X varies along columns, Z along rows
    a, b, cc = mp["lon"]; d, ee, f = mp["lat"]
    lon = a * X + b * Z + cc; lat = d * X + ee * Z + f
    col = (lon - w) / (e - w) * gpx - 0.5; row = (n - lat) / (n - s) * gpx - 0.5
    c0 = np.clip(np.floor(col).astype(int), 0, gpx - 2); r0 = np.clip(np.floor(row).astype(int), 0, gpx - 2)
    fc = np.clip(col - c0, 0, 1)[None]; fr = np.clip(row - r0, 0, 1)[None]
    g = lambda rr, ccx: mosaic[:, rr, ccx]
    img = (g(r0, c0) * (1 - fc) * (1 - fr) + g(r0, c0 + 1) * fc * (1 - fr) + g(r0 + 1, c0) * (1 - fc) * fr + g(r0 + 1, c0 + 1) * fc * fr)
    cov = float(valid[r0, c0].mean())
    return np.moveaxis(img.clip(0, 255).astype(np.uint8), 0, -1), cov


def encode(rgb, max_bytes=MAX_BYTES, max_q=MAX_Q):
    """JPEG at the highest quality <= max_q that fits max_bytes (never below 30)."""
    from PIL import Image
    im = Image.fromarray(rgb)
    for q in range(max_q, 29, -5):
        buf = io.BytesIO(); im.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
        if buf.tell() <= max_bytes: return buf.getvalue(), q
    return buf.getvalue(), q


def bake(mp, out_dir, months):
    w, s, e, n = mp["bounds"]
    t0 = time.time()
    mosaic, valid, used = geo_mosaic(w, s, e, n, 3 * PX // 2, months)
    if not used: raise RuntimeError("no scene covers the box")
    rgb, cov = to_scene_frame(mosaic, valid, mp)
    data, q = encode(rgb)
    with open(os.path.join(out_dir, f"{mp['id']}.jpg"), "wb") as fh: fh.write(data)
    dates = sorted(u["datetime"][:10] for u in used if u.get("datetime"))
    side = {
        "map": mp["id"], "name": mp.get("name"), "region": mp.get("region"),
        "frame": "scene: column = x, row = z, over the map's whole field (not north-up)",
        "bbox": [round(v, 5) for v in (w, s, e, n)], "px": PX, "quality": q, "bytes": len(data),
        "scenes": used, "date": dates[-1] if dates else None,
        "cloud_cover": max((u["cloud_cover"] or 0) for u in used), "local_cloud": max(u["local_cloud"] for u in used), "coverage": round(cov, 3),
        "attribution": ATTRIBUTION, "source": "Copernicus Sentinel-2 L2A, AWS Open Data (sentinel-cogs), true colour",
        "licence": "free and open (Copernicus); credit line required",
    }
    with open(os.path.join(out_dir, f"{mp['id']}.json"), "w") as fh: json.dump(side, fh, indent=1); fh.write("\n")
    print(f"[geo] {mp['id']}: {len(data) // 1024} KB q{q} scenes {len(used)} date {side['date']} cloud {side['cloud_cover']}, local {side['local_cloud']} cov {cov:.2f} ({time.time() - t0:.0f}s)", flush=True)
    return side


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("maps"); ap.add_argument("--out", default="WebXR/assets/geo")
    ap.add_argument("--regions", default=LOUISIANA); ap.add_argument("--only", default="")
    ap.add_argument("--months", default="2026-09,2026-08"); ap.add_argument("--skip-existing", action="store_true")
    a = ap.parse_args()
    maps = json.load(open(a.maps))
    only = [x for x in a.only.split(",") if x]
    regions = [x for x in a.regions.split(",") if x]
    pick = [m for m in maps if (m["id"] in only if only else m["region"] in regions)]
    os.makedirs(a.out, exist_ok=True)
    bad = 0
    for mp in pick:
        if a.skip_existing and os.path.exists(os.path.join(a.out, f"{mp['id']}.json")): continue
        try: bake(mp, a.out, a.months.split(","))
        except Exception as ex: bad += 1; print(f"[geo] {mp['id']}: FAILED {ex}", file=sys.stderr, flush=True)
    total = sum(os.path.getsize(os.path.join(a.out, f)) for f in os.listdir(a.out) if f.endswith(".jpg"))
    print(f"[geo] {len(pick) - bad}/{len(pick)} baked; all backdrops {total // 1024} KB")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
