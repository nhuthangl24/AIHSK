import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth/jwt";
import { getAuthCookieOptions, ADMIN_EMAILS } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";

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
    const role: UserRole = isAdmin ? UserRole.ADMIN : UserRole.USER;

    // Use Firebase UID as userId (no DB needed)
    const userId = uid || `firebase_${normalizedEmail.replace(/[^a-z0-9]/g, "_")}`;
    const name = displayName || normalizedEmail.split("@")[0];

    const token = await signToken({ userId, email: normalizedEmail, role, name });

    const redirectPath = role === UserRole.ADMIN ? "/admin" : "/dashboard";

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
