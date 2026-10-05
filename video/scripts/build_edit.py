"""Genera src/data/edit.json: segmentos sin silencios >0.3 s + subtítulos + destacados.
Entrada: src/data/transcript-whisper.json (Whisper medium, palabra a palabra)."""
import json, re
FPS = 30
GAP, PAD_IN, PAD_OUT = 0.3, 0.05, 0.08   # estilo.md §1
fix = {"LOLE": "Olé", "SQUAD": "Squad", "piano": "paquete", "llego": "llegó", "oer": "oler",
       "brechitos.": "brillitos.", "super": "súper"}
drop_idx = set()
raw = json.load(open("src/data/transcript-whisper.json"))
for i, w in enumerate(raw):   # "de lique" no se entiende: se omite del subtítulo
    if w["w"] == "lique":
        drop_idx |= {i - 1, i}
words = []
for i, w in enumerate(raw):
    if i in drop_idx: continue
    words.append({"t": fix.get(w["w"], w["w"]), "s": w["s"], "e": w["e"], "src": i})

# --- segmentos (tiempo de origen) ---
segs = []
cs, ce = words[0]["s"] - PAD_IN, words[0]["e"]
for p, n in zip(raw, raw[1:]):
    if n["s"] - p["e"] > GAP:
        segs.append([max(0, cs), p["e"] + PAD_OUT]); cs = n["s"] - PAD_IN
    ce = n["e"]
segs.append([max(0, cs), ce + 0.1])
# si el relleno cruza el siguiente segmento, fusionar
merged = [segs[0]]
for s in segs[1:]:
    if s[0] <= merged[-1][1]: merged[-1][1] = max(merged[-1][1], s[1])
    else: merged.append(s)
segs = [[round(a * FPS) / FPS, round(b * FPS) / FPS] for a, b in merged]

def to_out(t):
    o = 0.0
    for a, b in segs:
        if t < a: return o
        if t <= b: return o + t - a
        o += b - a
    return o
for w in words: w["os"], w["oe"] = round(to_out(w["s"]), 3), round(to_out(w["e"]), 3)
total = sum(b - a for a, b in segs)

# --- destacados (por palabra de origen) ---
HL = [("Olé Squad", None, "Olé", 2), ("mantequilla", "corporal", "mantequilla", 1), ("birthday", "cake", "birthday", 1),
      ("edición", "limitada", "edición", 1), ("súper", "glowy", "súper", 1), ("brillitos", None, "brillitos", 1),
      ("postrecitos", None, "postrecitos", 1), ("encanta", None, None, 1), ("delicioso", None, None, 1), ("encantó", None, None, 1)]
def find(txt, after=0):
    for i, w in enumerate(words):
        if i >= after and re.sub(r"\W", "", w["t"]).lower() == re.sub(r"\W", "", txt).lower(): return i
    raise KeyError(txt)
hl, cur = [], 0
specs = [("olé", "olé squad", "", 0), ("mantequilla", "mantequilla", "corporal", 0), ("birthday", "birthday", "cake", 0),
         ("edición", "edición", "limitada", 1), ("súper", "súper", "glowy", 0), ("brillitos", "brillitos", "", 0),
         ("postrecitos", "postrecitos", "", 0), ("encanta", "me encanta.", "", 0), ("delicioso", "delicioso.", "", 0),
         ("encantó", "me encantó.", "", 0)]
for key, main, sub, _ in specs:
    i = find(key, cur); cur = i + 1
    # "mantequilla" aparece varias veces: usa la 1ª tras 9 s de origen
    if key == "mantequilla": i = next(k for k, w in enumerate(words) if w["t"].startswith("mantequilla") and w["s"] > 9); cur = i + 1
    if key == "edición": i = next(k for k, w in enumerate(words) if w["t"].startswith("edición") and w["s"] > 15); cur = i + 1
    hl.append({"main": main.upper() if key in ("birthday",) else main, "sub": sub, "start": words[i]["os"]})
if hl[0]["main"] == "olé squad": hl[0]["main"], hl[0]["sub"] = "Olé", "Squad"
for k, h in enumerate(hl):
    nxt = hl[k + 1]["start"] if k + 1 < len(hl) else total
    h["end"] = round(min(h["start"] + 1.1, nxt - 0.05, total), 3)
    if k == len(hl) - 1: h["end"] = round(total, 3)
    h["start"] = round(h["start"], 3)

# --- bloques de subtítulo ---
blocks, cur_b = [], []
def flush():
    global cur_b
    if cur_b:
        blocks.append({"text": " ".join(w["t"] for w in cur_b), "start": cur_b[0]["os"], "end": cur_b[-1]["oe"]}); cur_b = []
for i, w in enumerate(words):
    cur_b.append(w)
    nxt = words[i + 1] if i + 1 < len(words) else None
    end_sent = re.search(r"[.?!,]$", w["t"])
    cut_after = nxt and raw[nxt["src"]]["s"] - raw[w["src"]]["e"] > GAP
    if len(cur_b) >= 7 or (end_sent and len(cur_b) >= 3) or cut_after or not nxt: flush()
for k, b in enumerate(blocks):
    nxt = blocks[k + 1]["start"] if k + 1 < len(blocks) else total
    b["end"] = round(min(b["end"] + 0.25, nxt), 3); b["start"] = round(b["start"], 3)
edit = {"fps": FPS, "totalSeconds": round(total, 3), "segments": [{"from": a, "to": b} for a, b in segs],
        "blocks": blocks, "highlights": hl}
json.dump(edit, open("src/data/edit.json", "w"), ensure_ascii=False, indent=1)
print(len(segs), "segmentos;", round(total, 1), "s de", 52.7, "s;", len(blocks), "bloques;", len(hl), "destacados")
for b in blocks: print(f'{b["start"]:5.2f}-{b["end"]:5.2f} {b["text"]}')
print([ (h["main"], h["start"], h["end"]) for h in hl])
