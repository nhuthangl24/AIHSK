import React from "react";

export function BrandLogo({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl shadow-sm transition-transform group-hover:scale-105 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/icon.svg"
        alt="HSK Logo"
        width={size}
        height={size}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
