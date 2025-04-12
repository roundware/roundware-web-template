import { memo, useEffect, useRef, useState } from "react";
import ProgressRing from "./ProgressRing";
import { useDimensions } from "./hooks";
import { useLoop } from "../../useLoop";

interface AnimatedCircleProps {
  dimensions: ReturnType<typeof useDimensions>;
  mode: ReturnType<typeof useLoop>["mode"];
  startedAtTime: React.MutableRefObject<number | null>;
  duration: number;
}

const AnimatedCircle = memo(
  ({ dimensions, mode, startedAtTime, duration }: AnimatedCircleProps) => {
    const [progress, setProgress] = useState(0);
    const requestRef = useRef<number>();

    useEffect(() => {
      if (mode !== "idle" && duration) {
        const animate = () => {
          const elapsedTime = Date.now() - (startedAtTime.current || 0);
          const durationMs = duration * 1000;
          const loopProgress = (elapsedTime % durationMs) / durationMs;
          setProgress(loopProgress);
          requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);

        return () => {
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
          }
        };
      } else {
        setProgress(0);
      }
    }, [mode, duration, startedAtTime]);

    return (
      <ProgressRing
        progress={progress}
        mode={
          mode === "idle"
            ? "rehearse"
            : mode === "waiting-to-record"
            ? "rehearse"
            : mode === "recording"
            ? "recording"
            : mode === "playing-speaker"
            ? "rehearse"
            : mode === "recording-playback" || mode === "loading"
            ? "review"
            : "rehearse"
        }
      />
    );
  }
);

export default AnimatedCircle;
