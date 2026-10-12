"""Write WebXR/assets/env/sample-street.glb — a hand-built placeholder
environment (a ground slab, a road, six building blocks and two kerbs,
vertex-coloured) so the GLB environment loader can be exercised without any
external asset and without a licence question.

    python3 tools/gen_sample_env.py
"""
import json, struct
from pathlib import Path
import numpy as np

verts, cols, idx = [], [], []


def box(cx, cy, cz, w, h, d, rgb):
    base = len(verts) // 3
    x0, x1, y0, y1, z0, z1 = cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2, cz - d / 2, cz + d / 2
    for p in [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]:
        verts.extend(p); cols.extend(rgb)
    for a, b, c in [(0, 2, 1), (0, 3, 2), (4, 5, 6), (4, 6, 7), (0, 1, 5), (0, 5, 4), (2, 3, 7), (2, 7, 6), (1, 2, 6), (1, 6, 5), (0, 4, 7), (0, 7, 3)]:
        idx.extend([base + a, base + b, base + c])


box(0, -0.05, 0, 60, 0.1, 60, (0.32, 0.33, 0.35))
box(0, 0.02, 0, 6, 0.04, 60, (0.55, 0.56, 0.58))
for x, z, h, rgb in [(-14, -18, 9, (0.62, 0.45, 0.35)), (14, -16, 12, (0.5, 0.55, 0.6)), (-15, 10, 7, (0.7, 0.6, 0.5)),
                     (15, 14, 10, (0.45, 0.5, 0.55)), (-13, -2, 5, (0.75, 0.7, 0.62)), (14, 0, 6, (0.55, 0.45, 0.4))]:
    box(x, h / 2, z, 10, h, 9, rgb)
for x in (-6.2, 6.2):
    box(x, 0.08, 0, 0.4, 0.16, 60, (0.85, 0.85, 0.8))

V = np.array(verts, dtype=np.float32); C = np.array(cols, dtype=np.float32); I = np.array(idx, dtype=np.uint32)
mn, mx = V.reshape(-1, 3).min(0).tolist(), V.reshape(-1, 3).max(0).tolist()
bin_ = V.tobytes() + C.tobytes() + I.tobytes()
bin_ += b"\0" * (-len(bin_) % 4)
gltf = {
    "asset": {"version": "2.0", "generator": "smartcitix-sample"}, "scene": 0, "scenes": [{"nodes": [0]}],
    "nodes": [{"mesh": 0, "name": "sample-street"}],
    "meshes": [{"primitives": [{"attributes": {"POSITION": 0, "COLOR_0": 1}, "indices": 2, "material": 0}]}],
    "materials": [{"pbrMetallicRoughness": {"baseColorFactor": [1, 1, 1, 1], "metallicFactor": 0.0, "roughnessFactor": 0.9}}],
    "buffers": [{"byteLength": len(bin_)}],
    "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": V.nbytes},
                    {"buffer": 0, "byteOffset": V.nbytes, "byteLength": C.nbytes},
                    {"buffer": 0, "byteOffset": V.nbytes + C.nbytes, "byteLength": I.nbytes}],
    "accessors": [{"bufferView": 0, "componentType": 5126, "count": len(V) // 3, "type": "VEC3", "min": mn, "max": mx},
                  {"bufferView": 1, "componentType": 5126, "count": len(C) // 3, "type": "VEC3"},
                  {"bufferView": 2, "componentType": 5125, "count": len(I), "type": "SCALAR"}],
}
js = json.dumps(gltf).encode(); js += b" " * (-len(js) % 4)
glb = (b"glTF" + struct.pack("<II", 2, 12 + 8 + len(js) + 8 + len(bin_))
       + struct.pack("<II", len(js), 0x4E4F534A) + js + struct.pack("<II", len(bin_), 0x004E4942) + bin_)
out = Path(__file__).resolve().parent.parent / "WebXR/assets/env/sample-street.glb"
out.write_bytes(glb)
print(f"wrote {out} ({len(glb)} bytes)")
