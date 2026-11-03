import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="space-y-3">
          <Badge variant="cinnabar">Bảo Mật & Tin Cậy</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Chính Sách Bảo Mật & Dữ Liệu Giọng Nói
          </h1>
          <p className="text-xs text-slate-500">Cập nhật lần cuối: Tháng 11/2026</p>
        </div>

        <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Bản Ghi Âm & Quyền Riêng Tư Giọng Nói</h2>
          <p>
            Khi bạn thực hiện bài khảo thí trên Classnia AI, thiết bị của bạn sẽ ghi lại giọng nói câu trả lời. File âm thanh này chỉ được xử lý phục vụ phân tích âm học, chuyển văn bản, trích xuất đường nét thanh điệu và tạo báo cáo chẩn đoán.
          </p>
          <p>
            Chúng tôi KHÔNG BAO GIỜ bán, cấp phép thương mại hoặc công khai bản ghi âm của bạn. Chúng tôi KHÔNG sử dụng giọng nói của học viên để huấn luyện các mô hình AI đại trà khi chưa có sự đồng thuận rõ ràng.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Kiểm Soát Truy Cập & Phân Lập Dữ Liệu</h2>
          <p>
            Bản ghi âm và biên bản hội thoại chỉ có thể truy cập bởi chính bạn, giảng viên phụ trách lớp học của bạn và quản trị viên tổ chức giáo dục được xác minh. Cơ chế phân quyền cấp máy chủ nghiêm ngặt ngăn chặn mọi hành vi truy cập trái phép chéo tổ chức.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Lưu Trữ & Quyền Yêu Cầu Xóa Dữ Liệu</h2>
          <p>
            Người dùng có toàn quyền xóa từng bản ghi âm bài thi hoặc yêu cầu xóa toàn bộ tài khoản bất kỳ lúc nào từ mục cài đặt hồ sơ. Dữ liệu trên hệ thống lưu trữ S3 sẽ được xóa vĩnh viễn ngay khi có yêu cầu.
          </p>
        </section>
      </div>
    </div>
  );
}
