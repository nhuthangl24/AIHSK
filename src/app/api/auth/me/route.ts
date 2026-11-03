import { NextResponse } from "next/server";
import { getCurrentUserWithProfile } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      profile: user.profile,
    },
  });
}
