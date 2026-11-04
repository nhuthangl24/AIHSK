import type { Metadata } from "next";
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
  Gavel,
  ShieldCheck,
  Zap,
  Terminal,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Điều Khoản Sử Dụng Dịch Vụ (Terms of Service) | Classnia AI",
  description:
    "Văn bản pháp lý quy định điều kiện sử dụng, quyền sở hữu trí tuệ, quy chuẩn chống gian lận, miễn trừ trách nhiệm và chế tài pháp lý ràng buộc của nền tảng khảo thí khẩu ngữ Classnia AI.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Điều Khoản Sử Dụng Dịch Vụ Ràng Buộc | Classnia AI",
    description: "Thỏa thuận dịch vụ khảo thí khẩu ngữ tiếng Trung AI và quy chế pháp lý nghiêm ngặt.",
  },
};

export default function TermsPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Header */}
        <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="destructive" className="bg-rose-600 text-xs font-bold">
              Thỏa Thuận Pháp Lý Ràng Buộc (Binding Legal Contract)
            </Badge>
            <span className="text-xs text-slate-500 font-medium">
              Hiệu lực: Tháng 11/2026 · Phiên bản 4.0 Toàn Diện
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Điều Khoản Sử Dụng Dịch Vụ
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Vui lòng đọc kỹ toàn bộ văn bản Điều khoản Sử dụng này (&ldquo;<strong>Thỏa thuận</strong>&rdquo;) trước khi thực hiện đăng ký, đăng nhập hoặc bắt đầu bất kỳ lượt phỏng vấn, khảo thí âm thanh nào trên hệ thống <strong>Classnia AI</strong> (tại các tên miền <code>chat.classnia.id.vn</code>, <code>classnia.id.vn</code> hoặc các phân hệ dịch vụ đi kèm). Bằng việc tương tác với hệ thống, bạn xác nhận đã đọc, hiểu thấu đáo và chấp thuận vô điều kiện toàn bộ các quy định pháp lý nghiêm ngặt dưới đây.
          </p>
        </div>

        {/* Tuyên bố tóm lược nghiêm ngặt */}
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 dark:text-amber-200 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
            <AlertOctagon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>THÔNG BÁO QUAN TRỌNG VỀ PHÁP LÝ & AN NINH MẠNG</span>
          </div>
          <ul className="space-y-2 text-xs leading-relaxed pl-5 list-disc text-amber-900/90 dark:text-amber-200/90">
            <li>
              <strong>Hợp đồng có hiệu lực tức thì:</strong> Thao tác đăng ký tài khoản, đăng nhập Google SSO hoặc gửi âm thanh qua micro có giá trị pháp lý tương đương với chữ ký tay của bạn trên hợp đồng dịch vụ điện tử theo Luật Giao dịch điện tử 2023.
            </li>
            <li>
              <strong>Độc lập khảo thí tuyệt đối:</strong> Điểm số, ước tính cấp độ HSK/HSKK và báo cáo chẩn đoán là sản phẩm nghiên cứu thuật toán ngôn ngữ học độc lập của Classnia AI; <strong>KHÔNG thay thế chứng chỉ pháp lý</strong> do Ủy ban Khảo thí Giáo dục Quốc tế Trung Quốc (CTI) hoặc Bộ Giáo dục Trung Quốc cấp.
            </li>
            <li>
              <strong>Chế tài nghiêm khắc với hành vi tấn công & cào dữ liệu:</strong> Mọi hành vi dump đề thi, jailbreak prompt sư phạm, mô phỏng âm thanh bot, đảo ngược mã nguồn hoặc khai thác lỗ hổng sẽ bị khóa tài khoản vĩnh viễn, truy thu bồi thường thiệt hại và chuyển hồ sơ sang Cục An ninh mạng và Phòng chống tội phạm công nghệ cao (A05) - Bộ Công an.
            </li>
          </ul>
        </div>

        {/* Mục lục điều khoản */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-rose-500" />
            <span>Mục Lục Điều Khoản Pháp Lý (12 Phần Chi Tiết)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <a href="#section-1" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">1.</span> Giá Trị Pháp Lý Của Thỏa Thuận Điện Tử
            </a>
            <a href="#section-2" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">2.</span> Điều Kiện Chủ Thể & Năng Lực Hành Vi
            </a>
            <a href="#section-3" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">3.</span> Quy Chế Nền Tảng Thử Nghiệm Miễn Phí (Beta)
            </a>
            <a href="#section-4" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">4.</span> Miễn Trừ Trách Nhiệm Về Văn Bằng Khảo Thí
            </a>
            <a href="#section-5" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">5.</span> Trách Nhiệm Quản Lý Định Danh & Tài Khoản
            </a>
            <a href="#section-6" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">6.</span> Các Hành Vi Bị Nghiêm Cấm Tuyệt Đối
            </a>
            <a href="#section-7" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">7.</span> Quyền Sở Hữu Trí Tuệ & Bí Mật Kinh Doanh
            </a>
            <a href="#section-8" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">8.</span> Bản Quyền Âm Thanh & Tín Hiệu Phát Ngôn
            </a>
            <a href="#section-9" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">9.</span> Giới Hạn Trách Nhiệm Pháp Lý Tối Đa
            </a>
            <a href="#section-10" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">10.</span> Chế Tài Vi Phạm, Khóa Tài Khoản & Bồi Thường
            </a>
            <a href="#section-11" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">11.</span> Sửa Đổi Điều Khoản & Hiệu Lực Cập Nhật
            </a>
            <a href="#section-12" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <span className="font-semibold text-rose-500">12.</span> Luật Điều Chỉnh & Thẩm Quyền Tòa Án
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
              Giá Trị Pháp Lý Của Thỏa Thuận Điện Tử & Sự Ràng Buộc
            </h2>
          </div>
          <p>
            Thỏa thuận này là hợp đồng dịch vụ điện tử hợp pháp được xác lập căn cứ theo <strong>Luật Giao dịch điện tử số 20/2023/QH15</strong>, <strong>Bộ luật Dân sự số 91/2015/QH13</strong> và <strong>Luật An ninh mạng số 24/2018/QH14</strong> của Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
          </p>
          <p>
            Bằng việc nhấn vào nút &ldquo;Đăng ký&rdquo;, &ldquo;Đăng nhập với Google&rdquo;, &ldquo;Bắt đầu bài thi&rdquo; hoặc tiếp tục truy cập bất kỳ giao diện, API nào của hệ thống, người dùng thể hiện ý chí cam kết đồng thuận và bị ràng buộc tuyệt đối bởi Thỏa thuận này cùng <Link href="/privacy" className="text-rose-600 font-semibold hover:underline">Chính Sách Bảo Mật</Link>. Nếu bạn không đồng ý với bất kỳ phần nào của Thỏa thuận này, bạn phải lập tức dừng ngay mọi hành vi truy cập và ngừng sử dụng dịch vụ.
          </p>
        </section>

        {/* Section 2 */}
        <section id="section-2" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Điều Kiện Chủ Thể, Năng Lực Dân Sự & Người Chưa Thành Niên
            </h2>
          </div>
          <p>
            Để sử dụng Classnia AI, người dùng cam đoan và bảo đảm rằng:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>Người dùng từ đủ 18 tuổi trở lên có đầy đủ năng lực hành vi dân sự theo quy định pháp luật để tự chịu trách nhiệm về mọi hành vi tương tác trên mạng.</li>
            <li>Trường hợp người học dưới 18 tuổi (bao gồm học sinh THCS, THPT hoặc thiếu nhi), việc đăng ký và làm bài thi phải có sự đồng thuận, hướng dẫn hoặc giám sát trực tiếp của cha mẹ hoặc người giám hộ hợp pháp. Cha mẹ/người giám hộ chịu trách nhiệm dân sự liên đới đối với mọi hoạt động của người học chưa thành niên.</li>
            <li>Người dùng cam kết không thuộc diện bị hạn chế năng lực hành vi hoặc bị pháp luật cấm tham gia giao dịch trên không gian mạng.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="section-3" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Quy Chế Nền Tảng Thử Nghiệm Miễn Phí (Free Community Beta License)
            </h2>
          </div>
          <p>
            Classnia AI hiện đang vận hành theo cơ chế <strong>Bản Thử Nghiệm Mở Hoàn Toàn Miễn Phí (Public Free Beta)</strong> phục vụ cộng đồng học sinh, sinh viên và người đi làm tại Việt Nam:
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <p>
              <strong>1. Miễn phí bản quyền sử dụng:</strong> Người học được cấp quyền sử dụng cá nhân, phi thương mại, không thể chuyển nhượng để luyện thi khẩu ngữ 5 giai đoạn, phòng Trò chuyện tự do cùng Giám khảo AI và nhận báo cáo chẩn đoán 7 chiều kích mà không bị thu bất kỳ khoản phí nào.
            </p>
            <p>
              <strong>2. Trạng thái phát triển kỹ thuật liên tục (Beta Status):</strong> Hệ thống liên tục được huấn luyện và tinh chỉnh về bộ phân giải thanh điệu tiếng Trung, tính toán độ biến thiên ngữ âm F0. Do đó, hệ thống có thể tạm gián đoạn hoặc bảo trì nâng cấp mà không bắt buộc phải có thông báo trước.
            </p>
            <p>
              <strong>3. Nghiêm cấm thương mại hóa tài nguyên miễn phí:</strong> Bất kỳ cá nhân hoặc tổ chức nào có hành vi thu tiền của học viên để cung cấp quyền truy cập vào Classnia AI, hoặc bán lại tài khoản Classnia AI đều bị coi là hành vi gian lận thương mại nghiêm trọng và sẽ bị xử lý pháp lý.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section id="section-4" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              4
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Tuyên Bố Miễn Trừ Trách Nhiệm Về Văn Bằng & Chứng Chỉ Khảo Thí
            </h2>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-xs space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
              <Scale className="h-4 w-4 shrink-0" />
              <span>ĐỘC LẬP HỌC THUẬT & PHẠM VI GIÁ TRỊ CỦA BÁO CÁO:</span>
            </div>
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              Các chỉ số điểm số (thang 100), ước lượng trình độ HSK (HSK 1 - HSK 6), khung tham chiếu châu Âu (CEFR A1 - C2), chứng chỉ hoàn thành hoặc báo cáo điểm 7 chiều kích của Classnia AI là kết quả đánh giá bằng thuật toán đối thoại AI nhằm mục đích tự ôn luyện, rèn luyện phản xạ và hỗ trợ công tác giảng dạy.
            </p>
            <p className="leading-relaxed font-bold text-slate-900 dark:text-white">
              Classnia AI KHÔNG CÓ BẤT KỲ MỐI QUAN HỆ ĐẠI DIỆN, LIÊN DOANH, ỦY QUYỀN HOẶC THAY THẾ NÀO đối với Ủy ban Khảo thí Giáo dục Quốc tế Trung Quốc (CTI - Chinese Testing International), Viện Khổng Tử, Trung tâm Hợp tác Giao lưu Ngôn ngữ Bộ Giáo dục Trung Quốc (CLEC), hoặc bất kỳ cơ quan khảo thí cấp nhà nước nào.
            </p>
            <p className="leading-relaxed text-slate-600 dark:text-slate-400">
              Báo cáo của Classnia AI không mang giá trị văn bằng nhà nước, không có giá trị thay thế chứng chỉ pháp lý phục vụ du học, xin thị thực (visa), xét tốt nghiệp đại học hoặc tuyển dụng cán bộ công chức đòi hỏi chứng chỉ chuẩn quốc gia. Classnia AI hoàn toàn miễn trừ trách nhiệm pháp lý nếu kết quả thi thực tế của thí sinh tại các kỳ thi thực địa ngoài xã hội khác biệt so với điểm số chẩn đoán của AI.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="section-5" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              5
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Trách Nhiệm Quản Lý Định Danh, Mật Khẩu & Phiên Đăng Nhập
            </h2>
          </div>
          <p>
            Người dùng có trách nhiệm tuyệt đối trong việc bảo vệ bí mật thông tin tài khoản:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>Người dùng cam kết cung cấp thông tin trung thực khi đăng ký hoặc xác thực qua tài khoản Google. Nghiêm cấm mạo danh cá nhân, tổ chức khác.</li>
            <li>Mỗi tài khoản được cấp cho duy nhất một cá nhân sử dụng. Nghiêm cấm hành vi chia sẻ tài khoản cho nhiều người cùng thi, cho mượn tài khoản nhằm gian lận chỉ số năng lực.</li>
            <li>Người dùng tự chịu toàn bộ trách nhiệm về mọi hành vi, lời nói, tương tác diễn ra dưới phiên đăng nhập của tài khoản mình.</li>
            <li>Nếu nghi ngờ tài khoản bị lộ mật khẩu, bị truy cập trái phép hoặc có dấu hiệu chiếm đoạt, bạn phải thông báo ngay lập tức cho Classnia AI qua hệ thống <Link href="/dashboard/support" className="text-rose-600 font-semibold hover:underline">Tiếp Nhận Yêu Cầu Hỗ Trợ</Link> để phong tỏa tài khoản.</li>
          </ul>
        </section>

        {/* Section 6: Các Hành Vi Bị Cấm Tuyệt Đối */}
        <section id="section-6" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              6
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Quy Định Các Hành Vi Bị Nghiêm Cấm Tuyệt Đối (Zero Tolerance)
            </h2>
          </div>
          <p>
            Nhằm bảo đảm môi trường khảo thí trong sạch, an toàn kỹ thuật và tuân thủ tuyệt đối Luật An ninh mạng Việt Nam, người dùng cam kết <strong>TUYỆT ĐỐI KHÔNG THỰC HIỆN</strong> các hành vi sau:
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-1">
              <strong className="text-rose-700 dark:text-rose-300 block font-bold text-sm">
                1. Tấn công mạng, Khai thác tự động & Cào dữ liệu (Anti-Scraping / Anti-Bot):
              </strong>
              Nghiêm cấm sử dụng robot, spider, crawler, scraper, extension tự động, script can thiệp hoặc bất kỳ phần mềm bên thứ ba nào để cào đề thi, tải hàng loạt ngân hàng câu hỏi, mô phỏng luồng âm thanh giả lập nhằm đánh lừa thuật toán nhận dạng hoặc gây quá tải hệ thống máy chủ (DDoS / DoS).
            </div>

            <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-1">
              <strong className="text-rose-700 dark:text-rose-300 block font-bold text-sm">
                2. Dịch ngược mã nguồn & Tấn công Prompt (Anti-Jailbreak / Prompt Injection):
              </strong>
              Nghiêm cấm hành vi dịch ngược (reverse engineering), decompile, deobfuscate mã nguồn; can thiệp trái phép vào các API nội bộ; cố tình truyền các chuỗi câu lệnh độc hại (Prompt Injection, System Jailbreak, Roleplay bypass) nhằm ép Giám khảo AI tiết lộ cấu hình hệ thống, prompt chỉ đạo sư phạm hoặc trọng số thuật toán rubric.
            </div>

            <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-1">
              <strong className="text-rose-700 dark:text-rose-300 block font-bold text-sm">
                3. Phát ngôn vi phạm an ninh quốc gia & Thuần phong mỹ tục:
              </strong>
              Nghiêm cấm nói vào micro các nội dung chống phá Nhà nước CHXHCN Việt Nam; xúc phạm lãnh tụ, danh nhân; kích động hận thù dân tộc, tôn giáo; tuyên truyền văn hóa phẩm đồi trụy; quấy rối, xúc phạm danh dự nhân phẩm của người khác hoặc vi phạm Điều 8, Điều 18 Luật An ninh mạng 2018.
            </div>

            <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-1">
              <strong className="text-rose-700 dark:text-rose-300 block font-bold text-sm">
                4. Tạo tài khoản hàng loạt & Gian lận có tổ chức:
              </strong>
              Nghiêm cấm sử dụng công cụ tạo hàng loạt tài khoản rác (clone accounts) nhằm spam tài nguyên máy tính, chiếm dụng hạn ngạch hoặc thực hiện các hành vi gian dối trong quá trình kiểm tra đánh giá.
            </div>
          </div>
        </section>

        {/* Section 7: Sở Hữu Trí Tuệ */}
        <section id="section-7" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              7
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Quyền Sở Hữu Trí Tuệ & Bảo Hộ Bí Mật Kinh Doanh
            </h2>
          </div>
          <p>
            Toàn bộ các yếu tố cấu thành nên nền tảng Classnia AI là tài sản trí tuệ độc quyền được pháp luật Việt Nam (Luật Sở hữu trí tuệ 2022) và các điều ước quốc tế bảo vệ toàn diện:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>Nhãn hiệu & Thương hiệu:</strong> Tên gọi &ldquo;Classnia&rdquo;, &ldquo;Classnia AI&rdquo;, biểu trưng logo, bộ nhận diện đồ họa phòng thi, slogan và tài sản thương mại.</li>
            <li><strong>Bí quyết công nghệ & Thuật toán:</strong> Toàn bộ cấu trúc kịch bản dẫn dắt phỏng vấn 5 giai đoạn thích ứng, hệ thống prompt sư phạm độc quyền, thuật toán phân tích đường nét cao độ F0, bộ tiêu chí chấm điểm 7 chiều kích tâm trắc học và mã nguồn nền tảng.</li>
            <li><strong>Ngân hàng dữ liệu đề thi:</strong> Tuyển tập đề thi, tình huống giao tiếp HSK/HSKK, câu hỏi gợi mở và phiên âm Pinyin chuẩn hóa.</li>
            <li>Mọi hành vi sao chép, làm nhái, phân phối lại, cho thuê, thương mại hóa hoặc tạo ra sản phẩm phái sinh đều cấu thành tội xâm phạm quyền tác giả và bí mật kinh doanh, sẽ bị truy cứu trách nhiệm dân sự và hình sự theo quy định pháp luật.</li>
          </ul>
        </section>

        {/* Section 8: Bản Quyền Âm Thanh */}
        <section id="section-8" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              8
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Bản Quyền Tín Hiệu Âm Thanh & Phát Ngôn Của Người Học
            </h2>
          </div>
          <p>
            Người học giữ nguyên quyền tác giả và quyền nhân thân đối với nội dung phát ngôn nguyên bản của mình trong bài thi. Khi người học tương tác qua micro, người học cấp cho Classnia AI một giấy phép sử dụng có giới hạn, phi độc quyền và miễn phí bản quyền nhằm các mục đích kỹ thuật hợp pháp sau:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Nhận dạng luồng âm thanh thành văn bản chữ Hán (Speech-to-Text).</li>
            <li>Trích xuất các đặc trưng âm học phục vụ đối chiếu rubric 7 chiều kích.</li>
            <li>Lưu trữ an toàn trong tài khoản của bạn để bạn và giáo viên trong lớp có thể nghe lại và xem biểu đồ tiến độ.</li>
          </ul>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
            ✓ Classnia AI cam kết KHÔNG BAO GIỜ bán hoặc chuyển giao bản ghi âm giọng nói của bạn cho bất kỳ đơn vị quảng cáo hoặc bên thứ ba nào.
          </p>
        </section>

        {/* Section 9: Giới Hạn Trách Nhiệm Pháp Lý Tối Đa */}
        <section id="section-9" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              9
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Giới Hạn Trách Nhiệm Pháp Lý Tối Đa (Limitation of Liability)
            </h2>
          </div>
          <p>
            Trong phạm vi tối đa được pháp luật Việt Nam cho phép:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>Dịch vụ được cung cấp trên cơ sở nguyên trạng (&ldquo;AS-IS&rdquo;) và khi sẵn có (&ldquo;AS-AVAILABLE&rdquo;). Classnia AI không bảo đảm rằng dịch vụ sẽ hoàn toàn không bị gián đoạn do lỗi đường truyền mạng Internet cá nhân của người học, lỗi phần cứng micro hoặc trình duyệt không tương thích.</li>
            <li>Classnia AI được miễn trừ hoàn toàn khỏi mọi trách nhiệm đối với các thiệt hại gián tiếp, thiệt hại ngẫu nhiên, thiệt hại hệ quả, mất cơ hội du học, mất cơ hội việc làm, mất học bổng hoặc tổn thất dữ liệu cục bộ từ phía người dùng.</li>
            <li>Trong mọi tình huống, mức trách nhiệm bồi thường cao nhất của Classnia AI (nếu có theo phán quyết của Tòa án có thẩm quyền) sẽ không vượt quá tổng số tiền thực tế mà người dùng đã thanh toán cho Classnia AI trong vòng 30 ngày trước khi phát sinh tranh chấp (đối với nền tảng thử nghiệm miễn phí, mức bồi thường tối đa ấn định là 0 VNĐ).</li>
          </ul>
        </section>

        {/* Section 10: Chế Tài Xử Phạt */}
        <section id="section-10" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              10
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Chế Tài Xử Lý Vi Phạm, Đơn Phương Chấm Dứt & Bồi Thường
            </h2>
          </div>
          <p>
            Khi phát hiện bất kỳ dấu hiệu vi phạm nào đối với Thỏa thuận này, Classnia AI có toàn quyền áp dụng các biện pháp xử lý sau mà không cần báo trước:
          </p>
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <Ban className="h-4 w-4" />
              <span>HỆ THỐNG CHẾ TÀI XỬ LÝ VI PHẠM TỨC THÌ:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>Khóa vĩnh viễn và tiêu hủy tài khoản:</strong> Đóng toàn bộ quyền truy cập của người vi phạm ngay lập tức, không có nghĩa vụ sao lưu hay hoàn trả dữ liệu.</li>
              <li><strong>Chặn địa chỉ IP và mã thiết bị (Hardware Fingerprint):</strong> Ngăn chặn vĩnh viễn thiết bị và mạng vi phạm truy cập vào hệ thống Classnia.</li>
              <li><strong>Khởi kiện yêu cầu bồi thường thiệt hại:</strong> Buộc bên vi phạm bồi thường toàn bộ thiệt hại về hạ tầng, tổn thất uy tín thương hiệu cùng toàn bộ chi phí thuê luật sư, chi phí giám định kỹ thuật số.</li>
              <li><strong>Chuyển hồ sơ cơ quan bảo vệ pháp luật:</strong> Trình báo và cung cấp nhật ký kỹ thuật cho Cơ quan Công an và Cơ quan An ninh mạng để điều tra khởi tố theo quy định của Bộ luật Hình sự.</li>
            </ul>
          </div>
        </section>

        {/* Section 11: Sửa Đổi Điều Khoản */}
        <section id="section-11" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              11
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Sửa Đổi, Bổ Sung & Hiệu Lực Của Điều Khoản Mới
            </h2>
          </div>
          <p>
            Classnia AI có toàn quyền sửa đổi, bổ sung hoặc điều chỉnh các điều khoản này tại bất kỳ thời điểm nào nhằm cập nhật theo tiến bộ công nghệ hoặc thay đổi của pháp luật.
          </p>
          <p>
            Bản điều khoản sửa đổi sẽ có hiệu lực ngay khi được công bố công khai trên trang web này kèm theo ngày cập nhật mới nhất. Việc bạn tiếp tục sử dụng hệ thống sau khi các điều chỉnh được công bố cấu thành việc bạn đã đọc và đồng thuận hoàn toàn với các nội dung sửa đổi đó.
          </p>
        </section>

        {/* Section 12: Luật Điều Chỉnh & Kênh Liên Hệ */}
        <section id="section-12" className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center">
              12
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Luật Điều Chỉnh, Giải Quyết Tranh Chấp & Kênh Pháp Lý
            </h2>
          </div>
          <p>
            Thỏa thuận này được điều chỉnh, diễn giải và thi hành hoàn toàn theo quy định của <strong>pháp luật Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam</strong>.
          </p>
          <p>
            Mọi bất đồng hoặc tranh chấp phát sinh sẽ được các bên ưu tiên giải quyết thông qua thương lượng thiện chí trong vòng 30 (ba mươi) ngày làm việc. Trường hợp không thể thống nhất, tranh chấp sẽ được đệ trình lên giải quyết tại <strong>Tòa án Nhân dân có thẩm quyền tại Thành phố Hồ Chí Minh, Việt Nam</strong>. Bản án hoặc phán quyết của Tòa án là chung thẩm và có hiệu lực thi hành bắt buộc đối với các bên.
          </p>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2 mt-4">
            <p className="font-bold text-slate-900 dark:text-white text-sm">THÔNG TIN ĐƠN VỊ VẬN HÀNH & KÊNH PHÁP LÝ:</p>
            <p><strong>Cơ quan Đại diện Điều hành Nền tảng:</strong> Ban Điều Hành Dự Án Nền Tảng Classnia AI</p>
            <p>
              <strong>Kênh tiếp nhận khiếu nại & Hỗ trợ kỹ thuật:</strong>{" "}
              <Link href="/dashboard/support" className="text-rose-600 font-bold hover:underline">
                Hệ Thống Yêu Cầu & Báo Lỗi Trực Tuyến
              </Link>
            </p>
            <p>
              <strong>Cổng thông tin hệ sinh thái:</strong>{" "}
              <a
                href={process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://classnia.id.vn"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-600 font-bold hover:underline"
              >
                https://classnia.id.vn
              </a>
            </p>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              <span>Xem Chính Sách Bảo Mật (Nghị định 13/2023/NĐ-CP)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/dashboard/support"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <span>Gửi Phiếu Yêu Cầu Hỗ Trợ Kỹ Thuật</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
