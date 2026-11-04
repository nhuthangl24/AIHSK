"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, CheckCircle2, Sparkles, ArrowRight, Mic, ShieldCheck } from "lucide-react";

export default function SubscriptionPage() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto pb-16 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="success" className="text-xs font-bold">
            Chính Sách Ưu Đãi Học Viên
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Chương Trình 200 Credit Khảo Thí
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Hiện tại hệ thống chưa yêu cầu mua gói trả phí. Mọi tài khoản đăng ký đều được cấp sẵn 200 Credit để trải nghiệm trọn vẹn toàn bộ tính năng khảo thí.
        </p>
      </div>

      {/* Main Credit Feature Card */}
      <Card className="rounded-3xl border-amber-200/90 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white dark:from-amber-950/30 dark:via-orange-950/20 dark:to-slate-900 shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200/60 dark:border-amber-900/50">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-amber-600" />
                <span>Số Dư Khả Dụng Của Bạn</span>
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl sm:text-5xl font-black text-amber-950 dark:text-amber-100">
                  200
                </span>
                <span className="text-base sm:text-lg font-bold text-amber-800/80 dark:text-amber-400">
                  / 200 Credits
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/80">
                <CheckCircle2 className="h-3.5 w-3.5" /> 100% Đang Kích Hoạt
              </span>
              <p className="text-xs text-slate-500 mt-1.5">Áp dụng cho mọi bài thi HSK & Khẩu ngữ</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rose-600" />
              <span>Đặc Quyền Sử Dụng Với 200 Credit Khảo Thí:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                "Trò chuyện phỏng vấn trực tiếp 5 giai đoạn cùng Giám khảo AI",
                "Chẩn đoán biến điệu thanh ba (三声变调) & ngữ điệu âm học",
                "Nhận báo cáo tâm trắc học đa chiều trên 7 chiều kích chuẩn hóa",
                "Phân tích sửa lỗi ngữ pháp & nâng cấp từ vựng trang trọng",
                "Lưu trữ file âm thanh ghi âm & nghe lại không giới hạn",
                "Lộ trình 4 tuần cá nhân hóa theo điểm mạnh & điểm yếu",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-amber-200/60 dark:border-amber-900/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Không cần khai báo thẻ tín dụng hay cam kết thanh toán</span>
            </div>

            <Link href="/dashboard/assessments" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-11 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm">
                <Mic className="h-4 w-4" />
                <span>Bắt Đầu Khảo Thí Ngay</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
