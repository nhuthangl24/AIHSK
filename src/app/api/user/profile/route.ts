import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, getUserProfileCookie, getAuthCookieOptions, PROFILE_COOKIE_NAME } from "@/lib/auth/session";
import { signToken } from "@/lib/auth/jwt";
import { assessmentStore } from "@/lib/db/assessment-store";
import { FirebaseDb } from "@/lib/firebase-db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  } catch {}

  // 2. Try assessmentStore (check both userId and email)
  const storedProfile =
    assessmentStore.getProfile(user.userId) ||
    assessmentStore.getProfile(normalizedEmail);

  return NextResponse.json({
    user: {
      name: profileCookie?.name || storedProfile?.name || fbUser?.name || user.name || "",
      email: normalizedEmail,
      targetLevel: profileCookie?.targetLevel || storedProfile?.targetLevel || fbUser?.targetLevel || "HSK 3",
      nativeLanguage: profileCookie?.nativeLanguage || storedProfile?.nativeLanguage || fbUser?.nativeLanguage || "Tiếng Việt",
      studyHoursWeekly: profileCookie?.studyHoursWeekly ?? storedProfile?.studyHoursWeekly ?? fbUser?.studyHoursWeekly ?? 3,
      learningGoal: profileCookie?.learningGoal ?? storedProfile?.learningGoal ?? fbUser?.learningGoal ?? "",
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

    // 1. Persist to assessmentStore (both in memory and individual disk file)
    assessmentStore.saveProfile(profileData);

    // 2. Try persisting to Firebase Firestore
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

    // 3. Create response and set bulletproof aihsk_profile cookie
    const response = NextResponse.json({
      success: true,
      message: "Cập nhật hồ sơ học tập và mục tiêu HSK thành công!",
      profile: {
        name: cleanName,
        targetLevel: cleanTargetLevel,
        nativeLanguage: cleanNativeLang,
        studyHoursWeekly: validHours,
        learningGoal: cleanGoal,
      },
    });

    const isProd = process.env.NODE_ENV === "production";
    const configuredDomain = process.env.COOKIE_DOMAIN;
    let domain: string | undefined = configuredDomain;
    if (!domain && isProd && process.env.NEXT_PUBLIC_APP_URL?.includes("classnia.id.vn")) {
      domain = ".classnia.id.vn";
    }

    // Set cookie: survives serverless cold starts & multiple containers across entire browser session
    response.cookies.set({
      name: PROFILE_COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(profileData)),
      httpOnly: false, // Accessible to client-side JS for instant hydration & sync
      secure: isProd && Boolean(process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")),
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      ...(domain ? { domain } : {}),
    });

    // 4. Update session token cookie if name changed
    try {
      const newToken = await signToken({
        userId: user.userId,
        email: normalizedEmail,
        role: user.role,
        name: cleanName,
      });
      const cookieOpts = getAuthCookieOptions();
      response.cookies.set(cookieOpts.name, newToken, cookieOpts);
    } catch (tokenErr) {
      console.warn("Cookie token refresh note:", tokenErr);
    }

    return response;
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
