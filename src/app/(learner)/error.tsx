"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, LogIn, LayoutDashboard } from "lucide-react";

export default function LearnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  const handleRetry = () => {
    setIsRetrying(true);
    try {
      reset();
    } catch {
      window.location.reload();
    } finally {
      setTimeout(() => setIsRetrying(false), 1500);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Không thể tải thông tin Bảng Điều Khiển
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        Có thể kết nối phiên học viên bị gián đoạn hoặc chuyển tab khi xử lý. Bạn có thể bấm Tải Lại để khôi phục ngay lập tức.
      </p>
      {error?.message && process.env.NODE_ENV !== "production" && (
        <p className="text-xs text-rose-500 mb-4 font-mono max-w-lg truncate bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-200">
          {error.message}
        </p>
      )}
      {error.digest && (
        <p className="text-xs text-slate-400 mb-6 font-mono">
          Digest: {error.digest}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 rounded-xl font-bold shadow-xs"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
          <span>{isRetrying ? "Đang Tải Lại..." : "Tải Lại"}</span>
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center gap-2 rounded-xl font-semibold border-slate-200 dark:border-slate-800">
            <LayoutDashboard className="h-4 w-4 text-rose-600" />
            <span>Về Bảng Điều Khiển</span>
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="ghost" className="flex items-center gap-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <LogIn className="h-4 w-4" />
            <span>Đăng Nhập Lại</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
