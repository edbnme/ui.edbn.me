"use client";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { HTMLMotionProps, motion } from "motion/react";

export const GRADIENT_ANGLES = {
  top: 0,
  right: 90,
  bottom: 180,
  left: 270,
};

export type ProgressiveBlurProps = {
  direction?: keyof typeof GRADIENT_ANGLES;
  blurLayers?: number;
  className?: string;
  blurIntensity?: number;
} & HTMLMotionProps<"div">;

export const ProgressiveBlur = memo(function ProgressiveBlur({
  direction = "bottom",
  blurLayers = 8,
  className,
  blurIntensity = 0.25,
  ...props
}: ProgressiveBlurProps) {
  const layers = Math.max(blurLayers, 2);
  const segmentSize = 1 / (blurLayers + 1);
  const angle = GRADIENT_ANGLES[direction];

  // Memoize layer styles to prevent recreating objects on every render
  const layerStyles = useMemo(() => {
    return Array.from({ length: layers }).map((_, index) => {
      const gradientStops = [
        index * segmentSize,
        (index + 1) * segmentSize,
        (index + 2) * segmentSize,
        (index + 3) * segmentSize,
      ].map(
        (pos, posIndex) =>
          `rgba(255, 255, 255, ${posIndex === 1 || posIndex === 2 ? 1 : 0}) ${
            pos * 100
          }%`,
      );

      const gradient = `linear-gradient(${angle}deg, ${gradientStops.join(
        ", ",
      )})`;

      return {
        maskImage: gradient,
        WebkitMaskImage: gradient,
        backdropFilter: `blur(${index * blurIntensity}px)`,
        WebkitBackdropFilter: `blur(${index * blurIntensity}px)`,
      };
    });
  }, [layers, segmentSize, angle, blurIntensity]);

  return (
    <div className={cn("relative", className)}>
      {layerStyles.map((style, index) => (
        <motion.div
          key={index}
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={style}
          {...props}
        />
      ))}
    </div>
  );
});
