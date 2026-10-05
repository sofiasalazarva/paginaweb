import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Composition,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import edit from "./data/edit.json";
import { GiantGlitch, Highlight, Subtitle } from "./components";

const FPS = edit.fps;


// estilo.md §7: dos encuadres que alternan con salto seco (ancho / acercado)
const ZOOMS = [1.0, 1.2];
const HL_COLORS = ["#FFF8C8", "#FFFFFF", "#F8B8C8"];
const IDEA_GAP = 1.0; // pausa original (s) a partir de la cual se considera cambio de idea -> flash B/N
const OUTLINE = ["BIRTHDAY", "súper", "delicioso.", "me encantó."]; // momentos importantes con contorno blanco
const GIANT = ["BIRTHDAY", "súper", "delicioso."]; // palabras gigantes con glitch

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
