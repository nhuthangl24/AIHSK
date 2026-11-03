"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, LogIn } from "lucide-react";

export default function LearnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Không thể tải thông tin Bảng Điều Khiển
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        Có thể kết nối phiên học viên bị gián đoạn hoặc phiên làm việc cần được làm mới.
      </p>
      {error.digest && (
        <p className="text-xs text-slate-400 mb-6 font-mono">
          Digest: {error.digest}
        </p>
      )}
      <div className="flex gap-3">
        <Button
          onClick={() => reset()}
          className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Tải Lại</span>
        </Button>
        <Link href="/login">
          <Button variant="outline" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            <span>Đăng Nhập Lại</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
