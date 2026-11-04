"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, MessageSquare } from "lucide-react";
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
      const timer = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(timer);
    } catch {
      // In case storage is unavailable
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 animate-in zoom-in-95 duration-150 space-y-4"
      >
        {/* Close icon */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Đóng"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with official Classnia AI brand logo */}
        <div className="flex items-center gap-3">
          <BrandLogo size={42} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Classnia <span className="text-rose-600">AI</span>
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                Bản thử nghiệm
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Khảo thí khẩu ngữ tiếng Trung chuẩn HSK</p>
          </div>
        </div>

        {/* Content body */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Chào mừng bạn đến với phiên bản thử nghiệm của <strong>Classnia AI</strong>. Bạn có thể thi thử mô phỏng 5 chặng thi nói HSKK hoặc luyện tập đối thoại tự do cùng Giám khảo AI.
          </p>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              💡 Lưu ý thiết bị:
            </p>
            <p>
              Vui lòng cấp quyền micro cho trình duyệt. Nếu gặp sự cố âm thanh hoặc nhận diện câu trả lời, hãy gửi phản hồi để đội ngũ hỗ trợ xử lý ngay.
            </p>
          </div>
        </div>

        {/* Don't show again toggle */}
        <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
          />
          <span>Không hiển thị lại trong 3 ngày tới</span>
        </label>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/dashboard/support"
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Gửi báo lỗi / Góp ý</span>
          </Link>

          <Button
            type="button"
            onClick={handleClose}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-9 px-4 rounded-xl shadow-xs"
          >
            <span>Bắt đầu luyện tập</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
