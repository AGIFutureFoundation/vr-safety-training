"""Assemble a series review: title card, one clip per station padded to its
narration, outro card. Usage: build_review.py <series> <title> <id>..."""
import json, os, subprocess, sys
BASE = "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad"
series, title, ids = sys.argv[1], sys.argv[2], sys.argv[3:]
D = f"{BASE}/review/{series}"; W = f"{D}/work"; os.makedirs(W, exist_ok=True)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def dur(p): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]).decode().strip())
def run(a): subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
def esc(t): return t.replace("\\","\\\\").replace(":","\\:").replace("'","\\'")
segs = []
def card(name, wav, lines, bg="0x0b1220"):
    L = dur(wav) + 0.8
    draw = ",".join(f"drawtext=fontfile={FONT}:text='{esc(t)}':fontcolor={c}:fontsize={fs}:x=(w-text_w)/2:y={y}" for t, c, fs, y in lines)
    out = f"{W}/{name}.mp4"
    run(["ffmpeg","-y","-f","lavfi","-i",f"color=c={bg}:s=1280x720:d={L:.2f}:r=30","-i",wav,"-vf",draw,"-c:v","libx264","-preset","veryfast","-pix_fmt","yuv420p","-c:a","aac","-ar","48000","-shortest",out]); segs.append(out)
card("hook", f"{D}/audio/hook.wav", [("SmartCiti.X", "0x7fd6ff", 34, 250), (title, "white", 58, 310), ("Quick review", "0xb8c4d0", 30, 400)])
for i in ids:
    clip = f"{D}/raw/{i}/take.webm"; wav = f"{D}/audio/{i}.wav"
    if not (os.path.exists(clip) and os.path.exists(wav)): print("skip", i); continue
    # The recording starts on the loading screen; the first big scene change
    # is the station appearing, so the clip starts just before it.
    import re as _re
    cuts = []
    # Dark interiors (the bar) change less than a lit plaza: fall back to a
    # lower threshold when the normal one finds no cut after one second.
    for thr in (0.3, 0.1):
        info = subprocess.run(["ffmpeg","-i",clip,"-vf",f"select='gt(scene,{thr})',showinfo","-f","null","-"], capture_output=True, text=True).stderr
        cuts = sorted(float(m) for m in _re.findall(r"pts_time:([0-9.]+)", info))
        if any(1.0 <= c <= 12.0 for c in cuts): break
    # Frame zero always registers as a cut and the hub/loading screens are
    # both dark, so the first cut after one second is the station appearing.
    first = [c for c in cuts if 1.0 <= c <= 12.0]
    start = max(0.0, (first[0] if first else 0.0) - 0.15)
    L = max(dur(clip) - start, dur(wav) + 0.6); out = f"{W}/{i}.mp4"
    run(["ffmpeg","-y","-ss",f"{start:.2f}","-i",clip,"-i",wav,"-filter_complex",f"[0:v]scale=1280:720,fps=30,tpad=stop_mode=clone:stop_duration=30,trim=duration={L:.2f},setpts=PTS-STARTPTS[v];[1:a]apad,atrim=duration={L:.2f},asetpts=PTS-STARTPTS[a]","-map","[v]","-map","[a]","-c:v","libx264","-preset","veryfast","-pix_fmt","yuv420p","-c:a","aac","-ar","48000",out]); segs.append(out)
card("outro", f"{D}/audio/outro.wav", [("SmartCiti.X ~ Training Holodeck", "white", 46, 290), ("145 union-trade stations · 17 programmes", "0xb8c4d0", 28, 370)])
lst = f"{W}/list.txt"; open(lst, "w").write("".join(f"file '{s}'\n" for s in segs))
final = f"{D}/smartcitix-review-{series}.mp4"
run(["ffmpeg","-y","-f","concat","-safe","0","-i",lst,"-c","copy",final])
print(final, round(dur(final), 1), "s", os.path.getsize(final)//1024, "KiB")
