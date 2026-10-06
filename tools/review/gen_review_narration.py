"""Narration for the quick series reviews: one hook per series, one line per
station (index, name, tagline), Kokoro am_michael. Usage: gen_review_narration.py <series> <id>..."""
import json, os, re, sys
from kokoro_onnx import Kokoro
import soundfile as sf
BASE = "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad"
series, ids = sys.argv[1], sys.argv[2:]
OUT = f"{BASE}/review/{series}/audio"; os.makedirs(OUT, exist_ok=True)
cat = json.load(open("/home/user/vr-safety-training/WebXR/smartcity/catalog.json"))
by = {s["id"]: s for s in cat["stations"]}
HOOKS = {
  "culinary": "SmartCiti X. The working kitchen: fifteen stations for UNITE HERE Local 2 kitchen workers, from the knife board to the grill line. A quick review of each.",
  "dental": "SmartCiti X. Dental hygiene for the Unspoken Smiles programmes: fifteen stations from the operatory to the outreach van. A quick review of each.",
  "bartending": "SmartCiti X. Behind the bar: fifteen bartending stations with the customers in them, from opening the well to the R B S capstone. A quick review of each.",
  "bay": "SmartCiti X. Bay restoration, ports and air quality: the newest stations on the shoreline, the terminal and the monitoring van. A quick review of each.",
}
SPELL = ["PPE","CO2","ID","RBS","ABC","CPR","AED","HEPA","AQI","PM","UV","POS","CCTV","BLS","DO","GPS","FIFO","HACCP","SDS","LEL"]
WORDS = {"&": " and ", "—": ", ", "–": ", ", "/": " or ", "°F": " degrees Fahrenheit", "°": " degrees ", "%": " percent", "CO₂": "C O two", "O₂": "oxygen", "PM2.5": "P M two point five", "PM10": "P M ten", "N95": "N ninety five", "§": "section "}
def speak(t):
    s = str(t)
    for a, b in WORDS.items(): s = s.replace(a, b)
    for tok in sorted(SPELL, key=len, reverse=True): s = re.sub(rf"\b{re.escape(tok)}\b", " ".join(tok), s)
    return re.sub(r"\s+", " ", s).strip()
k = Kokoro(f"{BASE}/pro/kokoro/kokoro-v1.0.fp16.onnx", f"{BASE}/pro/kokoro/voices-v1.0.bin")
def render(name, text):
    p = f"{OUT}/{name}.wav"
    if os.path.exists(p): return
    a, sr = k.create(speak(text), voice="am_michael", speed=1.05, lang="en-us"); sf.write(p, a, sr); print(name, round(len(a)/sr, 1), flush=True)
render("hook", HOOKS[series])
for i in ids:
    s = by[i]; tag = s["tagline"]
    # Quick review: the first clause of the tagline, never more than ~110 chars.
    for sep in [" — ", "; ", ". "]:
        if sep in tag and len(tag.split(sep)[0]) >= 40: tag = tag.split(sep)[0]
    if len(tag) > 110:
        cut = tag[:110].rsplit(", ", 1)[0] if ", " in tag[:110] else tag[:110].rsplit(" ", 1)[0]
        tag = cut
    render(i, f"Station {int(s['index'])}. {s['name']}. {tag.rstrip(',.;')}.")
render("outro", "Every station is driven end to end, passes twenty three checkers, and is graded by the content evaluation before it ships. SmartCiti X, powered by A G I Corp and Visko.")
