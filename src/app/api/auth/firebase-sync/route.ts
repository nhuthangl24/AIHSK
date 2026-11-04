import { NextRequest, NextResponse } from "next/server";
import { signToken, type UserRole } from "@/lib/auth/jwt";
import { getAuthCookieOptions, ADMIN_EMAILS } from "@/lib/auth/session";
import { FirebaseDb } from "@/lib/firebase-db";
import { assessmentStore } from "@/lib/db/assessment-store";

/**
 * Firebase SSO Sync — Using Firebase Firestore as Primary Database.
 * Accepts a verified Firebase user payload, synchronizes with Firestore,
 * issues a local JWT session cookie, and returns user session.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, displayName, photoURL, uid } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email hợp lệ là bắt buộc từ Firebase Authentication." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
    let role: UserRole = isAdmin ? "ADMIN" : "USER";

    let userId = uid || `firebase_${normalizedEmail.replace(/[^a-z0-9]/g, "_")}`;
    let name = displayName || normalizedEmail.split("@")[0];
    let targetLevel = "HSK 3";

    // 1. Resolve from Firebase Firestore (Primary DB)
    try {
      const fbUser =
        (uid ? await FirebaseDb.findUserById(uid) : null) ||
        (await FirebaseDb.findUserByEmail(normalizedEmail));

      if (fbUser) {
        userId = fbUser.id;
        if (fbUser.name) name = fbUser.name;
        if (fbUser.role) {
          role = (fbUser.role.toUpperCase() === "ADMIN" || isAdmin) ? "ADMIN" : "USER";
        }
        if (fbUser.targetLevel) targetLevel = fbUser.targetLevel;
      }
    } catch (fbErr) {
      console.warn("Firestore sync note in firebase-sync:", fbErr);
    }

    // Save profile to assessmentStore as well
    assessmentStore.saveProfile({
      userId,
      name,
      email: normalizedEmail,
      targetLevel,
      nativeLanguage: "Tiếng Việt",
      studyHoursWeekly: 3,
      learningGoal: "Luyện thi khẩu ngữ tiếng Trung chuẩn hóa cùng Giám khảo AI.",
      updatedAt: new Date().toISOString(),
    });

    const token = await signToken({ userId, email: normalizedEmail, role, name });

    const redirectPath = role === "ADMIN" ? "/admin" : "/dashboard";

    const response = NextResponse.json({
      success: true,
      message: "Đồng bộ tài khoản Classnia Firebase thành công!",
      user: {
        id: userId,
        email: normalizedEmail,
        name,
        role,
        avatarUrl: photoURL || null,
        targetLevel,
      },
      redirectPath,
    });

    const cookieOpts = getAuthCookieOptions();
    response.cookies.set({ ...cookieOpts, value: token });

    return response;
  } catch (err: any) {
    console.error("Firebase sync error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during Firebase authentication sync" },
      { status: 500 }
    );
  }
}
