import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { FirebaseDb } from "@/lib/firebase-db";
import { assessmentStore } from "@/lib/db/assessment-store";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // 1. Fetch from Firebase Firestore (Primary DB)
  try {
    const fbUser =
      (await FirebaseDb.findUserById(session.userId)) ||
      (await FirebaseDb.findUserByEmail(session.email));

    if (fbUser) {
      return NextResponse.json({
        user: {
          id: fbUser.id,
          email: fbUser.email,
          name: fbUser.name,
          role: fbUser.role || session.role,
          avatarUrl: fbUser.avatar || null,
          profile: {
            targetLevel: fbUser.targetLevel || "HSK 3",
            nativeLanguage: fbUser.nativeLanguage || "Tiếng Việt",
            studyHoursWeekly: fbUser.studyHoursWeekly || 3,
            learningGoal: fbUser.learningGoal || "",
            streakDays: fbUser.streakDays || 1,
            totalMastered: fbUser.totalMastered || 0,
          },
        },
      });
    }
  } catch (err) {
    console.warn("Firebase user fetch note in /api/auth/me:", err);
  }

  // 2. Fallback to assessmentStore
  const storedProfile = assessmentStore.getProfile(session.userId);

  return NextResponse.json({
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      avatarUrl: null,
      profile: storedProfile || {
        targetLevel: "HSK 3",
        nativeLanguage: "Tiếng Việt",
        studyHoursWeekly: 3,
        learningGoal: "",
      },
    },
  });
}
