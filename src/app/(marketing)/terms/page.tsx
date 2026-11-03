import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="space-y-3">
          <Badge variant="cinnabar">Điều Khoản & Điều Kiện</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Điều Khoản Sử Dụng Dịch Vụ
          </h1>
          <p className="text-xs text-slate-500">Cập nhật lần cuối: Tháng 11/2026</p>
        </div>

        <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Mô Tả Dịch Vụ</h2>
          <p>
            Classnia AI cung cấp giải pháp phần mềm dạng dịch vụ (SaaS) phục vụ luyện tập khẩu ngữ tiếng Trung, phỏng vấn thi nói mô phỏng bằng AI và xuất báo cáo chẩn đoán năng lực ngôn ngữ học.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Miễn Trừ Trách Nhiệm Về Kết Quả Đánh Giá</h2>
          <p>
            Điểm số, ước tính cấp độ CEFR và HSK do Classnia AI tạo ra là các chỉ số học thuật phục vụ tự rèn luyện và theo dõi giảng dạy trong lớp học. Các chỉ số này không cấu thành chứng chỉ chính thức được cấp bởi bất kỳ cơ quan chính phủ hay tổ chức khảo thí quốc gia nào.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Quy Tắc Sử Dụng Hợp Chuẩn</h2>
          <p>
            Người dùng cam kết sử dụng Classnia AI tuân thủ pháp luật hiện hành. Mọi hành vi cố tình dịch ngược mã nguồn, phá hoại hạ tầng mạng hoặc tải lên âm thanh của bên thứ ba trái phép đều bị nghiêm cấm.
          </p>
        </section>
      </div>
    </div>
  );
}
