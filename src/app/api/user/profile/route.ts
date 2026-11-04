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

  // 1. Try Prisma first (primary relational database)
  let prismaProfile: any = null;
  let prismaName: string | null = null;
  try {
    const { isPrismaAvailable, default: prisma } = await import("@/lib/db/prisma");
    if (await isPrismaAvailable()) {
      const pUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: normalizedEmail }, { id: user.userId }],
        },
        include: { profile: true },
      });
      if (pUser) {
        prismaName = pUser.name;
        prismaProfile = pUser.profile;
      }
    }
  } catch (e) {
    console.warn("Prisma profile fetch note:", e);
  }

  // 2. Try Firebase Firestore
  const fbUser =
    (await FirebaseDb.findUserById(user.userId)) ||
    (await FirebaseDb.findUserByEmail(normalizedEmail));

  // 3. Try assessmentStore (check both userId and email)
  const storedProfile =
    assessmentStore.getProfile(user.userId) ||
    assessmentStore.getProfile(normalizedEmail);

  return NextResponse.json({
    user: {
      name: prismaName || fbUser?.name || storedProfile?.name || user.name || "",
      email: normalizedEmail,
      targetLevel: prismaProfile?.targetLevel || fbUser?.targetLevel || storedProfile?.targetLevel || "HSK 3",
      nativeLanguage: prismaProfile?.nativeLanguage || fbUser?.nativeLanguage || storedProfile?.nativeLanguage || "Tiếng Việt",
      studyHoursWeekly: prismaProfile?.studyHoursWeekly ?? fbUser?.studyHoursWeekly ?? storedProfile?.studyHoursWeekly ?? 3,
      learningGoal: prismaProfile?.learningGoal ?? fbUser?.learningGoal ?? storedProfile?.learningGoal ?? "",
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

    // 1. DUAL-KEY persist to assessmentStore (by userId and by email)
    assessmentStore.saveProfile(profileData);

    // 2. Persist to Prisma DB (PostgreSQL) if active
    try {
      const { isPrismaAvailable, default: prisma } = await import("@/lib/db/prisma");
      if (await isPrismaAvailable()) {
        let pUser = await prisma.user.findFirst({
          where: {
            OR: [{ email: normalizedEmail }, { id: user.userId }],
          },
        });

        if (!pUser) {
          // If user record doesn't exist yet in Prisma, create it
          pUser = await prisma.user.create({
            data: {
              id: user.userId,
              email: normalizedEmail,
              name: cleanName,
              passwordHash: "oauth_sso_managed",
              role: (user.role as any) || "USER",
            },
          });
        } else if (cleanName && cleanName !== pUser.name) {
          await prisma.user.update({
            where: { id: pUser.id },
            data: { name: cleanName },
          });
        }

        if (pUser) {
          await prisma.userProfile.upsert({
            where: { userId: pUser.id },
            create: {
              userId: pUser.id,
              targetLevel: cleanTargetLevel,
              nativeLanguage: cleanNativeLang,
              studyHoursWeekly: validHours,
              learningGoal: cleanGoal,
            },
            update: {
              targetLevel: cleanTargetLevel,
              nativeLanguage: cleanNativeLang,
              studyHoursWeekly: validHours,
              learningGoal: cleanGoal,
            },
          });
        }
      }
    } catch (prismaErr) {
      console.warn("Prisma profile sync note:", prismaErr);
    }

    // 3. Persist to Firebase Firestore
    try {
      await FirebaseDb.updateUser(
        user.userId,
        {
          name: cleanName,
          targetLevel: cleanTargetLevel,
          targetHsk: parseInt(cleanTargetLevel.replace(/\D/g, ""), 10) || 3,
          nativeLanguage: cleanNativeLang,
          studyHoursWeekly: validHours,
          learningGoal: cleanGoal,
        },
        normalizedEmail
      );
    } catch (fbErr) {
      console.warn("Firestore profile sync warning:", fbErr);
    }

    const response = NextResponse.json({
      success: true,
      message: "Cập nhật hồ sơ học tập thành công!",
      profile: profileData,
    });

    // 4. Update session cookie if name changed
    if (cleanName && cleanName !== user.name) {
      try {
        const { signToken, getAuthCookieOptions } = await import("@/lib/auth/session");
        const newToken = await signToken({
          userId: user.userId,
          email: normalizedEmail,
          role: user.role,
          name: cleanName,
        });
        const opts = getAuthCookieOptions();
        response.cookies.set(opts.name, newToken, opts);
      } catch (tokenErr) {
        console.warn("Cookie token refresh note:", tokenErr);
      }
    }

    return response;
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: err?.message || "Không thể cập nhật hồ sơ" },
      { status: 500 }
    );
  }
}
