import { Audio } from "@remotion/media";
import {
  AbsoluteFill, Composition, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import edit from "./data/edit2.json";
import { FPS, GiantGlitch, Highlight, Subtitle } from "./components";

// Los clips originales están grabados en espejo (cámara frontal): se voltean horizontalmente para que el texto se lea bien.
// Voz = IMG_3959 (public/p-voz.mp4). Los clips superpuestos (video.mov = p-unbox, IMG_3955 = p-makeup) van sin sonido.
const ZOOMS = [1.0, 1.1];
const HL_COLORS = ["#FFF8C8", "#FFFFFF", "#F8B8C8"];
const GIANT = ["19 dólares"];
const CLIPS: Record<string, string> = { unbox: "p-unbox.mp4", makeup: "p-makeup.mp4" };

const segFrames = edit.segments.map((s) => ({
  from: Math.round(s.from * FPS), len: Math.max(1, Math.round((s.to - s.from) * FPS)),
}));
export const PARCHES_FRAMES = segFrames.reduce((a, s) => a + s.len, 0);
const cutFrames = (() => { let at = 0; return segFrames.map((s) => { const f = at; at += s.len; return f; }); })();

const Voice: React.FC = () => (
  <>
    {segFrames.map((s, i) => (
      <Sequence key={i} from={cutFrames[i]} durationInFrames={s.len} name={`Corte ${i + 1}`}>
        <AbsoluteFill style={{ transform: `scale(${-ZOOMS[i % ZOOMS.length]}, ${ZOOMS[i % ZOOMS.length]})`, transformOrigin: "50% 35%" }}>
          <OffthreadVideo src={staticFile("p-voz.mp4")} trimBefore={s.from} />
        </AbsoluteFill>
      </Sequence>
    ))}
  </>
);

// Vídeo superpuesto: tarjeta redondeada con borde blanco en la mitad inferior; la cara y la voz siguen
const Card: React.FC<{ clip: string; clipStart: number; durationInFrames: number }> = ({ clip, clipStart, durationInFrames }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 16, stiffness: 190 }, durationInFrames: 12 });
  const out = interpolate(f, [durationInFrames - 4, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <div
      style={{
        position: "absolute", left: 100, top: 1180, width: 880, height: 680, borderRadius: 44, overflow: "hidden",
        border: "8px solid #fff", boxShadow: "0 14px 40px rgba(0,0,0,0.4)", background: "#000",
        opacity: Math.min(1, pop * 1.4) * out, transform: `translateY(${(1 - pop) * 60}px) scale(${0.92 + 0.08 * pop})`,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: -470, width: 880, height: 1564, transform: "scaleX(-1)" }}>
        <OffthreadVideo src={staticFile(CLIPS[clip])} trimBefore={Math.round(clipStart * FPS)} volume={0} muted style={{ width: 880, height: 1564, objectFit: "cover" }} />
      </div>
    </div>
  );
};

const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const hl = edit.highlights.find((h) => t >= h.start && t < h.end);
  const block = edit.blocks.find((b) => t >= b.start && t < b.end);
  const card = edit.overlays.some((o) => t >= o.start && t < o.end);
  return (
    <AbsoluteFill>
      {edit.overlays.map((o, i) => (
        <Sequence key={`o${i}`} from={Math.round(o.start * FPS)} durationInFrames={Math.round((o.end - o.start) * FPS)} layout="none">
          <Card clip={o.clip} clipStart={o.clipStart} durationInFrames={Math.round((o.end - o.start) * FPS)} />
        </Sequence>
      ))}
      {edit.highlights.map((h, i) => {
        const len = Math.max(1, Math.round((h.end - h.start) * FPS));
        return (
          <Sequence key={`h${i}`} from={Math.round(h.start * FPS)} durationInFrames={len + 12} layout="none">
            {GIANT.includes(h.main)
              ? <GiantGlitch main={h.main.split(" ")[0]} sub={h.main.split(" ").slice(1).join(" ")} durationInFrames={len} />
              : <Highlight main={h.main} sub={h.sub} color={HL_COLORS[i % HL_COLORS.length]} durationInFrames={len} />}
          </Sequence>
        );
      })}
      {!hl && block ? <Subtitle words={block.words} top={card ? 1035 : 1180} /> : null}
    </AbsoluteFill>
  );
};

const Sfx: React.FC = () => (
  <>
    {cutFrames.slice(1).map((f, i) => (
      <Sequence key={`c${i}`} from={Math.max(0, f - 3)} durationInFrames={14} layout="none">
        <Audio src={staticFile(`sfx/${i % 2 ? "whip" : "whoosh"}.wav`)} volume={0.35} />
      </Sequence>
    ))}
    {edit.overlays.map((o, i) => (
      <Sequence key={`o${i}`} from={Math.round(o.start * FPS)} durationInFrames={14} layout="none">
        <Audio src={staticFile("sfx/page-turn.wav")} volume={0.5} />
      </Sequence>
    ))}
    {edit.highlights.map((h, i) => (
      <Sequence key={`h${i}`} from={Math.round(h.start * FPS)} durationInFrames={45} layout="none">
        <Audio src={staticFile(`sfx/${GIANT.includes(h.main) ? "switch" : "mouse-click"}.wav`)} volume={0.7} />
        {GIANT.includes(h.main) ? <Audio src={staticFile("sfx/ding.wav")} volume={0.35} /> : null}
      </Sequence>
    ))}
  </>
);

export const Parches: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Voice />
    <Overlay />
    <Sfx />
  </AbsoluteFill>
);

export const ParchesComposition = () => (
  <Composition id="Parches" component={Parches} durationInFrames={PARCHES_FRAMES} fps={FPS} width={1080} height={1920} />
);
