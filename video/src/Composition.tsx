import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  Composition,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import edit from "./data/edit.json";

const FPS = edit.fps;

loadFont({ family: "Playfair", url: staticFile("fonts/playfair-display-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: "MontserratBlack", url: staticFile("fonts/montserrat-latin-900-normal.woff2"), weight: "900" });

// estilo.md §7: dos encuadres que alternan con salto seco (ancho / acercado)
const ZOOMS = [1.0, 1.2];
const HL_COLORS = ["#FFF8C8", "#FFFFFF", "#F8B8C8"];
const IDEA_GAP = 1.0; // pausa original (s) a partir de la cual se considera cambio de idea -> flash B/N
const OUTLINE = ["BIRTHDAY", "súper", "delicioso.", "me encantó."]; // momentos importantes con contorno blanco
const GIANT = ["BIRTHDAY", "súper", "delicioso."]; // palabras gigantes con glitch
const rand = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const segFrames = edit.segments.map((s, i) => ({
  from: Math.round(s.from * FPS),
  len: Math.max(1, Math.round((s.to - s.from) * FPS)),
  idea: i > 0 && s.from - edit.segments[i - 1].to >= IDEA_GAP,
}));
export const TOTAL_FRAMES = segFrames.reduce((a, s) => a + s.len, 0);
const cutFrames = (() => { let at = 0; return segFrames.map((s) => { const f = at; at += s.len; return f; }); })();

// ---------- video: contorno blanco + zoom por corte + flash B/N en cambios de idea ----------
const Footage: React.FC = () => (
  <>
    {segFrames.map((s, i) => (
      <Sequence key={i} from={cutFrames[i]} durationInFrames={s.len} name={`Corte ${i + 1}`}>
        <Cut zoom={ZOOMS[i % ZOOMS.length]} trimBefore={s.from} idea={s.idea} />
      </Sequence>
    ))}
  </>
);

const Cut: React.FC<{ zoom: number; trimBefore: number; idea: boolean }> = ({ zoom, trimBefore, idea }) => {
  const f = useCurrentFrame();
  const bw = idea && f < 7;
  const flash = idea ? interpolate(f, [0, 1, 4], [0.95, 0.7, 0], { extrapolateRight: "clamp" }) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`, transformOrigin: "50% 38%",
          filter: bw ? "grayscale(1) contrast(1.35) brightness(1.08)" : undefined,
        }}
      >
        <Video src={staticFile("mi-video.mp4")} trimBefore={trimBefore} />
      </AbsoluteFill>
      {flash > 0 ? <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};

// contorno recortado: solo mientras dura cada momento clave (se monta sobre el video normal, mismo fotograma)
const Outlines: React.FC = () => (
  <>
    {edit.highlights.filter((h) => OUTLINE.includes(h.main)).map((h, k) => {
      const start = Math.max(0, Math.round((h.start - 0.1) * FPS));
      const ci = cutFrames.findLastIndex((f) => f <= start);
      const end = Math.min(Math.round((h.end + 0.35) * FPS), ci + 1 < cutFrames.length ? cutFrames[ci + 1] : TOTAL_FRAMES);
      const len = end - start;
      if (len < 1) return null;
      return (
        <Sequence key={k} from={start} durationInFrames={len} name={`Contorno ${h.main}`}>
          <AbsoluteFill style={{ transform: `scale(${ZOOMS[ci % ZOOMS.length]})`, transformOrigin: "50% 38%" }}>
            <Video src={staticFile("mi-video-cutout.mp4")} trimBefore={segFrames[ci].from + (start - cutFrames[ci])} />
          </AbsoluteFill>
        </Sequence>
      );
    })}
  </>
);

// ---------- subtítulos: blanco, palabra activa en amarillo suave ----------
const Subtitle: React.FC<{ words: { t: string; s: number; e: number }[] }> = ({ words }) => {
  const t = useCurrentFrame() / FPS;
  const active = words.findLastIndex((w) => t >= w.s);
  return (
    <div
      style={{
        position: "absolute", top: 1080, left: 170, width: 740, textAlign: "center",
        fontFamily: "Playfair, serif", fontWeight: 500, fontSize: 52, lineHeight: 1.18, color: "#fff",
        textShadow: "0 2px 10px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.6)",
      }}
    >
      {words.map((w, i) => (
        <span key={i} style={{ color: i === active ? "#FFE680" : "#fff" }}>{w.t}{i < words.length - 1 ? " " : ""}</span>
      ))}
    </div>
  );
};

// ---------- destacado normal (arriba) ----------
const Highlight: React.FC<{ main: string; sub: string; color: string; durationInFrames: number }> = ({
  main, sub, color, durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 220 }, durationInFrames: 10 });
  const out = Math.min(1, Math.max(0, (durationInFrames - frame) / 3));
  const size = Math.min(170, 900 / (Math.max(main.length, sub.length * 0.9) * 0.66));
  return (
    <div
      style={{
        position: "absolute", top: 190, left: 0, width: 1080, textAlign: "center",
        fontFamily: "MontserratBlack, sans-serif", fontWeight: 900, color,
        textShadow: "0 3px 14px rgba(60,35,30,0.45), 0 0 2px rgba(60,35,30,0.5)",
        opacity: Math.min(1, pop * 1.5) * out, transform: `scale(${0.8 + 0.2 * pop})`, lineHeight: 1.05,
      }}
    >
      <div style={{ fontSize: size }}>{main}</div>
      {sub ? <div style={{ fontSize: size * 0.5 }}>{sub}</div> : null}
    </div>
  );
};

// ---------- palabra gigante con glitch (división RGB + cortes horizontales) ----------
const GiantGlitch: React.FC<{ main: string; sub: string; durationInFrames: number }> = ({ main, sub, durationInFrames }) => {
  const f = useCurrentFrame();
  const out = Math.min(1, Math.max(0, (durationInFrames - f) / 3));
  const hot = f < 10 || (f % 11 === 0);               // ráfaga fuerte al entrar y parpadeos después
  const amp = hot ? 10 + rand(f) * 26 : 3 + rand(f) * 3;
  const dx = (rand(f + 1) - 0.5) * 2 * amp;
  const dy = hot ? (rand(f + 2) - 0.5) * 10 : 0;
  const lines = [main, sub].filter(Boolean);
  const size = Math.min(240, 1000 / (Math.max(...lines.map((l) => l.length)) * 0.72));
  const base: React.CSSProperties = {
    position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    fontFamily: "MontserratBlack, sans-serif", fontWeight: 900, fontSize: size, lineHeight: 0.95, textTransform: "uppercase",
    letterSpacing: -4,
  };
  const Layer = ({ color, x, y = 0, blend, clip }: { color: string; x: number; y?: number; blend?: "screen"; clip?: string }) => (
    <div style={{ ...base, color, transform: `translate(${x}px, ${y}px)`, mixBlendMode: blend, clipPath: clip }}>
      {lines.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );
  const sliceTop = rand(f + 5) * 70, sliceH = 6 + rand(f + 6) * 18;
  return (
    <AbsoluteFill style={{ opacity: out, top: 60 }}>
      <Layer color="#ff2e63" x={-dx} y={dy} blend="screen" />
      <Layer color="#00e5ff" x={dx} y={-dy} blend="screen" />
      <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 6px 22px rgba(0,0,0,0.45))" }}><Layer color="#fff" x={0} /></div>
      {hot ? <Layer color="#fff" x={(rand(f + 9) - 0.5) * 120}
        clip={`inset(${sliceTop}% 0 ${100 - sliceTop - sliceH}% 0)`} /> : null}
    </AbsoluteFill>
  );
};

const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const hl = edit.highlights.find((h) => t >= h.start && t < h.end);
  const block = edit.blocks.find((b) => t >= b.start && t < b.end);
  return (
    <AbsoluteFill>
      {edit.highlights.map((h, i) => {
        const len = Math.max(1, Math.round((h.end - h.start) * FPS));
        return (
          <Sequence key={i} from={Math.round(h.start * FPS)} durationInFrames={len + 12} layout="none">
            {GIANT.includes(h.main)
              ? <GiantGlitch main={h.main} sub={h.sub} durationInFrames={len} />
              : <Highlight main={h.main} sub={h.sub} color={HL_COLORS[i % HL_COLORS.length]} durationInFrames={len} />}
          </Sequence>
        );
      })}
      {!hl && block ? <Subtitle words={block.words} /> : null}
    </AbsoluteFill>
  );
};

// ---------- sonido: whoosh en cada corte, flash = obturador, click por destacado, ding en palabras de brillo ----------
const SFX = "sfx/";
const DING = ["súper", "brillitos", "postrecitos"];
const Sfx: React.FC = () => (
  <>
    {cutFrames.slice(1).map((f, i) => (
      <Sequence key={`c${i}`} from={Math.max(0, f - 3)} durationInFrames={20} layout="none">
        <Audio src={staticFile(`${SFX}${i % 2 ? "whip" : "whoosh"}.wav`)} volume={0.55} />
        {segFrames[i + 1].idea ? <Audio src={staticFile(`${SFX}shutter-modern.wav`)} volume={0.6} /> : null}
      </Sequence>
    ))}
    {edit.highlights.map((h, i) => (
      <Sequence key={`h${i}`} from={Math.round(h.start * FPS)} durationInFrames={45} layout="none">
        <Audio src={staticFile(`${SFX}${GIANT.includes(h.main) ? "switch" : "mouse-click"}.wav`)} volume={0.7} />
        {DING.includes(h.main) ? <Audio src={staticFile(`${SFX}ding.wav`)} volume={0.35} /> : null}
      </Sequence>
    ))}
  </>
);

export const MiVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Footage />
    <Outlines />
    <Overlay />
    <Sfx />
  </AbsoluteFill>
);

export const MyComposition = () => (
  <Composition id="MiVideo" component={MiVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
);
