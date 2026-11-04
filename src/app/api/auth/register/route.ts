import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/lib/auth/password";
import { signToken, type UserRole } from "@/lib/auth/jwt";
import { getAuthCookieOptions, ADMIN_EMAILS } from "@/lib/auth/session";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);
    const normalizedEmail = validated.email.toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
    const role: UserRole = isAdmin ? "ADMIN" : "USER";

    // 1. Cố gắng ghi vào PostgreSQL nếu có
    let userId = `user_${crypto.randomUUID().slice(0, 12)}`;
    try {
      const { isPrismaAvailable, default: prisma } = await import("@/lib/db/prisma");
      if (await isPrismaAvailable()) {
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (existingUser) {
          return NextResponse.json(
            { error: "Tài khoản với email này đã tồn tại trong hệ thống." },
            { status: 409 }
          );
        }

        const passwordHash = await hashPassword(validated.password);
        const user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            name: validated.name,
            role,
            emailVerified: true,
            profile: {
              create: {
                targetLevel: validated.targetLevel || "HSK 3",
                nativeLanguage: validated.nativeLanguage || "Tiếng Việt",
                learningGoal: "Luyện thi khẩu ngữ tiếng Trung chuẩn hóa cùng Giám khảo AI.",
              },
            },
          },
        });
        userId = user.id;

        try {
          const freePlan = await prisma.subscriptionPlan.findUnique({
            where: { slug: "free" },
          });
          if (freePlan) {
            await prisma.subscription.create({
              data: {
                userId: user.id,
                planId: freePlan.id,
                status: "ACTIVE",
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
              },
            });
          }
        } catch {
          /* plan optional */
        }
      }
    } catch (dbErr: any) {
      if (dbErr?.name === "ZodError") throw dbErr;
      // DB write skipped, falling back to pure JWT token session
    }

    // 2. Ký JWT session token (hoạt động độc lập không cần DB)
    const token = await signToken({
      userId,
      email: normalizedEmail,
      role,
      name: validated.name,
    });

    const redirectPath = role === "ADMIN" ? "/admin" : "/dashboard";
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: normalizedEmail,
        name: validated.name,
        role,
      },
      redirectPath,
    });

    const cookieOpts = getAuthCookieOptions();
    response.cookies.set({
      ...cookieOpts,
      value: token,
    });

    return response;
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    console.error("Register error:", err);
    return NextResponse.json({ error: "Đăng ký không thành công. Vui lòng thử lại." }, { status: 500 });
  }
}
