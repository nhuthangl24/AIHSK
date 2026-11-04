import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  FileText,
  ShieldAlert,
  Award,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Scale,
  Ban,
  AlertOctagon,
  Lock,
  Flame,
  Globe,
} from "lucide-react";

export const metadata = {
  title: "Điều Khoản Sử Dụng Dịch Vụ (Terms of Service) | Classnia AI",
  description:
    "Quy chuẩn pháp lý, thỏa thuận dịch vụ thử nghiệm miễn phí và điều kiện sử dụng nền tảng khảo thí khẩu ngữ tiếng Trung Classnia AI.",
};

export default function TermsPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Header */}
        <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cinnabar">Thỏa Thuận Dịch Vụ Ràng Buộc</Badge>
            <span className="text-xs text-slate-500 font-medium">
              Phiên bản 3.0 · Cập nhật: Tháng 11/2026
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Điều Khoản Sử Dụng Dịch Vụ
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Chào mừng bạn đến với <strong>Classnia AI</strong> (trực thuộc hệ sinh thái Classnia). Bản Điều khoản Sử dụng này ("Thỏa thuận") xác lập các quyền, nghĩa vụ và trách nhiệm pháp lý ràng buộc giữa Người sử dụng (bao gồm học viên, thí sinh, giáo viên, tổ chức) và Ban quản trị Classnia AI. Việc bạn đăng ký tài khoản, đăng nhập qua Google SSO hoặc bắt đầu bài thi đồng nghĩa với việc bạn đã đọc, hiểu và cam kết tuân thủ toàn bộ các điều khoản này.
          </p>
        </div>

        {/* Highlight Banner: Free Beta Platform & Academic Independence */}
        <div className="p-5 rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-200 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Tóm Lược Quan Trọng Dành Cho Người Dùng</span>
          </div>
          <ul className="space-y-1.5 text-xs leading-relaxed pl-5 list-disc text-amber-900/90 dark:text-amber-300/90">
            <li>
              <strong>Nền tảng Thử nghiệm Miễn phí (Free Public Beta):</strong> Classnia AI hiện đang mở trải nghiệm 100% miễn phí cho cộng đồng người học tiếng Trung nhằm hoàn thiện công nghệ AI. Không có bất kỳ khoản phí ẩn hoặc yêu cầu thu phí dịch vụ nào.
            </li>
            <li>
              <strong>Độc lập Khảo thí & Tính chất Tham khảo:</strong> Điểm số và ước lượng trình độ HSK/HSKK là chỉ số học thuật mô phỏng dựa trên thuật toán, <strong>KHÔNG thay thế cho Giấy chứng nhận HSK/HSKK chính thức</strong> do cơ quan khảo thí quốc gia Trung Quốc (CTI/Hanban) cấp.
            </li>
            <li>
              <strong>Chế tài nghiêm khắc đối với gian lận & phá hoại:</strong> Mọi hành vi dùng bot, cào dữ liệu, trích xuất prompt sư phạm hoặc can thiệp hệ thống sẽ bị khóa tài khoản vĩnh viễn và xử lý theo Luật An ninh mạng Việt Nam.
            </li>
          </ul>
        </div>

        {/* Table of Contents */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-rose-500" />
            <span>Mục Lục Điều Khoản</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <a href="#section-1" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">1.</span> Giá Trị Pháp Lý Hợp Đồng Điện Tử
            </a>
            <a href="#section-2" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">2.</span> Quy Chế Dịch Vụ Thử Nghiệm Miễn Phí
            </a>
            <a href="#section-3" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">3.</span> Đăng Ký Tài Khoản & Bảo Mật Phiên
            </a>
            <a href="#section-4" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">4.</span> Miễn Trừ Trách Nhiệm Về Chứng Chỉ & Kết Quả
            </a>
            <a href="#section-5" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">5.</span> Quy Định Nghiêm Cấm & Chế Tài Xử Phạt
            </a>
            <a href="#section-6" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">6.</span> Quyền Sở Hữu Trí Tuệ & Bí Quyết Công Nghệ
            </a>
            <a href="#section-7" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">7.</span> Bản Quyền Nội Dung Giọng Nói Người Học
            </a>
            <a href="#section-8" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">8.</span> Giới Hạn Trách Nhiệm Dịch Vụ
            </a>
            <a href="#section-9" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">9.</span> Đình Chỉ & Chấm Dứt Dịch Vụ
            </a>
            <a href="#section-10" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">10.</span> Luật Điều Chỉnh & Thẩm Quyền Giải Quyết
            </a>
          </div>
        </div>

        {/* Section 1 */}
        <section id="section-1" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Giá Trị Pháp Lý Của Hợp Đồng Điện Tử & Sự Chấp Thuận
            </h2>
          </div>
          <p>
            Thỏa thuận này được giao kết dưới hình thức hợp đồng điện tử theo quy định của <strong>Luật Giao dịch điện tử số 20/2023/QH15</strong> và <strong>Bộ luật Dân sự số 91/2015/QH13</strong> nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
          </p>
          <p>
            Bằng việc nhấn "Đăng ký", "Đăng nhập", hoặc truy cập vào bất kỳ phân hệ nào của trang web <code>chat.classnia.id.vn</code> / <code>classnia.id.vn</code>, người dùng xác nhận có đầy đủ năng lực hành vi dân sự để thực hiện giao dịch và cam kết chịu sự ràng buộc bởi Thỏa thuận này cùng Chính sách Bảo mật kèm theo. Nếu bạn là người dưới 18 tuổi, bạn cần có sự đồng ý hoặc giám sát của cha mẹ hoặc người giám hộ hợp pháp.
          </p>
        </section>

        {/* Section 2 */}
        <section id="section-2" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Quy Chế Nền Tảng Thử Nghiệm Miễn Phí (Free Community Beta License)
            </h2>
          </div>
          <p>
            Classnia AI được phát triển nhằm mục tiêu xã hội hóa và nâng cao năng lực phản xạ tiếng Trung cho cộng đồng người Việt:
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <p>
              <strong>1. Miễn phí 100%:</strong> Trong suốt giai đoạn thử nghiệm (Beta Test), người học được quyền truy cập đầy đủ các đề khảo thí khẩu ngữ 5 giai đoạn, phòng Trò chuyện tự do (Free-Talk) và nhận báo cáo chẩn đoán chuyên sâu mà không phải thanh toán bất kỳ khoản phí nào.
            </p>
            <p>
              <strong>2. Trạng thái Thử nghiệm (Beta Status):</strong> Hệ thống đang liên tục được tinh chỉnh về năng lực hiểu giọng đọc, ngữ điệu và khả năng tính toán cao độ âm học. Vì vậy, hệ thống có thể được bảo trì cập nhật không báo trước để cải thiện chất lượng phục vụ.
            </p>
            <p>
              <strong>3. Không kinh doanh mua bán hạn mức:</strong> Nghiêm cấm mọi hành vi mua bán lại tài khoản, môi giới cấp quyền hoặc trục lợi thương mại từ tài nguyên miễn phí của Classnia AI.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section id="section-3" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Đăng Ký Tài Khoản & Trách Nhiệm Bảo Mật
            </h2>
          </div>
          <p>
            Người dùng có trách nhiệm tự bảo vệ thông tin đăng nhập cá nhân:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>Mỗi tài khoản được đăng ký gắn liền với một địa chỉ thư điện tử hoặc một tài khoản Google duy nhất. Người dùng cam kết cung cấp thông tin chính xác.</li>
            <li>Người dùng chịu trách nhiệm duy nhất đối với toàn bộ hoạt động diễn ra dưới tài khoản của mình. Không được chia sẻ mật khẩu hoặc cho người khác mượn tài khoản nhằm mục đích gian lận khảo thí.</li>
            <li>Nếu phát hiện tài khoản bị xâm phạm hoặc có dấu hiệu truy cập trái phép, bạn có nghĩa vụ thông báo ngay cho đội ngũ hỗ trợ qua tab <strong>Yêu Cầu & Hỗ Trợ</strong>.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="section-4" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              4
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Tuyên Bố Miễn Trừ Trách Nhiệm Về Chứng Chỉ & Điểm Thi
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400">
              <AlertOctagon className="h-4 w-4 shrink-0" />
              <span>Độc Lập Khảo Thí & Phạm Vi Áp Dụng:</span>
            </div>
            <p>
              Các kết quả điểm số (0 - 100 điểm), cấp độ tương ứng (HSK 1 - HSK 6, CEFR A1 - C2, HSKK Sơ cấp / Trung cấp / Cao cấp) và các khuyến nghị phát âm tại Classnia AI là kết quả phân tích thuật toán ngôn ngữ học độc lập nhằm mục đích rèn luyện cá nhân và hỗ trợ giáo viên theo dõi năng lực học viên.
            </p>
            <p>
              <strong>Classnia AI KHÔNG LIÊN KẾT, KHÔNG ĐẠI DIỆN VÀ KHÔNG THAY THẾ</strong> cho cơ quan tổ chức khảo thí HSK quốc tế (CTI - Chinese Testing International), Viện Khổng Tử hoặc Bộ Giáo dục Trung Quốc. Báo cáo chẩn đoán của Classnia AI không thể sử dụng để thay thế chứng chỉ pháp lý phục vụ du học, xin thị thực (visa), tốt nghiệp đại học hoặc ứng tuyển việc làm đòi hỏi văn bằng nhà nước.
            </p>
            <p>
              Classnia AI không chịu trách nhiệm đối với bất kỳ quyết định tuyển sinh, xét học bổng, cấp visa hoặc điểm số thực tế của thí sinh trong các kỳ thi thực địa bên ngoài.
            </p>
          </div>
        </section>

        {/* Section 5: Các Hành Vi Bị Cấm Tuyệt Đối */}
        <section id="section-5" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              5
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Quy Định Nghiêm Cấm Tuyệt Đối & Chế Tài Xử Phạt
            </h2>
          </div>
          <p>
            Để bảo vệ cộng đồng học tập văn minh và môi trường kỹ thuật an toàn, người dùng cam kết <strong>TUYỆT ĐỐI KHÔNG</strong> thực hiện các hành vi sau:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-1">
              <strong className="text-rose-700 dark:text-rose-300 block font-bold">
                1. Tấn công mạng & Khai thác tự động (Anti-Scraping / Anti-Bot):
              </strong>
              Nghiêm cấm sử dụng robot, web crawler, scraper, extension tự động, script can thiệp hoặc bất kỳ phần mềm nào để tự động gửi request, cào đề thi, mô phỏng âm thanh giả lập nhằm đánh lừa hệ thống chấm điểm hoặc gây quá tải tài nguyên máy chủ.
            </div>

            <div className="p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-1">
              <strong className="text-rose-700 dark:text-rose-300 block font-bold">
                2. Dịch ngược & Đánh cắp Prompt (Anti-Reverse Engineering / Anti-Jailbreak):
              </strong>
              Nghiêm cấm thực hiện hành vi dịch ngược mã nguồn (reverse engineering), can thiệp API nội bộ, cố tình nhập câu lệnh độc hại (Prompt Injection / Jailbreak) nhằm trích xuất prompt sư phạm bí mật của Giám khảo AI, trọng số thang điểm rubric hoặc cơ sở dữ liệu đề thi bản quyền.
            </div>

            <div className="p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-1">
              <strong className="text-rose-700 dark:text-rose-300 block font-bold">
                3. Phát ngôn vi phạm pháp luật & Đạo đức:
              </strong>
              Nghiêm cấm phát ngôn vào micro các nội dung kích động bạo lực, khiêu dâm, xúc phạm danh dự nhân phẩm, xuyên tạc lịch sử, chống phá Nhà nước, tuyên truyền văn hóa phẩm độc hại hoặc vi phạm Luật An ninh mạng Việt Nam.
            </div>

            <div className="p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-1">
              <strong className="text-rose-700 dark:text-rose-300 block font-bold">
                4. Tạo tài khoản giả mạo & Gian lận có tổ chức:
              </strong>
              Nghiêm cấm đăng ký hàng loạt tài khoản ảo (clone accounts) bằng công cụ tự động hoặc mua bán chuyển nhượng tài khoản.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 dark:bg-slate-950 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <Ban className="h-4 w-4 shrink-0" />
              <span>CHẾ TÀI XỬ LÝ VI PHẠM TỨC THÌ:</span>
            </div>
            <p>
              Khi phát hiện bất kỳ dấu hiệu vi phạm nào, Classnia AI có toàn quyền:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Đình chỉ và khóa vĩnh viễn</strong> tài khoản người dùng ngay lập tức mà không cần báo trước và không có nghĩa vụ khôi phục dữ liệu.</li>
              <li><strong>Chặn địa chỉ IP và mã thiết bị</strong> vi phạm trên toàn bộ hệ thống Classnia.</li>
              <li><strong>Bảo lưu quyền khởi kiện yêu cầu bồi thường thiệt hại</strong> đối với mọi tổn thất về hạ tầng hoặc tài sản sở hữu trí tuệ, đồng thời chuyển giao hồ sơ chứng cứ cho Cơ quan An ninh mạng và Phòng chống tội phạm sử dụng công nghệ cao (A05) xử lý theo quy định pháp luật.</li>
            </ul>
          </div>
        </section>

        {/* Section 6: Sở Hữu Trí Tuệ */}
        <section id="section-6" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              6
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Quyền Sở Hữu Trí Tuệ & Tài Sản Vô Hình Độc Quyền
            </h2>
          </div>
          <p>
            Toàn bộ tài nguyên số cấu thành nên Classnia AI là tài sản trí tuệ độc quyền được pháp luật Việt Nam và các điều ước quốc tế về sở hữu trí tuệ bảo hộ:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>Nhãn hiệu & Nhận diện:</strong> Tên thương hiệu "Classnia", "Classnia AI", biểu trưng (Logo HSK/Classnia), giao diện phòng thi, đồ họa âm thanh và hệ thống design token.</li>
            <li><strong>Bí quyết công nghệ sư phạm:</strong> Hệ thống prompt dẫn dắt khảo thí 5 chặng, thuật toán trắc lượng tâm lý học chấm điểm đa chiều, bộ quy tắc nhận diện biến điệu ngữ âm tiếng Trung và kiến trúc phần mềm SaaS.</li>
            <li><strong>Ngữ liệu đề thi:</strong> Tuyển tập kịch bản đề thi phỏng vấn, câu hỏi thử thách, bài đọc trích đoạn và gợi ý phản xạ giao tiếp.</li>
            <li>Mọi hành vi sao chép, làm giả, phân phối lại hoặc tạo ra sản phẩm phái sinh đều bị nghiêm cấm tuyệt đối nếu không có thỏa thuận văn bản có chữ ký của đại diện có thẩm quyền Classnia AI.</li>
          </ul>
        </section>

        {/* Section 7: Bản Quyền Giọng Nói Của Học Viên */}
        <section id="section-7" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              7
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Bản Quyền Nội Dung Giọng Nói Của Học Viên
            </h2>
          </div>
          <p>
            Người học giữ nguyên quyền tác giả và quyền nhân thân đối với nội dung phát ngôn nguyên bản của mình trong bài thi. Khi người học tương tác qua micro, người học cấp cho Classnia AI một giấy phép sử dụng có giới hạn, phi độc quyền và miễn phí bản quyền nhằm các mục đích:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Nhận dạng tiếng nói thành văn bản chữ Hán (Speech-to-Text).</li>
            <li>Trích xuất các đặc trưng âm học phục vụ đối chiếu rubric 7 chiều.</li>
            <li>Lưu trữ tạm thời trong tài khoản của bạn để bạn và giáo viên trong lớp có thể nghe lại và xem biểu đồ tiến độ.</li>
          </ul>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            ✓ Classnia AI cam kết không bán bản ghi âm giọng nói của bạn cho bất kỳ đơn vị quảng cáo hoặc bên thứ ba nào.
          </p>
        </section>

        {/* Section 8: Giới Hạn Trách Nhiệm Dịch Vụ */}
        <section id="section-8" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              8
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Giới Hạn Trách Nhiệm Pháp Lý Tối Đa
            </h2>
          </div>
          <p>
            Trong phạm vi tối đa được pháp luật Việt Nam cho phép:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Dịch vụ được cung cấp trên cơ sở nguyên trạng ("AS-IS") và khi có sẵn ("AS-AVAILABLE"). Do đặc thù thử nghiệm công nghệ, Classnia AI không đảm bảo rằng dịch vụ sẽ hoàn toàn không xảy ra lỗi gián đoạn âm thanh hoặc lỗi đường truyền mạng cục bộ từ phía người dùng.</li>
            <li>Classnia AI không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp, thiệt hại ngẫu nhiên, mất mát dữ liệu do sự cố phần cứng của người dùng (micro hỏng, trình duyệt không tương thích, rớt mạng Internet cá nhân).</li>
            <li>Trong mọi tình huống, tổng mức trách nhiệm bồi thường cao nhất của Classnia AI (nếu có) đối với mọi khiếu nại phát sinh từ việc sử dụng dịch vụ sẽ không vượt quá số tiền mà người dùng đã thực tế chi trả cho Classnia AI (với nền tảng miễn phí, mức giới hạn tối đa là 0 VNĐ).</li>
          </ul>
        </section>

        {/* Section 9: Chấm Dứt Dịch Vụ */}
        <section id="section-9" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              9
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Đình Chỉ, Chấm Dứt & Thay Đổi Điều Khoản
            </h2>
          </div>
          <p>
            Classnia AI bảo lưu quyền sửa đổi, bổ sung các điều khoản này tại bất kỳ thời điểm nào nhằm tuân thủ quy định pháp luật mới hoặc điều chỉnh theo nâng cấp tính năng. Mọi sửa đổi có hiệu lực ngay khi được công bố trên trang web.
          </p>
          <p>
            Việc người dùng tiếp tục sử dụng hệ thống sau khi các điều khoản sửa đổi được công bố đồng nghĩa với việc chấp thuận toàn bộ các sửa đổi đó. Nếu không đồng ý, người dùng có quyền ngừng sử dụng và yêu cầu xóa tài khoản.
          </p>
        </section>

        {/* Section 10: Luật Điều Chỉnh & Kênh Liên Hệ */}
        <section id="section-10" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              10
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Luật Điều Chỉnh, Giải Quyết Tranh Chấp & Kênh Pháp Lý
            </h2>
          </div>
          <p>
            Bản Điều khoản này được điều chỉnh, diễn giải và thi hành hoàn toàn theo quy định của pháp luật Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
          </p>
          <p>
            Mọi tranh chấp, khiếu nại phát sinh từ hoặc liên quan đến Thỏa thuận này trước hết sẽ được ưu tiên giải quyết thông qua thương lượng thiện chí giữa các bên trong thời hạn 30 (ba mươi) ngày làm việc. Nếu không đạt được thỏa thuận, tranh chấp sẽ được đưa ra giải quyết tại Tòa án Nhân dân có thẩm quyền tại Thành phố Hồ Chí Minh, Việt Nam. Phán quyết của Tòa án là chung thẩm và ràng buộc đối với các bên.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 mt-4">
            <p><strong>Cơ quan Đại diện Pháp lý & Điều hành Nền tảng:</strong> Ban Quản trị Dự án Classnia AI</p>
            <p>
              <strong>Email pháp lý & Bản quyền:</strong>{" "}
              <a href="mailto:support@classnia.id.vn" className="text-rose-600 font-semibold hover:underline">
                support@classnia.id.vn
              </a>
            </p>
            <p>
              <strong>Hệ thống tiếp nhận phản hồi & Hỗ trợ kỹ thuật:</strong>{" "}
              <Link href="/dashboard/support" className="text-rose-600 font-semibold hover:underline">
                Tab Yêu Cầu & Hỗ Trợ
              </Link>
            </p>
            <p>
              <strong>Địa chỉ hệ sinh thái đào tạo:</strong>{" "}
              <a
                href={process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://classnia.id.vn"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-600 font-semibold hover:underline"
              >
                https://classnia.id.vn
              </a>
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              <span>Đọc Chính Sách Bảo Mật (Privacy Policy)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/dashboard/support"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <span>Trung Tâm Hỗ Trợ & Báo Lỗi</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
