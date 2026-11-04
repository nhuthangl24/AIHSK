import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser, getUserProfileCookie } from "@/lib/auth/session";
import { assessmentStore } from "@/lib/db/assessment-store";
import { FirebaseDb } from "@/lib/firebase-db";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const profileCookie = getUserProfileCookie(cookieStore);
  const normalizedEmail = user.email.toLowerCase().trim();

  // 1. Try Firebase Firestore
  let fbUser: any = null;
  try {
    fbUser =
      (await FirebaseDb.findUserById(user.userId)) ||
      (await FirebaseDb.findUserByEmail(normalizedEmail));
  } catch {
    // Continue
  }

  // 2. Try assessmentStore (check by userId and email)
  const storedProfile =
    assessmentStore.getProfile(user.userId) ||
    assessmentStore.getProfile(normalizedEmail);

  // Precedence order: Explicit user cookie > server assessmentStore > Firestore cloud > default
  const resolvedName =
    profileCookie?.name ||
    storedProfile?.name ||
    fbUser?.name ||
    user.name ||
    "";

  const resolvedTargetLevel =
    profileCookie?.targetLevel ||
    storedProfile?.targetLevel ||
    fbUser?.targetLevel ||
    "HSK 3";

  const resolvedNativeLang =
    profileCookie?.nativeLanguage ||
    storedProfile?.nativeLanguage ||
    fbUser?.nativeLanguage ||
    "Tiếng Việt";

  const resolvedHours =
    profileCookie?.studyHoursWeekly ??
    storedProfile?.studyHoursWeekly ??
    fbUser?.studyHoursWeekly ??
    3;

  const resolvedGoal =
    profileCookie?.learningGoal ??
    storedProfile?.learningGoal ??
    fbUser?.learningGoal ??
    "Luyện thi khẩu ngữ tiếng Trung chuẩn hóa cùng Giám khảo AI.";

  const initialData = {
    name: resolvedName,
    email: normalizedEmail,
    avatar: fbUser?.avatar || null,
    role: fbUser?.role || user.role || "Học Viên",
    targetLevel: resolvedTargetLevel,
    nativeLanguage: resolvedNativeLang,
    studyHoursWeekly: resolvedHours,
    learningGoal: resolvedGoal,
    streakDays: fbUser?.streakDays ?? 1,
    totalMastered: fbUser?.totalMastered ?? 0,
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-16">
      <ProfileClient initialData={initialData} />
    </div>
  );
}
