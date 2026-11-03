import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { signToken } from "@/lib/auth/jwt";
import { COOKIE_NAME, getAuthCookieOptions, ADMIN_EMAILS } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);
    const normalizedEmail = validated.email.toLowerCase();

    // Try DB login if Prisma/PostgreSQL is available
    try {
      const { default: prisma } = await import("@/lib/db/prisma");
      const { verifyPassword } = await import("@/lib/auth/password");

      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

      if (!user) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      if (!user.isActive) {
        return NextResponse.json(
          { error: "Your account has been deactivated. Please contact support." },
          { status: 403 }
        );
      }

      const isMatch = await verifyPassword(validated.password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const token = await signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      const redirectPath = user.role === "ADMIN" ? "/admin" : "/dashboard";
      const response = NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        redirectPath,
      });

      response.cookies.set({ ...getAuthCookieOptions(), value: token });

      try {
        await prisma.auditLog.create({
          data: { actorId: user.id, action: "USER_LOGIN", entityType: "User", entityId: user.id },
        });
      } catch { /* audit log optional */ }

      return response;
    } catch (dbErr: any) {
      // DB not available — only Firebase login supported
      if (dbErr?.name === "ZodError") throw dbErr;
      console.warn("DB unavailable for email login, only Firebase auth supported:", dbErr?.message);
      return NextResponse.json(
        { error: "Vui lòng sử dụng nút 'Đăng nhập với Google (Classnia)' hoặc đăng nhập bằng tài khoản Classnia." },
        { status: 503 }
      );
    }
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
