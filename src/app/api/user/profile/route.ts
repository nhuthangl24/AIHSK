import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assessmentStore } from "@/lib/db/assessment-store";
import { FirebaseDb } from "@/lib/firebase-db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Try Firebase Firestore
  const fbUser =
    (await FirebaseDb.findUserById(user.userId)) ||
    (await FirebaseDb.findUserByEmail(user.email));

  const storedProfile = assessmentStore.getProfile(user.userId);

  return NextResponse.json({
    user: {
      name: fbUser?.name || storedProfile?.name || user.name || "",
      email: fbUser?.email || storedProfile?.email || user.email || "",
      targetLevel: fbUser?.targetLevel || storedProfile?.targetLevel || "HSK 3",
      nativeLanguage: fbUser?.nativeLanguage || storedProfile?.nativeLanguage || "Tiếng Việt",
      studyHoursWeekly: fbUser?.studyHoursWeekly ?? storedProfile?.studyHoursWeekly ?? 3,
      learningGoal: fbUser?.learningGoal || storedProfile?.learningGoal || "",
    },
  });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, targetLevel, nativeLanguage, studyHoursWeekly, learningGoal } = body;

    const hours = Number(studyHoursWeekly);
    const validHours = !isNaN(hours) && hours > 0 ? Math.min(hours, 60) : 3;

    const profileData = {
      userId: user.userId,
      name: name && typeof name === "string" ? name.trim() : user.name,
      email: user.email,
      targetLevel: targetLevel ? String(targetLevel).trim() : "HSK 3",
      nativeLanguage: nativeLanguage ? String(nativeLanguage).trim() : "Tiếng Việt",
      studyHoursWeekly: validHours,
      learningGoal: typeof learningGoal === "string" ? learningGoal.trim() : "",
      updatedAt: new Date().toISOString(),
    };

    assessmentStore.saveProfile(profileData);

    // Persist to Firebase Firestore if configured
    await FirebaseDb.updateUser(user.userId, {
      name: profileData.name,
      targetLevel: profileData.targetLevel,
      targetHsk: parseInt(profileData.targetLevel.replace(/\D/g, ""), 10) || 3,
      nativeLanguage: profileData.nativeLanguage,
      studyHoursWeekly: profileData.studyHoursWeekly,
      learningGoal: profileData.learningGoal,
    }).catch((err) => {
      console.warn("Firestore profile sync warning:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật hồ sơ học tập thành công!",
      profile: profileData,
    });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: err?.message || "Không thể cập nhật hồ sơ" },
      { status: 500 }
    );
  }
}
