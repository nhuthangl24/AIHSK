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

  const normalizedEmail = user.email.toLowerCase().trim();

  // 1. Try Prisma first (primary relational database)
  let prismaProfile: any = null;
  let prismaUser: any = null;
  try {
    const { isPrismaAvailable, default: prisma } = await import("@/lib/db/prisma");
    if (await isPrismaAvailable()) {
      prismaUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: normalizedEmail }, { id: user.userId }],
        },
        include: { profile: true },
      });
      prismaProfile = prismaUser?.profile;
    }
  } catch (e) {
    console.warn("Prisma profile page load note:", e);
  }

  // 2. Try Firebase Firestore
  const fbUser =
    (await FirebaseDb.findUserById(user.userId)) ||
    (await FirebaseDb.findUserByEmail(normalizedEmail));

  // 3. Try assessmentStore (check by userId and email)
  const storedProfile =
    assessmentStore.getProfile(user.userId) ||
    assessmentStore.getProfile(normalizedEmail);

  const initialData = {
    name: prismaUser?.name || fbUser?.name || storedProfile?.name || user.name || "",
    email: normalizedEmail,
    avatar: fbUser?.avatar || null,
    role: prismaUser?.role || fbUser?.role || user.role || "Học Viên",
    targetLevel: prismaProfile?.targetLevel || fbUser?.targetLevel || storedProfile?.targetLevel || "HSK 3",
    nativeLanguage: prismaProfile?.nativeLanguage || fbUser?.nativeLanguage || storedProfile?.nativeLanguage || "Tiếng Việt",
    studyHoursWeekly: prismaProfile?.studyHoursWeekly ?? fbUser?.studyHoursWeekly ?? storedProfile?.studyHoursWeekly ?? 3,
    learningGoal: prismaProfile?.learningGoal ?? fbUser?.learningGoal ?? storedProfile?.learningGoal ?? "Luyện thi khẩu ngữ tiếng Trung chuẩn hóa cùng Giám khảo AI.",
    streakDays: fbUser?.streakDays ?? 1,
    totalMastered: fbUser?.totalMastered ?? 0,
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-16">
      <ProfileClient initialData={initialData} />
    </div>
  );
}
