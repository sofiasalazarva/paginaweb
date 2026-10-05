"""Video de los parches: voz de IMG_3959 (public/p-voz.mp4), sin silencios >0.3 s y sin repeticiones.
Genera src/data/edit2.json con segmentos, subtítulos palabra a palabra, destacados y vídeos superpuestos."""
import json, re
FPS, GAP, PAD_IN, PAD_OUT = 30, 0.3, 0.05, 0.04
raw = json.load(open("src/data/transcript-parches.json"))
fix = {"Melaccine,": "Melaxin,", "pimple": "pimple", "cómplenlas": "cómpralas", "videíto": "videíto"}
# Tomas elegidas (tiempo en el video fuente). Se descartan las repeticiones: se deja la última toma buena.
TAKES = [(3.43, 5.99), (9.3, 11.9), (16.02, 19.3), (36.14, 42.82), (52.07, 57.27), (61.45, 65.36), (68.21, 71.47),
         (80.97, 83.35), (87.27, 93.13), (103.45, 106.27)]
# quita solapes entre tomas contiguas
fixed = []
for a, b in TAKES:
    if fixed and a < fixed[-1][1]: a = fixed[-1][1]
    fixed.append((a, b))
words = []
for w in raw:
    if any(a - 0.02 <= w["s"] and w["e"] <= b + 0.15 for a, b in fixed):
        t = fix.get(w["w"], w["w"])
        if t in ("7", "6", "72", "19"): pass
        words.append({"t": t, "s": w["s"], "e": w["e"]})
import subprocess
_o = subprocess.run(["ffmpeg", "-i", "public/p-voz.mp4", "-af", "silencedetect=n=-45dB:d=0.3", "-f", "null", "-"], capture_output=True, text=True).stderr
_st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", _o)]; _en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", _o)]
REAL_SIL = [(a + PAD_OUT, b - PAD_IN) for a, b in zip(_st, _en) if b - a > GAP + PAD_IN + PAD_OUT]
def subtract(segs, cuts):
    res = []
    for a, b in segs:
        pieces = [[a, b]]
        for c0, c1 in cuts:
            nxt = []
            for x, y in pieces:
                if c1 <= x or c0 >= y: nxt.append([x, y]); continue
                if c0 > x: nxt.append([x, c0])
                if c1 < y: nxt.append([c1, y])
            pieces = nxt
        res += [q for q in pieces if q[1] - q[0] > 0.15]
    return res
# segmentos: una palabra mantiene continuidad si el hueco con la anterior es <= GAP y está en la misma toma
def take_of(t): return next((i for i, (a, b) in enumerate(fixed) if a - 0.02 <= t <= b + 0.15), -1)
segs, cs = [], words[0]["s"] - PAD_IN
for p, n in zip(words, words[1:]):
    if n["s"] - p["e"] > GAP or take_of(n["s"]) != take_of(p["s"]):
        segs.append([max(0, cs), p["e"] + PAD_OUT]); cs = n["s"] - PAD_IN
segs.append([cs, words[-1]["e"] + 0.12])
for i in range(1, len(segs)):                   # sin solapes
    if segs[i][0] < segs[i - 1][1]: segs[i][0] = segs[i - 1][1]
segs = subtract(segs, REAL_SIL)
segs = [[round(a * FPS) / FPS, round(b * FPS) / FPS] for a, b in segs if b - a > 0.1]
def to_out(t):
    o = 0.0
    for a, b in segs:
        if t < a: return o
        if t <= b: return o + (t - a)
        o += b - a
    return o
for w in words: w["os"], w["oe"] = round(to_out(w["s"]), 3), round(to_out(w["e"]), 3)
total = sum(b - a for a, b in segs)
# subtítulos: bloques de hasta 6 palabras, cortando en puntuación, huecos y tomas
blocks, cur = [], []
def flush():
    global cur
    if cur:
        blocks.append({"text": " ".join(w["t"] for w in cur), "start": cur[0]["os"], "end": cur[-1]["oe"],
                       "words": [{"t": w["t"], "s": w["os"], "e": w["oe"]} for w in cur]}); cur = []
for i, w in enumerate(words):
    cur.append(w); n = words[i + 1] if i + 1 < len(words) else None
    gap = n and (n["s"] - w["e"] > GAP or take_of(n["s"]) != take_of(w["s"]))
    if len(cur) >= 7 or (re.search(r"[.,?!]$", w["t"]) and len(cur) >= 3) or gap or not n: flush()
for k, b in enumerate(blocks):
    nxt = blocks[k + 1]["start"] if k + 1 < len(blocks) else total
    b["start"] = round(b["start"], 3); b["end"] = round(min(b["end"] + 0.2, nxt), 3)
# destacados (por palabra clave y tiempo de origen)
def at(txt, after, before=999):
    for w in words:
        if after <= w["s"] <= before and re.sub(r"\W", "", w["t"]).lower() == txt: return w
    raise KeyError(txt)
HL = [("Amazon Prime", "Days", at("amazon", 3, 6)), ("pimple patches", "", at("pimple", 16, 18)),
      ("Dr. Melaxin", "", at("melaxin", 52, 57)), ("72 parches", "", at("72", 88, 89)),
      ("19 dólares", "", at("19", 87, 89)), ("link en mi bio", "", at("link", 103, 105))]
hl = []
for main, sub, w in sorted(HL, key=lambda x: x[2]["s"]):
    hl.append({"main": main, "sub": sub, "start": round(w["os"], 3)})
for k, h in enumerate(hl):
    nxt = hl[k + 1]["start"] if k + 1 < len(hl) else total
    h["end"] = round(min(h["start"] + 1.4, nxt - 0.05, total), 3)
# vídeos superpuestos (voz se mantiene): clip, inicio dentro del clip (s), rango en el video fuente de la voz
OV = [("unbox", 5.4, 16.02, 19.3), ("unbox", 57.0, 39.3, 42.82), ("unbox", 6.0, 55.2, 57.27),
      ("makeup", 60.0, 61.45, 65.36), ("makeup", 15.0, 90.2, 93.13)]
ov = []
for clip, cstart, a, b in OV:
    s0, s1 = to_out(max(a, fixed[0][0])), to_out(b)
    if s1 - s0 > 0.6: ov.append({"clip": clip, "clipStart": cstart, "start": round(s0, 3), "end": round(s1, 3)})
json.dump({"fps": FPS, "totalSeconds": round(total, 3), "segments": [{"from": a, "to": b} for a, b in segs],
           "blocks": blocks, "highlights": hl, "overlays": ov}, open("src/data/edit2.json", "w"), ensure_ascii=False, indent=1)
print(len(segs), "segmentos;", round(total, 1), "s;", len(blocks), "bloques")
for b in blocks: print(f'{b["start"]:5.2f}-{b["end"]:5.2f} {b["text"]}')
print([(h["main"], h["start"]) for h in hl]); print(ov)
