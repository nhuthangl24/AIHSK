"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center mb-6 text-rose-600 dark:text-rose-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
        Đã xảy ra sự cố kết nối
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        Hệ thống đang tải lại phiên làm việc hoặc phiên đăng nhập đã hết hạn. Vui lòng bấm thử lại hoặc đăng nhập lại.
      </p>
      {error.digest && (
        <p className="text-xs text-slate-400 mb-6 font-mono">
          Mã sự cố (Digest): {error.digest}
        </p>
      )}
      <div className="flex gap-3">
        <Button
          onClick={() => reset()}
          className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Thử Lại</span>
        </Button>
        <Link href="/login">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Đăng Nhập</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
