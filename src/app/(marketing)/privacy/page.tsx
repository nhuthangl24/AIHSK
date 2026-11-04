import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mic,
  Database,
  Trash2,
  UserCheck,
  ArrowRight,
  AlertTriangle,
  Scale,
  FileCheck2,
  Server,
  EyeOff,
  Clock,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Chính Sách Bảo Mật & Bảo Vệ Dữ Liệu Cá Nhân",
  description:
    "Chính sách bảo mật toàn diện tuân thủ Nghị định 13/2023/NĐ-CP, quy chế bảo vệ âm thanh giọng nói và quyền riêng tư tại Classnia AI.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Chính Sách Bảo Mật & Bảo Vệ Dữ Liệu Cá Nhân | Classnia AI",
    description: "Chính sách bảo vệ dữ liệu cá nhân, âm thanh giọng nói và quyền riêng tư người học tại Classnia AI.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Header */}
        <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cinnabar">Bảo Mật & Pháp Lý</Badge>
            <span className="text-xs text-slate-500 font-medium">
              Tuân thủ Nghị định 13/2023/NĐ-CP · Cập nhật: Tháng 11/2026
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Chính Sách Bảo Mật & Bảo Vệ Dữ Liệu Cá Nhân
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Tại <strong>Classnia AI</strong> (trực thuộc hệ sinh thái Classnia), chúng tôi cam kết bảo vệ dữ liệu cá nhân, âm thanh giọng nói và quyền riêng tư số của người học ở mức cao nhất. Bản Chính sách này cấu thành thỏa thuận pháp lý ràng buộc giữa Bên Xử lý Dữ liệu (Classnia AI) và Chủ thể Dữ liệu (Người dùng), được thiết lập phù hợp với pháp luật Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
          </p>
        </div>

        {/* 4 Core Legal Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Không Bán Dữ Liệu</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90">
              Tuyệt đối không bán, cho thuê hay thương mại hóa bản ghi âm của người học cho bên thứ ba.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-rose-900 dark:text-rose-300">
              <Lock className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Mã Hóa Đa Tầng</span>
            </div>
            <p className="text-[11px] text-rose-800 dark:text-rose-300/90">
              Mã hóa luồng âm thanh TLS 1.3 thời gian thực và bảo vệ dữ liệu lưu trữ AES-256.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-sky-900 dark:text-sky-300">
              <Scale className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>Chuẩn Nghị Định 13</span>
            </div>
            <p className="text-[11px] text-sky-800 dark:text-sky-300/90">
              Thực thi đầy đủ 8 quyền của Chủ thể Dữ liệu cá nhân theo quy định Chính phủ Việt Nam.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-900 dark:text-indigo-300">
              <Trash2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Quyền Xóa Vĩnh Viễn</span>
            </div>
            <p className="text-[11px] text-indigo-800 dark:text-indigo-300/90">
              Người học có quyền yêu cầu xóa bỏ hoàn toàn tệp âm thanh và tài khoản bất kỳ lúc nào.
            </p>
          </div>
        </div>

        {/* Section 1: Căn Cứ Pháp Lý & Định Nghĩa */}
        <section id="section-1" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Căn Cứ Pháp Lý & Giải Thích Từ Ngữ
            </h2>
          </div>
          <p>
            Chính sách Bảo mật này được xây dựng và điều chỉnh căn cứ theo:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Nghị định số 13/2023/NĐ-CP</strong> ngày 17/04/2023 của Chính phủ về Bảo vệ dữ liệu cá nhân.</li>
            <li><strong>Luật An toàn thông tin mạng số 86/2015/QH13</strong> và <strong>Luật An ninh mạng số 24/2018/QH14</strong>.</li>
            <li><strong>Luật Giao dịch điện tử số 20/2023/QH15</strong> và các văn bản hướng dẫn thi hành hiện hành.</li>
          </ul>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <p><strong>Bên Kiểm soát & Xử lý Dữ liệu:</strong> Ban quản trị Classnia AI (Nền tảng khảo thí khẩu ngữ tiếng Trung AI trực thuộc Classnia).</p>
            <p><strong>Chủ thể Dữ liệu:</strong> Thí sinh, học viên, giáo viên hoặc bất kỳ cá nhân nào khởi tạo tài khoản và tương tác phòng thi trên hệ thống.</p>
            <p><strong>Dữ liệu cá nhân cơ bản:</strong> Họ tên, email, hình ảnh đại diện, lịch sử học tập.</p>
            <p><strong>Dữ liệu cá nhân nhạy cảm:</strong> Đặc trưng giọng nói âm học (tần số F0, thanh điệu) và bản ghi âm phát ngôn qua micro.</p>
          </div>
        </section>

        {/* Section 2: Dữ Liệu Thu Thập */}
        <section id="section-2" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Phân Loại Dữ Liệu Thu Thập & Phương Thức Thu Thập
            </h2>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <strong className="text-slate-900 dark:text-white block mb-1">
                a. Dữ liệu định danh & Tài khoản (Account Data):
              </strong>
              Họ tên, địa chỉ thư điện tử (email), mã định danh người dùng (User ID), ảnh đại diện (avatar đồng bộ qua Google/Firebase SSO), mục tiêu HSK (HSK 1 - HSK 6) và ngôn ngữ mẹ đẻ đã khai báo.
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <strong className="text-slate-900 dark:text-white block mb-1">
                b. Dữ liệu âm thanh phát ngôn (Voice Audio Data):
              </strong>
              Tín hiệu sóng âm thu qua micro khi người học nhấn nút phát biểu trong 5 chặng bài thi hoặc phòng Trò chuyện tự do, văn bản chuyển ngữ (Transcript), dấu thời gian từng câu trả lời và phản hồi của Giám khảo AI.
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <strong className="text-slate-900 dark:text-white block mb-1">
                c. Chỉ số trích xuất âm học tính toán (Acoustic Metrics):
              </strong>
              Đường nét cao độ F0 (Pitch Contour), thời lượng âm tiết (Syllable Duration), tốc độ nói (âm tiết/giây), khoảng ngừng ngắt hơi và đặc trưng biến điệu (thanh 3, thanh nhẹ, chữ 不, 一). Dữ liệu này chỉ tồn tại dưới dạng tham số toán học tính toán, không chứa thông tin đời tư.
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <strong className="text-slate-900 dark:text-white block mb-1">
                d. Dữ liệu kỹ thuật & Nhật ký chẩn đoán (Technical Logs):
              </strong>
              Địa chỉ IP (được băm mã hóa một chiều để phòng vệ tấn công mạng), loại trình duyệt, hệ điều hành (macOS, Windows, Android, iOS), độ phân giải màn hình và cấu hình thiết bị đính kèm trong các phiếu báo lỗi (Support Tickets).
            </div>
          </div>
        </section>

        {/* Section 3: Quy Định Về Dữ Liệu Giọng Nói */}
        <section id="voice-data" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Quy Chế Nghiêm Ngặt Về Bảo Vệ Dữ Liệu Âm Thanh Giọng Nói
            </h2>
          </div>
          <p>
            Nhận thức rõ giọng nói là dữ liệu sinh trắc học cá nhân nhạy cảm, Classnia AI áp dụng các nguyên tắc bảo mật chặt chẽ:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-1">
              <strong className="block font-bold">1. Quyền cấp phép Micro có điều kiện:</strong>
              Hệ thống chỉ thu âm khi người học chủ động nhấn nút ghi âm hoặc cho phép quyền Micro trên trình duyệt. Trình duyệt luôn hiển thị chấm đỏ báo hiệu thiết bị ghi âm đang hoạt động. Bạn có thể thu hồi quyền Micro bất cứ lúc nào trong cài đặt bảo mật trình duyệt.
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="block font-bold text-slate-900 dark:text-white">2. Nguyên tắc Không Huấn Luyện AI Công Khai (Zero Public LLM Training):</strong>
              Classnia AI cam kết KHÔNG sử dụng bản ghi âm giọng nói của người học để làm dữ liệu huấn luyện cho các mô hình AI mở thương mại hoặc chuyển giao cho các công ty quảng cáo. Luồng xử lý ngôn ngữ thực hiện theo chính sách Zero Data Retention.
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="block font-bold text-slate-900 dark:text-white">3. Phân lập dữ liệu đa tầng (Tenant & User Scoping):</strong>
              Mọi tệp âm thanh và biên bản hội thoại được gán mã định danh duy nhất (UUID), phân quyền nghiêm ngặt theo tài khoản cá nhân. Không một người dùng nào khác trong hệ thống có thể nghe trộm hoặc tải về bản thu âm của bạn.
            </div>
          </div>
        </section>

        {/* Section 4: Mục Đích Xử Lý */}
        <section id="section-4" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              4
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Mục Đích Xử Lý Dữ Liệu Hợp Pháp
            </h2>
          </div>
          <p>Dữ liệu chỉ được xử lý trong phạm vi các mục đích đã được người dùng đồng thuận:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">1. Vận hành phỏng vấn trực tiếp:</strong>
              Tạo phản hồi âm thanh và câu hỏi tiếp nối của Giám khảo AI phù hợp với cấp độ phản xạ của thí sinh.
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">2. Chẩn đoán ngôn ngữ học 7 chiều:</strong>
              Đánh giá Phát âm, Độ trôi chảy, Ngữ pháp, Từ vựng, Mạch lạc, Nghe hiểu và Tương tác đàm thoại có trích dẫn nguyên văn bằng chứng.
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">3. Theo dõi tiến độ cá nhân hóa:</strong>
              Tổng hợp biểu đồ tiến độ học tập, biểu đồ phân bổ thời lượng nói và lịch sử các bài khảo thí.
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">4. Bảo đảm an toàn hệ thống & phòng chống gian lận:</strong>
              Ngăn ngừa các hành vi sử dụng bot, crawler tự động hoặc spam tài nguyên làm nghẽn hạ tầng thử nghiệm cộng đồng.
            </div>
          </div>
        </section>

        {/* Section 5: Quyền Của Người Dùng Theo Nghị Định 13 */}
        <section id="section-5" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              5
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Quyền Hạn Của Chủ Thể Dữ Liệu Theo Nghị Định 13/2023/NĐ-CP
            </h2>
          </div>
          <p>
            Chủ thể dữ liệu có đầy đủ các quyền luật định sau đây và có thể thực thi bất kỳ lúc nào:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5 font-bold">1. Quyền được biết & Quyền đồng ý:</strong>
              Biết rõ mục đích, phương thức thu thập và có toàn quyền từ chối cung cấp dữ liệu.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5 font-bold">2. Quyền truy cập & Xuất dữ liệu:</strong>
              Xem lại toàn bộ báo cáo, tải về bản PDF kết quả chẩn đoán và nghe lại các câu trả lời.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5 font-bold">3. Quyền rút lại sự đồng ý:</strong>
              Thu hồi quyền sử dụng dữ liệu bất kỳ thời điểm nào thông qua cài đặt tài khoản.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5 font-bold">4. Quyền yêu cầu xóa vĩnh viễn:</strong>
              Yêu cầu hủy hoàn toàn tài khoản và xóa sạch tệp âm thanh câu trả lời khỏi hệ thống máy chủ.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5 font-bold">5. Quyền chỉnh sửa thông tin:</strong>
              Cập nhật họ tên, mật khẩu, mục tiêu HSK trong mục Hồ Sơ & Mục Tiêu.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-0.5 font-bold">6. Quyền khiếu nại & Bồi thường:</strong>
              Khiếu nại trực tiếp tới Bộ phận DPO của Classnia AI hoặc cơ quan bảo vệ dữ liệu có thẩm quyền nếu phát hiện vi phạm.
            </div>
          </div>
        </section>

        {/* Section 6: Thời Gian Lưu Trữ & Tiêu Hủy */}
        <section id="section-6" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              6
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Thời Hạn Lưu Trữ Dữ Liệu & Quy Trình Tiêu Hủy An Toàn
            </h2>
          </div>
          <p>
            Dữ liệu được lưu trữ trong thời gian tối thiểu cần thiết để đáp ứng mục đích học tập của người học hoặc theo quy định lưu trữ nhật ký an ninh mạng:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>Tệp ghi âm câu trả lời:</strong> Lưu trữ trong suốt thời gian tài khoản hoạt động để người học nghe lại và so sánh sự tiến bộ. Nếu tài khoản không phát sinh hoạt động trong 12 tháng liên tục, hệ thống sẽ gửi thông báo trước khi tiến hành xóa dọn tự động.</li>
            <li><strong>Nhật ký bảo mật hệ thống:</strong> Lưu trữ tối đa 12 tháng theo quy định tại Luật An ninh mạng để phục vụ giám sát và phòng chống mã độc, sau đó tự động hủy.</li>
            <li><strong>Phương thức tiêu hủy:</strong> Ghi đè dữ liệu số (secure wipe) trên máy chủ lưu trữ đám mây, xóa vĩnh viễn khóa liên kết giải mã mà không thể khôi phục.</li>
          </ul>
        </section>

        {/* Section 7: Bên Thứ Ba & Lưu Trữ Đám Mây */}
        <section id="section-7" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              7
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Bên Thứ Ba & Hạ Tầng Lưu Trữ Đám Mây Đạt Tiêu Chuẩn Quốc Tế
            </h2>
          </div>
          <p>
            Để bảo đảm độ sẵn sàng và độ an toàn cao, chúng tôi hợp tác với các nhà cung cấp hạ tầng công nghệ hàng đầu đạt chứng chỉ an ninh thông tin ISO/IEC 27001 và SOC 2 Type II:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>Google Cloud Platform & Firebase:</strong> Xác thực danh tính người dùng an toàn (Google SSO) và cơ sở dữ liệu phân tán chuẩn bảo mật cao.</li>
            <li><strong>Máy chủ ứng dụng máy học chuyên dụng:</strong> Xử lý âm học ngữ âm Pinyin và tính toán cao độ thời gian thực với đường truyền mạng riêng biệt có tường lửa WAF.</li>
            <li>Các đối tác hạ tầng cam kết tuân thủ nghĩa vụ bảo mật nghiêm ngặt và không được phép sử dụng dữ liệu người học cho bất kỳ mục đích nào ngoài phạm vi hợp đồng ủy thác.</li>
          </ul>
        </section>

        {/* Section 8: Bảo Vệ Người Chưa Thành Niên */}
        <section id="section-8" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              8
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Bảo Vệ Quyền Riêng Tư Của Trẻ Em & Người Dưới 16 Tuổi
            </h2>
          </div>
          <p>
            Classnia AI đặc biệt coi trọng việc bảo vệ dữ liệu cá nhân của người học dưới 16 tuổi theo Điều 20 Nghị định 13/2023/NĐ-CP:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Người học dưới 16 tuổi khi đăng ký cần có sự đồng thuận hoặc giám sát của cha mẹ hoặc người giám hộ hợp pháp.</li>
            <li>Cha mẹ hoặc người giám hộ có toàn quyền xem, yêu cầu chỉnh sửa hoặc xóa bỏ toàn bộ dữ liệu khảo thí của con em mình bất kỳ lúc nào bằng cách gửi yêu cầu tới địa chỉ email hỗ trợ.</li>
          </ul>
        </section>

        {/* Section 9: DPO & Kênh Liên Hệ Giải Quyết Khiếu Nại */}
        <section id="section-9" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              9
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Bộ Phận Bảo Vệ Dữ Liệu (DPO) & Tiếp Nhận Khiếu Nại
            </h2>
          </div>
          <p>
            Mọi yêu cầu thực thi quyền dữ liệu, yêu cầu xóa vĩnh viễn hoặc phản ánh liên quan đến bảo mật thông tin xin vui lòng liên hệ:
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <p><strong>Bộ phận chuyên trách:</strong> Classnia AI Data Protection Office (DPO)</p>
            <p>
              <strong>Email pháp lý & bảo mật:</strong>{" "}
              <a href="mailto:privacy@classnia.id.vn" className="text-rose-600 font-semibold hover:underline">
                privacy@classnia.id.vn
              </a>
            </p>
            <p>
              <strong>Kênh báo lỗi & hỗ trợ học viên:</strong>{" "}
              <Link href="/dashboard/support" className="text-rose-600 font-semibold hover:underline">
                Tab Yêu Cầu & Hỗ Trợ (Hệ thống tiếp nhận Ticket)
              </Link>
            </p>
            <p>
              <strong>Thời hạn giải quyết:</strong> Trong vòng 72 giờ làm việc kể từ khi tiếp nhận đầy đủ thông tin xác thực chủ tài khoản.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/terms"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              <span>Xem Điều Khoản Dịch Vụ</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/dashboard/support"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <span>Gửi yêu cầu hỗ trợ</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
