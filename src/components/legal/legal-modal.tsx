"use client";

import { X, ExternalLink, ShieldCheck, FileText, CheckCircle2, AlertOctagon, Lock } from "lucide-react";
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
                {isTerms ? "Điều Khoản Sử Dụng Dịch Vụ (ToS)" : "Chính Sách Bảo Mật (Privacy Policy)"}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isTerms ? "Thỏa thuận dịch vụ ràng buộc · Luật Giao dịch điện tử 2023" : "Tuân thủ Nghị định 13/2023/NĐ-CP & Luật An ninh mạng"}
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
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                  <AlertOctagon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Cam Kết Pháp Lý Ràng Buộc</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                  Việc sử dụng dịch vụ đồng nghĩa với việc bạn ký kết hợp đồng dịch vụ điện tử có giá trị pháp lý theo Luật Giao dịch điện tử 2023. Hãy nắm rõ các giới hạn cốt lõi sau:
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">
                    1. Độc Lập Khảo Thí & Không Thay Thế Chứng Chỉ Quốc Tế
                  </h4>
                  <p className="text-xs">
                    Classnia AI là hệ thống công nghệ giáo dục độc lập. Kết quả chẩn đoán và điểm số ước lượng phục vụ mục đích tự rèn luyện và nghiên cứu học thuật, <strong>không có giá trị thay thế văn bằng chứng chỉ chính quy</strong> do CTI hoặc Bộ Giáo dục Trung Quốc cấp.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">
                    2. Nghiêm Cấm Tấn Công Hệ Thống & Trích Xuất Dữ Liệu
                  </h4>
                  <p className="text-xs">
                    Nghiêm cấm tuyệt đối các hành vi jailbreak prompt sư phạm, sử dụng bot cào đề thi, mô phỏng âm thanh giả lập (audio spoofing), đảo ngược mã nguồn hoặc can thiệp hạ tầng máy chủ. Mọi vi phạm sẽ bị xử lý theo Luật An ninh mạng 2018 và truy cứu trách nhiệm dân sự/hình sự.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">
                    3. Trách Nhiệm Định Danh Tài Khoản
                  </h4>
                  <p className="text-xs">
                    Mỗi tài khoản được cấp cho một cá nhân sử dụng. Người dùng chịu trách nhiệm duy nhất đối với toàn bộ hoạt động phát sinh từ tài khoản của mình và phải bảo mật tuyệt đối thông tin xác thực.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">
                    4. Bản Quyền Sở Hữu Trí Tuệ & Dữ Liệu Phát Ngôn
                  </h4>
                  <p className="text-xs">
                    Toàn bộ thuật toán, bộ đề thi, giao diện và cấu trúc chẩn đoán thuộc quyền sở hữu trí tuệ của Classnia AI. Bạn giữ quyền đối với giọng nói cá nhân và cấp quyền phân tích âm học giới hạn cho nền tảng nhằm phục vụ trả điểm bài thi.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Tuân Thủ Nghị Định 13/2023/NĐ-CP</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-900/90 dark:text-emerald-200/90">
                  Classnia AI thực thi đầy đủ 8 quyền và 3 nghĩa vụ của Chủ thể dữ liệu, bảo vệ tối đa dữ liệu nhạy cảm âm thanh và sinh trắc học giọng nói.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">
                    1. Cam Kết Không Bán Dữ Liệu & Không Huấn Luyện AI Mở
                  </h4>
                  <p className="text-xs">
                    Chúng tôi cam kết <strong>không bao giờ bán, cho thuê hoặc chuyển giao bản ghi âm giọng nói của bạn cho các bên thứ ba quảng cáo</strong>. Luồng âm thanh chỉ dùng suy luận (inference) trực tiếp và không đưa vào tập dữ liệu công khai (Zero Public Training).
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">
                    2. Tiêu Chuẩn Bảo Mật Kỹ Thuật Đa Tầng
                  </h4>
                  <p className="text-xs">
                    Âm thanh truyền tải qua micro được mã hóa trực tiếp bằng giao thức TLS 1.3 và lưu trữ máy chủ với chuẩn AES-256. Dữ liệu phân quyền độc lập theo mã người dùng duy nhất (Tenant Isolation).
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">
                    3. 8 Quyền Luật Định & Quyền Xóa Vĩnh Viễn
                  </h4>
                  <p className="text-xs">
                    Bạn có toàn quyền truy cập, xem lại, rút lại sự đồng ý hoặc yêu cầu tiêu hủy hoàn toàn bản ghi âm và tài khoản bất kỳ lúc nào qua Trung Tâm Hỗ Trợ. Thời hạn xử lý xóa bỏ vĩnh viễn không quá 72 giờ làm việc.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">
                    4. Bảo Vệ Người Học Dưới 16 Tuổi
                  </h4>
                  <p className="text-xs">
                    Người học dưới 16 tuổi tham gia thi thử cần có sự đồng thuận của cha mẹ hoặc người giám hộ hợp pháp theo Điều 20 Nghị định 13/2023/NĐ-CP.
                  </p>
                </div>
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
            <span>Đọc toàn bộ văn bản pháp lý chi tiết</span>
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
