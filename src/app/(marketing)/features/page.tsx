import type { Metadata } from "next";
import Link from "next/link";
import { Mic, BarChart3, Users, BookOpen, Volume2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Tính Năng Giám Khảo AI & Thang Điểm 7 Chiều",
  description:
    "Khám phá các tính năng hàng đầu của Classnia AI: Giám khảo AI thích ứng 5 giai đoạn, chấm điểm ngữ âm 7 chiều, chẩn đoán thanh điệu và quản lý lớp học.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Tính Năng Giám Khảo AI & Thang Điểm 7 Chiều | Classnia AI",
    description:
      "Bộ giải pháp toàn diện kết hợp Voice AI, phân tích âm học và chẩn đoán khẩu ngữ tiếng Trung chuẩn HSK.",
  },
};

export default function FeaturesPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="cinnabar">Tính Năng Nền Tảng</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Được Thiết Kế Cho Khảo Thí Khẩu Ngữ Tiếng Trung Chuẩn Xác
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Bộ giải pháp toàn diện kết hợp Voice AI, ngôn ngữ học ứng dụng, tâm trắc học và công cụ quản lý lớp học.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 flex items-center justify-center">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Giám Khảo AI Thích Ứng 5 Giai Đoạn
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Giám khảo AI tiến hành kỳ phỏng vấn nói hoàn chỉnh với giọng đọc chuẩn phổ thông, tự động điều chỉnh độ khó và đặt các câu hỏi phản biện sâu sắc để khơi gợi năng lực thực tế của thí sinh.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800" id="scoring">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Chấm Điểm Dựa Trên Toàn Bộ Cuộc Hội Thoại
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Điểm số không bao giờ tính trên các câu nói rời rạc. Động cơ tính điểm tổng hợp toàn bộ các lượt thoại qua 7 chiều kích: Phát âm, Trôi chảy, Từ vựng, Ngữ pháp, Mạch lạc, Nghe hiểu và Tương tác.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 flex items-center justify-center">
                <Volume2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Chẩn Đoán Biến Điệu & Đường Nét Âm Học
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Tự động phát hiện biến điệu thanh ba (三声变调), âm uốn lưỡi (zh, ch, sh) và khoảng lặng ngắt nghỉ tại ranh giới cú pháp để đưa ra chỉ dẫn cải thiện phát âm cụ thể.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Nhận Xét Có Bằng Chứng Trực Tiếp
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Mọi nhận định trong báo cáo đều được minh chứng bằng câu nói nguyên văn của thí sinh. Bảng ngữ pháp đối chiếu câu gốc với câu diễn đạt chuẩn mực kèm quy tắc rõ ràng.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Quản Lý Lớp Học & Giao Bài Cho Giáo Viên
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Giảng viên dễ dàng tạo lớp, giao bài tập phỏng vấn khẩu ngữ kèm thời hạn, nghe lại file ghi âm của học sinh, theo dõi phân phối điểm số và xuất sổ điểm ra CSV.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Phân Lập Đa Khách Hàng Chuẩn Doanh Nghiệp
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Các trường đại học và viện ngôn ngữ được đảm bảo phân lập dữ liệu nghiêm ngặt, quản lý số chỗ bản quyền, ghi nhật ký kiểm toán và bảo mật quyền riêng tư âm thanh tuyệt đối.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="rounded-3xl bg-slate-900 text-white p-10 md:p-14 text-center space-y-6">
          <h2 className="text-3xl font-extrabold">Sẵn sàng đánh giá khả năng nói tiếng Trung của bạn?</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Tham gia cùng hàng ngàn học viên đang chuẩn hóa khẩu ngữ tiếng Trung với Classnia AI.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              Bắt Đầu Miễn Phí &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
