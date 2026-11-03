import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { signToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { getAuthCookieOptions, ADMIN_EMAILS } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";

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

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      if (!user.isActive) {
        return NextResponse.json(
          { error: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ ban quản trị Classnia." },
          { status: 403 }
        );
      }

      // Upgrade to SUPER_ADMIN if configured in ADMIN_EMAILS
      if (isAdmin && user.role !== UserRole.SUPER_ADMIN) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            role: UserRole.SUPER_ADMIN,
            avatarUrl: photoURL || user.avatarUrl,
            name: displayName || user.name,
          },
        });
      } else if (photoURL && !user.avatarUrl) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: photoURL },
        });
      }
    } else {
      // Auto-provision user account from Classnia Firebase into PostgreSQL
      const randomPassword = crypto.randomUUID() + "!PassA1";
      const passwordHash = await hashPassword(randomPassword);

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: displayName || normalizedEmail.split("@")[0],
          avatarUrl: photoURL || null,
          passwordHash,
          role: isAdmin ? UserRole.SUPER_ADMIN : UserRole.LEARNER,
          emailVerified: true,
          profile: {
            create: {
              targetLevel: "HSK 3",
              nativeLanguage: "Vietnamese",
              studyHoursWeekly: 3,
            },
          },
        },
      });
    }

    // Sign local JWT session token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Routing destination: Admin -> /admin, User -> /dashboard
    let redirectPath = "/dashboard";
    if (user.role === "SUPER_ADMIN" || user.role === "ORG_ADMIN") redirectPath = "/admin";

    const response = NextResponse.json({
      success: true,
      message: "Đồng bộ tài khoản Classnia Firebase thành công!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      redirectPath,
    });

    // Set cookie across subdomains (e.g. .classnia.id.vn)
    const cookieOpts = getAuthCookieOptions();
    response.cookies.set({
      ...cookieOpts,
      value: token,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "FIREBASE_SSO_LOGIN",
        entityType: "User",
        entityId: user.id,
        metadataJson: {
          firebaseUid: uid || null,
          provider: "Firebase/Classnia",
        },
      },
    });

    return response;
  } catch (err: any) {
    console.error("Firebase sync error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during Firebase authentication sync" },
      { status: 500 }
    );
  }
}
