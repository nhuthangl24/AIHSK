import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, BookOpen, Award, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4">
          <Badge variant="cinnabar">Triết Lý Đánh Giá Khẩu Ngữ</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Tính Chuẩn Xác & Chuẩn Mực Trong Khảo Thí Khẩu Ngữ AI
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Classnia AI được phát triển nhằm giải quyết khoảng trống then chốt trong giáo dục ngôn ngữ: đánh giá năng lực nói và tương tác hội thoại một cách toàn diện thay vì chấm điểm từng câu đơn lẻ rời rạc.
          </p>
        </div>

        <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Vì Sao Cuộc Hội Thoại Hoàn Chỉnh Lại Có Ý Nghĩa Quyết Định
              </h2>
              <p>
                Trong khảo thí ngôn ngữ, một thí sinh có thể học thuộc lòng một câu đơn lẻ để phát âm trôi chảy trong vài giây, nhưng sẽ bộc lộ hạn chế khi phải giải thích luận điểm, đối đáp phản biện hoặc duy trì đối thoại qua 5 giai đoạn liên tục.
              </p>
              <p>
                Classnia AI mô phỏng hội đồng thi khẩu ngữ chuyên nghiệp. Giám khảo AI lắng nghe toàn bộ câu trả lời, đánh giá độ rộng từ vựng và khả năng kết nối ngữ pháp qua nhiều lượt đối đáp, đồng thời đưa ra các câu hỏi mở rộng thử thách năng lực diễn ngôn thực tế.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-8 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Chuẩn Hóa Theo Tiêu Chuẩn Năng Lực HSK & HSKK
              </h2>
              <p>
                Bộ tiêu chí chấm điểm được hiệu chuẩn theo khung chuẩn năng lực HSK (HSK 1 đến HSK 6) và quy chuẩn khảo thí khẩu ngữ HSKK quốc tế.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    Khung Đánh Giá HSK
                  </h4>
                  <p className="text-xs text-slate-500">
                    HSK 1-2 cho giao tiếp hàng ngày; HSK 3-4 cho thảo luận chủ đề độc lập; HSK 5-6 cho tư duy trừu tượng và phản xạ tự nhiên.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    Quy Đổi Chuẩn HSK (Học thuật)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Ước tính năng lực khẩu ngữ tương ứng với các bậc từ vựng và độ phức tạp ngữ pháp từ HSK 1 đến HSK 6.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div id="disclaimer" className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-2">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
              <span>Tuyên Bố Miễn Trừ Trách Nhiệm Về Chứng Chỉ Chính Thức</span>
            </h3>
            <p className="leading-relaxed">
              Classnia AI là nền tảng công nghệ đánh giá ngôn ngữ độc lập, cung cấp ước tính năng lực và phản hồi chẩn đoán phục vụ mục đích học tập. Classnia AI không liên kết trực tiếp, không đại diện và không cấp chứng chỉ chính thức thay thế cho Chinese Testing International (CTI) hay Bộ Giáo dục Trung Quốc. Báo cáo đánh giá nhằm mục đích chẩn đoán và nâng cao năng lực cá nhân.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
