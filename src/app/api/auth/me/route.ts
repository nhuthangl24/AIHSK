import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Try to get full profile from DB if available
  try {
    const { isPrismaAvailable, default: prisma } = await import("@/lib/db/prisma");
    if (await isPrismaAvailable()) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { profile: true },
      });
      if (user && user.isActive) {
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
    }
  } catch {
    // DB unavailable — return JWT session data
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      avatarUrl: null,
      profile: null,
    },
  });
}
