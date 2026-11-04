import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { signToken, type UserRole } from "@/lib/auth/jwt";
import { getAuthCookieOptions, ADMIN_EMAILS } from "@/lib/auth/session";

/**
 * Firebase SSO Sync — No Database Required.
 * Accepts a verified Firebase user payload (already authenticated client-side),
 * issues a local JWT session cookie, and redirects to dashboard.
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
    const role: UserRole = isAdmin ? "ADMIN" : "USER";

    let userId = uid || `firebase_${normalizedEmail.replace(/[^a-z0-9]/g, "_")}`;
    const name = displayName || normalizedEmail.split("@")[0];

    // Synchronize to PostgreSQL to guarantee relations like AssessmentSession never fail
    try {
      const { isPrismaAvailable, default: prisma } = await import("@/lib/db/prisma");
      if (await isPrismaAvailable()) {
        let dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: normalizedEmail },
              ...(uid ? [{ id: uid }] : []),
            ],
          },
        });

        if (!dbUser) {
          const { hashPassword } = await import("@/lib/auth/password");
          const passwordHash = await hashPassword(crypto.randomUUID() + "!AiHsk2025");
          dbUser = await prisma.user.create({
            data: {
              id: uid || undefined,
              email: normalizedEmail,
              name,
              passwordHash,
              avatarUrl: photoURL || null,
              role,
              emailVerified: true,
              profile: {
                create: {
                  targetLevel: "HSK 3",
                  nativeLanguage: "Tiếng Việt",
                  learningGoal: "Luyện thi khẩu ngữ tiếng Trung chuẩn hóa cùng Giám khảo AI.",
                },
              },
            },
          });
        } else {
          if (photoURL && !dbUser.avatarUrl) {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { avatarUrl: photoURL },
            });
          }
        }

        if (dbUser) {
          userId = dbUser.id;
        }
      }
    } catch {
      // Prisma offline or table absent — continue with Firebase user ID and JWT
    }

    const token = await signToken({ userId, email: normalizedEmail, role, name });

    const redirectPath = role === "ADMIN" ? "/admin" : "/dashboard";

    const response = NextResponse.json({
      success: true,
      message: "Đồng bộ tài khoản Classnia Firebase thành công!",
      user: { id: userId, email: normalizedEmail, name, role, avatarUrl: photoURL || null },
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
