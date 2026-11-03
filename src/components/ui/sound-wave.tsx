"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SoundWaveProps {
  isActive: boolean;
  color?: "cinnabar" | "jade" | "blue";
  size?: "sm" | "md" | "lg";
}

export function SoundWave({ isActive, color = "cinnabar", size = "md" }: SoundWaveProps) {
  const barClass =
    color === "cinnabar"
      ? "bg-rose-500"
      : color === "jade"
      ? "bg-emerald-500"
      : "bg-blue-500";

  const heightClasses =
    size === "sm"
      ? ["h-3", "h-5", "h-2", "h-4", "h-3"]
      : size === "lg"
      ? ["h-8", "h-14", "h-6", "h-12", "h-10"]
      : ["h-5", "h-9", "h-4", "h-8", "h-6"];

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 px-2" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((idx) => (
        <span
          key={idx}
          className={cn(
            "w-1.5 rounded-full transition-all duration-300",
            barClass,
            isActive ? `animate-voice-bar-${idx}` : "h-1.5 opacity-30"
          )}
        />
      ))}
    </div>
  );
}
