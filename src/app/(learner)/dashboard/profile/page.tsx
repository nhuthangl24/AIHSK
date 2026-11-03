import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { profile: true },
  });

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Hồ Sơ Học Viên & Mục Tiêu
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Cấu hình thông số học tập và cấp độ mục tiêu cho các kỳ khảo thí thích ứng.
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Thông Tin Cá Nhân</CardTitle>
          <CardDescription>
            Thông tin tài khoản và chuẩn đánh giá tiếng Trung mục tiêu của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Họ và Tên</Label>
            <Input defaultValue={userRecord?.name || "Alex Chen"} disabled />
          </div>

          <div className="space-y-1.5">
            <Label>Địa Chỉ Email</Label>
            <Input defaultValue={userRecord?.email || "learner@aihsk.com"} disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cấp Độ HSK Mục Tiêu</Label>
              <Input defaultValue={userRecord?.profile?.targetLevel || "HSK 1"} disabled />
            </div>

            <div className="space-y-1.5">
              <Label>Ngôn Ngữ Mẹ Đẻ</Label>
              <Input defaultValue={userRecord?.profile?.nativeLanguage || "Tiếng Việt"} disabled />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Số Giờ Luyện Nói Hàng Tuần</Label>
            <Input
              defaultValue={userRecord?.profile?.studyHoursWeekly?.toString() || "5"}
              disabled
            />
          </div>

          <div className="space-y-1.5">
            <Label>Mục Tiêu Học Tập</Label>
            <textarea
              defaultValue={
                userRecord?.profile?.learningGoal ||
                "Chuẩn bị du học Bắc Kinh và làm việc trong môi trường song ngữ quốc tế."
              }
              rows={3}
              disabled
              className="w-full rounded-lg border border-input bg-background p-3 text-sm text-slate-700 dark:text-slate-300"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
