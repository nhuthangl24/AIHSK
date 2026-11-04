import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Câu Hỏi Thường Gặp (FAQ) Về Khảo Thí Khẩu Ngữ",
  description:
    "Giải đáp mọi thắc mắc về quy trình thi nói Giám khảo AI, thang điểm 7 chiều, tương thích thiết bị và bảo mật dữ liệu âm thanh tại Classnia AI.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Câu Hỏi Thường Gặp (FAQ) Về Khảo Thí Khẩu Ngữ | Classnia AI",
    description: "Giải đáp thắc mắc về Giám khảo AI, cách tính điểm HSK và bảo mật giọng nói.",
  },
};

const faqs = [
  {
    q: "Giám khảo AI tiến hành kỳ thi phỏng vấn khẩu ngữ như thế nào?",
    a: "Bài thi diễn ra qua quy trình chuẩn 5 giai đoạn: Khởi động & Giới thiệu, Giao tiếp đời sống thường nhật, Thuyết trình chủ đề chuyên sâu, Phản biện & Đào sâu tư duy, và Tổng kết thi. Giám khảo AI phát âm tiếng Trung chuẩn và lắng nghe câu trả lời qua micro của thiết bị.",
  },
  {
    q: "Điểm thi nói của tôi được tính như thế nào?",
    a: "Điểm số được tính bằng động cơ tâm trắc học đánh giá toàn bộ cuộc hội thoại trên 7 chiều kích có trọng số: Phát âm (20%), Độ trôi chảy (20%), Từ vựng (15%), Ngữ pháp (15%), Tính mạch lạc (10%), Nghe hiểu (10%) và Tương tác giao tiếp (10%). Mọi điểm số đều có dẫn chứng nguyên văn từ biên bản hội thoại.",
  },
  {
    q: "Tôi có thể sử dụng Classnia AI trên điện thoại di động không?",
    a: "Hoàn toàn được! Classnia AI tương thích hoàn hảo trên iPhone, iPad, điện thoại Android, máy tính bảng cũng như máy tính xách tay có micro thu âm.",
  },
  {
    q: "Classnia AI có cấp chứng chỉ HSK chính thức không?",
    a: "Không. Classnia AI cung cấp báo cáo chẩn đoán năng lực học thuật tham chiếu theo chuẩn HSK và HSKK quốc tế, là công cụ ôn luyện đắc lực cho thí sinh trước kỳ thi thật nhưng không thay thế cho chứng chỉ chính thức của CTI.",
  },
  {
    q: "Bản ghi âm giọng nói của tôi có được bảo mật an toàn không?",
    a: "Có. Toàn bộ file âm thanh và biên bản thoại đều được mã hóa cả khi truyền tải lẫn lưu trữ. Chỉ có bạn và giảng viên được ủy quyền trong lớp học mới có thể truy cập.",
  },
  {
    q: "Giáo viên giao bài tập kiểm tra nói cho học sinh bằng cách nào?",
    a: "Giáo viên đăng ký tài khoản Giảng viên, tạo mã lớp học, mời học sinh, giao đề thi khẩu ngữ chuẩn hóa kèm thời hạn nộp và theo dõi kết quả, sổ điểm ngay trên Cổng Giảng Viên.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

export default function FAQPage() {
  return (
    <div className="py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <Badge variant="cinnabar">Câu Hỏi Thường Gặp</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Mọi Điều Bạn Cần Biết Về Classnia AI
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Tìm hiểu chi tiết về quy trình khảo thí khẩu ngữ, tiêu chí tính điểm và bảo mật.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 space-y-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{f.q}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
