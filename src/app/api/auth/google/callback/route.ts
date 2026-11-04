import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { COOKIE_NAME, ADMIN_EMAILS } from "@/lib/auth/session";
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

    let userId = `google_${email.replace(/[^a-z0-9]/g, "_")}`;
    const isAdmin = ADMIN_EMAILS.includes(email);
    let role = isAdmin ? "ADMIN" : "USER";

    try {
      const { FirebaseDb } = await import("@/lib/firebase-db");
      const fbUser = await FirebaseDb.findUserByEmail(email);
      if (!fbUser) {
        await FirebaseDb.updateUser(userId, {
          email,
          name,
          avatar: avatarUrl,
          role,
          targetLevel: "HSK 3",
          targetHsk: 3,
          nativeLanguage: "Tiếng Việt",
          learningGoal: "Luyện thi khẩu ngữ tiếng Trung chuẩn hóa cùng Giám khảo AI.",
          studyHoursWeekly: 4,
          streakDays: 1,
          totalMastered: 0,
        }, email);
      } else {
        userId = fbUser.id || userId;
        role = (fbUser.role as any) || role;
      }
    } catch (fbErr) {
      console.warn("Firestore sync during Google OAuth note:", fbErr);
    }

    const token = await signToken({
      userId,
      email,
      role: role as any,
      name,
    });

    let redirectPath = "/dashboard";
    if (role === "ADMIN") redirectPath = "/admin";

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
