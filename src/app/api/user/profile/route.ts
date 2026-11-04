import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assessmentStore } from "@/lib/db/assessment-store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  return NextResponse.json({
    user: {
      name: userRecord?.name || storedProfile?.name || user.name || "",
      email: userRecord?.email || storedProfile?.email || user.email || "",
      targetLevel: userRecord?.profile?.targetLevel || storedProfile?.targetLevel || "HSK 3",
      nativeLanguage: userRecord?.profile?.nativeLanguage || storedProfile?.nativeLanguage || "Tiếng Việt",
      studyHoursWeekly: userRecord?.profile?.studyHoursWeekly ?? storedProfile?.studyHoursWeekly ?? 3,
      learningGoal: userRecord?.profile?.learningGoal || storedProfile?.learningGoal || "",
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

    try {
      const { isPrismaAvailable, default: prisma } = await import("@/lib/db/prisma");
      if (await isPrismaAvailable()) {
        if (name && typeof name === "string" && name.trim().length > 0) {
          await prisma.user.update({
            where: { id: user.userId },
            data: { name: name.trim() },
          }).catch(() => null);
        }

        await prisma.userProfile.upsert({
          where: { userId: user.userId },
          update: {
            targetLevel: profileData.targetLevel,
            nativeLanguage: profileData.nativeLanguage,
            studyHoursWeekly: validHours,
            learningGoal: profileData.learningGoal,
          },
          create: {
            userId: user.userId,
            targetLevel: profileData.targetLevel,
            nativeLanguage: profileData.nativeLanguage,
            studyHoursWeekly: validHours,
            learningGoal: profileData.learningGoal,
          },
        }).catch(() => null);
      }
    } catch {
      // Prisma offline, fallback store is primary
    }

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
