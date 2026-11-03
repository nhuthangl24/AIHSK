import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { COOKIE_NAME, getAuthCookieOptions, ADMIN_EMAILS } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(validated.password);
    const normalizedEmail = validated.email.toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: validated.name,
        role: isAdmin ? UserRole.ADMIN : UserRole.USER,
        emailVerified: true,
        profile: {
          create: {
            targetLevel: validated.targetLevel || "HSK 3",
            nativeLanguage: validated.nativeLanguage || "Tiếng Việt",
            learningGoal: "Improve oral Chinese fluency",
          },
        },
      },
      include: { profile: true },
    });

    // Default Free subscription
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

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
