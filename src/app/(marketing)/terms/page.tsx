import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, ShieldAlert, Award, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Điều Khoản Dịch Vụ (Terms of Service) | Classnia AI",
  description: "Quy chuẩn pháp lý và điều kiện sử dụng dịch vụ khảo thí khẩu ngữ tiếng Trung Classnia AI.",
};

export default function TermsPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Header */}
        <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cinnabar">Điều Khoản & Điều Kiện</Badge>
            <span className="text-xs text-slate-500 font-medium">Phiên bản 2.4 · Cập nhật: Tháng 11/2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Điều Khoản Sử Dụng Dịch Vụ
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-3xl">
            Chào mừng bạn đến với <strong>Classnia AI</strong> (thuộc hệ sinh thái Classnia). Bản Điều khoản Sử dụng này ("Điều khoản") quy định các quyền và nghĩa vụ ràng buộc pháp lý giữa người sử dụng và Classnia AI khi truy cập hoặc sử dụng ứng dụng web, phòng thi nói trực tuyến, API khảo thí và các tài nguyên liên quan.
          </p>
        </div>

        {/* Quick Summary Alert */}
        <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Tóm Lược Quan Trọng Trước Khi Bắt Đầu</span>
          </div>
          <p className="text-xs leading-relaxed">
            Classnia AI cung cấp giải pháp luyện tập khẩu ngữ tiếng Trung chuẩn hóa bằng trí tuệ nhân tạo. <strong>Điểm số và đánh giá cấp độ HSK/HSKK do hệ thống tạo ra là chỉ số học thuật độc lập phục vụ rèn luyện cá nhân và hỗ trợ giảng dạy</strong>, không cấu thành chứng chỉ chính thức được cấp bởi cơ quan khảo thí nhà nước Trung Quốc (CTI/Hanban). Bằng cách đăng ký tài khoản hoặc sử dụng dịch vụ, bạn xác nhận đã đọc, hiểu và đồng ý với toàn bộ nội dung dưới đây.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-rose-500" />
            <span>Mục Lục Văn Bản</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <a href="#section-1" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">1.</span> Chấp Thuận Điều Khoản & Đối Tượng
            </a>
            <a href="#section-2" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">2.</span> Mô Tả Dịch Vụ & Công Nghệ Khảo Thí
            </a>
            <a href="#section-3" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">3.</span> Đăng Ký & Bảo Mật Tài Khoản
            </a>
            <a href="#section-4" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">4.</span> Miễn Trừ Trách Nhiệm Về Chứng Chỉ
            </a>
            <a href="#section-5" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">5.</span> Quy Tắc Sử Dụng Hợp Chuẩn & Điều Cấm
            </a>
            <a href="#section-6" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">6.</span> Dữ Liệu Âm Thanh & Quyền Sở Hữu
            </a>
            <a href="#section-7" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">7.</span> Quyền Sở Hữu Trí Tuệ Nền Tảng
            </a>
            <a href="#section-8" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">8.</span> Gói Dịch Vụ, Hạn Mức & Thanh Toán
            </a>
            <a href="#section-9" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">9.</span> Giới Hạn Trách Nhiệm Pháp Lý
            </a>
            <a href="#section-10" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">10.</span> Chấm Dứt Dịch Vụ & Liên Hệ
            </a>
          </div>
        </div>

        {/* Section 1 */}
        <section id="section-1" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">1</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chấp Thuận Điều Khoản & Phạm Vi Áp Dụng</h2>
          </div>
          <p>
            Bằng việc tạo tài khoản, đăng nhập qua hệ thống Classnia (bao gồm Firebase SSO / Google Login) hoặc bắt đầu bất kỳ bài thi nói nào trên hệ thống, bạn cam kết rằng bạn đủ năng lực hành vi dân sự để giao kết thỏa thuận này. Nếu bạn chưa đủ 18 tuổi, bạn cần có sự đồng ý hoặc giám sát của cha mẹ hoặc người giám hộ hợp pháp.
          </p>
          <p>
            Nếu bạn không đồng ý với bất kỳ phần nào trong bản Điều khoản này, bạn vui lòng ngừng truy cập và không sử dụng các dịch vụ của Classnia AI.
          </p>
        </section>

        {/* Section 2 */}
        <section id="section-2" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">2</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mô Tả Dịch Vụ & Công Nghệ Khảo Thí AI</h2>
          </div>
          <p>
            Classnia AI là nền tảng SaaS (Software as a Service) giáo dục chuyên sâu về kỹ năng khẩu ngữ tiếng Trung Quốc tiêu chuẩn (Phổ thông thoại). Nền tảng cung cấp:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Phòng Thi Phỏng Vấn Giám Khảo AI:</strong> Tương tác giọng nói trực tiếp qua 5 giai đoạn chuẩn hóa (Khởi động, Đời sống thường nhật, Thuyết trình chuyên sâu, Phản biện tư duy, Tổng kết thi).</li>
            <li><strong>Luyện Tập Tự Do (Free-Talk):</strong> Hội thoại chủ đề linh hoạt cùng gia sư ảo và đề xuất phản hồi thời gian thực.</li>
            <li><strong>Động Cơ Đánh Giá 7 Chiều:</strong> Tự động chấm điểm dựa trên Phát âm (20%), Độ trôi chảy (20%), Từ vựng (15%), Ngữ pháp (15%), Tính mạch lạc (10%), Nghe hiểu (10%) và Tương tác giao tiếp (10%).</li>
            <li><strong>Báo Cáo Chẩn Đoán Âm Học & Lộ Trình:</strong> Phân tích lỗi biến điệu thanh nhẹ, thanh 3, thanh 4 và tạo câu hỏi luyện tập tăng cường.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="section-3" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">3</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Đăng Ký & Bảo Mật Tài Khoản</h2>
          </div>
          <p>
            Khi đăng ký tài khoản, bạn đồng ý cung cấp thông tin chính xác, cập nhật và đầy đủ. Bạn có thể đăng ký tài khoản trực tiếp qua email hoặc xác thực nhanh bằng tài khoản Google thông qua dịch vụ Firebase Authentication của Classnia.
          </p>
          <p>
            Bạn chịu trách nhiệm duy nhất đối với việc bảo mật mật khẩu, mã xác thực và mọi hoạt động diễn ra dưới tài khoản của mình. Khi phát hiện bất kỳ dấu hiệu truy cập trái phép nào, bạn có nghĩa vụ thông báo ngay cho ban quản trị Classnia AI.
          </p>
        </section>

        {/* Section 4 */}
        <section id="section-4" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">4</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tuyên Bố Miễn Trừ Trách Nhiệm Về Chứng Chỉ & Điểm Số</h2>
          </div>
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
              Quy Chuẩn Học Thuật & Độc Lập Khảo Thí:
            </p>
            <p className="text-xs">
              Các thang điểm, phân loại cấp bậc (HSK 1 - HSK 6, HSKK Sơ cấp/Trung cấp/Cao cấp) và bảng dự báo năng lực tại Classnia AI là kết quả phân tích thuật toán dựa trên khung tham chiếu ngôn ngữ. <strong>Classnia AI là hệ thống công nghệ độc lập và KHÔNG đại diện, liên kết hay thay mặt cho đơn vị tổ chức thi HSK quốc tế (CTI - Chinese Testing International), Viện Khổng Tử hoặc Bộ Giáo dục Trung Quốc.</strong>
            </p>
            <p className="text-xs">
              Kết quả khảo thí tại Classnia AI không thể sử dụng để thay thế giấy chứng nhận năng lực ngôn ngữ chính thức trong hồ sơ du học, xin visa hoặc ứng tuyển công việc đòi hỏi văn bằng quốc gia.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="section-5" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">5</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quy Tắc Sử Dụng Hợp Chuẩn & Các Hành Vi Bị Cấm</h2>
          </div>
          <p>Khi sử dụng nền tảng, người dùng cam kết KHÔNG thực hiện các hành vi sau:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Tải lên, phát ngôn hoặc truyền tải âm thanh chứa nội dung khiêu dâm, bạo lực, xúc phạm danh dự, phân biệt chủng tộc hoặc vi phạm pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam và quốc tế.</li>
            <li>Cố tình can thiệp làm gián đoạn hệ thống máy chủ, tấn công từ chối dịch vụ (DDoS) hoặc khai thác lỗ hổng kỹ thuật.</li>
            <li>Sử dụng bot, crawler hoặc các công cụ tự động để cào trích xuất dữ liệu câu hỏi, thuật toán chấm điểm hoặc cơ sở dữ liệu đề thi.</li>
            <li>Dịch ngược mã nguồn (reverse engineering), sao chép thiết kế kiến trúc hoặc tạo ra sản phẩm phái sinh mà không có sự đồng ý bằng văn bản từ Classnia AI.</li>
            <li>Chia sẻ tài khoản cá nhân cho nhiều người dùng đồng thời nhằm trục lợi hoặc gian lận hạn mức khảo thí.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="section-6" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">6</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dữ Liệu Âm Thanh Giọng Nói & Quyền Sở Hữu</h2>
          </div>
          <p>
            Bạn giữ toàn bộ quyền sở hữu đối với nội dung phát ngôn nguyên bản và bản quyền cá nhân của mình. Khi bạn nói vào micro trong bài khảo thí, bạn cấp cho Classnia AI một giấy phép toàn cầu, phi độc quyền, miễn phí bản quyền nhưng có giới hạn nghiêm ngặt nhằm mục đích:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Chuyển đổi âm thanh thành văn bản (Speech-to-Text).</li>
            <li>Trích xuất các đặc trưng âm học (cao độ Pitch/F0, thời lượng, cường độ, tính ngập ngừng).</li>
            <li>Cung cấp điểm số, phản hồi phát âm và đề xuất câu hỏi cải thiện.</li>
          </ul>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            ✓ Cam kết bảo mật: Classnia AI KHÔNG sử dụng bản ghi âm giọng nói của người dùng để bán thương mại hoặc huấn luyện các mô hình AI mở đại trà khi chưa được sự đồng ý tường minh.
          </p>
        </section>

        {/* Section 7 */}
        <section id="section-7" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">7</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quyền Sở Hữu Trí Tuệ Nền Tảng</h2>
          </div>
          <p>
            Toàn bộ giao diện người dùng, mã nguồn phần mềm, thiết kế tương tác, thuật toán tâm trắc học, biểu tượng, hình ảnh thương hiệu và bộ ngữ liệu khảo thí thuộc quyền sở hữu trí tuệ độc quyền của Classnia AI và các đối tác cấp phép. Người dùng không được sao chép, tái bản hoặc sử dụng cho mục đích thương mại riêng mà không có văn bản chấp thuận trước.
          </p>
        </section>

        {/* Section 8 */}
        <section id="section-8" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">8</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gói Dịch Vụ, Hạn Mức Khảo Thí & Thanh Toán</h2>
          </div>
          <p>
            Classnia AI cung cấp các gói trải nghiệm khảo thí miễn phí và các gói nâng cao (Pro / Tổ chức giáo dục). Mức phí và quyền lợi của từng gói được niêm yết công khai tại trang Giá Dịch Vụ.
          </p>
          <p>
            Mọi khoản phí dịch vụ đã kích hoạt được tính theo chu kỳ đã chọn và không hoàn lại, trừ trường hợp phát sinh sự cố kỹ thuật nghiêm trọng kéo dài từ phía máy chủ Classnia AI khiến người dùng hoàn toàn không thể sử dụng dịch vụ.
          </p>
        </section>

        {/* Section 9 */}
        <section id="section-9" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">9</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Giới Hạn Trách Nhiệm Pháp Lý</h2>
          </div>
          <p>
            Trong giới hạn tối đa được pháp luật cho phép, Classnia AI không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc do hậu quả phát sinh từ:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Sự cố đường truyền mạng Internet cá nhân, thiết bị micro rè, xung đột trình duyệt của người dùng.</li>
            <li>Sự gián đoạn dịch vụ tạm thời để bảo trì định kỳ hoặc nâng cấp hệ thống máy chủ.</li>
            <li>Quyết định tuyển dụng, điểm thi chính thức hoặc kết quả học tập thực tế của thí sinh tại các kỳ thi bên ngoài.</li>
          </ul>
        </section>

        {/* Section 10 */}
        <section id="section-10" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">10</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chấm Dứt Dịch Vụ, Luật Điều Chỉnh & Kênh Liên Hệ</h2>
          </div>
          <p>
            Chúng tôi có quyền đình chỉ hoặc hủy bỏ vĩnh viễn quyền truy cập của bất kỳ người dùng nào vi phạm nghiêm trọng các Điều khoản này mà không cần báo trước.
          </p>
          <p>
            Bản Điều khoản này được điều chỉnh và giải thích theo quy định của pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết qua thương lượng thiện chí trước khi đưa ra Tòa án có thẩm quyền.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Bộ phận Pháp chế & Hỗ trợ Học viên:</span>
              <br />
              Email: <a href="mailto:support@classnia.id.vn" className="text-rose-600 hover:underline">support@classnia.id.vn</a> · Hotline: +84 (0) 902-CLASSNIA
            </div>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              <span>Xem Chính Sách Bảo Mật</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
