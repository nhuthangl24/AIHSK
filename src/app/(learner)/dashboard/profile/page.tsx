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
    avatar: fbUser?.avatar || null,
    role: fbUser?.role || user.role || "Học Viên",
    targetLevel: fbUser?.targetLevel || storedProfile?.targetLevel || "HSK 3",
    nativeLanguage: fbUser?.nativeLanguage || storedProfile?.nativeLanguage || "Tiếng Việt",
    studyHoursWeekly: fbUser?.studyHoursWeekly ?? storedProfile?.studyHoursWeekly ?? 3,
    learningGoal: fbUser?.learningGoal || storedProfile?.learningGoal || "Luyện thi khẩu ngữ tiếng Trung chuẩn hóa",
    streakDays: fbUser?.streakDays ?? 1,
    totalMastered: fbUser?.totalMastered ?? 0,
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-16">
      <ProfileClient initialData={initialData} />
    </div>
  );
}
