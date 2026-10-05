import "./index.css";
import { MyComposition } from "./Composition";
import { ParchesComposition } from "./Parches";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <ParchesComposition />
    </>
  );
};
