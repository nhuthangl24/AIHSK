import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mic,
  Database,
  Trash2,
  ArrowRight,
  Scale,
  FileCheck2,
  Server,
  EyeOff,
  Clock,
  Mail,
  AlertOctagon,
  Users,
  Cpu,
  FileText,
  KeyRound,
  Fingerprint,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Chính Sách Bảo Mật & Bảo Vệ Dữ Liệu Cá Nhân (Privacy Policy) | Classnia AI",
  description:
    "Chính sách bảo vệ dữ liệu cá nhân toàn diện tuân thủ Nghị định 13/2023/NĐ-CP, quy chế bảo vệ âm thanh giọng nói, quyền của chủ thể dữ liệu và an ninh thông tin tại Classnia AI.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Chính Sách Bảo Mật & Bảo Vệ Dữ Liệu Cá Nhân | Classnia AI",
    description:
      "Văn bản quy định chế độ bảo vệ dữ liệu cá nhân, âm thanh sinh trắc học và thực thi đầy đủ quyền hợp pháp theo Nghị định 13/2023/NĐ-CP.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Header */}
        <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="destructive" className="bg-rose-600 text-xs font-bold">
              Bảo Mật & Pháp Lý (Decree 13/2023/ND-CP Compliant)
            </Badge>
            <span className="text-xs text-slate-500 font-medium">
              Hiệu lực: Tháng 11/2026 · Phiên bản 4.0 Toàn Diện
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Chính Sách Bảo Mật & Bảo Vệ Dữ Liệu Cá Nhân
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Tại <strong>Classnia AI</strong> (trực thuộc hệ sinh thái giáo dục công nghệ Classnia), chúng tôi tôn trọng tuyệt đối quyền riêng tư và cam kết bảo vệ dữ liệu cá nhân, âm thanh phát ngôn và đặc trưng âm học của người học. Chính sách này cấu thành văn bản pháp lý minh định quyền hạn, trách nhiệm và quy trình xử lý dữ liệu theo đúng tinh thần <strong>Nghị định số 13/2023/NĐ-CP</strong> của Chính phủ Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
          </p>
        </div>

        {/* 4 Trụ Cột Cam Kết Bảo Vệ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Không Thương Mại Hóa</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
              Tuyệt đối không bán, không cho thuê, không chia sẻ dữ liệu âm thanh hoặc thông tin học viên cho bên quảng cáo thứ ba.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-rose-900 dark:text-rose-300">
              <Cpu className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Không Huấn Luyện AI Mở</span>
            </div>
            <p className="text-[11px] text-rose-800 dark:text-rose-300/90 leading-relaxed">
              Âm thanh chỉ xử lý suy luận (inference) thời gian thực phục vụ chấm thi; không đưa vào tập dữ liệu công khai (Zero Public Training).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-sky-900 dark:text-sky-300">
              <Scale className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>Chuẩn Nghị Định 13</span>
            </div>
            <p className="text-[11px] text-sky-800 dark:text-sky-300/90 leading-relaxed">
              Bảo đảm trọn vẹn 8 quyền và 3 nghĩa vụ pháp lý của Chủ thể dữ liệu cá nhân theo quy định của pháp luật Việt Nam.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-900 dark:text-indigo-300">
              <Trash2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Quyền Tiêu Hủy An Toàn</span>
            </div>
            <p className="text-[11px] text-indigo-800 dark:text-indigo-300/90 leading-relaxed">
              Người học có toàn quyền yêu cầu xóa bỏ vĩnh viễn tệp âm thanh và tài khoản khỏi máy chủ thông qua kênh tiếp nhận chính thức.
            </p>
          </div>
        </div>

        {/* Khung tuyên bố nguyên tắc an toàn */}
        <div className="p-5 sm:p-6 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-950 dark:text-rose-200 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-800 dark:text-rose-300">
            <AlertOctagon className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>NGUYÊN TẮC BẢO VỆ DỮ LIỆU CỐT LÕI (CORE PRIVACY MANDATE)</span>
          </div>
          <p className="text-xs leading-relaxed text-rose-900/90 dark:text-rose-200/90">
            Việc người học cấp quyền truy cập Micro trên trình duyệt và gửi tín hiệu âm thanh vào phòng thi trực tuyến cấu thành hành vi <strong>đồng thuận tự nguyện có điều kiện</strong> cho mục đích duy nhất: <em>&ldquo;Phân tích ngôn ngữ âm học phục vụ luyện tập và khảo thí khẩu ngữ HSK/HSKK&rdquo;</em>. Classnia AI không sử dụng dữ liệu này cho bất kỳ mục đích nào ngoài phạm vi dịch vụ bạn đã lựa chọn.
          </p>
        </div>

        {/* Mục lục chính sách */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-rose-500" />
            <span>Mục Lục Quy Chế Bảo Vệ Dữ Liệu (11 Phần Chi Tiết)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <a href="#section-1" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">1.</span> Căn Cứ Pháp Lý & Phân Định Chủ Thể
            </a>
            <a href="#section-2" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">2.</span> Phân Loại Dữ Liệu Cá Nhân Thu Thập
            </a>
            <a href="#section-3" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">3.</span> Bảo Vệ Dữ Liệu Âm Thanh Giọng Nói & Biometrics
            </a>
            <a href="#section-4" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">4.</span> Mục Đích Xử Lý Dữ Liệu Hợp Pháp
            </a>
            <a href="#section-5" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">5.</span> 8 Quyền Hợp Pháp Của Chủ Thể Dữ Liệu (Điều 9 NĐ 13)
            </a>
            <a href="#section-6" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">6.</span> 3 Nghĩa Vụ Của Chủ Thể Dữ Liệu (Điều 10 NĐ 13)
            </a>
            <a href="#section-7" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">7.</span> Biện Pháp An Ninh Kỹ Thuật (TLS 1.3, AES-256)
            </a>
            <a href="#section-8" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">8.</span> Bên Xử Lý Dữ Liệu Phụ & Chuyển Giao Hợp Chuẩn
            </a>
            <a href="#section-9" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">9.</span> Bảo Vệ Dữ Liệu Trẻ Em & Người Dưới 16 Tuổi
            </a>
            <a href="#section-10" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">10.</span> Lưu Trữ, Tiêu Hủy An Toàn & Báo Cáo Sự Cố
            </a>
            <a href="#section-11" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">11.</span> Bộ Phận DPO & Thủ Tục Tiếp Nhận Khiếu Nại
            </a>
          </div>
        </div>

        {/* Section 1: Căn Cứ Pháp Lý & Định Nghĩa */}
        <section id="section-1" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Căn Cứ Pháp Lý & Phân Định Trách Nhiệm Chủ Thể
            </h2>
          </div>
          <p>
            Chính sách Bảo mật và Bảo vệ Dữ liệu Cá nhân này được ban hành và thi hành căn cứ trên hệ thống pháp luật Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam, bao gồm:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>Nghị định số 13/2023/NĐ-CP</strong> ngày 17 tháng 04 năm 2023 của Chính phủ về Bảo vệ dữ liệu cá nhân (sau đây gọi tắt là <em>&ldquo;Nghị định 13&rdquo;</em>).</li>
            <li><strong>Luật An ninh mạng số 24/2018/QH14</strong> được Quốc hội thông qua ngày 12 tháng 06 năm 2018.</li>
            <li><strong>Luật An toàn thông tin mạng số 86/2015/QH13</strong> được Quốc hội thông qua ngày 19 tháng 11 năm 2015.</li>
            <li><strong>Luật Giao dịch điện tử số 20/2023/QH15</strong> được Quốc hội thông qua ngày 22 tháng 06 năm 2023.</li>
            <li><strong>Bộ luật Dân sự số 91/2015/QH13</strong> về quyền nhân thân và bảo vệ đời sống riêng tư, bí mật cá nhân.</li>
          </ul>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5 font-bold">Bên Kiểm Soát & Xử Lý Dữ Liệu Cá Nhân:</strong>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ban Điều hành và Đội ngũ Kỹ thuật của Nền tảng Classnia AI (trực thuộc Classnia). Chịu trách nhiệm xác định mục đích, phương tiện và trực tiếp thực thi các biện pháp bảo vệ dữ liệu.
                </p>
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5 font-bold">Chủ Thể Dữ Liệu (Data Subject):</strong>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Bất kỳ cá nhân nào khởi tạo tài khoản, đăng nhập, cấp quyền Micro, tham gia thi thử mô phỏng 5 chặng, trò chuyện tự do hoặc tương tác với Giám khảo AI trên hệ thống.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Dữ Liệu Thu Thập */}
        <section id="section-2" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Phân Loại Chi Tiết Dữ Liệu Thu Thập
            </h2>
          </div>
          <p>
            Theo quy định tại Điều 2 Nghị định 13, dữ liệu được thu thập và phân loại thành hai nhóm rõ rệt:
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
                <span>a. Dữ Liệu Cá Nhân Cơ Bản (Basic Personal Data)</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Thông tin tài khoản định danh:</strong> Họ tên hoặc biệt danh hiển thị, địa chỉ thư điện tử (email), ảnh đại diện (avatar được cung cấp qua liên kết Google SSO), mã định danh duy nhất (User UUID).</li>
                <li><strong>Hồ sơ học thuật & Mục tiêu:</strong> Cấp độ HSK mục tiêu (HSK 1 - HSK 6), ngôn ngữ mẹ đẻ, thời gian dự kiến thi chứng chỉ, lịch sử các bài thi thử đã hoàn thành.</li>
                <li><strong>Dữ liệu nhật ký kỹ thuật mạng:</strong> Địa chỉ IP (được lưu dưới dạng băm một chiều phục vụ an ninh mạng), loại trình duyệt, phiên bản hệ điều hành máy khách, dấu thời gian phiên làm việc (timestamps).</li>
                <li><strong>Dữ liệu tương tác phản hồi:</strong> Nội dung trao đổi trong phiếu hỗ trợ kỹ thuật (Support Tickets), điểm đánh giá độ hài lòng và thông tin đính kèm phản ánh sự cố.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-sm">
                <Fingerprint className="h-4 w-4 text-amber-600" />
                <span>b. Dữ Liệu Âm Học & Sinh Trắc Nhạy Cảm (Sensitive Voice Biometric Data)</span>
              </div>
              <p className="text-amber-900/80 dark:text-amber-300/80 text-[11px] leading-relaxed">
                Căn cứ Điều 2 Khoản 4 Điểm d Nghị định 13, dữ liệu sinh trắc học và giọng nói được xác định là dữ liệu cá nhân nhạy cảm, chịu quy trình bảo vệ tăng cường:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-amber-900/90 dark:text-amber-200/90">
                <li><strong>Bản ghi sóng âm (Raw Audio Stream):</strong> Tệp âm thanh thu nhận trực tiếp từ micro trình duyệt của người học trong khoảng thời gian người học kích hoạt chức năng ghi âm.</li>
                <li><strong>Vector tham số cao độ F0 (Fundamental Frequency):</strong> Chuỗi số liệu biến thiên tần số dao động của dây thanh âm phục vụ phân tích độ chính xác của thanh 1, thanh 2, thanh 3, thanh 4 và thanh nhẹ trong tiếng Trung chuẩn.</li>
                <li><strong>Tham số cộng hưởng âm vực (Formants F1, F2):</strong> Dữ liệu vị trí đặt lưỡi, độ mở khẩu hình môi mô phỏng toán học nhằm nhận diện các âm khó nhầm lẫn như j/q/x, z/c/s, zh/ch/sh.</li>
                <li><strong>Văn bản chuyển hóa từ giọng nói (Speech-to-Text Transcripts):</strong> Văn bản chữ Hán và Pinyin do máy học suy diễn từ lời nói tự phát của bạn.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Bảo Vệ Giọng Nói */}
        <section id="section-3" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Quy Chế Nghiêm Ngặt Về Bảo Vệ Dữ Liệu Âm Thanh Giọng Nói
            </h2>
          </div>
          <p>
            Nhận thức rõ giá trị nhạy cảm của giọng nói con người, Classnia AI áp dụng cơ chế bảo vệ theo tiêu chuẩn kiểm soát cao nhất:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">
                1. Nguyên tắc Không Thu Âm Thụ Động (Zero Passive Listening)
              </strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Micro chỉ được mở khi và chỉ khi người học bấm nút bắt đầu ghi âm hoặc chủ động kích hoạt chế độ đàm thoại trong phòng thi. Trình duyệt của người dùng luôn hiển thị chỉ báo quyền riêng tư (icon micro đỏ). Nền tảng tuyệt đối không chạy ngầm tiến trình lắng nghe hay ghi nhận âm thanh môi trường xung quanh.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">
                2. Cam Kết Tuyệt Đối Không Huấn Luyện AI Công Khai (Zero Public LLM Training)
              </strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Mọi tệp âm thanh chỉ được đưa vào mô hình nhận dạng âm học cục bộ trong thời gian suy luận (inference session) để tính toán điểm số 7 chiều. Classnia AI <strong>tuyệt đối không tổng hợp bản ghi giọng nói của người học để làm tập dữ liệu công khai (public dataset) huấn luyện mô hình nền tảng cho bất kỳ bên thứ ba nào</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">
                3. Phân Lập Dữ Liệu Theo Người Dùng (Multi-Tenant Isolation)
              </strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Tệp ghi âm và bảng phân tích điểm thi được mã hóa với token định danh duy nhất theo tài khoản của bạn. Không một người dùng nào khác trong hệ thống có thể nghe trộm, tải về hay truy cập vào lịch sử âm thanh của bạn trừ khi bạn chủ động cấp quyền chia sẻ cho giáo viên phụ trách.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Mục Đích Xử Lý */}
        <section id="section-4" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
              4
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Mục Đích Xử Lý Dữ Liệu Hợp Pháp
            </h2>
          </div>
          <p>
            Căn cứ Điều 11 Nghị định 13, dữ liệu cá nhân chỉ được xử lý đúng mục đích đã thông báo và nhận được sự đồng thuận của người dùng:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">1. Khảo Thí & Đàm Thoại Thời Gian Thực</strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Phân tích câu trả lời của thí sinh để Giám khảo AI đưa ra phản hồi đối đáp tự nhiên và chuyển tiếp các câu hỏi mở trong 5 chặng thi mô phỏng.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">2. Chẩn Đoán Ngôn Ngữ Học 7 Chiều</strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Đánh giá chính xác các tiêu chí: Phát âm & Thanh điệu, Độ trôi chảy, Ngữ pháp, Vốn từ vựng, Cấu trúc mạch lạc, Độ hiểu bài thi và Khả năng tương tác.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">3. Cá Nhân Hóa Lộ Trình Ôn Luyện</strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Tổng hợp biểu đồ tiến độ, lưu trữ báo cáo chẩn đoán lỗi âm điệu cá nhân giúp học viên theo dõi sự tiến bộ qua từng tuần luyện tập.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">4. Bảo Đảm An Toàn Mạng & Hỗ Trợ Kỹ Thuật</strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Ngăn chặn hành vi gian lận thi cử, chống tấn công DDoS, bảo vệ hạ tầng máy chủ và xử lý các phản ánh kỹ thuật do người học gửi qua ticket.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: 8 Quyền Của Chủ Thể Dữ Liệu */}
        <section id="section-5" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
              5
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Toàn Bộ 8 Quyền Hợp Pháp Của Chủ Thể Dữ Liệu (Điều 9 Nghị Định 13)
            </h2>
          </div>
          <p>
            Người dùng tại Classnia AI có đầy đủ các quyền luật định sau đây và có thể thực thi bất kỳ lúc nào:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">1. Quyền Được Biết (Right to be informed)</strong>
              <p className="text-slate-600 dark:text-slate-400">
                Được thông báo rõ ràng về loại dữ liệu thu thập, mục đích xử lý, thời gian lưu trữ và các bên nhận chuyển giao thông tin.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">2. Quyền Đồng Ý & Rút Lại Đồng Ý</strong>
              <p className="text-slate-600 dark:text-slate-400">
                Có toàn quyền quyết định cấp quyền hoặc rút lại sự đồng ý đối với việc xử lý dữ liệu giọng nói bất cứ lúc nào qua cài đặt micro.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">3. Quyền Truy Cập & Xem Dữ Liệu</strong>
              <p className="text-slate-600 dark:text-slate-400">
                Được xem, nghe lại bản ghi âm câu trả lời, xem bảng điểm chi tiết và tải xuống tệp PDF báo cáo kết quả thi bất kỳ lúc nào.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">4. Quyền Yêu Cầu Xóa Vĩnh Viễn (Right to Erasure)</strong>
              <p className="text-slate-600 dark:text-slate-400">
                Yêu cầu xóa toàn bộ lịch sử thi, tệp âm thanh và hồ sơ cá nhân. Hệ thống sẽ tiến hành tiêu hủy bảo mật trong vòng 72 giờ.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">5. Quyền Hạn Chế Xử Lý Dữ Liệu</strong>
              <p className="text-slate-600 dark:text-slate-400">
                Yêu cầu hệ thống tạm ngừng phân tích nâng cao hoặc tạm dừng tổng hợp dữ liệu thống kê khi bạn đang tranh chấp về tính chính xác.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">6. Quyền Cung Cấp Dữ Liệu (Data Portability)</strong>
              <p className="text-slate-600 dark:text-slate-400">
                Yêu cầu cung cấp dữ liệu học tập cá nhân dưới định dạng tiêu chuẩn có cấu trúc (JSON / PDF) để chuyển giao sang hệ thống khác.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">7. Quyền Phản Đối Xử Lý Dữ Liệu</strong>
              <p className="text-slate-600 dark:text-slate-400">
                Phản đối việc xử lý dữ liệu phục vụ mục đích nghiên cứu học thuật hoặc các tính năng phân tích hành vi người học.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">8. Quyền Khiếu Nại, Tố Cáo & Khởi Kiện</strong>
              <p className="text-slate-600 dark:text-slate-400">
                Khiếu nại trực tiếp lên Bộ phận DPO của Classnia AI hoặc cơ quan chức năng (Cục An ninh mạng - Bộ Công an) nếu phát hiện hành vi xâm phạm.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Nghĩa Vụ Của Chủ Thể Dữ Liệu */}
        <section id="section-6" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
              6
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              3 Nghĩa Vụ Bắt Buộc Của Chủ Thể Dữ Liệu (Điều 10 Nghị Định 13)
            </h2>
          </div>
          <p>
            Song hành cùng các quyền lợi, người dùng cam kết thực hiện nghiêm túc các nghĩa vụ pháp lý:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">
                1. Tự Bảo Vệ Dữ Liệu Cá Nhân Của Mình
              </strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Có trách nhiệm tự bảo vệ bí mật thông tin tài khoản, mật khẩu truy cập và thông tin đăng nhập Google liên kết. Tuyệt đối không cho mượn tài khoản hoặc chia sẻ quyền truy cập phòng thi với người khác.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">
                2. Tôn Trọng Dữ Liệu Cá Nhân Của Người Khác
              </strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Không thu thập, ghi âm lén, phát tán hoặc tiết lộ bản ghi âm giọng nói của giáo viên, giám thị hoặc bạn học khác khi tham gia các phiên thảo luận nhóm mà không có sự đồng ý bằng văn bản của họ.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">
                3. Cung Cấp Thông Tin Trung Thực & Chính Xác
              </strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Cung cấp đầy đủ, chính xác thông tin cá nhân khi đăng ký; chịu hoàn toàn trách nhiệm pháp lý nếu cố tình mạo danh cá nhân, tổ chức khác để tạo tài khoản hoặc gian lận khảo thí.
              </p>
            </div>
          </div>
        </section>

        {/* Section 7: Biện Pháp An Toàn Kỹ Thuật */}
        <section id="section-7" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
              7
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Biện Pháp Kỹ Thuật & Tổ Chức Bảo Vệ Dữ Liệu (TOMs)
            </h2>
          </div>
          <p>
            Classnia AI triển khai các giải pháp kỹ thuật bảo vệ dữ liệu theo tiêu chuẩn công nghiệp an toàn thông tin quốc tế:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Lock className="h-4 w-4 text-rose-600" />
                <span>Mã Hóa Đường Truyền TLS 1.3</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Toàn bộ luồng âm thanh micro truyền từ trình duyệt lên máy chủ đều được mã hóa bằng chuẩn mật mã học TLS 1.3 với thuật toán ECDHE nhằm chống nghe lén man-in-the-middle.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Database className="h-4 w-4 text-rose-600" />
                <span>Mã Hóa Lưu Trữ AES-256</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Các bản lưu trữ dữ liệu điểm số, văn bản chuyển ngữ và metadata tài khoản được mã hóa ở cấp độ máy chủ vật lý bằng thuật toán mã hóa khối đối xứng AES-256.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Server className="h-4 w-4 text-rose-600" />
                <span>Tường Lửa WAF & Chống DDoS</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Hệ thống áp dụng chính sách giới hạn tần suất truy vấn (Rate Limiting), kiểm soát bot độc hại tự động và lọc lưu lượng bất thường bằng Cloudflare Web Application Firewall.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <KeyRound className="h-4 w-4 text-rose-600" />
                <span>Kiểm Soát Truy Cập Phân Quyền (RBAC)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Chỉ nhân sự kỹ thuật được ủy quyền đặc biệt với xác thực đa yếu tố (MFA) mới có thể truy cập nhật ký chẩn đoán lỗi trong trường hợp nhận được yêu cầu xử lý từ bạn.
              </p>
            </div>
          </div>
        </section>

        {/* Section 8: Bên Thứ Ba & Lưu Trữ Đám Mây */}
        <section id="section-8" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
              8
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Bên Xử Lý Dữ Liệu Phụ & Chuyển Giao Dữ Liệu Hợp Chuẩn (Điều 25 Nghị Định 13)
            </h2>
          </div>
          <p>
            Nhằm đảm bảo hiệu năng xử lý âm học thời gian thực với độ trễ thấp nhất, Classnia AI chỉ hợp tác với các nhà cung cấp hạ tầng công nghệ hàng đầu thế giới đạt chứng nhận ISO/IEC 27001 và SOC 2 Type II:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">1. Google Cloud Platform & Firebase (Hoa Kỳ / Singapore)</strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Được ủy thác xử lý hạ tầng xác thực danh tính an toàn (Google SSO), cơ sở dữ liệu phân tán lưu trữ kết quả thi và thông tin tài khoản với phụ lục bảo vệ dữ liệu (Data Protection Addendum - DPA) đạt tiêu chuẩn GDPR và Nghị định 13.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">2. Hệ Thống Máy Chủ Chuyên Dụng Xử Lý Nhận Dạng Ngữ Âm</strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Máy chủ tính toán ngữ âm Pinyin và đối thoại phản hồi của Giám khảo AI hoạt động trong mạng nội bộ cô lập (VPC). Các đơn vị cung cấp hạ tầng tính toán cam kết không trích xuất, không sao chép và không sử dụng dữ liệu hội thoại của thí sinh vào mục đích riêng.
              </p>
            </div>
          </div>
        </section>

        {/* Section 9: Trẻ Em & Dưới 16 Tuổi */}
        <section id="section-9" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
              9
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Bảo Vệ Dữ Liệu Trẻ Em & Người Dưới 16 Tuổi (Điều 20 Nghị Định 13)
            </h2>
          </div>
          <p>
            Classnia AI đặc biệt coi trọng sự an toàn và quyền riêng tư của đối tượng thanh thiếu niên học tập tiếng Trung:
          </p>

          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li>Người học dưới 16 tuổi khi đăng ký và tham gia các bài thi khẩu ngữ cần được sự đồng thuận hoặc dưới sự giám sát trực tiếp của cha mẹ hoặc người giám hộ hợp pháp theo quy định tại Điều 20 Nghị định 13/2023/NĐ-CP.</li>
            <li>Cha mẹ hoặc người giám hộ hợp pháp có quyền yêu cầu xem xét, chỉnh sửa hoặc tiêu hủy vĩnh viễn toàn bộ dữ liệu lịch sử bài nói của con em mình bất kỳ lúc nào thông qua việc gửi ticket tại Trung Tâm Yêu Cầu & Hỗ Trợ.</li>
            <li>Hệ thống cam kết không bao giờ thu thập thông tin tài chính, địa chỉ cư trú hoặc các thông tin gia đình ngoài phạm vi bài thi học thuật đối với người học dưới 16 tuổi.</li>
          </ul>
        </section>

        {/* Section 10: Lưu Trữ, Tiêu Hủy & Báo Cáo Sự Cố */}
        <section id="section-10" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
              10
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Thời Hạn Lưu Trữ, Quy Trình Tiêu Hủy An Toàn & Báo Cáo Sự Cố
            </h2>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">1. Thời Hạn Lưu Trữ Tối Đa</strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Dữ liệu cá nhân và tệp ghi âm giọng nói chỉ được duy trì trong suốt vòng đời tài khoản học tập còn hoạt động của người dùng để phục vụ việc tự ôn tập. Trường hợp tài khoản không phát sinh hoạt động liên tục trong 12 tháng, hệ thống sẽ gửi thông báo trước khi tiến hành thanh lọc tự động.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-bold">2. Quy Trình Tiêu Hủy Dữ Liệu An Toàn (Secure Data Purge)</strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Khi nhận được yêu cầu xóa tài khoản từ chủ thể dữ liệu, toàn bộ tệp ghi âm âm thanh, kết quả chẩn đoán và metadata liên kết sẽ được ghi đè và xóa bỏ vĩnh viễn (Cryptographic Deletion) khỏi cơ sở dữ liệu và các bản sao lưu trong vòng 72 giờ làm việc, không thể phục hồi bằng bất kỳ kỹ thuật khôi phục dữ liệu nào.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-1">
              <strong className="text-rose-950 dark:text-rose-300 block font-bold">3. Quy Trình Báo Cáo Sự Cố Dữ Liệu (Điều 23 Nghị Định 13)</strong>
              <p className="text-rose-900/80 dark:text-rose-200/80 leading-relaxed">
                Trong trường hợp phát hiện sự cố vi phạm an ninh dẫn đến nguy cơ rò rỉ hoặc mất an toàn dữ liệu cá nhân, Classnia AI cam kết thông báo cho Cục An ninh mạng và Phòng chống tội phạm sử dụng công nghệ cao (A05) - Bộ Công an trong thời hạn 72 giờ kể từ khi phát hiện, đồng thời thông báo ngay cho các chủ thể dữ liệu bị ảnh hưởng qua email đăng ký.
              </p>
            </div>
          </div>
        </section>

        {/* Section 11: DPO & Tiếp Nhận Khiếu Nại */}
        <section id="section-11" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
              11
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Bộ Phận Chuyên Trách DPO & Kênh Tiếp Nhận Khiếu Nại
            </h2>
          </div>
          <p>
            Để thực thi các quyền luật định của bạn, yêu cầu tiêu hủy dữ liệu hoặc gửi khiếu nại liên quan đến quyền riêng tư, vui lòng liên hệ trực tiếp với Bộ phận Bảo vệ Dữ liệu:
          </p>

          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Users className="h-4 w-4 text-rose-600" />
              <span>Văn Phòng Bảo Vệ Dữ Liệu Cá Nhân (Data Protection Officer - DPO)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Đơn vị phụ trách:</strong> Ban Pháp chế & An toàn thông tin Classnia AI.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Kênh tiếp nhận chính thức:</strong>{" "}
              <Link
                href="/dashboard/support"
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
              >
                Cổng Tiếp Nhận Phiếu Yêu Cầu & Báo Lỗi Trực Tuyến
              </Link>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Thời hạn phản hồi và giải quyết yêu cầu:</strong> Không quá 72 giờ làm việc kể từ thời điểm nhận được yêu cầu hợp lệ và xác thực danh tính chủ sở hữu tài khoản thành công.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/terms"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              <span>Xem Điều Khoản Sử Dụng Dịch Vụ Ràng Buộc</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/dashboard/support"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <span>Gửi phiếu hỗ trợ kỹ thuật & bảo mật</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
