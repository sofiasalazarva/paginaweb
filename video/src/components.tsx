import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

export const FPS = 30;
export const rand = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

loadFont({ family: "Playfair", url: staticFile("fonts/playfair-display-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: "MontserratBlack", url: staticFile("fonts/montserrat-latin-900-normal.woff2"), weight: "900" });

// ---------- subtítulos: blanco, palabra activa en amarillo suave ----------
export const Subtitle: React.FC<{ words: { t: string; s: number; e: number }[]; top?: number }> = ({ words, top = 1080 }) => {
  const t = useCurrentFrame() / FPS;
  const active = words.findLastIndex((w) => t >= w.s);
  return (
    <div
      style={{
        position: "absolute", top, left: 170, width: 740, textAlign: "center",
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
export const Highlight: React.FC<{ main: string; sub: string; color: string; durationInFrames: number }> = ({
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
export const GiantGlitch: React.FC<{ main: string; sub: string; durationInFrames: number }> = ({ main, sub, durationInFrames }) => {
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

