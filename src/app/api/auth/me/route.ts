import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, getUserProfileCookie } from "@/lib/auth/session";
import { FirebaseDb } from "@/lib/firebase-db";
import { assessmentStore } from "@/lib/db/assessment-store";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const cookieStore = await cookies();
  const profileCookie = getUserProfileCookie(cookieStore);

  // 1. Fetch from Firebase Firestore (Primary DB)
  let fbUser: any = null;
  try {
    fbUser =
      (await FirebaseDb.findUserById(session.userId)) ||
      (await FirebaseDb.findUserByEmail(session.email));
  } catch (err) {
    console.warn("Firebase user fetch note in /api/auth/me:", err);
  }

  // 2. Fallback to assessmentStore
  const storedProfile =
    assessmentStore.getProfile(session.userId) ||
    assessmentStore.getProfile(session.email);

  const resolvedName = profileCookie?.name || storedProfile?.name || fbUser?.name || session.name;
  const resolvedTargetLevel = profileCookie?.targetLevel || storedProfile?.targetLevel || fbUser?.targetLevel || "HSK 3";
  const resolvedNativeLang = profileCookie?.nativeLanguage || storedProfile?.nativeLanguage || fbUser?.nativeLanguage || "Tiếng Việt";
  const resolvedHours = profileCookie?.studyHoursWeekly ?? storedProfile?.studyHoursWeekly ?? fbUser?.studyHoursWeekly ?? 3;
  const resolvedGoal = profileCookie?.learningGoal ?? storedProfile?.learningGoal ?? fbUser?.learningGoal ?? "";

  return NextResponse.json({
    user: {
      id: fbUser?.id || session.userId,
      email: session.email,
      name: resolvedName,
      role: fbUser?.role || session.role,
      avatarUrl: fbUser?.avatar || null,
      profile: {
        targetLevel: resolvedTargetLevel,
        nativeLanguage: resolvedNativeLang,
        studyHoursWeekly: resolvedHours,
        learningGoal: resolvedGoal,
        streakDays: fbUser?.streakDays || 1,
        totalMastered: fbUser?.totalMastered || 0,
      },
    },
  });
}
