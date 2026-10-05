import { Video } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  Composition,
  Sequence,
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

const segFrames = edit.segments.map((s) => ({
  from: Math.round(s.from * FPS),
  len: Math.max(1, Math.round((s.to - s.from) * FPS)),
}));
export const TOTAL_FRAMES = segFrames.reduce((a, s) => a + s.len, 0);

const Footage: React.FC = () => {
  let at = 0;
  return (
    <>
      {segFrames.map((s, i) => {
        const start = at;
        at += s.len;
        return (
          <Sequence key={i} from={start} durationInFrames={s.len} name={`Corte ${i + 1}`}>
            <AbsoluteFill style={{ transform: `scale(${ZOOMS[i % ZOOMS.length]})`, transformOrigin: "50% 38%" }}>
              <Video src={staticFile("mi-video.mp4")} trimBefore={s.from} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </>
  );
};

const Subtitle: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute", top: 190, left: 190, width: 700, textAlign: "center",
      fontFamily: "Playfair, serif", fontWeight: 500, fontSize: 46, lineHeight: 1.18, color: "#000",
    }}
  >
    {text}
  </div>
);

const Highlight: React.FC<{ main: string; sub: string; color: string; durationInFrames: number }> = ({
  main, sub, color, durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 220 }, durationInFrames: 10 });
  const out = Math.min(1, Math.max(0, (durationInFrames - frame) / 3));
  const size = Math.min(170, 900 / (Math.max(main.length, sub.length * 0.9) * 0.66));
  const shadow = "0 3px 14px rgba(60,35,30,0.45), 0 0 2px rgba(60,35,30,0.5)";
  return (
    <div
      style={{
        position: "absolute", top: 190, left: 0, width: 1080, textAlign: "center",
        fontFamily: "MontserratBlack, sans-serif", fontWeight: 900, color, textShadow: shadow,
        opacity: Math.min(1, pop * 1.5) * out, transform: `scale(${0.8 + 0.2 * pop})`, lineHeight: 1.05,
      }}
    >
      <div style={{ fontSize: size }}>{main}</div>
      {sub ? <div style={{ fontSize: size * 0.5 }}>{sub}</div> : null}
    </div>
  );
};

const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const hl = edit.highlights.find((h) => t >= h.start && t < h.end);
  const block = edit.blocks.find((b) => t >= b.start && t < b.end);
  return (
    <AbsoluteFill>
      {edit.highlights.map((h, i) => (
        <Sequence key={i} from={Math.round(h.start * FPS)} durationInFrames={Math.max(1, Math.round((h.end - h.start) * FPS))} layout="none">
          <Highlight main={h.main} sub={h.sub} color={HL_COLORS[i % HL_COLORS.length]} durationInFrames={Math.round((h.end - h.start) * FPS)} />
        </Sequence>
      ))}
      {!hl && block ? <Subtitle text={block.text} /> : null}
    </AbsoluteFill>
  );
};

export const MiVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Footage />
    <Overlay />
  </AbsoluteFill>
);

export const MyComposition = () => (
  <Composition id="MiVideo" component={MiVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
);
