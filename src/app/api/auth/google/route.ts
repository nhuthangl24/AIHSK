import { NextRequest, NextResponse } from "next/server";
import { signToken, type UserRole } from "@/lib/auth/jwt";
import { getAuthCookieOptions, ADMIN_EMAILS } from "@/lib/auth/session";
import crypto from "crypto";

/**
 * Google Auth — No Database Required.
 * Fallback when Firebase popup is blocked. Creates JWT session directly.
 */
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

  return NextResponse.redirect(new URL("/login?google=1", origin));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = (body.email || "google.user@gmail.com").trim().toLowerCase();
    const rawName = (body.name || rawEmail.split("@")[0]).trim();

    if (!rawEmail.includes("@")) {
      return NextResponse.json({ error: "Email Google không hợp lệ" }, { status: 400 });
    }

    const isAdmin = ADMIN_EMAILS.includes(rawEmail);
    const role: UserRole = isAdmin ? "ADMIN" : "USER";
    const userId = `google_${crypto.createHash("md5").update(rawEmail).digest("hex").slice(0, 16)}`;

    const token = await signToken({ userId, email: rawEmail, role, name: rawName });

    const redirectPath = role === "ADMIN" ? "/admin" : "/dashboard";

    const response = NextResponse.json({
      success: true,
      user: { id: userId, email: rawEmail, name: rawName, role },
      redirectPath,
    });

    const cookieOpts = getAuthCookieOptions();
    response.cookies.set({ ...cookieOpts, value: token });

    return response;
  } catch (err: any) {
    console.error("Google Auth error:", err);
    return NextResponse.json(
      { error: "Đăng nhập Google thất bại: " + err.message },
      { status: 500 }
    );
  }
}
