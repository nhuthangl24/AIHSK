import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { COOKIE_NAME } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error || "Google auth canceled")}`, origin));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    if (!clientId || !clientSecret) {
      throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing");
    }

    // Exchange authorization code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || "Failed to exchange token with Google");
    }

    // Fetch user profile from Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileRes.json();
    if (!profileRes.ok || !profile.email) {
      throw new Error("Failed to retrieve Google profile");
    }

    const email = profile.email.toLowerCase();
    const name = profile.name || profile.given_name || "Google User";
    const avatarUrl = profile.picture || null;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const randomPassword = crypto.randomUUID();
      const passwordHash = await hashPassword(randomPassword);

      user = await prisma.user.create({
        data: {
          email,
          name,
          avatarUrl,
          passwordHash,
          emailVerified: true,
          role: UserRole.LEARNER,
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
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    let redirectPath = "/dashboard";
    if (user.role === "SUPER_ADMIN" || user.role === "ORG_ADMIN") redirectPath = "/admin";

    const response = NextResponse.redirect(new URL(redirectPath, origin));

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error("Google Callback error:", err);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err.message)}`, origin));
  }
}
