import React from "react";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="relative flex flex-col items-center">
        {/* Pulsing Glow Aura */}
        <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse" />

        {/* Center Card with Logo & Spinner */}
        <div className="relative p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            {/* Rotating SVG Ring */}
            <div className="absolute -inset-2.5 rounded-2xl border-2 border-rose-500/20 border-t-rose-600 animate-spin" />
            <BrandLogo size={48} className="rounded-2xl" />
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
              Đang tải trang...
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Classnia AI &bull; Khảo thí khẩu ngữ HSK
            </span>
          </div>

          {/* Mini Linear Shimmer Bar */}
          <div className="w-28 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
