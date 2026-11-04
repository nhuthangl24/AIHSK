"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Mic, RotateCcw, AlertTriangle, ArrowRight, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";

const DISMISSED_KEY = "classnia_beta_notice_dismissed";

export function BetaNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    try {
      const dismissedUntil = localStorage.getItem(DISMISSED_KEY);
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
        return;
      }
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    } catch {
      // In case storage is restricted
    }
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    try {
      const duration = dontShowAgain ? 3 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISSED_KEY, (Date.now() + duration).toString());
    } catch {
      // Ignore storage errors
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="beta-notice-title"
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-5 sm:p-6 animate-in zoom-in-95 duration-150 space-y-4"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Đóng thông báo"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with official Classnia AI brand logo */}
        <div className="flex items-start gap-3 pr-8">
          <BrandLogo size={42} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 id="beta-notice-title" className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Classnia <span className="text-rose-600">AI</span>
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                Bản Thử Nghiệm (Beta)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Hướng dẫn xử lý nhanh sự cố phòng thi & luyện tập</p>
          </div>
        </div>

        {/* Intro */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Hệ thống đang mở thử nghiệm khảo thí khẩu ngữ HSKK và đối thoại tự do. Nếu gặp sự cố trong quá trình luyện tập, bạn hãy xử lý theo các bước sau:
        </p>

        {/* Actionable Troubleshooting Cards */}
        <div className="space-y-2.5 text-xs">
          {/* Issue 1: Microphone */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <Mic className="h-4 w-4" />
            </div>
            <div className="space-y-1 min-w-0">
              <strong className="text-slate-900 dark:text-slate-100 block">
                1. Micro không nhận giọng / Bị chặn quyền:
              </strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Nhấp biểu tượng ổ khóa <span className="font-semibold">🔒</span> trên thanh địa chỉ trình duyệt ➔ Chuyển Micro sang <strong className="text-rose-600 dark:text-rose-400">Cho phép (Allow)</strong> ➔ Tải lại trang (F5). Bạn cũng có thể bấm nút <strong>Gõ phím</strong> để tiếp tục bài thi.
              </p>
            </div>
          </div>

          {/* Issue 2: Reconnection & Progress preservation */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div className="space-y-1 min-w-0">
              <strong className="text-slate-900 dark:text-slate-100 block">
                2. Mạng lag hoặc phòng thi bị gián đoạn:
              </strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Hệ thống <strong>tự động lưu từng chặng nói</strong>. Bạn chỉ cần tải lại trang (F5), bài thi sẽ tiếp tục từ câu gần nhất mà không bị mất tiến trình.
              </p>
            </div>
          </div>

          {/* Issue 3: Direct link to support */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <strong className="text-amber-950 dark:text-amber-200 block">
                3. Cần kỹ thuật viên hỗ trợ hoặc báo lỗi phòng thi:
              </strong>
              <p className="text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                Gửi yêu cầu kèm thông tin phòng thi để đội ngũ kiểm tra và xử lý ngay cho bạn.
              </p>
              <Link
                href="/dashboard/support?category=BUG"
                onClick={handleClose}
                className="inline-flex items-center gap-1 font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline pt-0.5"
              >
                <span>Mở Trung tâm Báo lỗi & Hỗ trợ kỹ thuật</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Don't show again toggle */}
        <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
          />
          <span>Không hiển thị lại thông báo này trong 3 ngày tới</span>
        </label>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/dashboard/support?category=BUG"
            onClick={handleClose}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LifeBuoy className="h-3.5 w-3.5 text-rose-600" />
            <span>Báo Lỗi / Hỗ Trợ</span>
          </Link>

          <Button
            type="button"
            onClick={handleClose}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-9 px-5 rounded-xl shadow-xs"
          >
            <span>Đã hiểu, Bắt đầu luyện tập</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
