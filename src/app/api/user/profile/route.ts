import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assessmentStore } from "@/lib/db/assessment-store";
import { FirebaseDb } from "@/lib/firebase-db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const normalizedEmail = user.email.toLowerCase().trim();

  // 1. Try Firebase Firestore
  const fbUser =
    (await FirebaseDb.findUserById(user.userId)) ||
    (await FirebaseDb.findUserByEmail(normalizedEmail));

  // 2. Try assessmentStore (check both userId and email)
  const storedProfile =
    assessmentStore.getProfile(user.userId) ||
    assessmentStore.getProfile(normalizedEmail);

  return NextResponse.json({
    user: {
      name: fbUser?.name || storedProfile?.name || user.name || "",
      email: normalizedEmail,
      targetLevel: fbUser?.targetLevel || storedProfile?.targetLevel || "HSK 3",
      nativeLanguage: fbUser?.nativeLanguage || storedProfile?.nativeLanguage || "Tiếng Việt",
      studyHoursWeekly: fbUser?.studyHoursWeekly ?? storedProfile?.studyHoursWeekly ?? 3,
      learningGoal: fbUser?.learningGoal ?? storedProfile?.learningGoal ?? "",
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
    const cleanTargetLevel = targetLevel ? String(targetLevel).trim() : "HSK 3";
    const cleanNativeLang = nativeLanguage ? String(nativeLanguage).trim() : "Tiếng Việt";
    const cleanGoal = typeof learningGoal === "string" ? learningGoal.trim() : "";
    const cleanName = name && typeof name === "string" ? name.trim() : user.name;
    const normalizedEmail = user.email.toLowerCase().trim();

    const profileData = {
      userId: user.userId,
      name: cleanName,
      email: normalizedEmail,
      targetLevel: cleanTargetLevel,
      nativeLanguage: cleanNativeLang,
      studyHoursWeekly: validHours,
      learningGoal: cleanGoal,
      updatedAt: new Date().toISOString(),
    };

    // 1. Persist to assessmentStore
    assessmentStore.saveProfile(profileData);

    // 2. Persist to Firebase Firestore
    try {
      await FirebaseDb.updateUser(
        user.userId,
        {
          name: cleanName,
          email: normalizedEmail,
          targetLevel: cleanTargetLevel,
          targetHsk: parseInt(cleanTargetLevel.replace(/\D/g, "")) || 3,
          nativeLanguage: cleanNativeLang,
          studyHoursWeekly: validHours,
          learningGoal: cleanGoal,
        },
        normalizedEmail
      );
    } catch (fbErr) {
      console.warn("Firestore profile update note:", fbErr);
    }

    return NextResponse.json({
      success: true,
      profile: {
        name: cleanName,
        targetLevel: cleanTargetLevel,
        nativeLanguage: cleanNativeLang,
        studyHoursWeekly: validHours,
        learningGoal: cleanGoal,
      },
    });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
