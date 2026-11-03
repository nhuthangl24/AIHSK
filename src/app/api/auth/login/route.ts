import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/auth";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { COOKIE_NAME, getAuthCookieOptions } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Determine redirect route based on role (Admin -> /admin, User -> /dashboard)
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
        action: "USER_LOGIN",
        entityType: "User",
        entityId: user.id,
      },
    });

    return response;
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
