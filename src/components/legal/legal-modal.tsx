"use client";

import { X, ExternalLink, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LegalModalProps {
  isOpen: boolean;
  type: "terms" | "privacy" | null;
  onClose: () => void;
  onAccept?: () => void;
}

export function LegalModal({ isOpen, type, onClose, onAccept }: LegalModalProps) {
  if (!isOpen || !type) return null;

  const isTerms = type === "terms";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full max-h-[88vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
              {isTerms ? <FileText className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                {isTerms ? "Điều Khoản Sử Dụng Dịch Vụ" : "Chính Sách Bảo Mật & Dữ Liệu"}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isTerms ? "Terms of Service · Classnia AI" : "Privacy Policy · Classnia AI"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {isTerms ? (
            <>
              <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs">
                <strong>Tóm tắt cốt lõi:</strong> Classnia AI là hệ thống luyện khẩu ngữ tiếng Trung độc lập, cung cấp điểm số và nhận xét học thuật phục vụ tự rèn luyện và hỗ trợ giảng dạy, không thay thế chứng chỉ pháp lý cấp bởi cơ quan khảo thí quốc gia (CTI).
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  1. Chấp Thuận Điều Khoản
                </h4>
                <p>
                  Khi đăng ký tài khoản, đăng nhập hoặc trải nghiệm các tính năng khảo thí tại Classnia AI, bạn đồng ý tuân thủ toàn bộ quy định trong bản Điều khoản này.
                </p>

                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  2. Dịch Vụ Khảo Thí Khẩu Ngữ AI
                </h4>
                <p>
                  Classnia AI ứng dụng trí tuệ nhân tạo đối thoại thời gian thực để mô phỏng kỳ thi khẩu ngữ HSK/HSKK, phân tích âm học 7 chiều và đề xuất bài luyện thích ứng.
                </p>

                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  3. Tài Khoản & Bảo Mật Định Danh
                </h4>
                <p>
                  Bạn chịu trách nhiệm bảo mật mật khẩu và tài khoản Google liên kết. Mọi hoạt động phát sinh từ tài khoản của bạn được xem là do chính bạn thực hiện.
                </p>

                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  4. Quy Tắc Sử Dụng Hợp Chuẩn
                </h4>
                <p>
                  Người dùng cam kết không tải lên các nội dung vi phạm pháp luật, ngôn từ thù địch; không sử dụng công cụ tự động khai thác trái phép dữ liệu đề thi hoặc can thiệp đảo ngược mã nguồn nền tảng.
                </p>

                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  5. Quyền Sở Hữu Trí Tuệ & Dữ Liệu Phát Ngôn
                </h4>
                <p>
                  Bản quyền mã nguồn, giao diện, bộ đề thi thuộc về Classnia AI. Học viên giữ quyền sở hữu phát ngôn cá nhân và cấp quyền hạn chế cho hệ thống phân tích nhằm mục đích trả kết quả khảo thí.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs">
                <strong>Cam kết quyền riêng tư:</strong> Chúng tôi bảo vệ tuyệt đối bản ghi âm của bạn. Dữ liệu giọng nói KHÔNG BAO GIỜ bị bán cho bên thứ ba và KHÔNG dùng để huấn luyện mô hình AI công khai khi chưa có sự đồng ý.
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  1. Dữ Liệu Chúng Tôi Thu Thập
                </h4>
                <p>
                  Bao gồm: Email, tên hiển thị, mục tiêu cấp độ HSK; file ghi âm âm thanh micro trong bài thi; dữ liệu trích xuất cao độ F0, nhịp điệu và văn bản nhận dạng tiếng Trung.
                </p>

                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  2. Mục Đích Sử Dụng Dữ Liệu
                </h4>
                <p>
                  Chỉ phục vụ việc chẩn đoán lỗi phát âm thanh điệu, tính toán điểm 7 chiều, hiển thị biểu đồ tiến bộ học tập và cung cấp phản hồi của Giám khảo AI.
                </p>

                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  3. Tiêu Chuẩn Bảo Mật & Mã Hóa
                </h4>
                <p>
                  Dữ liệu truyền tải được mã hóa TLS 1.3 và lưu trữ an toàn với cơ chế phân quyền bảo mật nghiêm ngặt. Chỉ bạn và giảng viên phụ trách lớp học của bạn mới có quyền xem báo cáo chi tiết.
                </p>

                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  4. Quyền Yêu Cầu Xóa Dữ Liệu
                </h4>
                <p>
                  Bạn có toàn quyền xóa lịch sử khảo thí, từng bản ghi âm bài nói hoặc yêu cầu hủy vĩnh viễn tài khoản trong mục Hồ sơ & Cài đặt.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-3">
          <Link
            href={isTerms ? "/terms" : "/privacy"}
            target="_blank"
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1.5"
          >
            <span>Đọc toàn bộ văn bản chi tiết</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <div className="flex items-center gap-2">
            {onAccept && (
              <Button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 rounded-xl font-bold flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Tôi đồng ý</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs h-9 rounded-xl"
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
