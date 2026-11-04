import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { assessmentStore } from "@/lib/db/assessment-store";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let userRecord: any = null;
  try {
    const { isPrismaAvailable, default: prisma } = await import("@/lib/db/prisma");
    if (await isPrismaAvailable()) {
      userRecord = await prisma.user.findUnique({
        where: { id: user.userId },
        include: { profile: true },
      });
    }
  } catch {
    userRecord = null;
  }

  const storedProfile = assessmentStore.getProfile(user.userId);

  const initialData = {
    name: userRecord?.name || storedProfile?.name || user.name || "",
    email: userRecord?.email || storedProfile?.email || user.email || "",
    targetLevel: userRecord?.profile?.targetLevel || storedProfile?.targetLevel || "HSK 3",
    nativeLanguage: userRecord?.profile?.nativeLanguage || storedProfile?.nativeLanguage || "Tiếng Việt",
    studyHoursWeekly: userRecord?.profile?.studyHoursWeekly ?? storedProfile?.studyHoursWeekly ?? 3,
    learningGoal: userRecord?.profile?.learningGoal || storedProfile?.learningGoal || "",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Hồ Sơ Học Viên & Mục Tiêu
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Cấu hình thông số học tập và cấp độ mục tiêu HSK cho các kỳ khảo thí thích ứng.
        </p>
      </div>

      <ProfileClient initialData={initialData} />
    </div>
  );
}
