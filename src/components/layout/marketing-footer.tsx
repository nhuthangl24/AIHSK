import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/50 py-12 dark:border-slate-800 dark:bg-slate-950/50 transition-colors">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <BrandLogo size={32} />
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Classnia <span className="text-rose-600">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Nền tảng đánh giá năng lực khẩu ngữ tiếng Trung chuẩn hóa ứng dụng trí tuệ nhân tạo. Thực hiện các buổi phỏng vấn giao tiếp tự nhiên trọn vẹn và nhận báo cáo chẩn đoán ngôn ngữ học chuyên sâu.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Phân tích toàn diện hội thoại &bull; Chấm điểm dựa trên bằng chứng</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Sản Phẩm</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/features" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Giám Khảo AI
                </Link>
              </li>
              <li>
                <Link href="/features#scoring" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Thang Điểm 7 Chiều
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Gói Dịch Vụ
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Cổng Tổ Chức Đào Tạo
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Khảo Thí</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/about" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Quy Chuẩn Thi Nói
                </Link>
              </li>
              <li>
                <Link href="/about#cefr-hsk" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Chuẩn Khung CEFR & HSK
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Chẩn Đoán Phát Âm & Biến Điệu
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Chính Sách & Pháp Lý</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/privacy" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Chính Sách Bảo Mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Điều Khoản Dịch Vụ
                </Link>
              </li>
              <li>
                <Link href="/privacy#voice-data" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Lưu Trữ Dữ Liệu Âm Thanh
                </Link>
              </li>
              <li>
                <Link href="/about#disclaimer" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Tuyên Bố Miễn Trừ Trách Nhiệm
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="max-w-2xl leading-relaxed text-center md:text-left">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Lưu ý:</span> Classnia AI cung cấp kết quả chẩn đoán và ước tính giáo dục đối chiếu theo chuẩn CEFR và HSK. Classnia AI là hệ thống độc lập, không liên kết hay đại diện chính thức cho cơ quan khảo thí HSK (CTI) hoặc Bộ Giáo dục Trung Quốc.
          </p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>&copy; {new Date().getFullYear()} Classnia AI. Bảo lưu mọi quyền.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
