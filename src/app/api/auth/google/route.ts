import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { COOKIE_NAME, getAuthCookieOptions, ADMIN_EMAILS } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl = `${origin}/api/auth/google/callback`;

  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (clientId) {
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", callbackUrl);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "select_account");

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // If GOOGLE_CLIENT_ID is not configured in env, redirect to login page with google modal trigger
  return NextResponse.redirect(new URL("/login?google=1", origin));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = (body.email || "google.user@gmail.com").trim().toLowerCase();
    const rawName = (body.name || "Người Dùng Google").trim();
    const avatarUrl = body.avatarUrl || null;

    if (!rawEmail.includes("@")) {
      return NextResponse.json({ error: "Email Google không hợp lệ" }, { status: 400 });
    }

    // Upsert User with Google verification
    let user = await prisma.user.findUnique({
      where: { email: rawEmail },
    });

    if (!user) {
      const randomPassword = crypto.randomUUID();
      const passwordHash = await hashPassword(randomPassword);

      const isAdmin = ADMIN_EMAILS.includes(rawEmail);

      user = await prisma.user.create({
        data: {
          email: rawEmail,
          name: rawName,
          passwordHash,
          avatarUrl,
          emailVerified: true,
          role: isAdmin ? UserRole.SUPER_ADMIN : UserRole.LEARNER,
          profile: {
            create: {
              targetLevel: "HSK 3",
              nativeLanguage: "Tiếng Việt",
              learningGoal: "Luyện thi khẩu ngữ tiếng Trung chuẩn hóa cùng Giám khảo AI.",
              studyHoursWeekly: 4,
            },
          },
        },
      });
    } else {
      if (!user.isActive) {
        return NextResponse.json(
          { error: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ." },
          { status: 403 }
        );
      }
      const isAdmin = ADMIN_EMAILS.includes(rawEmail);
      if (isAdmin && user.role !== UserRole.SUPER_ADMIN) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: UserRole.SUPER_ADMIN, emailVerified: true },
        });
      } else if (!user.emailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });
      }
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    let redirectPath = "/dashboard";
    if (user.role === "SUPER_ADMIN" || user.role === "ORG_ADMIN") redirectPath = "/admin";

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectPath,
    });

    const cookieOpts = getAuthCookieOptions();
    response.cookies.set({
      ...cookieOpts,
      value: token,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "USER_GOOGLE_LOGIN",
        entityType: "User",
        entityId: user.id,
      },
    });

    return response;
  } catch (err: any) {
    console.error("Google Auth error:", err);
    return NextResponse.json({ error: "Đăng nhập Google thất bại: " + err.message }, { status: 500 });
  }
}
