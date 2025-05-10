import { useMemo } from "react";

export const useDimensions = () => {
  return useMemo(() => {
    const size = 306;
    const strokeWidth = 2;
    const thumbSize = 11;
    const maxStrokeWidth = 16; // maximum stroke width during recording
    const padding = Math.max(thumbSize / 2, maxStrokeWidth / 2);
    const svgSize = size + padding * 2;
    const radius = (size - maxStrokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const thumbRadius = radius + strokeWidth / 2;

    return {
      size,
      strokeWidth,
      thumbSize,
      padding,
      svgSize,
      radius,
      circumference,
      thumbRadius,
    };
  }, []);
};
