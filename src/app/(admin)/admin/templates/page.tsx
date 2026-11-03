import prisma from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Clock } from "lucide-react";

export default async function AdminTemplatesPage() {
  let templates: any[] = [];
  try {
    const { default: prisma } = await import("@/lib/db/prisma");
    templates = await prisma.assessmentTemplate.findMany({
      include: { rubric: true },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    templates = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Mẫu Đề Khảo Thí Khẩu Ngữ
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý cấu hình bài thi chuẩn hóa, kịch bản 5 giai đoạn và liên kết thang đo tâm trắc học.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((t) => (
          <Card key={t.id} className="border-slate-200 dark:border-slate-800">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="cinnabar" className="text-[10px]">
                  {t.targetLevel}
                </Badge>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> ~{t.estimatedDurationMinutes} phút
                </span>
              </div>
              <CardTitle className="text-base font-bold">{t.title}</CardTitle>
              <p className="text-xs text-slate-500">{t.description}</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-xs">
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-slate-500">
                <span>Thang đo liên kết:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t.rubric?.name || "Chuẩn 7 Chiều Kích v1.0"}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Danh mục:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{t.category}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
