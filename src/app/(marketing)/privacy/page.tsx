import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShieldCheck, Lock, Mic, Database, Trash2, UserCheck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Chính Sách Bảo Mật (Privacy Policy) | Classnia AI",
  description: "Chính sách bảo vệ dữ liệu cá nhân, âm thanh giọng nói và quyền riêng tư người học tại Classnia AI.",
};

export default function PrivacyPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Header */}
        <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cinnabar">Bảo Mật & Tin Cậy</Badge>
            <span className="text-xs text-slate-500 font-medium">Phiên bản 2.4 · Cập nhật: Tháng 11/2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Chính Sách Bảo Mật & Dữ Liệu Giọng Nói
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-3xl">
            Tại <strong>Classnia AI</strong>, chúng tôi xem dữ liệu giọng nói và thông tin học tập của bạn là tài sản riêng tư tối thượng. Bản Chính sách Bảo mật này mô tả cách chúng tôi thu thập, xử lý âm học, bảo vệ và trao quyền kiểm soát tuyệt đối dữ liệu cho bạn.
          </p>
        </div>

        {/* 3 Core Guarantees Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-900 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Không Bán Dữ Liệu</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 leading-normal">
              Chúng tôi KHÔNG BAO GIỜ bán, cho thuê hay thương mại hóa bản ghi âm giọng nói của bạn cho bất kỳ bên thứ ba nào.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-rose-900 dark:text-rose-300">
              <Lock className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Mã Hóa Đa Tầng</span>
            </div>
            <p className="text-[11px] text-rose-800 dark:text-rose-300/90 leading-normal">
              Mã hóa luồng âm thanh TLS 1.3 khi truyền tải và mã hóa AES-256 an toàn trong cơ sở dữ liệu lưu trữ đám mây.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-indigo-900 dark:text-indigo-300">
              <Trash2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Toàn Quyền Xóa Bỏ</span>
            </div>
            <p className="text-[11px] text-indigo-800 dark:text-indigo-300/90 leading-normal">
              Bạn có thể xóa từng bài thi, bản thu âm hoặc yêu cầu hủy vĩnh viễn tài khoản chỉ bằng một cú nhấp chuột.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section id="section-1" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">1</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dữ Liệu Chúng Tôi Thu Thập</h2>
          </div>
          <p>
            Để vận hành phòng thi Giám khảo AI và phân tích chuẩn xác năng lực khẩu ngữ tiếng Trung, chúng tôi thu thập các nhóm thông tin cần thiết sau:
          </p>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-1">a. Thông tin tài khoản & định danh:</strong>
              Họ tên, địa chỉ email, ảnh đại diện (nếu bạn đăng nhập bằng Google SSO thông qua Firebase), cấp độ HSK mục tiêu (HSK 1 - HSK 6) và vai trò người dùng (Học viên / Giảng viên / Quản trị viên).
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-1">b. Tín hiệu âm thanh & Bản ghi âm micro:</strong>
              Các đoạn âm thanh trả lời khi bạn nhấn nút ghi âm hoặc phát biểu trong bài thi nói, biên bản hội thoại trích xuất (Transcript), phiên âm Pinyin và dấu thời gian từng lượt hội thoại.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-1">c. Dữ liệu âm học tính toán (Acoustic Features):</strong>
              Đường nét cao độ thanh điệu (Pitch Contour / F0), thời lượng âm tiết, tốc độ phát âm (âm tiết/giây), khoảng dừng ngập ngừng và phân tích biến điệu (thanh 3, thanh nhẹ, chữ 不, 一).
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block mb-1">d. Dữ liệu kỹ thuật thiết bị:</strong>
              Loại trình duyệt, hệ điều hành (macOS, Windows, iOS, Android), cài đặt âm thanh tùy chọn của người dùng (giọng đọc, tốc độ phát 0.85x - 1.05x).
            </div>
          </div>
        </section>

        {/* Section 2: Voice Data Anchor */}
        <section id="voice-data" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">2</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lưu Trữ Dữ Liệu Âm Thanh & Quyền Riêng Tư Giọng Nói</h2>
          </div>
          <p>
            Giọng nói là dữ liệu sinh trắc học cá nhân. Do đó, Classnia AI áp dụng các quy chuẩn quản lý nghiêm ngặt hàng đầu:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
            <li>
              <strong>Chỉ phục vụ mục đích học thuật:</strong> Bản ghi âm câu trả lời chỉ được xử lý nhằm phân tích phát âm, đối chiếu thang điểm 7 chiều HSKK và hiển thị cho chính bạn cùng giảng viên được bạn cấp quyền trong lớp học.
            </li>
            <li>
              <strong>Không huấn luyện mô hình công khai:</strong> Classnia AI cam kết KHÔNG cung cấp bản ghi âm của người học cho các bên thứ ba để huấn luyện mô hình trí tuệ nhân tạo công khai trừ phi có thỏa thuận nghiên cứu học thuật bằng văn bản và đã ẩn danh hóa hoàn toàn danh tính.
            </li>
            <li>
              <strong>Phân lập dữ liệu triệt để:</strong> Cơ sở dữ liệu sử dụng mô hình Tenant/User ID scoping, đảm bảo người dùng khác không thể truy xuất hoặc nghe trộm bản ghi âm của bạn.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="section-3" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">3</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mục Đích Xử Lý Thông Tin</h2>
          </div>
          <p>Dữ liệu được xử lý nhằm các mục đích cốt lõi sau:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">1. Vận hành khảo thí thời gian thực:</strong>
              Giám khảo AI lắng nghe, hiểu và tạo câu hỏi tương tác tiếp nối theo năng lực ứng biến của thí sinh.
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">2. Chẩn đoán & Chấm điểm 7 chiều:</strong>
              Tự động định lượng điểm thành phần, phát hiện từ vựng cao cấp và lỗi ngữ pháp với dẫn chứng nguyên văn.
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">3. Báo cáo & Luyện tập thích ứng:</strong>
              Sinh bộ câu hỏi củng cố phản xạ sau bài thi và vẽ biểu đồ theo dõi tiến độ nâng hạng HSK.
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">4. Bảo mật & Chống gian lận:</strong>
              Xác thực phiên làm việc, ngăn ngừa hành vi tấn công giả mạo hoặc truy cập chéo tài khoản.
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="section-4" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">4</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dịch Vụ Bên Thứ Ba & Nhà Cung Cấp Đám Mây</h2>
          </div>
          <p>
            Để cung cấp trải nghiệm ổn định và bảo mật cao, chúng tôi hợp tác cùng các nhà cung cấp hạ tầng đám mây đạt tiêu chuẩn quốc tế:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Firebase Authentication & Firestore (Google Cloud Platform):</strong> Quản lý danh tính người dùng an toàn và đồng bộ tài khoản thông suốt với hệ sinh thái Classnia (classnia.id.vn).</li>
            <li><strong>Cơ sở hạ tầng lưu trữ S3 tương thích:</strong> Lưu trữ tệp âm thanh câu trả lời dưới định dạng nén tối ưu với khóa mã hóa dữ liệu độc lập.</li>
            <li><strong>Động cơ suy luận AI (Inference Engine):</strong> Xử lý tạo văn bản thoại và chấm điểm ngôn ngữ học theo nguyên tắc Zero-Retention (không lưu vết dữ liệu riêng tư sau khi phản hồi).</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section id="section-5" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">5</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quyền Của Người Học Đối Với Dữ Liệu</h2>
          </div>
          <p>Theo chuẩn bảo vệ dữ liệu cá nhân (GDPR & Luật Bảo vệ dữ liệu cá nhân Việt Nam), bạn có đầy đủ các quyền sau:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block font-semibold mb-1">Quyền Xem & Xuất Dữ Liệu:</strong>
              Xem lại toàn bộ lịch sử thi, nghe lại file ghi âm và tải về biên bản báo cáo chẩn đoán bất cứ lúc nào.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block font-semibold mb-1">Quyền Xóa Vĩnh Viễn:</strong>
              Yêu cầu xóa từng bản thu âm hoặc xóa toàn bộ tài khoản. Khi xóa, dữ liệu âm thanh sẽ bị tiêu hủy vĩnh viễn khỏi máy chủ.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block font-semibold mb-1">Quyền Chỉnh Sửa Hồ Sơ:</strong>
              Thay đổi họ tên, mật khẩu, trình độ HSK mục tiêu tại trang Cài đặt Hồ sơ.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white block font-semibold mb-1">Quyền Rút Lại Đồng Thuận:</strong>
              Ngừng cấp quyền truy cập micro trong cài đặt trình duyệt hoặc hủy liên kết tài khoản Google bất kỳ lúc nào.
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="section-6" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">6</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cookie & Lưu Trữ Cục Bộ (Local Storage)</h2>
          </div>
          <p>
            Chúng tôi sử dụng <strong>LocalStorage</strong> trên trình duyệt của bạn để ghi nhớ các tùy chọn cá nhân hóa trải nghiệm mà không gửi lên máy chủ khi không cần thiết, bao gồm:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><code>aihsk_system_audio_settings</code>: Tùy chọn giọng đọc tiếng Trung ưu tiên, tốc độ phát âm (0.85x - 1.05x) và trạng thái hiển thị Pinyin.</li>
            <li>Phiên đăng nhập JWT an toàn (HTTP-Only cookies đối với máy chủ xác thực).</li>
          </ul>
          <p className="text-xs text-slate-500">
            Chúng tôi không sử dụng các cookie quảng cáo theo dõi chéo của bên thứ ba để nhắm mục tiêu tiếp thị.
          </p>
        </section>

        {/* Section 7 */}
        <section id="section-7" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">7</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Liên Hệ Bộ Phận Bảo Mật Dữ Liệu (DPO)</h2>
          </div>
          <p>
            Mọi yêu cầu xóa dữ liệu, khiếu nại về quyền riêng tư hoặc câu hỏi liên quan đến chính sách bảo mật xin vui lòng gửi về:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <p><strong>Cơ quan Phụ trách Dữ liệu:</strong> Classnia AI Data Protection Office (DPO)</p>
            <p><strong>Email chuyên trách:</strong> <a href="mailto:privacy@classnia.id.vn" className="text-rose-600 hover:underline">privacy@classnia.id.vn</a></p>
            <p><strong>Hỗ trợ kỹ thuật:</strong> <a href="mailto:support@classnia.id.vn" className="text-rose-600 hover:underline">support@classnia.id.vn</a></p>
            <p><strong>Thời gian phản hồi:</strong> Trong vòng 24 đến 48 giờ làm việc kể từ khi tiếp nhận yêu cầu.</p>
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
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <span>Tạo tài khoản học tập</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
