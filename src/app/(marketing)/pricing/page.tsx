import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="cinnabar">Bảng Giá Minh Bạch & Linh Hoạt</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Đầu Tư Cho Năng Lực Khẩu Ngữ Tiếng Trung Chuẩn Quốc Tế
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Lựa chọn gói dịch vụ tối ưu cho lộ trình cá nhân, lớp học tiếng Trung hoặc viện ngôn ngữ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {[
            {
              name: "Miễn Phí Khởi Động",
              price: "$0",
              desc: "Chẩn đoán nhanh cho thí sinh tự do.",
              features: [
                "3 bài khảo thí mỗi tháng",
                "Phỏng vấn AI tiêu chuẩn 5 giai đoạn",
                "Ước tính trình độ HSK & HSKK",
                "Đánh giá điểm mạnh & điểm yếu cơ bản",
                "Hỗ trợ cộng đồng",
              ],
              cta: "Bắt Đầu Miễn Phí",
              href: "/register",
              highlighted: false,
            },
            {
              name: "Học Viên Chuyên Nghiệp",
              price: "$19",
              period: "/tháng",
              desc: "Phân tích toàn diện cho người học tiếng Trung nghiêm túc.",
              features: [
                "30 bài khảo thí mỗi tháng",
                "Đầy đủ điểm số tâm trắc học 7 chiều kích",
                "Chẩn đoán âm học biến điệu & thanh điệu",
                "Gợi ý nâng cấp ngữ pháp & từ vựng",
                "Lưu trữ & nghe lại âm thanh hội thoại",
                "Xuất & in báo cáo chẩn đoán PDF",
                "Lộ trình học tập 4 tuần cá nhân hóa",
              ],
              cta: "Nâng Cấp Pro",
              href: "/register",
              highlighted: true,
            },
            {
              name: "Giảng Viên & Lớp Học",
              price: "$49",
              period: "/tháng",
              desc: "Bộ công cụ đắc lực cho giáo viên và gia sư tiếng Trung.",
              features: [
                "120 bài khảo thí mỗi tháng",
                "Tạo không giới hạn lớp học sinh",
                "Giao bài thi khẩu ngữ kèm thời hạn",
                "Xem lại biên bản thoại & file âm thanh học sinh",
                "Phân tích tiến độ cả lớp & sổ điểm",
                "Xuất bảng điểm lớp học ra file CSV",
                "Hỗ trợ kỹ thuật ưu tiên cho giảng viên",
              ],
              cta: "Bắt Đầu Gói Giảng Viên",
              href: "/register",
              highlighted: false,
            },
            {
              name: "Doanh Nghiệp & Tổ Chức",
              price: "$199",
              period: "/tháng",
              desc: "Hạ tầng khảo thí hoàn chỉnh cho trường học và viện đào tạo.",
              features: [
                "1.000 bài khảo thí mỗi tháng",
                "Quản lý nhiều giảng viên và khoa đào tạo",
                "Bao gồm tối đa 250 tài khoản học sinh",
                "Phân lập dữ liệu đa người thuê nghiêm ngặt",
                "Tùy chỉnh đề thi & tiêu chí chấm điểm",
                "Hỗ trợ tích hợp SSO, SAML & LMS",
                "Chuyên viên tư vấn triển khai đồng hành",
              ],
              cta: "Liên Hệ Doanh Nghiệp",
              href: "/register",
              highlighted: false,
            },
          ].map((plan, i) => (
            <Card
              key={i}
              className={`flex flex-col justify-between ${
                plan.highlighted
                  ? "border-2 border-rose-600 shadow-xl dark:border-rose-500"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <CardContent className="p-6 space-y-4">
                {plan.highlighted && (
                  <Badge variant="cinnabar" className="text-[10px]">
                    Khuyên Dùng
                  </Badge>
                )}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500">{plan.desc}</p>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.period && <span className="text-xs text-slate-500">{plan.period}</span>}
                </div>
                <ul className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href={plan.href}>
                  <Button
                    className={`w-full font-semibold ${
                      plan.highlighted
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
