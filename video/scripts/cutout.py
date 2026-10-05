"""Contorno blanco tipo pegatina alrededor de la persona (estilo referencia2).
Segmenta con MediaPipe (modelo incluido en el paquete), oscurece/desatura el fondo y dibuja el borde.
Entrada: public/mi-video.mp4  ->  Salida: public/mi-video-cutout.mp4 (mismo audio)"""
import subprocess, sys, numpy as np, cv2, mediapipe as mp
SRC, OUT, W, H, FPS = "public/mi-video.mp4", "public/mi-video-cutout.mp4", 1080, 1920, 30
RING = 15            # px de grosor del borde (en 1080)
rd = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-vf", f"fps={FPS}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
                      stdout=subprocess.PIPE)
wr = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                       "-i", SRC, "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-crf", "18", "-preset", "veryfast",
                       "-pix_fmt", "yuv420p", "-c:a", "copy", "-shortest", OUT], stdin=subprocess.PIPE)
seg = mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=0)
k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (RING * 2 + 1, RING * 2 + 1))
prev, n = None, 0
while True:
    buf = rd.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    m = seg.process(cv2.cvtColor(cv2.resize(f, (384, 683)), cv2.COLOR_BGR2RGB)).segmentation_mask
    m = m if prev is None else 0.6 * m + 0.4 * prev      # suaviza el parpadeo entre fotogramas
    prev = m
    m = cv2.resize(m, (W, H), interpolation=cv2.INTER_CUBIC)
    person = np.clip((m - 0.4) / 0.2, 0, 1)
    person = cv2.GaussianBlur(person, (0, 0), 2.0)
    ring = cv2.GaussianBlur(cv2.dilate(person, k), (0, 0), 1.5)
    gray = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)[..., None].repeat(3, 2).astype(np.float32)
    bg = (0.75 * f.astype(np.float32) + 0.25 * gray) * 0.82           # fondo algo apagado
    shadow = cv2.GaussianBlur(cv2.dilate(person, k), (0, 0), 14)[..., None] * 0.35
    bg = bg * (1 - shadow)
    r = ring[..., None]
    comp = bg * (1 - r) + 255.0 * r
    p = person[..., None]
    out = comp * (1 - p) + f.astype(np.float32) * p
    wr.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes())
    n += 1
    if n % 200 == 0: print(n, "fotogramas", file=sys.stderr)
wr.stdin.close(); wr.wait(); print("listo", n)
