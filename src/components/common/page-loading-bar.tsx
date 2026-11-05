"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function PageLoadingBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [, startTransition] = useTransition();

  // Reset when route change finishes
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept anchor clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignore modified clicks (Ctrl, Cmd, Shift, Alt) or right clicks
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        e.shiftKey
      ) {
        return;
      }

      // Find closest anchor
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore hash links, javascript:, tel:, mailto:
      if (
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("tel:") ||
        href.startsWith("mailto:")
      ) {
        return;
      }

      // Ignore new tab / download
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      // Check if target is internal URL
      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Ignore external domains
        if (targetUrl.origin !== currentUrl.origin) return;

        // Ignore identical URL (including hash)
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) {
          return;
        }

        // Start loading bar immediately
        setLoading(true);
        setProgress(25);
      } catch {
        // invalid URL format, ignore
      }
    };

    // Listen to custom programmatic trigger events if any
    const handleStart = () => {
      setLoading(true);
      setProgress(25);
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
    };

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("classnia:route-start", handleStart);
    window.addEventListener("classnia:route-complete", handleComplete);

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("classnia:route-start", handleStart);
      window.removeEventListener("classnia:route-complete", handleComplete);
    };
  }, []);

  // Animate progress while loading
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev; // stall at ~88% until route mounts
        if (prev < 50) return prev + 15;
        if (prev < 75) return prev + 8;
        return prev + 3;
      });
    }, 180);

    // Safety timeout: dismiss after 9s to prevent hanging
    const timeout = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 9000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [loading]);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-200"
      style={{ opacity: loading ? 1 : 0 }}
    >
      {/* Top Gradient Progress Bar */}
      <div
        className="h-[3px] w-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 shadow-[0_0_10px_rgba(244,63,94,0.7)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
        }}
      />

      {/* Subtle Pulsing Glow Spinner in Top-Right */}
      <div className="absolute top-2 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 shadow-lg text-[11px] font-medium text-white select-none animate-fadeIn">
        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
        <span className="text-[10px] tracking-wide text-slate-200">Đang tải...</span>
      </div>
    </div>
  );
}

export function PageLoadingBar() {
  return (
    <Suspense fallback={null}>
      <PageLoadingBarInner />
    </Suspense>
  );
}
