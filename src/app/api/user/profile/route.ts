import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { profile: true },
  });

  if (!userRecord) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      name: userRecord.name,
      email: userRecord.email,
      targetLevel: userRecord.profile?.targetLevel || "HSK 3",
      nativeLanguage: userRecord.profile?.nativeLanguage || "Tiếng Việt",
      studyHoursWeekly: userRecord.profile?.studyHoursWeekly ?? 3,
      learningGoal: userRecord.profile?.learningGoal || "",
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

    if (name && typeof name === "string" && name.trim().length > 0) {
      await prisma.user.update({
        where: { id: user.userId },
        data: { name: name.trim() },
      });
    }

    const hours = Number(studyHoursWeekly);
    const validHours = !isNaN(hours) && hours > 0 ? Math.min(hours, 60) : 3;

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: user.userId },
      update: {
        targetLevel: targetLevel ? String(targetLevel).trim() : "HSK 3",
        nativeLanguage: nativeLanguage ? String(nativeLanguage).trim() : "Tiếng Việt",
        studyHoursWeekly: validHours,
        learningGoal: typeof learningGoal === "string" ? learningGoal.trim() : null,
      },
      create: {
        userId: user.userId,
        targetLevel: targetLevel ? String(targetLevel).trim() : "HSK 3",
        nativeLanguage: nativeLanguage ? String(nativeLanguage).trim() : "Tiếng Việt",
        studyHoursWeekly: validHours,
        learningGoal: typeof learningGoal === "string" ? learningGoal.trim() : null,
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
