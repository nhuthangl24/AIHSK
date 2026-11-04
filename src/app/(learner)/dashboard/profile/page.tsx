import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { assessmentStore } from "@/lib/db/assessment-store";
import { FirebaseDb } from "@/lib/firebase-db";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const fbUser =
    (await FirebaseDb.findUserById(user.userId)) ||
    (await FirebaseDb.findUserByEmail(user.email));

  const storedProfile = assessmentStore.getProfile(user.userId);

  const initialData = {
    name: fbUser?.name || storedProfile?.name || user.name || "",
    email: fbUser?.email || storedProfile?.email || user.email || "",
    targetLevel: fbUser?.targetLevel || storedProfile?.targetLevel || "HSK 3",
    nativeLanguage: fbUser?.nativeLanguage || storedProfile?.nativeLanguage || "Tiếng Việt",
    studyHoursWeekly: fbUser?.studyHoursWeekly ?? storedProfile?.studyHoursWeekly ?? 3,
    learningGoal: fbUser?.learningGoal || storedProfile?.learningGoal || "",
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
